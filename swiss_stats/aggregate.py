"""Spatial aggregation of hectare-level data to municipality level."""

from __future__ import annotations

import logging
import os
from pathlib import Path

# Fix PROJ database path when running inside conda envs with a version mismatch.
_env_proj = Path(os.sys.executable).resolve().parents[1] / "share" / "proj"
if _env_proj.is_dir() and "PROJ_DATA" not in os.environ:
    os.environ["PROJ_DATA"] = str(_env_proj)

import geopandas as gpd
import numpy as np
import pandas as pd
import rasterio
from shapely.geometry import Point

from swiss_stats.variable_catalog import AGG_HINTS, get_selected_columns, SLS_COMPOSITION_VARIABLE_LABEL_MAP

logger = logging.getLogger(__name__)

MUNICIPALITY_GEOJSON = Path(__file__).parent / "municipality_boundaries.geojson"
POPULATION_MASK_TIF = Path(__file__).parent.parent / "background_data" / "06_population_mask.tif"

# CRS used by swisslandstats (LV95)
CRS_LV95 = "EPSG:2056"

_municipalities_cache: gpd.GeoDataFrame | None = None


def _load_municipalities() -> gpd.GeoDataFrame:
    """Load and cache municipality boundaries."""
    global _municipalities_cache
    if _municipalities_cache is not None:
        return _municipalities_cache
    gdf = gpd.read_file(MUNICIPALITY_GEOJSON)
    if gdf.crs is None:
        gdf = gdf.set_crs(CRS_LV95)
    elif gdf.crs.to_epsg() != 2056:
        gdf = gdf.to_crs(CRS_LV95)
    _municipalities_cache = gdf
    logger.info("Loaded %d municipality boundaries", len(gdf))
    return gdf


def _build_points_gdf(ldf, columns: list[str]) -> gpd.GeoDataFrame:
    """Build a GeoDataFrame of hectare points from a LandDataFrame."""
    e_col = "E_KOORD" if "E_KOORD" in ldf.columns else "E_COORD"
    n_col = "N_KOORD" if "N_KOORD" in ldf.columns else "N_COORD"
    coords = ldf[[e_col, n_col]].values
    geometry = [Point(e, n) for e, n in coords]
    return gpd.GeoDataFrame(ldf[columns].copy(), geometry=geometry, crs=CRS_LV95)


def aggregate_to_municipalities(
    ldf,
    variables: list[str],
    agg_funcs: dict[str, str] | None = None,
) -> pd.DataFrame:
    """Aggregate hectare-level LandDataFrame to municipality level.

    Parameters
    ----------
    ldf : sls.LandDataFrame
        Hectare-level data with E_COORD, N_COORD columns.
    variables : list[str]
        Column names to aggregate.
    agg_funcs : dict[str, str] | None
        Maps variable code to aggregation function ("sum", "mean", "max").
        If None, uses AGG_HINTS with "sum" as default.

    Returns
    -------
    pd.DataFrame
        Indexed by BFS_NUMMER with one column per variable, plus NAME.
    """
    if agg_funcs is None:
        agg_funcs = {}

    municipalities = _load_municipalities()

    # Filter to requested variables that exist in the dataframe
    available = [v for v in variables if v in ldf.columns]
    missing = set(variables) - set(available)
    if missing:
        logger.warning("Variables not in dataframe (skipped): %s", missing)

    if not available:
        raise ValueError("No requested variables found in the dataframe")

    # Build GeoDataFrame from hectare points
    logger.info("Creating point geometries for %d hectare cells...", len(ldf))
    points_gdf = _build_points_gdf(ldf, available)

    # Spatial join: assign each hectare to a municipality
    logger.info("Performing spatial join...")
    joined = gpd.sjoin(points_gdf, municipalities, how="inner", predicate="within")

    # Build aggregation spec per variable
    agg_spec = {}
    for var in available:
        func = agg_funcs.get(var, AGG_HINTS.get(var, "sum"))
        agg_spec[var] = func

    # Group by BFS_NUMMER and aggregate
    logger.info("Aggregating %d variables by municipality...", len(available))
    grouped = joined.groupby("BFS_NUMMER")
    result = grouped[available].agg(agg_spec)

    # Attach municipality names
    name_map = municipalities.set_index("BFS_NUMMER")["NAME"]
    result.insert(0, "NAME", result.index.map(name_map))

    logger.info(
        "Aggregated to %d municipalities, %d variables", len(result), len(available)
    )
    return result


def aggregate_dataset(
    dataset_key: str,
    agg_funcs: dict[str, str] | None = None,
) -> pd.DataFrame:
    """Convenience: load dataset, get selected variables, aggregate.

    Parameters
    ----------
    dataset_key : str
        One of "statpop", "bds", "sls", "statent".
    agg_funcs : dict[str, str] | None
        Per-variable aggregation overrides.

    Returns
    -------
    pd.DataFrame
        Municipality-level DataFrame indexed by BFS_NUMMER.
    """
    from swiss_stats.loaders import load_dataset

    variables = get_selected_columns(dataset_key)
    ldf = load_dataset(dataset_key, columns=variables)
    return aggregate_to_municipalities(ldf, variables, agg_funcs)


def _apply_population_mask(ldf, e_col: str, n_col: str) -> "pd.DataFrame":
    """Return ldf filtered to rows that fall within habitable pixels.

    Uses ``06_population_mask.tif`` (EPSG:2056, ~1 km resolution).  Pixels
    with value 1 are habitable; NaN pixels are uninhabitable and excluded.
    """
    if not POPULATION_MASK_TIF.exists():
        logger.warning(
            "Population mask not found (%s); skipping habitable-area filter.",
            POPULATION_MASK_TIF,
        )
        return ldf

    with rasterio.open(POPULATION_MASK_TIF) as src:
        mask_data = src.read(1)
        transform = src.transform
        height, width = mask_data.shape

    e_vals = ldf[e_col].to_numpy()
    n_vals = ldf[n_col].to_numpy()

    # Map coordinates to pixel indices via the affine transform (origin = upper-left).
    col_idx = np.floor((e_vals - transform.c) / transform.a).astype(int)
    row_idx = np.floor((n_vals - transform.f) / transform.e).astype(int)

    in_bounds = (col_idx >= 0) & (col_idx < width) & (row_idx >= 0) & (row_idx < height)
    habitable = np.zeros(len(ldf), dtype=bool)
    habitable[in_bounds] = mask_data[row_idx[in_bounds], col_idx[in_bounds]] == 1

    n_before = len(ldf)
    filtered = ldf[habitable]
    logger.info(
        "Population mask: %d → %d hectares (removed %d uninhabitable)",
        n_before,
        len(filtered),
        n_before - len(filtered),
    )
    return filtered


def aggregate_sls_composition(
    variables: list[str] | None = None,
    apply_population_mask: bool = True,
) -> pd.DataFrame:
    """Count habitable hectares per SLS categorical class code per municipality.

    For each variable, groups by (BFS_NUMMER, class_code) and counts
    hectares, then pivots to a wide DataFrame.  Column names follow the
    pattern ``{variable}__{code}`` (e.g. ``LU18_10__100``).

    Parameters
    ----------
    variables : list[str] | None
        SLS categorical column names to aggregate.
        Defaults to the keys of SLS_COMPOSITION_VARIABLE_LABEL_MAP
        (``LU18_10`` and ``AS18_17``).
    apply_population_mask : bool
        When True (default), filter SLS hectares to habitable pixels defined
        by ``background_data/06_population_mask.tif`` (value == 1) before
        aggregating.  Uninhabitable pixels (NaN) are excluded.

    Returns
    -------
    pd.DataFrame
        Indexed by BFS_NUMMER with composition count columns and NAME.
    """
    from swiss_stats.loaders import load_dataset

    if variables is None:
        variables = list(SLS_COMPOSITION_VARIABLE_LABEL_MAP.keys())

    municipalities = _load_municipalities()

    logger.info("Loading SLS dataset for composition variables: %s", variables)
    ldf = load_dataset("sls", columns=variables)

    available = [v for v in variables if v in ldf.columns]
    missing = set(variables) - set(available)
    if missing:
        logger.warning(
            "Composition variables not in SLS dataset (skipped): %s", missing
        )
    if not available:
        raise ValueError("No composition variables found in SLS dataset")

    # Filter to habitable areas only.
    if apply_population_mask:
        e_col = "E_KOORD" if "E_KOORD" in ldf.columns else "E_COORD"
        n_col = "N_KOORD" if "N_KOORD" in ldf.columns else "N_COORD"
        ldf = _apply_population_mask(ldf, e_col, n_col)

    # Build GeoDataFrame from hectare points
    logger.info(
        "Creating point geometries for %d hectare cells (composition)...", len(ldf)
    )
    points_gdf = _build_points_gdf(ldf, available)

    # Spatial join: assign each hectare to a municipality
    logger.info("Performing spatial join (composition)...")
    joined = gpd.sjoin(
        points_gdf,
        municipalities[["BFS_NUMMER", "NAME", "geometry"]],
        how="inner",
        predicate="within",
    )

    # For each variable: count hectares per (BFS_NUMMER, code), pivot to wide
    frames: list[pd.DataFrame] = []
    for var in available:
        logger.info("Computing composition counts for '%s'...", var)
        counts = (
            joined.groupby(["BFS_NUMMER", var])
            .size()
            .rename("count")
            .reset_index()
        )
        # Drop unclassified (NaN) codes
        counts = counts.dropna(subset=[var])
        counts[var] = counts[var].astype(int)

        # Pivot: rows = BFS_NUMMER, columns = class code
        wide = (
            counts.pivot(index="BFS_NUMMER", columns=var, values="count")
            .fillna(0)
            .astype(int)
        )
        wide.columns = [f"{var}__{int(c)}" for c in wide.columns]
        frames.append(wide)

    # Outer-join all pivoted variable tables
    result = frames[0]
    for frame in frames[1:]:
        result = result.join(frame, how="outer")
    result = result.fillna(0).astype(int)

    # Attach municipality names
    name_map = municipalities.set_index("BFS_NUMMER")["NAME"]
    result.insert(0, "NAME", result.index.map(name_map))

    logger.info(
        "SLS composition: %d municipalities, %d composition columns",
        len(result),
        len(result.columns) - 1,
    )
    return result
