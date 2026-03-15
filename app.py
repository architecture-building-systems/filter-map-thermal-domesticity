"""Standalone Flask app for the municipality featured filter map."""

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
    compute_stage1_severity_scores,
    compute_bivariate_records,
    compute_exceptional_ids,
    filter_records_by_bivariate_class,
    select_exceptional_ids_by_climate_risk_share,
    select_top_n_by_group,
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
_load_thread: threading.Thread | None = None
_load_thread_lock = threading.Lock()
_weather_cache: dict[str, dict] = {}


def _background_load() -> None:
    global _load_error
    try:
        store.load()
        _json_response_cache.clear()
        _binary_etag_cache.clear()
        _prime_json_cache(store.bootstrap_payload, "bootstrap")
    except Exception as exc:  # pragma: no cover
        _load_error = str(exc)


def _ensure_background_load_started() -> None:
    """Start datastore loader in the current process if needed."""
    global _load_thread
    if store.ready or _load_error:
        return
    with _load_thread_lock:
        if _load_thread is not None and _load_thread.is_alive():
            return
        _load_thread = threading.Thread(target=_background_load, daemon=True, name="datastore-loader")
        _load_thread.start()

VALID_SEASONS = {"annual", "winter"}
VALID_TEMP_METHODS = {"mean-mean", "mean-range", "mean-min", "mean-max"}
VALID_BIVARIATE_CLASSES = {
    "1-1", "1-2", "1-3",
    "2-1", "2-2", "2-3",
    "3-1", "3-2", "3-3",
}


def _etag_hex(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _prime_json_cache(payload: dict, cache_key: str) -> None:
    blob = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    etag = _etag_hex(blob)
    gzip_blob = gzip.compress(blob, compresslevel=6)
    gzip_etag = _etag_hex(gzip_blob)
    _json_response_cache[cache_key] = (blob, etag, gzip_blob, gzip_etag)


def _cached_json_response(
    payload: dict,
    cache_key: str,
    cache_control: str = "public, max-age=300",
) -> Response:
    cached = _json_response_cache.get(cache_key)
    if cached is None:
        _prime_json_cache(payload, cache_key)
        cached = _json_response_cache[cache_key]
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


def _parse_int_list(values) -> list[int]:
    if not isinstance(values, list):
        return []
    out: list[int] = []
    seen: set[int] = set()
    for value in values:
        try:
            parsed = int(float(value))
        except Exception:
            continue
        if parsed in seen:
            continue
        seen.add(parsed)
        out.append(parsed)
    return out


def _parse_label_list(values) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        label = str(value).strip()
        if not label or label in seen:
            continue
        seen.add(label)
        out.append(label)
    return out


def _parse_zone_number(value) -> int | None:
    try:
        if value is None:
            return None
        text = str(value).strip()
        if not text:
            return None
        return int(float(text))
    except Exception:
        return None


def _normalize_label(value) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _material_hearth_code_from_meta(meta: dict) -> str:
    combo = _normalize_label(meta.get("material+hearth_zone"))
    if combo:
        return combo
    zone = _parse_zone_number(meta.get("building_material_zone_number"))
    hearth_code = _normalize_label(meta.get("hearth_system_zone_number")).upper()
    if len(hearth_code) != 1 or not hearth_code.isalpha():
        hearth_code = "U"
    left = str(zone) if zone is not None else "U"
    return f"{left}_{hearth_code}"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health")
def health():
    _ensure_background_load_started()
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
    _ensure_background_load_started()
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503
    return _cached_json_response(store.bootstrap_payload, "bootstrap")


@app.route("/api/overlay/<layer_id>")
def api_overlay(layer_id: str):
    _ensure_background_load_started()
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
    _ensure_background_load_started()
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


@app.route("/api/municipality/<bfs>/profile")
def api_municipality_profile(bfs: str):
    _ensure_background_load_started()
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503

    payload = store.get_municipality_profile(bfs)
    if payload is None:
        return jsonify({"error": f"Unknown municipality BFS: {bfs}"}), 404

    cache_key = f"profile:{payload.get('bfs', str(bfs))}"
    return _cached_json_response(payload, cache_key, cache_control="public, max-age=300")


@app.route("/api/municipality/<bfs>/weather")
def api_municipality_weather(bfs: str):
    _ensure_background_load_started()
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503

    from services import epw_service

    parsed_bfs = str(int(bfs)) if bfs.isdigit() else None
    if parsed_bfs is None:
        return jsonify({"error": "Invalid BFS identifier"}), 400

    if parsed_bfs in _weather_cache:
        return jsonify(_weather_cache[parsed_bfs])

    base = store.profile_base_by_bfs.get(parsed_bfs)
    if base is None:
        return jsonify({"error": f"Unknown municipality BFS: {bfs}"}), 404

    lat = base.get("centroid_lat")
    lon = base.get("centroid_lon")
    if lat is None or lon is None:
        return jsonify({"error": "Centroid coordinates not available"}), 404

    summary = epw_service.get_weather_summary(lat, lon)
    if summary is None:
        return jsonify({"error": "Weather data could not be retrieved"}), 503

    _weather_cache[parsed_bfs] = summary
    return jsonify(summary)


@app.route("/api/recompute", methods=["POST"])
def api_recompute():
    _ensure_background_load_started()
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

    selected_material_hearth_zones = _parse_label_list(
        body.get("selected_material_hearth_zones", []),
    )
    apply_material_hearth_filter = _parse_bool(body.get("apply_material_hearth_filter", True), True)
    apply_climate_priority = _parse_bool(body.get("apply_climate_priority", True), True)
    if store.material_hearth_zone_values:
        selected_material_hearth_zones = [
            code
            for code in selected_material_hearth_zones
            if code in store.material_hearth_zone_values
        ]

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
    stage1_base_exceptional_count = int(len(stage1_exceptional_ids))
    stage1_severity_scores = compute_stage1_severity_scores(
        stage1_records,
        stats,
        temp_extreme=temp_extreme,
    )

    combo_top_n = 3

    selected_material_hearth_zone_set = set(selected_material_hearth_zones)
    combo_filter_active = bool(apply_material_hearth_filter)
    stage2_stats: dict[str, object] = {
        "top_n_per_group": int(combo_top_n),
        "group_counts": [],
        "input_count": int(len(stage1_exceptional_ids)),
        "eligible_count": int(len(stage1_exceptional_ids)),
        "selected_count": int(len(stage1_exceptional_ids)),
    }
    if combo_filter_active:
        material_hearth_group_by_bfs: dict[str, str] = {}
        for bfs in stage1_exceptional_ids:
            meta = store.metadata_by_bfs.get(str(bfs), {})
            material_hearth_group_by_bfs[str(bfs)] = _material_hearth_code_from_meta(meta)
        stage1_exceptional_ids, stage2_stats = select_top_n_by_group(
            stage1_exceptional_ids,
            material_hearth_group_by_bfs,
            stage1_severity_scores,
            top_n=combo_top_n,
            selected_groups=selected_material_hearth_zone_set if selected_material_hearth_zone_set else None,
            group_field_name="material_hearth_zone",
        )
    stage2_combo_filtered_count = int(len(stage1_exceptional_ids))

    climate_scores, climate_meta = compute_dynamic_climate_risk_scores(
        store.climate_indicator_frame,
        climate_indicator_keys,
    )
    climate_scores_by_bfs = {
        str(bfs): float(score)
        for bfs, score in climate_scores.items()
        if np.isfinite(score)
    }

    climate_priority_active = bool(apply_climate_priority and climate_meta["climate_stage_enabled"])
    if climate_priority_active:
        exceptional_ids, climate_stage_status, climate_stats = select_exceptional_ids_by_climate_risk_share(
            stage1_exceptional_ids,
            climate_scores_by_bfs,
            climate_top_share_pct,
        )
        climate_stats["climate_selection_scope"] = "global"
        climate_stats["climate_stage_group_counts"] = []
        climate_stats["climate_stage_group_count"] = 0
    else:
        exceptional_ids = list(stage1_exceptional_ids)
        climate_stage_status = {str(bfs): "selected" for bfs in stage1_exceptional_ids}
        climate_stats = {
            "climate_selection_scope": "global",
            "climate_top_share_pct": float(climate_top_share_pct),
            "climate_stage_input_count": int(len(stage1_exceptional_ids)),
            "climate_stage_valid_count": 0,
            "climate_stage_output_count": int(len(stage1_exceptional_ids)),
            "climate_missing_excluded": 0,
            "climate_stage_group_counts": [],
            "climate_stage_group_count": 0,
        }
        if not apply_climate_priority:
            climate_stats["climate_stage_input_count"] = int(len(stage1_exceptional_ids))
            climate_stats["climate_stage_output_count"] = int(len(stage1_exceptional_ids))
            climate_stats["climate_stage_valid_count"] = int(len(stage1_exceptional_ids))

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
                "climate_stage_enabled": bool(climate_priority_active),
                "apply_material_hearth_filter": bool(apply_material_hearth_filter),
                "apply_climate_priority": bool(apply_climate_priority),
                "stage2_combo_filter_enabled": bool(combo_filter_active),
                "stage4_climate_priority_enabled": bool(climate_priority_active),
                "stage2_reduction_mode": "top_n_per_group" if combo_filter_active else "bypass",
                "stage2_top_n_per_group": int(combo_top_n if combo_filter_active else 0),
                "stage2_group_counts": stage2_stats.get("group_counts", []),
                "stage2_group_count": int(len(stage2_stats.get("group_counts", []))),
                "stage2_combo_reduction_mode": "top_n_per_group" if combo_filter_active else "bypass",
                "stage2_combo_top_n_per_group": int(combo_top_n if combo_filter_active else 0),
                "stage2_combo_group_counts": stage2_stats.get("group_counts", []),
                "stage2_combo_group_count": int(len(stage2_stats.get("group_counts", []))),
                "climate_top_share_pct": float(climate_top_share_pct),
                "climate_indicator_count": int(climate_meta["usable_indicator_count"]),
                "climate_indicator_keys": climate_indicator_keys,
                "climate_ignored_indicators": climate_meta["climate_ignored_indicators"],
                "climate_selection_scope": str(climate_stats.get("climate_selection_scope", "global")),
                "climate_stage_group_counts": climate_stats.get("climate_stage_group_counts", []),
                "climate_stage_group_count": int(climate_stats.get("climate_stage_group_count", 0)),
                # Backward compatibility aliases (kept for one transition cycle).
                "climate_stage_zone_counts": climate_stats.get("climate_stage_group_counts", []),
                "climate_stage_zone_count": int(climate_stats.get("climate_stage_group_count", 0)),
                "excluded_bivariate_classes": stage1_class_stats["excluded_bivariate_classes"],
                "stage1_candidate_record_count_before_filter": int(stage1_class_stats["stage1_candidate_record_count_before_filter"]),
                "stage1_candidate_record_count_after_filter": int(stage1_class_stats["stage1_candidate_record_count_after_filter"]),
                "stage1_candidate_record_excluded_count": int(stage1_class_stats["stage1_candidate_record_excluded_count"]),
                "selected_material_hearth_zones": selected_material_hearth_zones,
                "stage1_exceptional_count": int(stage1_base_exceptional_count),
                "stage2_combo_filtered_count": int(stage2_combo_filtered_count),
                "stage2_exceptional_count": int(len(exceptional_ids)),
                "stage4_exceptional_count": int(len(exceptional_ids)),
                "climate_stage_input_count": int(climate_stats["climate_stage_input_count"]),
                "climate_stage_valid_count": int(climate_stats["climate_stage_valid_count"]),
                "climate_stage_output_count": int(climate_stats["climate_stage_output_count"]),
                "climate_missing_excluded": int(climate_stats["climate_missing_excluded"]),
                # Backward compatibility aliases (kept for one transition cycle).
                "apply_material_filter": bool(apply_material_hearth_filter),
                "apply_hearth_filter": False,
                "stage2_material_filter_enabled": bool(combo_filter_active),
                "stage3_hearth_filter_enabled": False,
                "stage3_reduction_mode": "bypass",
                "stage3_top_n_per_group": 0,
                "stage3_group_counts": [],
                "stage3_group_count": 0,
                "selected_building_material_zone_numbers": [],
                "selected_hearth_system_zones": [],
                "stage2_material_filtered_count": int(stage2_combo_filtered_count),
                "stage3_hearth_filtered_count": int(stage2_combo_filtered_count),
                "stage1_material_filtered_count": int(stage2_combo_filtered_count),
            },
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5050"))
    app.run(host="127.0.0.1", port=port, debug=False)
