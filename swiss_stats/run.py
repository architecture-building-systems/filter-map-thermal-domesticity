"""CLI entry point: load, aggregate, and cache all datasets.

Usage:
    python -m swiss_stats.run
    python swiss_stats/run.py
"""

import logging
import sys

from swiss_stats.aggregate import aggregate_dataset, aggregate_sls_composition
from swiss_stats.cache import is_cache_valid, load_cache, save_cache
from swiss_stats.canton_means import compute_and_cache as compute_canton_means
from swiss_stats.variable_catalog import DATASET_CATALOGS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

DATASET_KEYS = list(DATASET_CATALOGS.keys())
SLS_COMPOSITION_KEY = "sls_composition"


def main(datasets: list[str] | None = None, force: bool = False) -> None:
    """Process each dataset: load, aggregate to municipalities, cache.

    Also generates the SLS composition cache (``sls_composition``) unless
    the caller explicitly lists datasets that do not include it.

    Parameters
    ----------
    datasets : list[str] | None
        Which datasets to process. Defaults to all four standard datasets
        plus ``sls_composition``.
    force : bool
        If True, re-process even if cache is valid.
    """
    if datasets is None:
        datasets = DATASET_KEYS + [SLS_COMPOSITION_KEY]

    for key in datasets:
        logger.info("=" * 60)
        logger.info("Processing: %s", key.upper())

        if key == SLS_COMPOSITION_KEY:
            if not force and is_cache_valid(SLS_COMPOSITION_KEY):
                logger.info(
                    "Cache is valid for '%s', loading from cache...",
                    SLS_COMPOSITION_KEY,
                )
                df = load_cache(SLS_COMPOSITION_KEY)
            else:
                logger.info("Aggregating SLS composition to municipality level...")
                df = aggregate_sls_composition()
                save_cache(SLS_COMPOSITION_KEY, df)
        else:
            if not force and is_cache_valid(key):
                logger.info("Cache is valid for '%s', loading from cache...", key)
                df = load_cache(key)
            else:
                logger.info("Aggregating '%s' to municipality level...", key)
                df = aggregate_dataset(key)
                save_cache(key, df)

        # Summary
        logger.info("  Municipalities: %d", len(df))
        logger.info("  Variables: %d", len(df.columns) - 1)  # exclude NAME
        logger.info("  Sample (first 3 rows):")
        sample_cols = list(df.columns[:6])
        print(df[sample_cols].head(3).to_string())
        print()

    logger.info("All datasets processed successfully.")

    logger.info("=" * 60)
    logger.info("Computing canton and Swiss means...")
    compute_canton_means(force=force)
    logger.info("Done.")


if __name__ == "__main__":
    force = "--force" in sys.argv
    datasets = [a for a in sys.argv[1:] if not a.startswith("--")]
    main(datasets=datasets or None, force=force)
