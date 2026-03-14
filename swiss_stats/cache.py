"""Parquet caching for municipality-aggregated results."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).parent / "cache"


def _cache_path(dataset_key: str) -> Path:
    return CACHE_DIR / f"{dataset_key}_by_municipality.parquet"


def save_cache(dataset_key: str, df: pd.DataFrame) -> Path:
    """Write aggregated DataFrame to parquet cache.

    Returns the path of the written file.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = _cache_path(dataset_key)
    df.to_parquet(path)
    logger.info("Cached '%s' → %s (%d rows)", dataset_key, path, len(df))
    return path


def load_cache(dataset_key: str) -> pd.DataFrame | None:
    """Read cached parquet if it exists, else return None."""
    path = _cache_path(dataset_key)
    if not path.exists():
        return None
    df = pd.read_parquet(path)
    logger.info("Loaded cache '%s' ← %s (%d rows)", dataset_key, path, len(df))
    return df


def is_cache_valid(dataset_key: str, max_age_days: int = 30) -> bool:
    """Check if cached file exists and was modified within max_age_days."""
    path = _cache_path(dataset_key)
    if not path.exists():
        return False
    mtime = datetime.fromtimestamp(path.stat().st_mtime)
    return datetime.now() - mtime < timedelta(days=max_age_days)
