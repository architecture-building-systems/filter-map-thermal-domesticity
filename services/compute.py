"""Computation helpers for bivariate municipality map."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, Tuple

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
