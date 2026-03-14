# Swiss Statistics Data Access Module — AGENTS.md

## Purpose

Standalone Python module for accessing Swiss Federal Statistics Office hectare-level
datasets (STATPOP, BDS, SLS, STATENT) and aggregating them to municipality level by
BFS number. No web framework, no filter_map dependency — just data loading, spatial
join, and parquet output.

## Architecture

```
variable_catalog.py  →  loaders.py  →  aggregate.py  →  cache.py
   (config)             (data)        (spatial join)    (persistence)
```

- **variable_catalog.py** — One Python dict per dataset mapping variable code → English
  label. User comments out unwanted variables. `get_selected_columns()` returns only
  uncommented codes. `AGG_HINTS` stores default aggregation behaviour. `SLS_CLASS_LABELS` 
  contains human-readable mapping for the classes in certain SLS categories such as 'AS_17'.
- **loaders.py** — Thin wrapper around `sls.load_dataset()`. Accepts dataset key and
  optional column list; defaults to catalog selection.
- **aggregate.py** — Converts hectare grid (E_COORD, N_COORD in LV95) to point
  GeoDataFrame, spatial-joins with municipality polygons, groups by `BFS_NUMMER`,
  and applies aggregation (sum/mean/max per variable).
- **cache.py** — Reads and writes parquet files in `cache/` directory, with simple
  timestamp-based validity check.
- **run.py** — CLI entry point that processes all four datasets end-to-end.
- **explore.ipynb** — Interactive notebook for testing and sanity-checking results.

## Data Flow

```
swisslandstats API  →  LandDataFrame (hectare grid)
    ↓
Point GeoDataFrame (E_COORD, N_COORD → Point geometry, CRS=EPSG:2056)
    ↓
gpd.sjoin(points, municipality_polygons, predicate="within")
    ↓
groupby("BFS_NUMMER").agg(sum/mean/max)
    ↓
pd.DataFrame indexed by BFS_NUMMER  →  parquet cache
```

## Variable Catalog Convention

- Each dataset has a `dict[str, str]` in `variable_catalog.py`
- Keys are variable codes exactly as they appear in the swisslandstats data
- Values are English descriptions translated from the German Excel source files
- To exclude a variable: **comment out** its line (don't delete it)
- `get_selected_columns(dataset_key)` returns only uncommented variable codes

## Aggregation Convention

- All results are indexed by `BFS_NUMMER` (int) — the official Swiss municipality ID
- `"sum"` for absolute counts (population, buildings, employees, area in m²)
- `"mean"` for rates and ratios
- `"max"` for categorical codes (land use classes); in practice use mode
- Defaults are set in `AGG_HINTS`; per-variable overrides via `agg_funcs` parameter

## Output Format

Parquet files in `cache/`:
```
cache/
├── statpop_by_municipality.parquet
├── bds_by_municipality.parquet
├── sls_by_municipality.parquet
└── statent_by_municipality.parquet
```

Each file is a DataFrame with:
- Index: `BFS_NUMMER` (int)
- First column: `NAME` (municipality name)
- Remaining columns: one per selected variable

## Coordinate System

LV95 (EPSG:2056) throughout, matching swisslandstats defaults. Municipality
boundaries GeoJSON is also in LV95.

## Integration Path (future)

When porting to filter_map:
1. Import `aggregate_dataset()` from this module
2. Merge the returned DataFrame into `DataStore.profile_metric_frame` by BFS key
3. Variable names from the catalog become profile metric keys

## Dependencies

- `swisslandstats-geopy` — data access (downloads from FSO, caches locally)
- `geopandas` — spatial join operations
- `pandas` — data manipulation
- `numpy` — numeric operations
- `pyarrow` — parquet I/O
- `openpyxl` — only needed at dev time for reading Excel variable files

## Language

All labels and descriptions are in English (translated from German source files).
Original German variable codes are preserved as-is.

## Known Quirks

- **PROJ database version mismatch**: The conda `py312` environment picks up the
  base environment's `proj.db` which has an older schema version. The package
  `__init__.py` auto-sets `PROJ_DATA` to the env-specific share directory. If you
  still see PROJ errors, set the env var before launching Python:
  `PROJ_DATA=/opt/homebrew/Caskroom/miniforge/base/envs/py312/share/proj`
- **Coordinate column names**: swisslandstats uses German names `E_KOORD` / `N_KOORD`
  (not `E_COORD` / `N_COORD`). `aggregate.py` auto-detects which name is present.
- **First download is slow**: SLS ~700MB, STATPOP ~200MB, BDS ~300MB, STATENT ~150MB.
  Subsequent loads use swisslandstats' internal download cache.
- **Spatial join performance**: ~30–60s per dataset for all municipalities. The point
  creation (list comprehension over millions of rows) is the bottleneck.
- **STATENT privacy masking**: All values < 4 are set to 4 in the source data (FSO
  confidentiality rule). Municipality totals may be slightly inflated for rare sectors.
- **BDS variable epochs**: Some variables (GH01–GH19, GE01–GE19) are only available
  for 2010–2015; newer heating data uses GH21–GH29, GE21–GE32.
- **SLS categorical variables**: Land use codes are categorical, not summable. The
  default "max" aggregation is a placeholder; for proper municipality-level land use
  composition, count hectares per class instead of aggregating the code directly.
- **Municipality boundaries**: The included GeoJSON has 2123 municipalities. BFS
  numbers and boundaries change over time due to municipal mergers.

## File Tree

```
swiss_stats/
├── AGENTS.md                          ← this file
├── __init__.py                        ← package init, re-exports
├── __main__.py                        ← python -m swiss_stats support
├── requirements.txt                   ← pip dependencies
├── variable_catalog.py                ← dicts: code → English label
├── loaders.py                         ← sls.load_dataset() wrappers
├── aggregate.py                       ← spatial join → municipality DataFrames
├── cache.py                           ← parquet read/write
├── run.py                             ← CLI entry point
├── explore.ipynb                      ← interactive exploration notebook
├── municipality_boundaries.geojson    ← stripped copy (BFS + NAME + geometry)
└── cache/                             ← generated parquet output
```
