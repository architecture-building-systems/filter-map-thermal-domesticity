"""EPW weather service: nearest-station lookup, download, parse, and summarise."""

from __future__ import annotations

import io
import logging
import threading
import urllib.request
import zipfile
from pathlib import Path

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

_HERE = Path(__file__).parent.parent
_CSV_PATH = _HERE / "background_data" / "climate_one_building.csv"
_EPW_CACHE_DIR = _HERE / "swiss_stats" / "cache" / "epw"

# ---------------------------------------------------------------------------
# Variables to summarise from the EPW DataFrame
# ---------------------------------------------------------------------------

EPW_VARIABLES = [
    {
        "key":   "temp_air",
        "label": "Dry Bulb Temperature (°C)",
        "colour_scatter": "rgba(200,100,80,0.25)",
        "colour_line":    "rgba(180,60,40,1.0)",
    },
    {
        "key":   "ghi",
        "label": "Global Horizontal Irradiance (W/m²)",
        "colour_scatter": "rgba(230,170,40,0.25)",
        "colour_line":    "rgba(200,140,0,1.0)",
    },
    {
        "key":   "relative_humidity",
        "label": "Relative Humidity (%)",
        "colour_scatter": "rgba(60,120,180,0.25)",
        "colour_line":    "rgba(30,80,150,1.0)",
    },
]

_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# ---------------------------------------------------------------------------
# Station index (loaded once)
# ---------------------------------------------------------------------------

_stations_df: pd.DataFrame | None = None
_stations_tree = None
_stations_lock = threading.Lock()


def _load_stations() -> tuple[pd.DataFrame, object]:
    """Load climate stations CSV and build a KDTree for nearest-point lookup."""
    global _stations_df, _stations_tree
    with _stations_lock:
        if _stations_df is not None:
            return _stations_df, _stations_tree
        try:
            from scipy.spatial import KDTree
            df = pd.read_csv(_CSV_PATH)
            df = df.rename(columns={
                "Latitude (N+/S-)":  "lat",
                "Longitude (E+/W-)": "lon",
                "URL":               "url",
                "WMO":               "wmo",
                "City/Station":      "station",
                "Elevation (m)":     "elevation",
            })
            df = df.dropna(subset=["lat", "lon", "url"])
            df["wmo"] = df["wmo"].astype(str)
            coords = df[["lat", "lon"]].values
            tree = KDTree(coords)
            _stations_df = df.reset_index(drop=True)
            _stations_tree = tree
            logger.info("EPW station index loaded: %d stations", len(df))
        except Exception:
            logger.exception("Failed to load EPW station index")
            _stations_df = pd.DataFrame()
            _stations_tree = None
        return _stations_df, _stations_tree


# ---------------------------------------------------------------------------
# EPW file download + cache
# ---------------------------------------------------------------------------

def _epw_cache_path(wmo: str) -> Path:
    _EPW_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return _EPW_CACHE_DIR / f"{wmo}.epw"


def _download_epw(url: str, wmo: str) -> Path:
    """Download ZIP from OneBuilding, extract the EPW, cache locally."""
    dest = _epw_cache_path(wmo)
    if dest.exists():
        return dest
    logger.info("Downloading EPW for WMO %s from %s", wmo, url)
    with urllib.request.urlopen(url, timeout=60) as resp:
        raw = resp.read()
    with zipfile.ZipFile(io.BytesIO(raw)) as zf:
        epw_names = [n for n in zf.namelist() if n.lower().endswith(".epw")]
        if not epw_names:
            raise ValueError(f"No EPW file found in ZIP from {url}")
        epw_bytes = zf.read(epw_names[0])
    dest.write_bytes(epw_bytes)
    logger.info("EPW cached: %s (%d bytes)", dest.name, len(epw_bytes))
    return dest


# ---------------------------------------------------------------------------
# EPW parsing + aggregation
# ---------------------------------------------------------------------------

def _build_variable_summary(df: pd.DataFrame, var_key: str) -> dict:
    """
    For one variable, build per-month typical-day summary:
      medians: list of 24 floats (median per hour across all days)
      scatter: list of 24 lists (all daily values per hour)
    """
    monthly = []
    for m_idx, m_name in enumerate(_MONTH_NAMES, start=1):
        month_df = df[df["month"] == m_idx]
        medians = []
        scatter = []
        for h in range(24):
            hour_vals = month_df.loc[month_df["hour"] == h, var_key].dropna().values
            medians.append(round(float(np.median(hour_vals)), 1) if len(hour_vals) else None)
            scatter.append([round(float(v), 1) for v in hour_vals])
        monthly.append({
            "month": m_idx,
            "name":  m_name,
            "medians": medians,
            "scatter": scatter,
        })
    return {"monthly": monthly}


def _parse_and_summarise(epw_path: Path, station_meta: dict) -> dict:
    """Parse EPW file and return full weather summary payload."""
    import pvlib
    epw_df, _meta = pvlib.iotools.read_epw(str(epw_path))

    # pvlib EPW uses 1-based hour stored in the datetime index; extract month/hour
    epw_df = epw_df.copy()
    epw_df["month"] = epw_df.index.month
    epw_df["hour"]  = epw_df.index.hour

    variables = {}
    for var_cfg in EPW_VARIABLES:
        key = var_cfg["key"]
        if key not in epw_df.columns:
            logger.warning("EPW column '%s' not found — skipping", key)
            continue
        variables[key] = {
            "label":          var_cfg["label"],
            "colour_scatter": var_cfg["colour_scatter"],
            "colour_line":    var_cfg["colour_line"],
            **_build_variable_summary(epw_df, key),
        }

    return {
        "station": station_meta,
        "variables": variables,
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_weather_summary(lat: float, lon: float) -> dict | None:
    """
    Find nearest EPW station to (lat, lon), download/cache EPW, return summary.
    Returns None on any failure.
    """
    stations, tree = _load_stations()
    if stations.empty or tree is None:
        logger.warning("EPW station index unavailable")
        return None

    try:
        _, idx = tree.query([lat, lon])
        row = stations.iloc[idx]
        station_meta = {
            "name":      str(row.get("station", "")),
            "lat":       float(row["lat"]),
            "lon":       float(row["lon"]),
            "wmo":       str(row["wmo"]),
            "elevation": float(row["elevation"]) if pd.notna(row.get("elevation")) else None,
        }
        epw_path = _download_epw(str(row["url"]), str(row["wmo"]))
        return _parse_and_summarise(epw_path, station_meta)
    except Exception:
        logger.exception("Failed to get weather summary for lat=%.4f lon=%.4f", lat, lon)
        return None
