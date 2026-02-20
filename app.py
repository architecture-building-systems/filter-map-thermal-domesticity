"""Standalone Flask app for the municipality bivariate filter map."""

from __future__ import annotations

from pathlib import Path
import threading
import os

from flask import Flask, Response, jsonify, render_template, request

from services.compute import compute_bivariate_records, compute_exceptional_ids
from services.data_store import DataStore

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, template_folder="templates", static_folder="static")
store = DataStore(BASE_DIR)

_load_error: str | None = None


def _background_load() -> None:
    global _load_error
    try:
        store.load()
    except Exception as exc:  # pragma: no cover
        _load_error = str(exc)


threading.Thread(target=_background_load, daemon=True).start()

VALID_SEASONS = {"annual", "winter"}
VALID_TEMP_METHODS = {"mean-mean", "mean-range", "mean-min", "mean-max"}


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
    return jsonify(store.bootstrap_payload)


@app.route("/api/raster/<layer_id>.png")
def api_raster(layer_id: str):
    if _load_error:
        return jsonify({"error": _load_error}), 500
    if not store.ready:
        return jsonify({"error": "Data store is still loading"}), 503

    payload = store.raster_overlay_png.get(str(layer_id))
    if payload is None:
        return jsonify({"error": f"Unknown raster layer: {layer_id}"}), 404

    return Response(
        payload,
        mimetype="image/png",
        headers={"Cache-Control": "public, max-age=3600"},
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

    temp_method = str(body.get("temp_method", "mean-mean"))
    if temp_method not in VALID_TEMP_METHODS:
        temp_method = "mean-mean"

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

    temp_by_bfs = store.get_temperature(season, temp_method, exclude_non_habitable)
    old_pct_by_bfs = store.compute_old_pct(excluded_heating_types)

    records = compute_bivariate_records(temp_by_bfs, old_pct_by_bfs, k=3)
    temp_extreme = "high" if temp_method in {"mean-range", "mean-max"} else "low"
    exceptional_ids, stats = compute_exceptional_ids(
        records,
        k_temp=k_temp,
        k_old=k_old,
        temp_extreme=temp_extreme,
    )

    for bfs, rec in records.items():
        rec.update(store.metadata_by_bfs.get(bfs, {}))

    return jsonify(
        {
            "records": records,
            "exceptional_ids": exceptional_ids,
            "stats": {
                "temp_mean": stats.temp_mean,
                "temp_std": stats.temp_std,
                "old_mean": stats.old_mean,
                "old_std": stats.old_std,
                "temp_cutoff": stats.temp_cutoff,
                "old_cutoff": stats.old_cutoff,
            },
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5050"))
    app.run(host="127.0.0.1", port=port, debug=False)
