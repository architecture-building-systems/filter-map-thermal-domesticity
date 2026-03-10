"""Standalone Flask app for the municipality bivariate filter map."""

from __future__ import annotations

import hashlib
import json
import gzip
from pathlib import Path
import threading
import os

from flask import Flask, Response, jsonify, render_template, request
try:
    from flask_compress import Compress
except Exception:  # pragma: no cover
    Compress = None

import numpy as np

from services.climate_metrics import compute_dynamic_climate_risk_scores, sanitize_indicator_keys
from services.compute import (
    compute_bivariate_records,
    compute_exceptional_ids,
    filter_records_by_bivariate_class,
    select_exceptional_ids_by_climate_risk_share,
)
from services.data_store import DataStore

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, template_folder="templates", static_folder="static")
if Compress is not None:
    Compress(app)
store = DataStore(BASE_DIR)
_compression_backend = "flask-compress" if Compress is not None else "manual-gzip"

_load_error: str | None = None
_json_response_cache: dict[str, tuple[bytes, str, bytes, str]] = {}
_binary_etag_cache: dict[str, str] = {}


def _background_load() -> None:
    global _load_error
    try:
        store.load()
        _json_response_cache.clear()
        _binary_etag_cache.clear()
    except Exception as exc:  # pragma: no cover
        _load_error = str(exc)


threading.Thread(target=_background_load, daemon=True).start()

VALID_SEASONS = {"annual", "winter"}
VALID_TEMP_METHODS = {"mean-mean", "mean-range", "mean-min", "mean-max"}
VALID_BIVARIATE_CLASSES = {
    "1-1", "1-2", "1-3",
    "2-1", "2-2", "2-3",
    "3-1", "3-2", "3-3",
}


def _etag_hex(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _cached_json_response(
    payload: dict,
    cache_key: str,
    cache_control: str = "public, max-age=300",
) -> Response:
    cached = _json_response_cache.get(cache_key)
    if cached is None:
        blob = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
        etag = _etag_hex(blob)
        gzip_blob = gzip.compress(blob, compresslevel=6)
        gzip_etag = _etag_hex(gzip_blob)
        cached = (blob, etag, gzip_blob, gzip_etag)
        _json_response_cache[cache_key] = cached
    blob, etag, gzip_blob, gzip_etag = cached

    accepts_gzip = "gzip" in str(request.headers.get("Accept-Encoding", "")).lower()
    use_gzip = accepts_gzip and len(gzip_blob) < len(blob)
    response_blob = gzip_blob if use_gzip else blob
    response_etag = gzip_etag if use_gzip else etag

    if request.if_none_match and request.if_none_match.contains(response_etag):
        resp = Response(status=304)
        resp.set_etag(response_etag)
        resp.headers["Cache-Control"] = cache_control
        resp.headers["Vary"] = "Accept-Encoding"
        if use_gzip:
            resp.headers["Content-Encoding"] = "gzip"
        return resp

    resp = Response(response_blob, mimetype="application/json")
    resp.set_etag(response_etag)
    resp.headers["Cache-Control"] = cache_control
    resp.headers["Vary"] = "Accept-Encoding"
    if use_gzip:
        resp.headers["Content-Encoding"] = "gzip"
    return resp


def _cached_binary_response(
    payload: bytes,
    cache_key: str,
    mimetype: str,
    cache_control: str,
) -> Response:
    etag = _binary_etag_cache.get(cache_key)
    if etag is None:
        etag = _etag_hex(payload)
        _binary_etag_cache[cache_key] = etag

    if request.if_none_match and request.if_none_match.contains(etag):
        resp = Response(status=304)
        resp.set_etag(etag)
        resp.headers["Cache-Control"] = cache_control
        return resp

    resp = Response(payload, mimetype=mimetype)
    resp.set_etag(etag)
    resp.headers["Cache-Control"] = cache_control
    return resp


def _parse_bool(value, default: bool) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        s = value.strip().lower()
        if s in {"1", "true", "yes", "on"}:
            return True
        if s in {"0", "false", "no", "off"}:
            return False
    return default


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health")
def health():
    status = {
        "ready": store.ready,
        "loading": not store.ready and _load_error is None,
        "compression_backend": _compression_backend,
    }
    if store.load_warnings:
        status["warning"] = " | ".join(store.load_warnings)
    if _load_error:
        status["error"] = _load_error
    return jsonify(status)


@app.route("/api/bootstrap")
def api_bootstrap():
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503
    return _cached_json_response(store.bootstrap_payload, "bootstrap")


@app.route("/api/overlay/<layer_id>")
def api_overlay(layer_id: str):
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503

    payload = store.get_overlay_payload(str(layer_id))
    if payload is None:
        return jsonify({"error": f"Unknown overlay layer: {layer_id}"}), 404

    return _cached_json_response(payload, f"overlay:{layer_id}")


@app.route("/api/raster/<layer_id>.png")
def api_raster(layer_id: str):
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503

    payload = store.raster_overlay_png.get(str(layer_id))
    if payload is None:
        return jsonify({"error": f"Unknown raster layer: {layer_id}"}), 404

    return _cached_binary_response(
        payload,
        cache_key=f"raster:{layer_id}",
        mimetype="image/png",
        cache_control="public, max-age=3600",
    )


@app.route("/api/recompute", methods=["POST"])
def api_recompute():
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503

    body = request.get_json(silent=True) or {}
    season = str(body.get("season", "annual"))
    if season not in VALID_SEASONS:
        season = "annual"

    temp_method = str(body.get("temp_method", "mean-range"))
    if temp_method not in VALID_TEMP_METHODS:
        temp_method = "mean-range"

    exclude_non_habitable = _parse_bool(body.get("exclude_non_habitable", True), True)
    excluded_heating_types = [str(x) for x in body.get("excluded_heating_types", [])]

    try:
        k_temp = float(body.get("k_temp", 1.0))
    except (TypeError, ValueError):
        k_temp = 1.0

    try:
        k_old = float(body.get("k_old", 1.0))
    except (TypeError, ValueError):
        k_old = 1.0

    raw_indicator_keys = body.get("climate_indicator_keys")
    if raw_indicator_keys is None or not isinstance(raw_indicator_keys, list):
        raw_indicator_keys = store.default_climate_indicator_keys
    climate_indicator_keys = sanitize_indicator_keys(
        raw_indicator_keys,
        store.climate_indicator_frame.columns,
    )
    try:
        climate_top_share_pct = float(body.get("climate_top_share_pct", 25))
    except (TypeError, ValueError):
        climate_top_share_pct = 25.0
    climate_top_share_pct = min(100.0, max(1.0, climate_top_share_pct))

    raw_excluded_classes = body.get("excluded_bivariate_classes", [])
    if not isinstance(raw_excluded_classes, list):
        raw_excluded_classes = []
    excluded_bivariate_classes = []
    seen_excluded = set()
    for value in raw_excluded_classes:
        bi_class = str(value)
        if bi_class not in VALID_BIVARIATE_CLASSES or bi_class in seen_excluded:
            continue
        seen_excluded.add(bi_class)
        excluded_bivariate_classes.append(bi_class)

    temp_by_bfs = store.get_temperature(season, temp_method, exclude_non_habitable)
    old_pct_by_bfs = store.compute_old_pct(excluded_heating_types)

    records = compute_bivariate_records(temp_by_bfs, old_pct_by_bfs, k=3)
    stage1_records, stage1_class_stats = filter_records_by_bivariate_class(
        records,
        set(excluded_bivariate_classes),
    )
    temp_extreme = "high" if temp_method in {"mean-range", "mean-max"} else "low"
    stage1_exceptional_ids, stats = compute_exceptional_ids(
        stage1_records,
        k_temp=k_temp,
        k_old=k_old,
        temp_extreme=temp_extreme,
    )

    climate_scores, climate_meta = compute_dynamic_climate_risk_scores(
        store.climate_indicator_frame,
        climate_indicator_keys,
    )
    climate_scores_by_bfs = {
        str(bfs): float(score)
        for bfs, score in climate_scores.items()
        if np.isfinite(score)
    }

    if climate_meta["climate_stage_enabled"]:
        exceptional_ids, climate_stage_status, climate_stats = select_exceptional_ids_by_climate_risk_share(
            stage1_exceptional_ids,
            climate_scores_by_bfs,
            climate_top_share_pct,
        )
    else:
        exceptional_ids = list(stage1_exceptional_ids)
        climate_stage_status = {str(bfs): "selected" for bfs in stage1_exceptional_ids}
        climate_stats = {
            "climate_top_share_pct": float(climate_top_share_pct),
            "climate_stage_input_count": int(len(stage1_exceptional_ids)),
            "climate_stage_valid_count": 0,
            "climate_stage_output_count": int(len(stage1_exceptional_ids)),
            "climate_missing_excluded": 0,
        }

    for bfs, rec in records.items():
        rec.update(store.metadata_by_bfs.get(bfs, {}))
        score = climate_scores_by_bfs.get(str(bfs))
        if score is not None:
            rec["climate_risk_score"] = float(score)

    return jsonify(
        {
            "records": records,
            "exceptional_ids": exceptional_ids,
            "stage1_exceptional_ids": stage1_exceptional_ids,
            "climate_stage_status": climate_stage_status,
            "stats": {
                "temp_mean": stats.temp_mean,
                "temp_std": stats.temp_std,
                "old_mean": stats.old_mean,
                "old_std": stats.old_std,
                "temp_cutoff": stats.temp_cutoff,
                "old_cutoff": stats.old_cutoff,
                "climate_stage_enabled": bool(climate_meta["climate_stage_enabled"]),
                "climate_top_share_pct": float(climate_top_share_pct),
                "climate_indicator_count": int(climate_meta["usable_indicator_count"]),
                "climate_indicator_keys": climate_indicator_keys,
                "climate_ignored_indicators": climate_meta["climate_ignored_indicators"],
                "excluded_bivariate_classes": stage1_class_stats["excluded_bivariate_classes"],
                "stage1_candidate_record_count_before_filter": int(stage1_class_stats["stage1_candidate_record_count_before_filter"]),
                "stage1_candidate_record_count_after_filter": int(stage1_class_stats["stage1_candidate_record_count_after_filter"]),
                "stage1_candidate_record_excluded_count": int(stage1_class_stats["stage1_candidate_record_excluded_count"]),
                "stage1_exceptional_count": int(len(stage1_exceptional_ids)),
                "stage2_exceptional_count": int(len(exceptional_ids)),
                "climate_stage_input_count": int(climate_stats["climate_stage_input_count"]),
                "climate_stage_valid_count": int(climate_stats["climate_stage_valid_count"]),
                "climate_stage_output_count": int(climate_stats["climate_stage_output_count"]),
                "climate_missing_excluded": int(climate_stats["climate_missing_excluded"]),
            },
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5050"))
    app.run(host="127.0.0.1", port=port, debug=False)
