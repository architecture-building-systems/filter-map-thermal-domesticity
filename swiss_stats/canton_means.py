"""Pre-compute canton and Swiss means for all cached municipality datasets.

Outputs two JSON files:
  cache/canton_means.json  – { "canton_num": { "dataset__var": mean, ... } }
  cache/swiss_means.json   – { "dataset__var": mean, ... }

Keys are prefixed with the dataset name and double-underscore, e.g.
  "statpop__BB11", "bds__GB01", "sls_composition__LU25_10__100"

Usage (CLI):
    python -m swiss_stats.canton_means
    python swiss_stats/canton_means.py [--force]
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

import geopandas as gpd
import pandas as pd

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).parent / "cache"
CANTON_MEANS_PATH = CACHE_DIR / "canton_means.json"
SWISS_MEANS_PATH = CACHE_DIR / "swiss_means.json"

_BACKGROUND_DIR = Path(__file__).parent.parent / "background_data"
_MUNI_GDF_PATH = _BACKGROUND_DIR / "07_municipalities_updated_fields.geojson"

_DATASETS = ("statpop", "bds", "sls_composition")


def _load_canton_map() -> dict[str, int]:
    """Return {bfs_str: canton_num} from the municipality GeoJSON."""
    if not _MUNI_GDF_PATH.exists():
        logger.warning("Municipality GeoJSON not found: %s", _MUNI_GDF_PATH)
        return {}
    gdf = gpd.read_file(_MUNI_GDF_PATH)
    result: dict[str, int] = {}
    for _, row in gdf.iterrows():
        bfs = row.get("BFS_NUMMER")
        canton = row.get("KANTONSNUM")
        if bfs is not None and canton is not None:
            try:
                result[str(int(bfs))] = int(canton)
            except (ValueError, TypeError):
                pass
    return result


def _load_parquet(key: str) -> pd.DataFrame | None:
    path = CACHE_DIR / f"{key}_by_municipality.parquet"
    if not path.exists():
        logger.warning("Cache not found for '%s' (%s)", key, path)
        return None
    df = pd.read_parquet(path)
    df.index = df.index.astype(str)
    return df


def _numeric_cols(df: pd.DataFrame) -> list[str]:
    return [c for c in df.columns if c != "NAME" and pd.api.types.is_numeric_dtype(df[c])]


def compute_and_cache(force: bool = False) -> None:
    """Compute canton and Swiss means from cached parquets and write JSON.

    Skips computation if both output files exist and ``force`` is False.
    """
    if not force and CANTON_MEANS_PATH.exists() and SWISS_MEANS_PATH.exists():
        logger.info("Canton/Swiss means already cached — use force=True to recompute.")
        return

    canton_map = _load_canton_map()
    if not canton_map:
        logger.error("Empty canton map — aborting means computation.")
        return

    # Build a combined numeric frame across all datasets, keyed as dataset__var
    index = sorted(canton_map.keys(), key=lambda x: int(x))
    combined = pd.DataFrame(index=index)
    combined.index.name = "BFS_NUMMER"

    for key in _DATASETS:
        df = _load_parquet(key)
        if df is None:
            continue
        for col in _numeric_cols(df):
            combined[f"{key}__{col}"] = df.reindex(combined.index)[col]

    if combined.empty or combined.shape[1] == 0:
        logger.error("No numeric data found in caches — aborting.")
        return

    # Attach canton numbers
    combined["__canton__"] = pd.Series(canton_map)

    # Canton means: group by canton, compute column means
    canton_groups = combined.groupby("__canton__")
    canton_means: dict[str, dict[str, float]] = {}
    for canton_num, group in canton_groups:
        data_cols = [c for c in group.columns if c != "__canton__"]
        means = group[data_cols].mean(skipna=True)
        canton_means[str(int(canton_num))] = {
            k: round(float(v), 4) for k, v in means.items() if pd.notna(v)
        }

    # Swiss means: global column means (excluding canton column)
    data_cols = [c for c in combined.columns if c != "__canton__"]
    swiss_series = combined[data_cols].mean(skipna=True)
    swiss_means: dict[str, float] = {
        k: round(float(v), 4) for k, v in swiss_series.items() if pd.notna(v)
    }

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with open(CANTON_MEANS_PATH, "w", encoding="utf-8") as f:
        json.dump(canton_means, f, separators=(",", ":"))
    with open(SWISS_MEANS_PATH, "w", encoding="utf-8") as f:
        json.dump(swiss_means, f, separators=(",", ":"))

    logger.info(
        "Canton means: %d cantons, %d vars. Swiss means: %d vars.",
        len(canton_means),
        next(iter(len(v) for v in canton_means.values()), 0),
        len(swiss_means),
    )


def load_canton_means() -> dict[str, dict[str, float]]:
    """Load pre-computed canton means. Returns {} if not yet computed."""
    if not CANTON_MEANS_PATH.exists():
        return {}
    with open(CANTON_MEANS_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_swiss_means() -> dict[str, float]:
    """Load pre-computed Swiss means. Returns {} if not yet computed."""
    if not SWISS_MEANS_PATH.exists():
        return {}
    with open(SWISS_MEANS_PATH, encoding="utf-8") as f:
        return json.load(f)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    force = "--force" in sys.argv
    compute_and_cache(force=force)
