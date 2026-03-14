"""Dataset loading wrappers around swisslandstats-geopy."""

import logging

import swisslandstats as sls

from swiss_stats.variable_catalog import get_selected_columns

logger = logging.getLogger(__name__)

# Fix separator in the library's dataset registry.  The BDS and STATENT
# CSVs use semicolons, but the registry incorrectly specifies sep=','.
# The registry's read_csv_kwargs are applied *after* user-supplied kwargs
# in load_dataset(), so we must patch the source directly.
for _ds in ("bds", "statent"):
    for _year_cfg in sls.settings.DATASET_DICT.get(_ds, {}).values():
        if isinstance(_year_cfg, dict) and "read_csv_kwargs" in _year_cfg:
            _year_cfg["read_csv_kwargs"]["sep"] = ";"


def load_dataset(
    dataset_key: str,
    columns: list[str] | None = None,
) -> sls.LandDataFrame:
    """Load a hectare-level dataset via swisslandstats-geopy.

    Parameters
    ----------
    dataset_key : str
        One of "statpop", "bds", "sls", "statent".
    columns : list[str] | None
        Specific columns to load. If None, loads the selected columns
        from the variable catalog (all uncommented entries).

    Returns
    -------
    sls.LandDataFrame
        Hectare-level data with RELI index and E_COORD/N_COORD columns.
    """
    if columns is None:
        columns = get_selected_columns(dataset_key)

    logger.info(
        "Loading dataset '%s' with %d columns...", dataset_key, len(columns)
    )
    # BDS and STATENT CSVs use semicolons; registry sep is patched at
    # module level above so the library's DEFAULT_SEP (';') takes effect.
    ldf = sls.load_dataset(dataset_key=dataset_key, columns=columns)
    logger.info(
        "Loaded '%s': %d rows × %d columns", dataset_key, len(ldf), len(ldf.columns)
    )
    return ldf
