"""Computation helpers for municipality featured filter map."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Tuple

import numpy as np

# Fixed 3x3 bivariate palette from notebook-derived CSV.
BIVARIATE_PALETTE = {
    "1-1": "#e7e7e7",
    "1-2": "#d7a0a0",
    "1-3": "#c75a5a",
    "2-1": "#a5c9d2",
    "2-2": "#9a8b92",
    "2-3": "#8f4e51",
    "3-1": "#64abbd",
    "3-2": "#5d7783",
    "3-3": "#574249",
}


@dataclass
class ExceptionalStats:
    temp_mean: float
    temp_std: float
    old_mean: float
    old_std: float
    temp_cutoff: float
    old_cutoff: float


def _quantile_class(values: np.ndarray, k: int = 3) -> np.ndarray:
    """Return 1..k quantile classes for values."""
    edges = np.percentile(values, np.linspace(0, 100, k + 1)[1:-1])
    q = np.digitize(values, edges, right=False) + 1
    return np.clip(q, 1, k).astype(int)


def compute_bivariate_records(
    temp_by_bfs: Dict[str, float],
    old_pct_by_bfs: Dict[str, float],
    k: int = 3,
) -> Dict[str, Dict[str, float | str | int]]:
    """Combine temperature and old-building data into bivariate class records."""
    common = sorted(set(temp_by_bfs) & set(old_pct_by_bfs))
    if not common:
        return {}

    temp_vals = np.array([temp_by_bfs[b] for b in common], dtype=float)
    old_vals = np.array([old_pct_by_bfs[b] for b in common], dtype=float)

    valid = np.isfinite(temp_vals) & np.isfinite(old_vals)
    if not np.any(valid):
        return {}

    common_valid = [b for b, ok in zip(common, valid) if ok]
    temp_valid = temp_vals[valid]
    old_valid = old_vals[valid]

    old_q = _quantile_class(old_valid, k=k)
    temp_q = _quantile_class(temp_valid, k=k)

    records: Dict[str, Dict[str, float | str | int]] = {}
    for i, bfs in enumerate(common_valid):
        bi_class = f"{int(old_q[i])}-{int(temp_q[i])}"
        records[bfs] = {
            "temp": float(temp_valid[i]),
            "pct_old1919": float(old_valid[i]),
            "old_q": int(old_q[i]),
            "tmp_q": int(temp_q[i]),
            "bi_class": bi_class,
            "bi_color": BIVARIATE_PALETTE.get(bi_class, "#bdbdbd"),
        }
    return records


def compute_exceptional_ids(
    records: Dict[str, Dict[str, float | str | int]],
    k_temp: float,
    k_old: float,
    temp_extreme: str = "low",
) -> Tuple[list[str], ExceptionalStats]:
    """Return exceptional municipality IDs using std-multiplier thresholds.

    temp_extreme:
      - "low": target unusually low temperature values
      - "high": target unusually high temperature values
    """
    if not records:
        stats = ExceptionalStats(0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
        return [], stats

    temp_vals = np.array([float(v["temp"]) for v in records.values()], dtype=float)
    old_vals = np.array([float(v["pct_old1919"]) for v in records.values()], dtype=float)

    temp_mean = float(np.mean(temp_vals))
    temp_std = float(np.std(temp_vals))
    old_mean = float(np.mean(old_vals))
    old_std = float(np.std(old_vals))

    if temp_extreme == "high":
        temp_cutoff = temp_mean + (k_temp * temp_std)
    else:
        temp_cutoff = temp_mean - (k_temp * temp_std)
    old_cutoff = old_mean + (k_old * old_std)

    if temp_extreme == "high":
        exceptional = [
            bfs
            for bfs, rec in records.items()
            if float(rec["temp"]) > temp_cutoff and float(rec["pct_old1919"]) > old_cutoff
        ]
    else:
        exceptional = [
            bfs
            for bfs, rec in records.items()
            if float(rec["temp"]) < temp_cutoff and float(rec["pct_old1919"]) > old_cutoff
        ]

    stats = ExceptionalStats(
        temp_mean=temp_mean,
        temp_std=temp_std,
        old_mean=old_mean,
        old_std=old_std,
        temp_cutoff=temp_cutoff,
        old_cutoff=old_cutoff,
    )
    return exceptional, stats


def filter_records_by_bivariate_class(
    records: Dict[str, Dict[str, float | str | int]],
    excluded_classes: set[str],
) -> Tuple[Dict[str, Dict[str, float | str | int]], Dict[str, int | list[str]]]:
    """Filter candidate records before stage-1 threshold calculation."""
    normalized_classes = {str(value) for value in excluded_classes if str(value)}
    pre_count = int(len(records))
    if not normalized_classes:
        return records, {
            "excluded_bivariate_classes": [],
            "stage1_candidate_record_count_before_filter": pre_count,
            "stage1_candidate_record_count_after_filter": pre_count,
            "stage1_candidate_record_excluded_count": 0,
        }

    filtered_records: Dict[str, Dict[str, float | str | int]] = {}
    excluded_count = 0
    for bfs, rec in records.items():
        bi_class = str(rec.get("bi_class", "") or "")
        if bi_class and bi_class in normalized_classes:
            excluded_count += 1
            continue
        filtered_records[str(bfs)] = rec

    return filtered_records, {
        "excluded_bivariate_classes": sorted(normalized_classes),
        "stage1_candidate_record_count_before_filter": pre_count,
        "stage1_candidate_record_count_after_filter": int(len(filtered_records)),
        "stage1_candidate_record_excluded_count": int(excluded_count),
    }


def select_exceptional_ids_by_climate_risk_share(
    stage1_exceptional_ids: list[str],
    climate_scores_by_bfs: Dict[str, float],
    top_share_pct: float,
) -> Tuple[list[str], Dict[str, str], Dict[str, int | float]]:
    """Select the top climate-risk share from stage-1 exceptional IDs."""
    ranked: list[tuple[str, float]] = []
    status_by_bfs: Dict[str, str] = {}
    missing_excluded = 0

    for bfs in stage1_exceptional_ids:
        key = str(bfs)
        value = climate_scores_by_bfs.get(key)
        if value is None or not np.isfinite(value):
            status_by_bfs[key] = "missing"
            missing_excluded += 1
            continue
        ranked.append((key, float(value)))

    ranked.sort(key=lambda item: (-item[1], item[0]))

    valid_count = len(ranked)
    if valid_count > 0:
        selected_count = max(1, int(math.ceil(valid_count * (float(top_share_pct) / 100.0))))
    else:
        selected_count = 0

    selected_ids = [bfs for bfs, _ in ranked[:selected_count]]
    selected_set = set(selected_ids)

    for bfs, _score in ranked:
        status_by_bfs[bfs] = "selected" if bfs in selected_set else "filtered_out"

    stats = {
        "climate_top_share_pct": float(top_share_pct),
        "climate_stage_input_count": int(len(stage1_exceptional_ids)),
        "climate_stage_valid_count": int(valid_count),
        "climate_stage_output_count": int(len(selected_ids)),
        "climate_missing_excluded": int(missing_excluded),
    }
    return selected_ids, status_by_bfs, stats


def select_exceptional_ids_by_climate_risk_share_per_zone(
    stage1_exceptional_ids: list[str],
    climate_scores_by_bfs: Dict[str, float],
    top_share_pct: float,
    zone_number_by_bfs: Dict[str, int | None],
) -> Tuple[list[str], Dict[str, str], Dict[str, int | float | str | list[dict[str, Any]]]]:
    """Select top climate-risk share separately inside each building-material zone."""
    status_by_bfs: Dict[str, str] = {}
    ranked_by_zone: Dict[int | None, list[tuple[str, float]]] = {}
    missing_excluded = 0

    for bfs in stage1_exceptional_ids:
        key = str(bfs)
        value = climate_scores_by_bfs.get(key)
        if value is None or not np.isfinite(value):
            status_by_bfs[key] = "missing"
            missing_excluded += 1
            continue
        zone_key = zone_number_by_bfs.get(key)
        ranked_by_zone.setdefault(zone_key, []).append((key, float(value)))

    selected_ids: list[str] = []
    total_valid_count = 0
    per_zone_counts: list[dict[str, Any]] = []
    ordered_zone_keys = sorted(ranked_by_zone.keys(), key=lambda value: (value is None, value if value is not None else 0))

    for zone_key in ordered_zone_keys:
        ranked = ranked_by_zone.get(zone_key, [])
        ranked.sort(key=lambda item: (-item[1], item[0]))
        valid_count = len(ranked)
        total_valid_count += valid_count
        if valid_count > 0:
            selected_count = max(1, int(math.ceil(valid_count * (float(top_share_pct) / 100.0))))
        else:
            selected_count = 0

        selected_zone_ids = [bfs for bfs, _ in ranked[:selected_count]]
        selected_zone_set = set(selected_zone_ids)
        selected_ids.extend(selected_zone_ids)
        for bfs, _score in ranked:
            status_by_bfs[bfs] = "selected" if bfs in selected_zone_set else "filtered_out"

        per_zone_counts.append(
            {
                "zone_number": zone_key,
                "stage1_valid_count": int(valid_count),
                "selected_count": int(len(selected_zone_ids)),
            }
        )

    stats = {
        "climate_selection_scope": "per_building_material_zone",
        "climate_top_share_pct": float(top_share_pct),
        "climate_stage_input_count": int(len(stage1_exceptional_ids)),
        "climate_stage_valid_count": int(total_valid_count),
        "climate_stage_output_count": int(len(selected_ids)),
        "climate_missing_excluded": int(missing_excluded),
        "climate_stage_zone_counts": per_zone_counts,
        "climate_stage_zone_count": int(len(per_zone_counts)),
    }
    return selected_ids, status_by_bfs, stats


def label_heating_options(available_codes: Iterable[str]) -> list[dict[str, str]]:
    """Build frontend label list for heating-system exclusion controls."""
    heat_map = {
        "1": "Energy sources for heat pump",
        "2": "Gas",
        "3": "Heating oil",
        "4": "Wood",
        "5": "Electricity",
        "6": "District heating",
        "7": "Solar thermal",
        "8": "Others",
        "9": "None",
    }

    options = []
    for code in sorted(set(available_codes), key=lambda x: int(x) if x.isdigit() else x):
        options.append({"code": code, "label": heat_map.get(code, f"Heating {code}")})
    return options
