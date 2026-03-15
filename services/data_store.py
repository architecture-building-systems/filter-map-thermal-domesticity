"""Data loading and cached aggregation for standalone filter-map app."""

from __future__ import annotations

import gzip
from datetime import date, datetime
import json
import logging
import os
import re
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable

import geopandas as gpd
import numpy as np
import pandas as pd
import rasterio
from rasterio.errors import NotGeoreferencedWarning
from rasterio.features import rasterize
from rasterio.io import MemoryFile
from rasterio.warp import transform_bounds

from .climate_metrics import CLIMATE_INDICATOR_BY_KEY, default_indicator_keys, get_climate_indicator_options
from .compute import label_heating_options

logger = logging.getLogger(__name__)

@dataclass
class HeatingAgeRecord:
    age_totals: Dict[str, float]
    age_heating: Dict[str, Dict[str, float]]


class DataStore:
    """Pre-load geodata and temperature aggregates for fast API responses."""

    RESIDENTIAL_TYPES = ["1021", "1025", "1030", "1040"]
    AGE_KEYS_SORTED = [
        "8011",
        "8012",
        "8013",
        "8014",
        "8015",
        "8016",
        "8017",
        "8018",
        "8019",
        "8020",
        "8021",
        "8022",
        "8023",
        "8024",
    ]

    CANTON_NAMES = {
        1: "Zurich",
        2: "Bern",
        3: "Luzern",
        4: "Uri",
        5: "Schwyz",
        6: "Obwalden",
        7: "Nidwalden",
        8: "Glarus",
        9: "Zug",
        10: "Freiburg",
        11: "Solothurn",
        12: "Basel-Stadt",
        13: "Basel-Landschaft",
        14: "Schaffhausen",
        15: "Appenzell Ausserrhoden",
        16: "Appenzell Innerrhoden",
        17: "Sankt Gallen",
        18: "Graubunden",
        19: "Aargau",
        20: "Thurgau",
        21: "Tessin",
        22: "Waadt",
        23: "Wallis",
        24: "Neuenberg",
        25: "Genf",
        26: "Jura",
    }

    PROFILE_CONTEXT_FIELDS = (
        "temperature_mean-range",
        "temperature_winter_mean-range",
        "temperature_mean-max",
        "temperature_mean-min",
        "older_than_1919_pct",
        "older_than_1919_pct_original_system",
        "population_coverage_pct",
        "climate_risk_gwl3.0",
        "climate_risk_range",
    )

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.background_dir = base_dir / "background_data"
        self.temp_dir = self.background_dir / "temperature_rasters"
        self.proposal_dir = base_dir.parent
        self.cache_dir = base_dir / ".cache"
        self.muni_simplify_tolerance = _safe_float(os.environ.get("MUNI_SIMPLIFY_TOL"), 0.0012)
        self.muni_simplify_tolerance = max(0.0005, min(self.muni_simplify_tolerance, 0.01))

        self.ready = False
        self.bootstrap_core_payload: dict = {}
        self.bootstrap_payload: dict = {}
        self.overlay_specs: dict[str, dict] = {}
        self.overlay_payloads: dict[str, dict] = {}
        self.overlay_manifest: dict[str, dict] = {}
        self.metadata_by_bfs: dict[str, dict] = {}
        self.climate_risk_by_bfs: dict[str, float] = {}
        self.climate_indicator_frame: pd.DataFrame = pd.DataFrame()
        self.climate_indicator_options: list[dict[str, str | bool]] = []
        self.default_climate_indicator_keys: list[str] = []
        self.building_material_zone_options: list[dict[str, str | int]] = []
        self.hearth_system_zone_options: list[dict[str, str]] = []
        self.hearth_system_zone_values: set[str] = set()
        self.material_hearth_zone_options: list[dict[str, str]] = []
        self.material_hearth_zone_values: set[str] = set()
        self.temperature_cache: dict[tuple[str, str, bool], dict[str, float]] = {}
        self.heating_records: dict[str, HeatingAgeRecord] = {}
        self.heating_codes: set[str] = set()
        self._old_pct_cache: dict[tuple[str, ...], dict[str, float]] = {}
        self.load_warnings: list[str] = []
        self.raster_overlay_meta: dict[str, dict] = {}
        self.raster_overlay_png: dict[str, bytes] = {}
        self.profile_cache: dict[str, dict] = {}
        self.profile_base_by_bfs: dict[str, dict] = {}
        self.profile_area_sq_km_by_bfs: dict[str, float] = {}
        self.profile_bioregion_by_bfs: dict[str, str] = {}
        self.profile_heating_summary_by_bfs: dict[str, dict] = {}
        self.profile_metric_frame: pd.DataFrame = pd.DataFrame()
        self.profile_percentile_frame: pd.DataFrame = pd.DataFrame()
        self.profile_benchmark_keys: list[str] = []
        self.profile_canton_benchmarks: dict[str, dict[str, float | None]] = {}
        self.profile_swiss_benchmarks: dict[str, float | None] = {}
        self.profile_indicator_catalog: list[dict[str, object]] = []
        self.profile_core_indicator_keys: list[str] = []

        self.snapshot_statpop: pd.DataFrame = pd.DataFrame()
        self.snapshot_bds: pd.DataFrame = pd.DataFrame()
        self.snapshot_sls_composition: pd.DataFrame = pd.DataFrame()
        self.snapshot_statent: pd.DataFrame = pd.DataFrame()
        self.snapshot_canton_means: dict[str, dict[str, float]] = {}
        self.snapshot_swiss_means: dict[str, float] = {}

        self._label_raster: np.ndarray | None = None
        self._pop_mask: np.ndarray | None = None
        self._max_label: int = 0
        self._bfs_ids: list[int] = []

    def load(self) -> None:
        """Load all static datasets and precompute caches."""
        self.load_warnings = []
        muni_path = self.background_dir / "07_municipalities_updated_fields.geojson"
        if not muni_path.exists():
            raise FileNotFoundError(f"Missing municipality dataset: {muni_path}")

        muni_gdf = gpd.read_file(muni_path)
        if muni_gdf.crs is None:
            muni_gdf = muni_gdf.set_crs(epsg=2056)
        else:
            muni_gdf = muni_gdf.to_crs(epsg=2056)

        muni_gdf = muni_gdf[muni_gdf["BFS_NUMMER"].notna()].copy()
        muni_gdf["BFS_NUMMER"] = muni_gdf["BFS_NUMMER"].astype(int)
        self._bfs_ids = sorted(muni_gdf["BFS_NUMMER"].unique().tolist())

        self.metadata_by_bfs, self.climate_risk_by_bfs = self._build_metadata(muni_gdf)
        self.climate_indicator_frame = self._build_climate_indicator_frame(muni_gdf)
        self.climate_indicator_options = get_climate_indicator_options(self.climate_indicator_frame.columns)
        self.default_climate_indicator_keys = default_indicator_keys(self.climate_indicator_frame.columns)
        self.building_material_zone_options = self._build_material_zone_options(muni_gdf)
        self.hearth_system_zone_options = self._build_hearth_zone_options(muni_gdf)
        self.hearth_system_zone_values = {
            str(item.get("zone_label", "")).strip()
            for item in self.hearth_system_zone_options
            if str(item.get("zone_label", "")).strip()
        }
        self.material_hearth_zone_options = self._build_material_hearth_zone_options(muni_gdf)
        self.material_hearth_zone_values = {
            str(item.get("zone_code", "")).strip()
            for item in self.material_hearth_zone_options
            if str(item.get("zone_code", "")).strip()
        }

        self._prepare_label_raster(muni_gdf)
        self._precompute_temperature_aggregates()
        self._load_heating_records()
        self._build_profile_caches(muni_gdf)
        self._build_snapshot_caches()
        self._build_raster_overlays()
        self.overlay_specs = self._build_overlay_specs()
        self.overlay_payloads = {}
        self.overlay_manifest = self._build_overlay_manifest(self.overlay_specs)

        self.bootstrap_core_payload = self._build_bootstrap_payload(muni_gdf, muni_path)
        # Backward-compatible alias used by current API handler.
        self.bootstrap_payload = self.bootstrap_core_payload
        self.ready = True

    def _build_metadata(self, gdf: gpd.GeoDataFrame) -> tuple[dict[str, dict], dict[str, float]]:
        out: dict[str, dict] = {}
        climate_risk_by_bfs: dict[str, float] = {}
        for _, row in gdf.iterrows():
            bfs = str(int(row["BFS_NUMMER"]))
            canton_num = int(row["KANTONSNUM"]) if row.get("KANTONSNUM") is not None else 0
            rec = {
                "bfs": bfs,
                "name": str(row.get("NAME", bfs)),
                "canton_num": canton_num,
                "canton_name": self.CANTON_NAMES.get(canton_num, str(canton_num)),
            }
            climate_risk = _safe_float(row.get("climate_risk_gwl3.0"), float("nan"))
            if np.isfinite(climate_risk):
                rec["climate_risk_gwl3.0"] = float(climate_risk)
                climate_risk_by_bfs[bfs] = float(climate_risk)

            zone_number = _safe_int(row.get("building_material_zone_number"), None)
            zone_label = str(row.get("building_material_zone") or "").strip()
            if zone_number is not None:
                rec["building_material_zone_number"] = int(zone_number)
            if zone_label:
                rec["building_material_zone"] = zone_label

            hearth_label = _normalize_label(row.get("hearth_system_zone"))
            hearth_code = _normalize_label(row.get("hearth_system_zone_number"))
            material_hearth_zone = _normalize_label(row.get("material+hearth_zone"))
            if hearth_label:
                rec["hearth_system_zone"] = hearth_label
            if hearth_code:
                rec["hearth_system_zone_number"] = hearth_code
            if material_hearth_zone:
                rec["material+hearth_zone"] = material_hearth_zone
            out[bfs] = rec
        return out, climate_risk_by_bfs

    def _build_material_zone_options(self, gdf: gpd.GeoDataFrame) -> list[dict[str, str | int]]:
        if "building_material_zone_number" not in gdf.columns:
            return []

        options_by_number: dict[int, str] = {}
        for _, row in gdf.iterrows():
            zone_number = _safe_int(row.get("building_material_zone_number"), None)
            if zone_number is None:
                continue
            zone_label = str(row.get("building_material_zone") or "").strip()
            if zone_number not in options_by_number:
                options_by_number[zone_number] = zone_label or f"Zone {zone_number}"
            elif not options_by_number[zone_number] and zone_label:
                options_by_number[zone_number] = zone_label

        return [
            {
                "zone_number": int(zone_number),
                "zone_label": str(options_by_number[zone_number] or f"Zone {zone_number}"),
            }
            for zone_number in sorted(options_by_number.keys())
        ]

    def _build_climate_indicator_frame(self, gdf: gpd.GeoDataFrame) -> pd.DataFrame:
        indicator_cols = [item["key"] for item in get_climate_indicator_options(gdf.columns)]
        if not indicator_cols:
            return pd.DataFrame(index=[str(int(v)) for v in gdf["BFS_NUMMER"].tolist()])

        frame = gdf[["BFS_NUMMER", *indicator_cols]].copy()
        frame["BFS_NUMMER"] = frame["BFS_NUMMER"].astype(int).astype(str)
        for col in indicator_cols:
            frame[col] = pd.to_numeric(frame[col], errors="coerce")
        frame = frame.set_index("BFS_NUMMER").sort_index()
        return frame

    def _build_hearth_zone_options(self, gdf: gpd.GeoDataFrame) -> list[dict[str, str]]:
        if "hearth_system_zone" not in gdf.columns:
            return []

        seen: set[str] = set()
        out: list[str] = []
        for _, row in gdf.iterrows():
            label = _normalize_label(row.get("hearth_system_zone"))
            if not label or label in seen:
                continue
            seen.add(label)
            out.append(label)

        out.sort(key=lambda value: value.lower())
        return [{"zone_label": str(label)} for label in out]

    def _build_material_hearth_zone_options(self, gdf: gpd.GeoDataFrame) -> list[dict[str, str]]:
        seen: set[str] = set()
        out: list[str] = []
        for _, row in gdf.iterrows():
            code = _normalize_label(row.get("material+hearth_zone"))
            if not code:
                zone = _safe_int(row.get("building_material_zone_number"), None)
                hearth_code = _normalize_label(row.get("hearth_system_zone_number")).upper()
                if len(hearth_code) != 1 or not hearth_code.isalpha():
                    hearth_code = "U"
                left = str(zone) if zone is not None else "U"
                code = f"{left}_{hearth_code}"
            if not code or code in seen:
                continue
            seen.add(code)
            out.append(code)

        out.sort(key=lambda value: value.lower())
        return [{"zone_code": str(code)} for code in out]

    def _profile_numeric_columns(self, gdf: gpd.GeoDataFrame) -> list[str]:
        cols: list[str] = []
        for field in self.PROFILE_CONTEXT_FIELDS:
            if field in gdf.columns:
                cols.append(field)
        for col in gdf.columns:
            if re.match(r".+_gwl(1\.5|2\.0|3\.0)$", str(col)):
                cols.append(str(col))
        # Preserve order while deduplicating.
        return list(dict.fromkeys(cols))

    def _build_profile_indicator_catalog(self, columns: Iterable[str]) -> list[dict[str, object]]:
        pattern = re.compile(r"^(?P<base>.+)_gwl(?P<level>1\.5|2\.0|3\.0)$")
        by_base: dict[str, dict[str, str]] = {}
        for raw_col in columns:
            col = str(raw_col)
            match = pattern.match(col)
            if not match:
                continue
            base = str(match.group("base"))
            level = str(match.group("level"))
            by_base.setdefault(base, {})[f"gwl{level}"] = col

        ordered_bases: list[str] = []
        seen: set[str] = set()
        for option in self.climate_indicator_options:
            key = str(option.get("key", ""))
            match = pattern.match(key)
            if not match:
                continue
            base = str(match.group("base"))
            if base in by_base and base not in seen:
                seen.add(base)
                ordered_bases.append(base)

        for base in sorted(by_base.keys()):
            if base in seen:
                continue
            seen.add(base)
            ordered_bases.append(base)

        out: list[dict[str, object]] = []
        for base in ordered_bases:
            gwl_columns = by_base.get(base, {})
            key_gwl3 = gwl_columns.get("gwl3.0", f"{base}_gwl3.0")
            meta = CLIMATE_INDICATOR_BY_KEY.get(key_gwl3)
            label = str(meta["label"]) if meta else _format_metric_label(base)
            group = str(meta["group"]) if meta else "Climate Indicators"
            out.append(
                {
                    "base_key": base,
                    "label": label,
                    "group": group,
                    "gwl_columns": gwl_columns,
                    "gwl3_key": key_gwl3,
                }
            )
        return out

    def _build_profile_bioregion_map(self, muni_gdf: gpd.GeoDataFrame) -> dict[str, str]:
        out: dict[str, str] = {}
        path = self.background_dir / "04_swiss_bioregions.geojson"
        if not path.exists():
            return out

        try:
            bioregions = gpd.read_file(path)
            if bioregions.crs is None:
                bioregions = bioregions.set_crs(epsg=2056)
            else:
                bioregions = bioregions.to_crs(epsg=2056)
        except Exception as exc:
            self.load_warnings.append(f"Bioregion map unavailable for profiles: {exc}")
            return out

        region_shapes: list[tuple[str, object]] = []
        for _, row in bioregions.iterrows():
            label = str(row.get("DEBioBedeu") or row.get("RegionName") or "").strip()
            geom = row.geometry
            if not label or geom is None or geom.is_empty:
                continue
            region_shapes.append((label, geom))

        for _, row in muni_gdf.iterrows():
            bfs = str(int(row["BFS_NUMMER"]))
            geom = row.geometry
            if geom is None or geom.is_empty:
                continue
            point = geom.representative_point()
            matched = ""
            for label, region_geom in region_shapes:
                if region_geom.contains(point) or region_geom.intersects(point):
                    matched = label
                    break
            if matched:
                out[bfs] = matched
        return out

    def _build_profile_heating_summaries(self) -> dict[str, dict]:
        label_map = {item["code"]: item["label"] for item in label_heating_options(self.heating_codes)}
        summaries: dict[str, dict] = {}

        for bfs, rec in self.heating_records.items():
            total_units = 0.0
            heat_totals: dict[str, float] = {}
            for age_code in self.AGE_KEYS_SORTED:
                by_heat = rec.age_heating.get(age_code, {})
                for heat_code, value in by_heat.items():
                    v = _safe_float(value, 0.0)
                    if not np.isfinite(v) or v <= 0:
                        continue
                    total_units += v
                    heat_totals[heat_code] = heat_totals.get(heat_code, 0.0) + float(v)

            age_total_units = float(sum(_safe_float(v, 0.0) for v in rec.age_totals.values()))
            old_units = float(_safe_float(rec.age_totals.get("8011"), 0.0))
            old_share = (old_units / age_total_units) * 100.0 if age_total_units > 0 else None

            heating_rows = []
            for heat_code, value in sorted(heat_totals.items(), key=lambda item: (-item[1], item[0])):
                share = (float(value) / total_units) * 100.0 if total_units > 0 else None
                heating_rows.append(
                    {
                        "code": str(heat_code),
                        "label": str(label_map.get(str(heat_code), f"Heating {heat_code}")),
                        "count": float(value),
                        "share_pct": float(share) if share is not None and np.isfinite(share) else None,
                    }
                )

            summaries[str(bfs)] = {
                "total_units": float(total_units),
                "old_1919_share_pct": float(old_share) if old_share is not None and np.isfinite(old_share) else None,
                "heating_mix": heating_rows,
            }
        return summaries

    def _build_profile_caches(self, muni_gdf: gpd.GeoDataFrame) -> None:
        self.profile_cache = {}
        self.profile_base_by_bfs = {}
        self.profile_area_sq_km_by_bfs = {}
        self.profile_bioregion_by_bfs = {}
        self.profile_heating_summary_by_bfs = {}
        self.profile_metric_frame = pd.DataFrame()
        self.profile_percentile_frame = pd.DataFrame()
        self.profile_benchmark_keys = []
        self.profile_canton_benchmarks = {}
        self.profile_swiss_benchmarks = {}
        self.profile_indicator_catalog = []
        self.profile_core_indicator_keys = []

        gdf = muni_gdf.copy()
        if gdf.empty:
            return

        gdf["BFS_NUMMER"] = gdf["BFS_NUMMER"].astype(int)
        if "KANTONSNUM" in gdf.columns:
            gdf["KANTONSNUM"] = pd.to_numeric(gdf["KANTONSNUM"], errors="coerce")
        else:
            gdf["KANTONSNUM"] = np.nan

        # Pre-compute WGS84 centroids for all municipalities (used for EPW station matching).
        # Centroid is computed in the source projected CRS (EPSG:2056) to avoid geographic-CRS
        # distortion warnings, then the centroid points are reprojected to WGS84.
        try:
            centroids_proj = gdf.geometry.centroid          # accurate in projected CRS
            centroids_gs = gpd.GeoSeries(centroids_proj, crs=gdf.crs)
            centroids_wgs84 = centroids_gs.to_crs("EPSG:4326")
        except Exception:
            centroids_wgs84 = None

        # Base profile data and area cache.
        for i, (_, row) in enumerate(gdf.iterrows()):
            bfs = str(int(row["BFS_NUMMER"]))
            rec = {
                "bfs": bfs,
                "name": str(row.get("NAME") or bfs),
                "language": _normalize_label(row.get("LANGUAGE")),
            }
            canton_num = _safe_int(row.get("KANTONSNUM"), None)
            if canton_num is not None:
                rec["canton_num"] = int(canton_num)
                rec["canton_name"] = self.CANTON_NAMES.get(int(canton_num), f"Canton {canton_num}")

            for key in ("building_material_zone", "building_material_zone_number", "hearth_system_zone", "hearth_system_zone_number", "material+hearth_zone"):
                value = row.get(key)
                if key.endswith("_number"):
                    parsed = _safe_int(value, None)
                    if parsed is not None:
                        rec[key] = parsed
                else:
                    label = _normalize_label(value)
                    if label:
                        rec[key] = label

            for key in self.PROFILE_CONTEXT_FIELDS:
                if key not in gdf.columns:
                    continue
                value = _safe_float(row.get(key), float("nan"))
                if np.isfinite(value):
                    rec[key] = float(value)

            geom = row.geometry
            if geom is not None and not geom.is_empty:
                area_sq_km = float(max(0.0, geom.area) / 1_000_000.0)
                self.profile_area_sq_km_by_bfs[bfs] = area_sq_km
                rec["area_sq_km"] = area_sq_km

            if centroids_wgs84 is not None:
                try:
                    c = centroids_wgs84.iloc[i]
                    if c is not None and not c.is_empty:
                        rec["centroid_lat"] = round(float(c.y), 6)
                        rec["centroid_lon"] = round(float(c.x), 6)
                except Exception:
                    pass

            self.profile_base_by_bfs[bfs] = rec

        numeric_cols = self._profile_numeric_columns(gdf)
        frame = gdf[["BFS_NUMMER", "KANTONSNUM", *numeric_cols]].copy()
        frame["BFS_NUMMER"] = frame["BFS_NUMMER"].astype(int).astype(str)
        for col in ["KANTONSNUM", *numeric_cols]:
            frame[col] = pd.to_numeric(frame[col], errors="coerce")
        frame = frame.set_index("BFS_NUMMER").sort_index()
        self.profile_metric_frame = frame

        self.profile_indicator_catalog = self._build_profile_indicator_catalog(frame.columns)
        catalog_gwl3_keys = {
            str(item.get("gwl3_key"))
            for item in self.profile_indicator_catalog
            if str(item.get("gwl3_key"))
        }
        self.profile_core_indicator_keys = [
            key for key in self.default_climate_indicator_keys if key in catalog_gwl3_keys
        ]

        gwl3_cols = [
            str(item.get("gwl_columns", {}).get("gwl3.0"))
            for item in self.profile_indicator_catalog
            if str(item.get("gwl_columns", {}).get("gwl3.0"))
            and str(item.get("gwl_columns", {}).get("gwl3.0")) in frame.columns
        ]
        if gwl3_cols:
            self.profile_percentile_frame = (
                frame[gwl3_cols]
                .rank(axis=0, method="average", pct=True, na_option="keep")
                .mul(100.0)
            )

        benchmark_keys: list[str] = []
        for key in (
            "temperature_mean-range",
            "temperature_winter_mean-range",
            "older_than_1919_pct",
            "population_coverage_pct",
            "climate_risk_gwl3.0",
        ):
            if key in frame.columns and key not in benchmark_keys:
                benchmark_keys.append(key)
        for key in self.default_climate_indicator_keys:
            if key in frame.columns and key not in benchmark_keys:
                benchmark_keys.append(key)
        self.profile_benchmark_keys = benchmark_keys

        for key in benchmark_keys:
            series = pd.to_numeric(frame[key], errors="coerce")
            canton_means: dict[str, float | None] = {}
            grouped = pd.concat([frame["KANTONSNUM"], series], axis=1).dropna(subset=["KANTONSNUM"])
            for canton_num, group in grouped.groupby("KANTONSNUM"):
                values = pd.to_numeric(group[key], errors="coerce")
                mean = float(values.mean(skipna=True))
                if np.isfinite(mean):
                    canton_means[str(int(canton_num))] = mean
            self.profile_canton_benchmarks[key] = canton_means
            swiss_mean = float(series.mean(skipna=True))
            self.profile_swiss_benchmarks[key] = swiss_mean if np.isfinite(swiss_mean) else None

        self.profile_bioregion_by_bfs = self._build_profile_bioregion_map(gdf)
        self.profile_heating_summary_by_bfs = self._build_profile_heating_summaries()

    # ------------------------------------------------------------------
    # Snapshot caches
    # ------------------------------------------------------------------

    _SNAPSHOT_AGE_COHORT_LABELS = [
        "0–4", "5–9", "10–14", "15–19", "20–24", "25–29",
        "30–34", "35–39", "40–44", "45–49", "50–54", "55–59",
        "60–64", "65–69", "70–74", "75–79", "80–84", "85–89", "90+",
    ]
    _SNAPSHOT_BBM_KEYS = [f"BBM{str(i).zfill(2)}" for i in range(1, 20)]
    _SNAPSHOT_BBW_KEYS = [f"BBW{str(i).zfill(2)}" for i in range(1, 20)]

    _SNAPSHOT_HP_KEYS   = ["HP01", "HP02", "HP03", "HP04", "HP05", "HP06"]
    _SNAPSHOT_HP_LABELS = {
        "HP01": "1 person",
        "HP02": "2 persons",
        "HP03": "3 persons",
        "HP04": "4 persons",
        "HP05": "5 persons",
        "HP06": "6+ persons",
    }

    _SNAPSHOT_ORIGIN_KEYS = ["BB21", "BB27", "BB28", "BB29", "BB30"]
    _SNAPSHOT_ORIGIN_LABELS = {
        "BB21": "Born in Switzerland",
        "BB27": "Born in EU/EFTA country",
        "BB28": "Born in other European country",
        "BB29": "Born in non-European country",
        "BB30": "Born abroad — unknown country",
    }

    _SNAPSHOT_GB_KEYS = [f"GB{str(i).zfill(2)}" for i in range(1, 14)]
    _SNAPSHOT_GB_LABELS = {
        "GB01": "Before 1919", "GB02": "1919–1945", "GB03": "1946–1960",
        "GB04": "1961–1970", "GB05": "1971–1980", "GB06": "1981–1990",
        "GB07": "1991–1995", "GB08": "1996–2000", "GB09": "2001–2005",
        "GB10": "2006–2010", "GB11": "2011–2015", "GB12": "2016–2020",
        "GB13": "2021–2023",
    }

    _SNAPSHOT_GH_KEYS = [f"GH{i}" for i in range(21, 30)]
    _SNAPSHOT_GH_LABELS = {
        "GH21": "Heat pump", "GH22": "Thermal solar", "GH23": "Boiler",
        "GH24": "Stove", "GH25": "Electric heating", "GH26": "Heat exchanger",
        "GH27": "Combined heat and power", "GH28": "Other", "GH29": "None",
    }

    _SNAPSHOT_GE_KEYS = [f"GE{i}" for i in range(21, 33)]
    _SNAPSHOT_GE_LABELS = {
        "GE21": "Air", "GE22": "Geothermal", "GE23": "Water",
        "GE24": "Gas", "GE25": "Heating oil", "GE26": "Wood",
        "GE27": "Electricity", "GE28": "Solar thermal", "GE29": "District heating",
        "GE30": "Undetermined", "GE31": "Other", "GE32": "None",
    }

    def _build_snapshot_caches(self) -> None:
        """Load cached parquets and pre-computed means for snapshot blocks."""
        swiss_stats_cache = Path(self.background_dir).parent / "swiss_stats" / "cache"

        def _load(key: str) -> pd.DataFrame:
            path = swiss_stats_cache / f"{key}_by_municipality.parquet"
            if not path.exists():
                logger.warning("Snapshot cache missing: %s", path)
                return pd.DataFrame()
            df = pd.read_parquet(path)
            df.index = df.index.astype(str)
            return df

        self.snapshot_statpop = _load("statpop")
        self.snapshot_bds = _load("bds")
        self.snapshot_sls_composition = _load("sls_composition")
        self.snapshot_statent = _load("statent")

        canton_means_path = swiss_stats_cache / "canton_means.json"
        swiss_means_path = swiss_stats_cache / "swiss_means.json"
        if canton_means_path.exists():
            with open(canton_means_path, encoding="utf-8") as f:
                self.snapshot_canton_means = json.load(f)
        if swiss_means_path.exists():
            with open(swiss_means_path, encoding="utf-8") as f:
                self.snapshot_swiss_means = json.load(f)

        logger.info(
            "Snapshot caches loaded: statpop=%d, bds=%d, sls_comp=%d, statent=%d, cantons=%d, swiss_vars=%d",
            len(self.snapshot_statpop),
            len(self.snapshot_bds),
            len(self.snapshot_sls_composition),
            len(self.snapshot_statent),
            len(self.snapshot_canton_means),
            len(self.snapshot_swiss_means),
        )

    @staticmethod
    def _snap_items(
        row: "pd.Series",
        keys: list[str],
        labels: dict[str, str],
        total: float,
    ) -> list[dict]:
        """Build snapshot items list from a data row."""
        items = []
        for k in keys:
            val = _safe_float(row.get(k), float("nan"))
            if not np.isfinite(val):
                val = 0.0
            share = round(100.0 * val / total, 2) if total > 0 else 0.0
            items.append({
                "code": k,
                "label": labels.get(k, k),
                "value": int(round(val)),
                "share_pct": share,
            })
        return sorted(items, key=lambda x: -x["value"])

    @staticmethod
    def _snap_mean_items(
        means: dict[str, float],
        prefix: str,
        keys: list[str],
        labels: dict[str, str],
    ) -> list[dict]:
        """Build snapshot items list from pre-computed means dict."""
        items = []
        total = sum(
            means.get(f"{prefix}{k}", 0.0) or 0.0 for k in keys
        )
        for k in keys:
            val = means.get(f"{prefix}{k}", 0.0) or 0.0
            share = round(100.0 * val / total, 2) if total > 0 else 0.0
            items.append({
                "code": k,
                "label": labels.get(k, k),
                "value": round(val, 2),
                "share_pct": share,
            })
        return sorted(items, key=lambda x: -x["value"])

    @staticmethod
    def _snap_composition_items(
        row: "pd.Series | None",
        prefix: str,
        code_label_map: dict[int, str],
    ) -> list[dict]:
        """Build snapshot items from SLS composition wide-format row."""
        if row is None:
            return []
        items = []
        total = 0.0
        for code, label in code_label_map.items():
            col = f"{prefix}__{code}"
            val = float(row.get(col, 0) or 0)
            total += val
        for code, label in code_label_map.items():
            col = f"{prefix}__{code}"
            val = float(row.get(col, 0) or 0)
            share = round(100.0 * val / total, 2) if total > 0 else 0.0
            items.append({
                "code": code,
                "label": label,
                "value": int(round(val)),
                "share_pct": share,
            })
        return sorted(items, key=lambda x: -x["value"])

    @staticmethod
    def _snap_composition_mean_items(
        means: dict[str, float],
        prefix: str,
        code_label_map: dict[int, str],
    ) -> list[dict]:
        """Build snapshot mean items from pre-computed composition means."""
        items = []
        total = sum(
            means.get(f"sls_composition__{prefix}__{code}", 0.0) or 0.0
            for code in code_label_map
        )
        for code, label in code_label_map.items():
            val = means.get(f"sls_composition__{prefix}__{code}", 0.0) or 0.0
            share = round(100.0 * val / total, 2) if total > 0 else 0.0
            items.append({
                "code": code,
                "label": label,
                "value": round(val, 2),
                "share_pct": share,
            })
        return sorted(items, key=lambda x: -x["value"])

    def _build_snapshot_block(self, key: str, canton_key: str) -> dict | None:
        """Build the snapshot payload block for a single municipality."""
        from swiss_stats.variable_catalog import SLS_CLASS_LABELS

        sp_row = self.snapshot_statpop.loc[key] if key in self.snapshot_statpop.index else None
        bds_row = self.snapshot_bds.loc[key] if key in self.snapshot_bds.index else None
        sls_row = self.snapshot_sls_composition.loc[key] if key in self.snapshot_sls_composition.index else None
        se_row = self.snapshot_statent.loc[key] if key in self.snapshot_statent.index else None

        canton_means = self.snapshot_canton_means.get(canton_key, {})
        swiss_means = self.snapshot_swiss_means

        # Swiss-born ratio
        swiss_ratio: dict = {}
        if sp_row is not None:
            swiss = int(round(_safe_float(sp_row.get("BB11"), 0.0) or 0.0))
            non_swiss = int(round(_safe_float(sp_row.get("BB12"), 0.0) or 0.0))
            denom = max(non_swiss, 1)
            ratio_str = f"{swiss / denom:.1f} : 1"
            swiss_ratio = {"swiss": swiss, "non_swiss": non_swiss, "ratio": ratio_str}

        # Origin
        origin_total = float(
            sum(_safe_float(sp_row.get(k), 0.0) or 0.0 for k in self._SNAPSHOT_ORIGIN_KEYS)
        ) if sp_row is not None else 0.0
        origin_items = self._snap_items(sp_row, self._SNAPSHOT_ORIGIN_KEYS, self._SNAPSHOT_ORIGIN_LABELS, origin_total) if sp_row is not None else []
        origin_canton = self._snap_mean_items(canton_means, "statpop__", self._SNAPSHOT_ORIGIN_KEYS, self._SNAPSHOT_ORIGIN_LABELS)
        origin_swiss = self._snap_mean_items(swiss_means, "statpop__", self._SNAPSHOT_ORIGIN_KEYS, self._SNAPSHOT_ORIGIN_LABELS)

        # Age distribution
        male_vals = [int(round(_safe_float(sp_row.get(k), 0.0) or 0.0)) for k in self._SNAPSHOT_BBM_KEYS] if sp_row is not None else []
        female_vals = [int(round(_safe_float(sp_row.get(k), 0.0) or 0.0)) for k in self._SNAPSHOT_BBW_KEYS] if sp_row is not None else []
        age_distribution: dict = {
            "cohorts": self._SNAPSHOT_AGE_COHORT_LABELS,
            "male": male_vals,
            "female": female_vals,
            "items": [
                {"code": f"M{lbl}", "label": lbl, "value": m, "share_pct": 0.0}
                for lbl, m in zip(self._SNAPSHOT_AGE_COHORT_LABELS, male_vals)
            ] if male_vals else [],
        }

        # Construction period
        gb_total = float(sum(_safe_float(bds_row.get(k), 0.0) or 0.0 for k in self._SNAPSHOT_GB_KEYS)) if bds_row is not None else 0.0
        construction_period = {
            "items": self._snap_items(bds_row, self._SNAPSHOT_GB_KEYS, self._SNAPSHOT_GB_LABELS, gb_total) if bds_row is not None else [],
            "canton_mean": self._snap_mean_items(canton_means, "bds__", self._SNAPSHOT_GB_KEYS, self._SNAPSHOT_GB_LABELS),
            "swiss_mean": self._snap_mean_items(swiss_means, "bds__", self._SNAPSHOT_GB_KEYS, self._SNAPSHOT_GB_LABELS),
        }

        # Heat source
        ge_total = float(sum(_safe_float(bds_row.get(k), 0.0) or 0.0 for k in self._SNAPSHOT_GE_KEYS)) if bds_row is not None else 0.0
        heat_source = {
            "items": self._snap_items(bds_row, self._SNAPSHOT_GE_KEYS, self._SNAPSHOT_GE_LABELS, ge_total) if bds_row is not None else [],
            "canton_mean": self._snap_mean_items(canton_means, "bds__", self._SNAPSHOT_GE_KEYS, self._SNAPSHOT_GE_LABELS),
            "swiss_mean": self._snap_mean_items(swiss_means, "bds__", self._SNAPSHOT_GE_KEYS, self._SNAPSHOT_GE_LABELS),
        }

        # Heat generator
        gh_total = float(sum(_safe_float(bds_row.get(k), 0.0) or 0.0 for k in self._SNAPSHOT_GH_KEYS)) if bds_row is not None else 0.0
        heat_generator = {
            "items": self._snap_items(bds_row, self._SNAPSHOT_GH_KEYS, self._SNAPSHOT_GH_LABELS, gh_total) if bds_row is not None else [],
            "canton_mean": self._snap_mean_items(canton_means, "bds__", self._SNAPSHOT_GH_KEYS, self._SNAPSHOT_GH_LABELS),
            "swiss_mean": self._snap_mean_items(swiss_means, "bds__", self._SNAPSHOT_GH_KEYS, self._SNAPSHOT_GH_LABELS),
        }

        # Land use 10-class
        lu10_labels = SLS_CLASS_LABELS.get("LU_10", {})
        land_use_10 = {
            "items": self._snap_composition_items(sls_row, "LU18_10", lu10_labels),
            "canton_mean": self._snap_composition_mean_items(canton_means, "LU18_10", lu10_labels),
            "swiss_mean": self._snap_composition_mean_items(swiss_means, "LU18_10", lu10_labels),
        }

        # Area statistics 17-class
        as17_labels = SLS_CLASS_LABELS.get("AS_17", {})
        area_stats_17 = {
            "items": self._snap_composition_items(sls_row, "AS18_17", as17_labels),
            "canton_mean": self._snap_composition_mean_items(canton_means, "AS18_17", as17_labels),
            "swiss_mean": self._snap_composition_mean_items(swiss_means, "AS18_17", as17_labels),
        }

        # Employment by sector (STATENT)
        _SECTOR_LABELS = ["Agriculture", "Industry", "Services"]
        _SECTOR_F_KEYS = ["B08EMPFS1", "B08EMPFS2", "B08EMPFS3"]
        _SECTOR_M_KEYS = ["B08EMPMS1", "B08EMPMS2", "B08EMPMS3"]
        sector_female = [int(round(_safe_float(se_row.get(k), 0.0) or 0.0)) for k in _SECTOR_F_KEYS] if se_row is not None else []
        sector_male = [int(round(_safe_float(se_row.get(k), 0.0) or 0.0)) for k in _SECTOR_M_KEYS] if se_row is not None else []
        employment_by_sector: dict = {
            "sectors": _SECTOR_LABELS,
            "female": sector_female,
            "male": sector_male,
            "items": [
                {"code": f"S{i+1}", "label": lbl, "value": (sector_female[i] + sector_male[i] if sector_female and sector_male else 0)}
                for i, lbl in enumerate(_SECTOR_LABELS)
            ] if sector_female else [],
        }

        # Private households by size (STATPOP HP01–HP06)
        hp_total = float(sum(_safe_float(sp_row.get(k), 0.0) or 0.0 for k in self._SNAPSHOT_HP_KEYS)) if sp_row is not None else 0.0
        private_households = {
            "labels": [self._SNAPSHOT_HP_LABELS[k] for k in self._SNAPSHOT_HP_KEYS],
            "items": self._snap_items(sp_row, self._SNAPSHOT_HP_KEYS, self._SNAPSHOT_HP_LABELS, hp_total) if sp_row is not None else [],
            "canton_mean": self._snap_mean_items(canton_means, "statpop__", self._SNAPSHOT_HP_KEYS, self._SNAPSHOT_HP_LABELS),
            "swiss_mean": self._snap_mean_items(swiss_means, "statpop__", self._SNAPSHOT_HP_KEYS, self._SNAPSHOT_HP_LABELS),
        }

        return {
            "swiss_ratio": swiss_ratio,
            "origin": {
                "items": origin_items,
                "canton_mean": origin_canton,
                "swiss_mean": origin_swiss,
            },
            "age_distribution": age_distribution,
            "construction_period": construction_period,
            "heat_source": heat_source,
            "heat_generator": heat_generator,
            "land_use_10": land_use_10,
            "area_stats_17": area_stats_17,
            "employment_by_sector": employment_by_sector,
            "private_households": private_households,
        }

    def get_municipality_profile(self, bfs: str | int) -> dict | None:
        parsed_bfs = _safe_int(bfs, None)
        if parsed_bfs is None:
            return None
        key = str(int(parsed_bfs))
        if key in self.profile_cache:
            return self.profile_cache[key]

        base = self.profile_base_by_bfs.get(key)
        if base is None:
            return None

        row = self.profile_metric_frame.loc[key] if key in self.profile_metric_frame.index else pd.Series(dtype=np.float64)
        canton_key = str(int(base.get("canton_num", 0))) if base.get("canton_num") is not None else ""
        area_sq_km = self.profile_area_sq_km_by_bfs.get(key)
        coverage_pct = _safe_float(row.get("population_coverage_pct"), float("nan"))
        inhabited_area = None
        if area_sq_km is not None and np.isfinite(coverage_pct):
            inhabited_area = float(area_sq_km * (coverage_pct / 100.0))

        progression: list[dict[str, object]] = []
        for item in self.profile_indicator_catalog:
            columns = item.get("gwl_columns", {})
            if not isinstance(columns, dict):
                continue
            values: dict[str, float | None] = {}
            has_value = False
            for scenario in ("gwl1.5", "gwl2.0", "gwl3.0"):
                col = str(columns.get(scenario, ""))
                if not col or col not in self.profile_metric_frame.columns:
                    values[scenario] = None
                    continue
                value = _safe_float(row.get(col), float("nan"))
                if np.isfinite(value):
                    has_value = True
                    values[scenario] = float(value)
                else:
                    values[scenario] = None
            if not has_value:
                continue

            gwl3_col = str(columns.get("gwl3.0", ""))
            percentile = None
            if (
                gwl3_col
                and not self.profile_percentile_frame.empty
                and gwl3_col in self.profile_percentile_frame.columns
                and key in self.profile_percentile_frame.index
            ):
                percentile_raw = _safe_float(self.profile_percentile_frame.at[key, gwl3_col], float("nan"))
                if np.isfinite(percentile_raw):
                    percentile = float(percentile_raw)

            progression.append(
                {
                    "base_key": str(item.get("base_key") or ""),
                    "label": str(item.get("label") or _format_metric_label(str(item.get("base_key") or ""))),
                    "group": str(item.get("group") or "Climate Indicators"),
                    "values": values,
                    "gwl3_percentile": percentile,
                }
            )

        progression_sorted = sorted(progression, key=lambda rec: (str(rec.get("group")), str(rec.get("label"))))
        core_progression = [
            rec
            for rec in progression_sorted
            if f"{rec.get('base_key', '')}_gwl3.0" in set(self.profile_core_indicator_keys)
        ]
        if not core_progression:
            core_progression = progression_sorted[:8]

        severity_top = sorted(
            [rec for rec in progression_sorted if rec.get("gwl3_percentile") is not None],
            key=lambda rec: (-float(rec.get("gwl3_percentile") or 0.0), str(rec.get("label") or "")),
        )[:10]

        benchmark_rows: list[dict[str, object]] = []
        for metric_key in self.profile_benchmark_keys:
            municipality_val = _safe_float(row.get(metric_key), float("nan"))
            canton_val = self.profile_canton_benchmarks.get(metric_key, {}).get(canton_key)
            swiss_val = self.profile_swiss_benchmarks.get(metric_key)
            benchmark_rows.append(
                {
                    "metric_key": metric_key,
                    "label": _format_metric_label(metric_key),
                    "municipality": float(municipality_val) if np.isfinite(municipality_val) else None,
                    "canton_mean": float(canton_val) if canton_val is not None and np.isfinite(canton_val) else None,
                    "swiss_mean": float(swiss_val) if swiss_val is not None and np.isfinite(swiss_val) else None,
                }
            )

        heating = self.profile_heating_summary_by_bfs.get(
            key,
            {"total_units": 0.0, "old_1919_share_pct": None, "heating_mix": []},
        )

        payload = {
            "bfs": key,
            "identity": {
                "name": str(base.get("name") or key),
                "canton_name": str(base.get("canton_name") or ""),
                "canton_num": base.get("canton_num"),
                "language": str(base.get("language") or ""),
            },
            "tags": {
                "building_material_zone": base.get("building_material_zone"),
                "building_material_zone_number": base.get("building_material_zone_number"),
                "hearth_system_zone": base.get("hearth_system_zone"),
                "hearth_system_zone_number": base.get("hearth_system_zone_number"),
                "material_hearth_zone": base.get("material+hearth_zone"),
            },
            "overview": {
                "temperature_mean_range": _safe_profile_value(row.get("temperature_mean-range")),
                "temperature_winter_mean_range": _safe_profile_value(row.get("temperature_winter_mean-range")),
                "older_than_1919_pct": _safe_profile_value(row.get("older_than_1919_pct")),
                "older_than_1919_pct_original_system": _safe_profile_value(row.get("older_than_1919_pct_original_system")),
                "population_coverage_pct": _safe_profile_value(row.get("population_coverage_pct")),
                "stored_climate_risk_gwl3.0": _safe_profile_value(row.get("climate_risk_gwl3.0")),
                "climate_risk_range": _safe_profile_value(row.get("climate_risk_range")),
            },
            "benchmarks": benchmark_rows,
            "climate": {
                "core_progression": core_progression,
                "progression": progression_sorted,
                "severity_top": severity_top,
                "not_available": {
                    "true_historical_timeline": {
                        "status": "not_available",
                        "message": "True historical per-year climate timeline is not available in this MVP.",
                    }
                },
            },
            "built_environment": {
                "heating": heating,
                "not_available": {
                    "detailed_housing_stock_timeseries": {
                        "status": "not_available",
                        "message": "Detailed historical building stock timeline is not available in this MVP.",
                    }
                },
            },
            "context": {
                "bioregion": self.profile_bioregion_by_bfs.get(key),
                "area_sq_km": float(area_sq_km) if area_sq_km is not None and np.isfinite(area_sq_km) else None,
                "inhabited_area_est_sq_km": (
                    float(inhabited_area) if inhabited_area is not None and np.isfinite(inhabited_area) else None
                ),
                "population_coverage_pct": _safe_profile_value(row.get("population_coverage_pct")),
                "centroid_lat": base.get("centroid_lat"),
                "centroid_lon": base.get("centroid_lon"),
            },
            "analysis_note": (
                "Profile uses cached municipality attributes and benchmark summaries. "
                "Stage-specific recompute outputs are not persisted in this endpoint."
            ),
            "not_available": {
                "elevation_profile_curve": {
                    "status": "not_available",
                    "message": "Detailed intra-municipality elevation profile is not available in this MVP.",
                }
            },
            "snapshot": self._build_snapshot_block(key, canton_key),
        }
        self.profile_cache[key] = payload
        return payload

    def _prepare_label_raster(self, muni_gdf: gpd.GeoDataFrame) -> None:
        pop_path = self.background_dir / "06_population_mask.tif"
        if not pop_path.exists():
            raise FileNotFoundError(f"Missing population mask: {pop_path}")

        with rasterio.open(pop_path) as src:
            pop_raw = src.read(1)
            transform = src.transform
            out_shape = (src.height, src.width)

        self._pop_mask = np.isfinite(pop_raw) & (pop_raw > 0)

        shapes = [
            (geom, int(bfs))
            for geom, bfs in zip(muni_gdf.geometry, muni_gdf["BFS_NUMMER"])
            if geom is not None
        ]

        labels = rasterize(
            shapes,
            out_shape=out_shape,
            transform=transform,
            fill=0,
            dtype="int32",
        )
        self._label_raster = labels
        self._max_label = int(labels.max())

    def _aggregate_means(self, arr: np.ndarray, use_habitable: bool) -> dict[str, float]:
        if self._label_raster is None:
            return {}

        valid = np.isfinite(arr)
        if use_habitable and self._pop_mask is not None:
            valid &= self._pop_mask

        labels = self._label_raster
        valid &= labels > 0

        idx = labels[valid].astype(np.int64)
        vals = arr[valid].astype(np.float64)

        if idx.size == 0:
            return {}

        sums = np.bincount(idx, weights=vals, minlength=self._max_label + 1)
        counts = np.bincount(idx, minlength=self._max_label + 1)

        out: dict[str, float] = {}
        for bfs in self._bfs_ids:
            if bfs <= self._max_label and counts[bfs] > 0:
                out[str(bfs)] = float(sums[bfs] / counts[bfs])
        return out

    def _read_raster(self, path: Path) -> np.ndarray:
        with rasterio.open(path) as src:
            arr = src.read(1).astype(np.float64)
            nodata = src.nodata
        if nodata is not None:
            arr[arr == nodata] = np.nan
        return arr

    def _precompute_temperature_aggregates(self) -> None:
        methods = ["mean-mean", "mean-range", "mean-min", "mean-max"]
        for method in methods:
            annual_path = self.temp_dir / f"temperature_1800-1900_{method}_resampled.tif"
            winter_path = self.temp_dir / f"temperature_winter_1800-1900_{method}_resampled.tif"

            if annual_path.exists():
                arr = self._read_raster(annual_path)
                self.temperature_cache[("annual", method, False)] = self._aggregate_means(arr, False)
                self.temperature_cache[("annual", method, True)] = self._aggregate_means(arr, True)

            if winter_path.exists():
                arr = self._read_raster(winter_path)
                self.temperature_cache[("winter", method, False)] = self._aggregate_means(arr, False)
                self.temperature_cache[("winter", method, True)] = self._aggregate_means(arr, True)

    def _load_heating_records(self) -> None:
        local_path = self.background_dir / "building_stock_dict.json"
        fallback_path = self.proposal_dir / "03_data" / "building_stock_dict.json"
        json_path = local_path if local_path.exists() else fallback_path

        if not json_path.exists():
            self.heating_records = {}
            self.heating_codes = set()
            return

        if json_path == fallback_path and not local_path.exists():
            self.load_warnings.append(
                "Using fallback heating dataset from 03_data/building_stock_dict.json; "
                "background_data/building_stock_dict.json not found."
            )

        data = json.loads(json_path.read_text())
        records: dict[str, HeatingAgeRecord] = {}
        heating_codes: set[str] = set()

        for bfs, per_age in data.items():
            age_totals: dict[str, float] = {}
            age_heating: dict[str, dict[str, float]] = {}

            if not isinstance(per_age, dict):
                continue

            for age_key, per_building in per_age.items():
                if age_key not in self.AGE_KEYS_SORTED:
                    continue
                if not isinstance(per_building, dict):
                    continue

                total_age = 0.0
                heat_totals: dict[str, float] = {}

                for b_type in self.RESIDENTIAL_TYPES:
                    stats = per_building.get(b_type)
                    if not isinstance(stats, dict):
                        continue

                    total_age += _safe_float(stats.get("_T", 0.0))

                    for heat_code, value in stats.items():
                        if heat_code == "_T":
                            continue
                        heat_code = str(heat_code)
                        heating_codes.add(heat_code)
                        heat_totals[heat_code] = heat_totals.get(heat_code, 0.0) + _safe_float(value)

                age_totals[age_key] = total_age
                age_heating[age_key] = heat_totals

            if age_totals:
                records[str(bfs)] = HeatingAgeRecord(
                    age_totals=age_totals,
                    age_heating=age_heating,
                )

        self.heating_records = records
        self.heating_codes = heating_codes

    def _overlay_geojson(
        self,
        path: Path,
        simplify_tolerance: float = 0.0,
        keep_columns: Iterable[str] | None = None,
    ) -> dict:
        if not path.exists():
            return {"type": "FeatureCollection", "features": []}
        gdf = gpd.read_file(path)
        if gdf.crs is None:
            gdf = gdf.set_crs(epsg=2056)
        gdf = gdf.to_crs(epsg=4326)
        if keep_columns:
            cols = [c for c in keep_columns if c in gdf.columns]
            gdf = gdf[cols + ["geometry"]].copy()
        if simplify_tolerance > 0:
            gdf = gdf.copy()
            gdf["geometry"] = gdf.geometry.simplify(simplify_tolerance)
        gdf = self._sanitize_for_json(gdf)
        return json.loads(gdf.to_json())

    def _sanitize_for_json(self, gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Convert values that break JSON serialization (e.g. Timestamp)."""
        out = gdf.copy()
        geom_name = out.geometry.name
        for col in out.columns:
            if col == geom_name:
                continue
            series = out[col]
            if pd.api.types.is_datetime64_any_dtype(series):
                out[col] = series.dt.strftime("%Y-%m-%dT%H:%M:%S").where(series.notna(), None)
                continue

            if pd.api.types.is_object_dtype(series):
                def _clean(v):
                    if v is None:
                        return None
                    if isinstance(v, pd.Timestamp):
                        return v.isoformat()
                    if isinstance(v, (datetime, date)):
                        return v.isoformat()
                    # Handle pandas native NA values without breaking on non-scalars.
                    try:
                        if bool(pd.isna(v)):
                            return None
                    except Exception:
                        pass
                    # GeoJSON-compatible scalars are left untouched.
                    return v

                out[col] = series.map(_clean)
        return out

    def _build_overlay_specs(self) -> dict[str, dict]:
        return {
            "national_border": {
                "label": "National border",
                "path": self.background_dir / "01_swiss_national_border.geojson",
                "simplify_tolerance": 0.0005,
                "keep_columns": None,
                "hoverable": False,
            },
            "cantons": {
                "label": "Cantons",
                "path": self.background_dir / "02_swiss_cantons.geojson",
                "simplify_tolerance": 0.001,
                "keep_columns": None,
                "hoverable": False,
            },
            "bioregions": {
                "label": "Bioregions",
                "path": self.background_dir / "04_swiss_bioregions.geojson",
                "simplify_tolerance": 0.001,
                "keep_columns": ["DEBioBedeu", "RegionName"],
                "hoverable": True,
            },
            "isos": {
                "label": "ISOS",
                "path": self._resolve_isos_path(),
                "simplify_tolerance": 0.0,
                "keep_columns": None,
                "hoverable": True,
            },
        }

    def _build_overlay_manifest(self, overlay_specs: dict[str, dict]) -> dict[str, dict]:
        out: dict[str, dict] = {}
        for layer_id, spec in overlay_specs.items():
            path = Path(spec["path"])
            feature_count = 1 if path.exists() else 0
            out[layer_id] = {
                "id": str(layer_id),
                "label": str(spec.get("label", layer_id)),
                "kind": "vector",
                "hoverable": bool(spec.get("hoverable", False)),
                "feature_count": int(feature_count),
                "url": f"/api/overlay/{layer_id}",
            }
        return out

    def get_overlay_payload(self, layer_id: str) -> dict | None:
        key = str(layer_id)
        if key in self.overlay_payloads:
            return self.overlay_payloads[key]

        spec = self.overlay_specs.get(key)
        if spec is None:
            return None

        path = Path(spec["path"])
        payload = self._overlay_geojson(
            path=path,
            simplify_tolerance=float(spec.get("simplify_tolerance", 0.0)),
            keep_columns=spec.get("keep_columns"),
        )
        self.overlay_payloads[key] = payload

        manifest_entry = self.overlay_manifest.get(key)
        if manifest_entry is not None:
            features = payload.get("features") if isinstance(payload, dict) else []
            manifest_entry["feature_count"] = len(features) if isinstance(features, list) else 0

        return payload

    def _municipality_keep_columns(self) -> list[str]:
        return [
            "BFS_NUMMER",
            "NAME",
            "KANTONSNUM",
        ]

    def _municipality_cache_signature(self, source_path: Path, keep_cols: list[str]) -> dict:
        stat = source_path.stat()
        return {
            "version": 2,
            "source_path": str(source_path),
            "source_mtime_ns": int(stat.st_mtime_ns),
            "source_size": int(stat.st_size),
            "simplify_tolerance": float(self.muni_simplify_tolerance),
            "columns": keep_cols,
        }

    def _municipality_cache_paths(self) -> tuple[Path, Path]:
        return (
            self.cache_dir / "municipalities_bootstrap.geojson.gz",
            self.cache_dir / "municipalities_bootstrap.meta.json",
        )

    def _build_municipality_geojson(self, muni_gdf: gpd.GeoDataFrame, keep_cols: list[str]) -> dict:
        muni_out = muni_gdf.to_crs(epsg=4326).copy()
        muni_out["geometry"] = muni_out.geometry.simplify(self.muni_simplify_tolerance)
        keep_cols = [c for c in keep_cols if c in muni_out.columns]
        muni_safe = self._sanitize_for_json(muni_out[keep_cols + ["geometry"]])
        return json.loads(muni_safe.to_json())

    def _load_or_build_municipality_geojson(self, muni_gdf: gpd.GeoDataFrame, source_path: Path) -> dict:
        keep_cols = self._municipality_keep_columns()
        signature = self._municipality_cache_signature(source_path, keep_cols)
        cache_geojson_path, cache_meta_path = self._municipality_cache_paths()

        if cache_geojson_path.exists() and cache_meta_path.exists():
            try:
                meta = json.loads(cache_meta_path.read_text())
                if meta == signature:
                    with gzip.open(cache_geojson_path, "rt", encoding="utf-8") as fh:
                        cached = json.load(fh)
                    if isinstance(cached, dict) and cached.get("type") == "FeatureCollection":
                        return cached
            except Exception as exc:
                self.load_warnings.append(f"Municipality cache ignored: {exc}")

        muni_geojson = self._build_municipality_geojson(muni_gdf, keep_cols)
        try:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
            with gzip.open(cache_geojson_path, "wt", encoding="utf-8", compresslevel=6) as fh:
                json.dump(muni_geojson, fh, separators=(",", ":"), ensure_ascii=False)
            cache_meta_path.write_text(json.dumps(signature, separators=(",", ":"), ensure_ascii=False))
        except Exception as exc:
            self.load_warnings.append(f"Municipality cache write skipped: {exc}")

        return muni_geojson

    def _build_bootstrap_payload(self, muni_gdf: gpd.GeoDataFrame, source_path: Path) -> dict:
        muni_geojson = self._load_or_build_municipality_geojson(muni_gdf, source_path)

        return {
            "municipalities": muni_geojson,
            # Keep "overlays" key for backward compatibility during transition.
            "overlays": {},
            "overlay_manifest": self.overlay_manifest,
            "raster_overlays": self.raster_overlay_meta,
            "controls": {
                "seasons": ["annual", "winter"],
                "temperature_methods": ["mean-mean", "mean-range", "mean-min", "mean-max"],
                "heating_options": label_heating_options(self.heating_codes),
                "climate_indicator_options": self.climate_indicator_options,
                "building_material_zone_options": self.building_material_zone_options,
                "hearth_system_zone_options": self.hearth_system_zone_options,
                "material_hearth_zone_options": self.material_hearth_zone_options,
                "defaults": {
                    "season": "annual",
                    "temp_method": "mean-range",
                    "exclude_non_habitable": True,
                    "excluded_heating_types": ["1", "7"],
                    "k_temp": 1.0,
                    "k_old": 1.0,
                    "climate_indicator_keys": self.default_climate_indicator_keys,
                    "climate_top_share_pct": 25,
                    "municipality_display_mode": "bivariate",
                    "selected_material_hearth_zones": [],
                    "apply_material_hearth_filter": True,
                    "apply_climate_priority": True,
                    # Backward compatibility defaults (kept for one transition cycle).
                    "selected_building_material_zone_numbers": [],
                    "selected_hearth_system_zones": [],
                    "apply_material_filter": True,
                    "apply_hearth_filter": False,
                    "auto_update": True,
                    "layer_order": [
                        "national_border",
                        "cantons",
                        "isos",
                        "bioregions",
                        "population",
                        "elevation",
                        "municipality_bounds",
                        "bivariate_municipalities",
                    ],
                    "show_layers": {
                        "bivariate_municipalities": True,
                        "municipality_bounds": False,
                        "national_border": False,
                        "cantons": False,
                        "isos": False,
                        "bioregions": False,
                        "population": False,
                        "elevation": False,
                    },
                    "show_overlays": {
                        "national_border": False,
                        "cantons": False,
                        "bioregions": False,
                        "isos": False,
                    },
                },
            },
        }

    def _build_raster_overlays(self) -> None:
        self.raster_overlay_meta = {}
        self.raster_overlay_png = {}

        specs = [
            {
                "id": "elevation",
                "path": self.background_dir / "elev_grid_epsg2056_reprojected.tif",
                "label": "Elevation",
                "domain": (0.0, 4000.0),
                "alpha": 0.55,
                "style": "elevation",
            },
            {
                "id": "population",
                "path": self.background_dir / "05_population_aggregated_to_ref.tif",
                "label": "Population",
                "domain": (0.0, 200.0),
                "alpha": 0.65,
                "style": "population",
            },
        ]

        for spec in specs:
            path = spec["path"]
            if not path.exists():
                self.load_warnings.append(f"Raster overlay missing: {path.name}")
                continue

            try:
                with rasterio.open(path) as src:
                    arr = src.read(1).astype(np.float32)
                    rgba = self._style_raster_rgba(
                        arr=arr,
                        nodata=src.nodata,
                        style=spec["style"],
                        vmin=float(spec["domain"][0]),
                        vmax=float(spec["domain"][1]),
                        alpha=float(spec["alpha"]),
                    )

                    left, bottom, right, top = transform_bounds(
                        src.crs,
                        "EPSG:4326",
                        *src.bounds,
                        densify_pts=21,
                    )

                png_bytes = self._encode_png_rgba(rgba)
                layer_id = str(spec["id"])
                self.raster_overlay_png[layer_id] = png_bytes
                self.raster_overlay_meta[layer_id] = {
                    "id": layer_id,
                    "label": str(spec["label"]),
                    "url": f"/api/raster/{layer_id}.png",
                    "bounds": [[bottom, left], [top, right]],
                    "default_opacity": float(spec["alpha"]),
                }
            except Exception as exc:
                self.load_warnings.append(f"Failed raster overlay {path.name}: {exc}")

    def _style_raster_rgba(
        self,
        arr: np.ndarray,
        nodata: float | int | None,
        style: str,
        vmin: float,
        vmax: float,
        alpha: float,
    ) -> np.ndarray:
        a = np.array(arr, dtype=np.float32, copy=True)
        valid = np.isfinite(a)
        if nodata is not None and np.isfinite(nodata):
            valid &= a != float(nodata)
        valid &= a > 0

        clipped = np.clip(a, vmin, vmax)
        denom = max(vmax - vmin, 1e-9)
        norm = np.clip((clipped - vmin) / denom, 0.0, 1.0)
        norm_valid = np.where(valid, norm, 0.0)

        if style == "population":
            rgb = self._inferno_like_rgb(norm_valid)
        else:
            gray = np.round(norm_valid * 255.0).astype(np.uint8)
            rgb = np.stack([gray, gray, gray], axis=-1)

        alpha_u8 = np.zeros(a.shape, dtype=np.uint8)
        alpha_u8[valid] = int(np.clip(alpha, 0.0, 1.0) * 255.0)
        rgba = np.dstack([rgb, alpha_u8]).astype(np.uint8)
        return rgba

    def _inferno_like_rgb(self, norm: np.ndarray) -> np.ndarray:
        # Compact inferno-like gradient anchors for server-side raster styling.
        anchors = np.array(
            [
                [0.0, 0.0, 4.0],
                [49.0, 11.0, 95.0],
                [136.0, 34.0, 106.0],
                [203.0, 70.0, 65.0],
                [248.0, 142.0, 14.0],
                [252.0, 255.0, 164.0],
            ],
            dtype=np.float32,
        )
        pos = np.linspace(0.0, 1.0, anchors.shape[0], dtype=np.float32)
        flat = np.nan_to_num(norm.reshape(-1).astype(np.float32), nan=0.0, posinf=1.0, neginf=0.0)
        out = np.empty((flat.shape[0], 3), dtype=np.float32)
        for i in range(3):
            out[:, i] = np.interp(flat, pos, anchors[:, i])
        out = np.nan_to_num(out, nan=0.0, posinf=255.0, neginf=0.0)
        return np.round(out).astype(np.uint8).reshape(norm.shape + (3,))

    def _encode_png_rgba(self, rgba: np.ndarray) -> bytes:
        h, w, _ = rgba.shape
        with MemoryFile() as mem:
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=NotGeoreferencedWarning)
                with mem.open(driver="PNG", width=w, height=h, count=4, dtype="uint8") as dst:
                    dst.write(rgba[:, :, 0], 1)
                    dst.write(rgba[:, :, 1], 2)
                    dst.write(rgba[:, :, 2], 3)
                    dst.write(rgba[:, :, 3], 4)
            return mem.read()

    def _resolve_isos_path(self) -> Path:
        """Return preferred ISOS source with graceful fallback + warning."""
        preferred = self.background_dir / "10_isos_data.geojson"
        fallback = self.proposal_dir / "03_data" / "geodata" / "isos_POI.geojson"

        if preferred.exists():
            return preferred

        if fallback.exists():
            self.load_warnings.append(
                "Using fallback ISOS source (03_data/geodata/isos_POI.geojson); "
                "background_data/10_isos_data.geojson not found."
            )
            return fallback

        self.load_warnings.append(
            "ISOS data unavailable: neither background_data/10_isos_data.geojson "
            "nor 03_data/geodata/isos_POI.geojson exists."
        )
        return preferred

    def get_temperature(self, season: str, method: str, exclude_non_habitable: bool) -> dict[str, float]:
        return self.temperature_cache.get((season, method, bool(exclude_non_habitable)), {})

    def compute_old_pct(self, excluded_heating_codes: Iterable[str]) -> dict[str, float]:
        excluded = tuple(sorted({str(c) for c in excluded_heating_codes}))
        if excluded in self._old_pct_cache:
            return self._old_pct_cache[excluded]

        excluded_set = set(excluded)
        out: dict[str, float] = {}

        for bfs, rec in self.heating_records.items():
            denom = 0.0
            num = 0.0
            for age in self.AGE_KEYS_SORTED:
                total_age = rec.age_totals.get(age, 0.0)
                by_heat = rec.age_heating.get(age, {})
                removed = sum(by_heat.get(code, 0.0) for code in excluded_set)
                adjusted = max(0.0, total_age - removed)
                denom += adjusted
                if age == "8011":
                    num = adjusted
            if denom > 0:
                out[bfs] = (num / denom) * 100.0
        self._old_pct_cache[excluded] = out
        return out


def _safe_float(v, default: float = 0.0) -> float:
    try:
        return float(v)
    except Exception:
        return float(default)


def _safe_int(v, default: int | None = 0) -> int | None:
    try:
        if v is None:
            return default
        if isinstance(v, str) and v.strip() == "":
            return default
        return int(float(v))
    except Exception:
        return default


def _normalize_label(v) -> str:
    if v is None:
        return ""
    try:
        if bool(pd.isna(v)):
            return ""
    except Exception:
        pass
    return str(v).strip()


def _safe_profile_value(value) -> float | None:
    numeric = _safe_float(value, float("nan"))
    if np.isfinite(numeric):
        return float(numeric)
    return None


def _format_metric_label(key: str) -> str:
    if key in CLIMATE_INDICATOR_BY_KEY:
        return str(CLIMATE_INDICATOR_BY_KEY[key]["label"])
    cleaned = str(key or "")
    cleaned = re.sub(r"_gwl(1\.5|2\.0|3\.0)$", "", cleaned)
    cleaned = cleaned.replace("_", " ").replace("-", " ").strip()
    if not cleaned:
        return "Metric"
    return cleaned[0].upper() + cleaned[1:]
