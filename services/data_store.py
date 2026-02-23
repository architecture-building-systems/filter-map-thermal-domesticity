"""Data loading and cached aggregation for standalone filter-map app."""

from __future__ import annotations

from datetime import date, datetime
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable

import geopandas as gpd
import numpy as np
import pandas as pd
import rasterio
from rasterio.features import rasterize
from rasterio.io import MemoryFile
from rasterio.warp import transform_bounds

from .compute import label_heating_options


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

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.background_dir = base_dir / "background_data"
        self.temp_dir = self.background_dir / "temperature_rasters"
        self.proposal_dir = base_dir.parent

        self.ready = False
        self.bootstrap_core_payload: dict = {}
        self.bootstrap_payload: dict = {}
        self.overlay_specs: dict[str, dict] = {}
        self.overlay_payloads: dict[str, dict] = {}
        self.overlay_manifest: dict[str, dict] = {}
        self.metadata_by_bfs: dict[str, dict] = {}
        self.temperature_cache: dict[tuple[str, str, bool], dict[str, float]] = {}
        self.heating_records: dict[str, HeatingAgeRecord] = {}
        self.heating_codes: set[str] = set()
        self._old_pct_cache: dict[tuple[str, ...], dict[str, float]] = {}
        self.load_warnings: list[str] = []
        self.raster_overlay_meta: dict[str, dict] = {}
        self.raster_overlay_png: dict[str, bytes] = {}

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

        self.metadata_by_bfs = self._build_metadata(muni_gdf)

        self._prepare_label_raster(muni_gdf)
        self._precompute_temperature_aggregates()
        self._load_heating_records()
        self._build_raster_overlays()
        self.overlay_specs = self._build_overlay_specs()
        self.overlay_payloads = {}
        self.overlay_manifest = self._build_overlay_manifest(self.overlay_specs)

        self.bootstrap_core_payload = self._build_bootstrap_payload(muni_gdf)
        # Backward-compatible alias used by current API handler.
        self.bootstrap_payload = self.bootstrap_core_payload
        self.ready = True

    def _build_metadata(self, gdf: gpd.GeoDataFrame) -> dict[str, dict]:
        out: dict[str, dict] = {}
        for _, row in gdf.iterrows():
            bfs = str(int(row["BFS_NUMMER"]))
            canton_num = int(row["KANTONSNUM"]) if row.get("KANTONSNUM") is not None else 0
            out[bfs] = {
                "bfs": bfs,
                "name": str(row.get("NAME", bfs)),
                "canton_num": canton_num,
                "canton_name": self.CANTON_NAMES.get(canton_num, str(canton_num)),
            }
        return out

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

    def _build_bootstrap_payload(self, muni_gdf: gpd.GeoDataFrame) -> dict:
        muni_out = muni_gdf.to_crs(epsg=4326).copy()
        muni_out["geometry"] = muni_out.geometry.simplify(0.0008)

        keep_cols = [
            "BFS_NUMMER",
            "NAME",
            "KANTONSNUM",
            "temperature_mean-mean",
            "temperature_mean-range",
            "temperature_mean-min",
            "temperature_mean-max",
            "temperature_winter_mean-mean",
            "temperature_winter_mean-range",
            "temperature_winter_mean-min",
            "temperature_winter_mean-max",
            "older_than_1919_pct_original_system",
            "population_coverage_pct",
        ]
        keep_cols = [c for c in keep_cols if c in muni_out.columns]
        muni_safe = self._sanitize_for_json(muni_out[keep_cols + ["geometry"]])
        muni_geojson = json.loads(muni_safe.to_json())

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
                "defaults": {
                    "season": "annual",
                    "temp_method": "mean-mean",
                    "exclude_non_habitable": True,
                    "excluded_heating_types": ["1", "7"],
                    "k_temp": 1.0,
                    "k_old": 1.0,
                    "auto_update": True,
                    "layer_order": [
                        "national_border",
                        "cantons",
                        "isos",
                        "bioregions",
                        "population",
                        "elevation",
                        "bivariate_municipalities",
                    ],
                    "show_layers": {
                        "bivariate_municipalities": True,
                        "national_border": True,
                        "cantons": False,
                        "isos": False,
                        "bioregions": False,
                        "population": False,
                        "elevation": False,
                    },
                    "show_overlays": {
                        "national_border": True,
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

        if style == "population":
            rgb = self._inferno_like_rgb(norm)
        else:
            gray = np.round(norm * 255.0).astype(np.uint8)
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
        flat = norm.reshape(-1).astype(np.float32)
        out = np.empty((flat.shape[0], 3), dtype=np.float32)
        for i in range(3):
            out[:, i] = np.interp(flat, pos, anchors[:, i])
        return np.round(out).astype(np.uint8).reshape(norm.shape + (3,))

    def _encode_png_rgba(self, rgba: np.ndarray) -> bytes:
        h, w, _ = rgba.shape
        with MemoryFile() as mem:
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


def _safe_float(v) -> float:
    try:
        return float(v)
    except Exception:
        return 0.0
