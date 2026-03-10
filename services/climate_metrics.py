from __future__ import annotations

from collections import Counter
from typing import Iterable, Literal, Sequence

import numpy as np
import pandas as pd

# ============================================================
# Climate indicator catalog
# ============================================================

CLIMATE_INDICATOR_CATALOG = [
    {"key": "HDD_change_gwl3.0", "label": "Heating Degree Days", "group": "Temperature / Energy Demand", "direction": "higher", "default_selected": False},
    {"key": "CDD_change_gwl3.0", "label": "Cooling Degree Days", "group": "Temperature / Energy Demand", "direction": "higher", "default_selected": True},
    {"key": "TASann_change_gwl3.0", "label": "Annual Mean Temperature", "group": "Temperature / Energy Demand", "direction": "higher", "default_selected": False},
    {"key": "TXann_change_gwl3.0", "label": "Annual Mean Daily Maximum Temperature", "group": "Temperature / Energy Demand", "direction": "higher", "default_selected": False},
    {"key": "TNann_change_gwl3.0", "label": "Annual Mean Daily Minimum Temperature", "group": "Temperature / Energy Demand", "direction": "higher", "default_selected": False},
    {"key": "TXx_change_gwl3.0", "label": "Hottest Day", "group": "Temperature Extremes", "direction": "higher", "default_selected": True},
    {"key": "TNn_change_gwl3.0", "label": "Coldest Night", "group": "Temperature Extremes", "direction": "higher", "default_selected": False},
    {"key": "DTR_change_gwl3.0", "label": "Diurnal Temperature Range", "group": "Temperature Extremes", "direction": "higher", "default_selected": False},
    {"key": "TropNights_change_gwl3.0", "label": "Tropical Nights", "group": "Temperature Extremes", "direction": "higher", "default_selected": True},
    {"key": "SummerDays_change_gwl3.0", "label": "Summer Days", "group": "Temperature Extremes", "direction": "higher", "default_selected": True},
    {"key": "PRCPTOT_change_gwl3.0", "label": "Total Precipitation", "group": "Precipitation Totals / Intensity", "direction": "higher", "default_selected": False},
    {"key": "WetDays_change_gwl3.0", "label": "Wet-Day Frequency", "group": "Precipitation Totals / Intensity", "direction": "higher", "default_selected": False},
    {"key": "SDII_change_gwl3.0", "label": "Simple Daily Intensity Index", "group": "Precipitation Totals / Intensity", "direction": "higher", "default_selected": False},
    {"key": "PRmon_change_gwl3.0", "label": "Monthly Total Precipitation", "group": "Precipitation Totals / Intensity", "direction": "higher", "default_selected": False},
    {"key": "Rx1day_change_gwl3.0", "label": "Maximum 1-Day Precipitation", "group": "Precipitation Extremes / Persistence", "direction": "higher", "default_selected": False},
    {"key": "Rx5day_change_gwl3.0", "label": "Maximum 5-Day Precipitation", "group": "Precipitation Extremes / Persistence", "direction": "higher", "default_selected": False},
    {"key": "MaxDrySpell_change_gwl3.0", "label": "Maximum Dry Spell Length", "group": "Precipitation Extremes / Persistence", "direction": "higher", "default_selected": True},
    {"key": "BIO01_change_gwl3.0", "label": "BIO01 Annual Mean Temperature", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO02_change_gwl3.0", "label": "BIO02 Mean Diurnal Range", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO03_change_gwl3.0", "label": "BIO03 Isothermality", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO04_change_gwl3.0", "label": "BIO04 Temperature Seasonality", "group": "BIO Temperature", "direction": "higher", "default_selected": True},
    {"key": "BIO05_change_gwl3.0", "label": "BIO05 Max Temperature of Warmest Month", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO06_change_gwl3.0", "label": "BIO06 Min Temperature of Coldest Month", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO07_change_gwl3.0", "label": "BIO07 Temperature Annual Range", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO08_change_gwl3.0", "label": "BIO08 Mean Temperature of Wettest Quarter", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO09_change_gwl3.0", "label": "BIO09 Mean Temperature of Driest Quarter", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO10_change_gwl3.0", "label": "BIO10 Mean Temperature of Warmest Quarter", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO11_change_gwl3.0", "label": "BIO11 Mean Temperature of Coldest Quarter", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "TASmon_change_gwl3.0", "label": "Monthly Mean Temperature", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "TXmon_change_gwl3.0", "label": "Monthly Mean Daily Maximum Temperature", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "TNmon_change_gwl3.0", "label": "Monthly Mean Daily Minimum Temperature", "group": "BIO Temperature", "direction": "higher", "default_selected": False},
    {"key": "BIO13_change_gwl3.0", "label": "BIO13 Precipitation of Wettest Month", "group": "BIO Precipitation", "direction": "higher", "default_selected": False},
    {"key": "BIO14_change_gwl3.0", "label": "BIO14 Precipitation of Driest Month", "group": "BIO Precipitation", "direction": "higher", "default_selected": False},
    {"key": "BIO15_change_gwl3.0", "label": "BIO15 Precipitation Seasonality", "group": "BIO Precipitation", "direction": "higher", "default_selected": False},
    {"key": "BIO16_change_gwl3.0", "label": "BIO16 Precipitation of Wettest Quarter", "group": "BIO Precipitation", "direction": "higher", "default_selected": False},
    {"key": "BIO17_change_gwl3.0", "label": "BIO17 Precipitation of Driest Quarter", "group": "BIO Precipitation", "direction": "higher", "default_selected": False},
    {"key": "BIO18_change_gwl3.0", "label": "BIO18 Precipitation of Warmest Quarter", "group": "BIO Precipitation", "direction": "higher", "default_selected": False},
    {"key": "BIO19_change_gwl3.0", "label": "BIO19 Precipitation of Coldest Quarter", "group": "BIO Precipitation", "direction": "higher", "default_selected": False},
]

CLIMATE_INDICATOR_BY_KEY = {item["key"]: item for item in CLIMATE_INDICATOR_CATALOG}
DEFAULT_CLIMATE_INDICATOR_KEYS = [item["key"] for item in CLIMATE_INDICATOR_CATALOG if item["default_selected"]]


# ============================================================
# MCDA Climate Risk Score (general utilities)
# ============================================================

def zscore_normalize(
    values: np.ndarray | "pd.Series",
    *,
    ddof: int = 0,
) -> np.ndarray:
    arr = np.asarray(values, dtype=np.float64)
    mu = np.nanmean(arr)
    sigma = np.nanstd(arr, ddof=ddof)
    if sigma == 0:
        return np.full_like(arr, np.nan)
    return (arr - mu) / sigma


def minmax_normalize(
    values: np.ndarray | "pd.Series",
    *,
    lower: float = 0.0,
    upper: float = 1.0,
) -> np.ndarray:
    arr = np.asarray(values, dtype=np.float64)
    vmin, vmax = np.nanmin(arr), np.nanmax(arr)
    if vmax == vmin:
        return np.full_like(arr, np.nan)
    return lower + (arr - vmin) * (upper - lower) / (vmax - vmin)


def mcda_weighted_sum(
    data: dict[str, np.ndarray | "pd.Series"],
    weights: dict[str, float],
    *,
    normalize: Literal["zscore", "minmax", "none"] = "zscore",
) -> np.ndarray:
    w_sum = sum(weights.values())
    if not np.isclose(w_sum, 1.0):
        raise ValueError(f"Weights must sum to 1.0, got {w_sum:.4f}")

    common = [k for k in weights if k in data]
    if not common:
        raise ValueError("No common indicators between data and weights")

    w_subset = {k: weights[k] for k in common}
    w_total = sum(w_subset.values())
    w_subset = {k: v / w_total for k, v in w_subset.items()}

    lengths = [len(np.asarray(data[k])) for k in common]
    if len(set(lengths)) != 1:
        raise ValueError(f"All arrays must have same length, got {lengths}")

    norm_fn = {
        "zscore": zscore_normalize,
        "minmax": minmax_normalize,
        "none": lambda x: np.asarray(x, dtype=np.float64),
    }[normalize]

    result = np.zeros(lengths[0], dtype=np.float64)
    for ind in common:
        normed = norm_fn(data[ind])
        result += w_subset[ind] * normed

    return result


# ============================================================
# Climate risk helpers for the filter-map app
# ============================================================

def get_climate_indicator_options(available_columns: Iterable[str] | None = None) -> list[dict[str, str | bool]]:
    allowed = set(available_columns) if available_columns is not None else None
    out: list[dict[str, str | bool]] = []
    for item in CLIMATE_INDICATOR_CATALOG:
        if allowed is not None and item["key"] not in allowed:
            continue
        out.append(dict(item))
    return out


def sanitize_indicator_keys(
    keys: Iterable[str] | None,
    available_columns: Iterable[str] | None = None,
) -> list[str]:
    allowed = set(available_columns) if available_columns is not None else None
    out: list[str] = []
    seen: set[str] = set()
    for raw in keys or []:
        key = str(raw)
        if key in seen:
            continue
        if key not in CLIMATE_INDICATOR_BY_KEY:
            continue
        if allowed is not None and key not in allowed:
            continue
        seen.add(key)
        out.append(key)
    return out


def default_indicator_keys(available_columns: Iterable[str] | None = None) -> list[str]:
    return sanitize_indicator_keys(DEFAULT_CLIMATE_INDICATOR_KEYS, available_columns)


def build_equal_weights(keys: Sequence[str]) -> dict[str, float]:
    usable = [str(k) for k in keys if str(k)]
    if not usable:
        return {}
    weight = 1.0 / float(len(usable))
    return {key: weight for key in usable}


def compute_dynamic_climate_risk_scores(
    frame: pd.DataFrame,
    selected_keys: list[str],
) -> tuple[pd.Series, dict]:
    score = pd.Series(np.nan, index=frame.index, dtype=np.float64)
    available_columns = set(frame.columns)
    requested = sanitize_indicator_keys(selected_keys)
    selected = sanitize_indicator_keys(requested, available_columns)

    ignored: list[dict[str, str]] = []
    ignored_reason_counts: Counter[str] = Counter()
    usable_data: dict[str, pd.Series] = {}

    missing_from_frame = [key for key in requested if key not in available_columns]
    for key in missing_from_frame:
        ignored.append({"key": key, "reason": "missing_column"})
        ignored_reason_counts["missing_column"] += 1

    for key in selected:
        series = pd.to_numeric(frame[key], errors="coerce").astype(np.float64)
        if not np.isfinite(series.to_numpy()).any():
            ignored.append({"key": key, "reason": "all_missing"})
            ignored_reason_counts["all_missing"] += 1
            continue

        oriented = series
        finite = oriented[np.isfinite(oriented)]
        if finite.empty or float(finite.max()) == float(finite.min()):
            ignored.append({"key": key, "reason": "no_variation"})
            ignored_reason_counts["no_variation"] += 1
            continue
        usable_data[key] = oriented

    meta = {
        "requested_indicator_count": int(len(requested)),
        "selected_indicator_count": int(len(selected)),
        "usable_indicator_count": int(len(usable_data)),
        "climate_indicator_keys": list(usable_data.keys()),
        "climate_ignored_indicators": ignored,
        "climate_ignored_reason_counts": dict(ignored_reason_counts),
        "climate_stage_enabled": False,
        "valid_score_count": 0,
    }

    if not usable_data:
        return score, meta

    usable_frame = pd.DataFrame(usable_data, index=frame.index)
    valid_mask = np.isfinite(usable_frame.to_numpy(dtype=np.float64)).all(axis=1)
    valid_count = int(valid_mask.sum())
    meta["valid_score_count"] = valid_count

    if valid_count == 0:
        return score, meta

    weights = build_equal_weights(list(usable_data.keys()))
    weighted = mcda_weighted_sum(
        {key: usable_frame.loc[valid_mask, key].to_numpy(dtype=np.float64) for key in usable_data},
        weights,
        normalize="minmax",
    )
    score.loc[usable_frame.index[valid_mask]] = weighted.astype(np.float64)
    meta["climate_stage_enabled"] = True
    return score, meta
