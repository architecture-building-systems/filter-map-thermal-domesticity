"""Swiss Statistics hectare-level data access module.

Loads STATPOP, BDS, SLS, and STATENT datasets via swisslandstats-geopy,
aggregates them to municipality level by BFS number, and caches results
as parquet files.
"""

import os as _os
from pathlib import Path as _Path

# Fix PROJ database path when conda base env has a stale proj.db.
_env_proj = _Path(_os.sys.executable).resolve().parents[1] / "share" / "proj"
if _env_proj.is_dir() and "PROJ_DATA" not in _os.environ:
    _os.environ["PROJ_DATA"] = str(_env_proj)

from swiss_stats.variable_catalog import (
    STATPOP_VARIABLES,
    BDS_VARIABLES,
    SLS_VARIABLES,
    SLS_CLASS_LABELS,
    STATENT_VARIABLES,
    AGG_HINTS,
    DATASET_CATALOGS,
    get_selected_columns,
)
from swiss_stats.loaders import load_dataset
from swiss_stats.aggregate import aggregate_to_municipalities, aggregate_dataset
from swiss_stats.cache import save_cache, load_cache, is_cache_valid

__all__ = [
    "STATPOP_VARIABLES",
    "BDS_VARIABLES",
    "SLS_VARIABLES",
    "SLS_CLASS_LABELS",
    "STATENT_VARIABLES",
    "AGG_HINTS",
    "DATASET_CATALOGS",
    "get_selected_columns",
    "load_dataset",
    "aggregate_to_municipalities",
    "aggregate_dataset",
    "save_cache",
    "load_cache",
    "is_cache_valid",
]
