const state = {
  bootstrap: null,
  records: {},
  exceptional: new Set(),
  exceptionalStage1: new Set(),
  climateStageStatus: {},
  lastClimateStats: {},
  climateIndicatorOptions: [],
  selectedClimateIndicators: new Set(),
  climateTopSharePct: 25,
  climateStageEnabled: false,
  municipalityModalOpen: false,
  municipalityModalSelectedBfs: null,
  municipalityModalActiveTab: "overview",
  municipalityModalProfileLoading: false,
  municipalityModalProfileError: "",
  municipalityModalProfileData: null,
  municipalityModalProfileCache: {},
  municipalityModalProfileFetchInFlight: {},
  municipalityModalReturnFocusEl: null,
  municipalityModalQueryHandled: false,
  municipalityModalMap: null,
  municipalityModalMapReady: false,
  municipalityModalMapGeometryLayer: null,
  municipalityModalMapFutureLayer: null,
  compareBfsOrder: [],
  compareModalOpen: false,
  compareModalActiveSection: "metrics",
  compareModalSnapshotPanel: "swiss_ratio",
  compareModalReturnFocusEl: null,
  compareProfileCache: {},
  compareProfileFetchInFlight: {},
  compareWeatherCache: {},
  compareWeatherFetchInFlight: {},
  compareWeatherErrorByBfs: {},
  compareChartIds: [],
  compareLauncherClickTimer: null,
  municipalityDisplayMode: "bivariate",
  buildingMaterialZoneOptions: [],
  materialHearthZoneOptions: [],
  selectedMaterialHearthZones: new Set(),
  hearthSystemZoneOptions: [],
  materialZoneColorMap: {},
  hearthZoneColorMap: {},
  materialHearthZoneColorMap: {},
  applyMaterialHearthFilter: true,
  applyClimatePriority: true,
  climateIndicatorScrollTop: 0,
  municipalityOptionsScrollTop: 0,
  materialHearthZoneScrollTop: 0,
  analysisStackOpenClimateMain: false,
  analysisStackOpenClimateLegend: false,
  analysisStackOpenExceptional: false,
  analysisStackOpenExceptionalInfo: false,
  legendSelectedClasses: new Set(),
  legendSelectedMaterialHearthGroups: new Set(),
  municipalityLegendExceptionalOnly: false,
  map: null,
  muniLayer: null,
  layerOrder: [],
  layerVisibility: {},
  layerOpacity: {},
  layerInstances: {},
  overlayManifest: {},
  overlayData: {},
  overlayDataLoaded: {},
  overlayFetchInFlight: {},
  layerLoadErrors: {},
  layerPaneZBase: 390,
  debounceHandle: null,
  hoverSchemas: {},
  hoverSelectedFields: {},
  layerStackOpenMain: {},
  layerStackOpenLegend: {},
  layerLegendScrollTop: {},
  healthWarning: "",
  isosLayerColorMap: {},
  isosIconCache: {},
  isosRenderMode: "symbol",
  isosZoomSettleHandle: null,
  isZoomingMap: false,
  bootHintTimer: null,
  topRowNavWired: false,
  cantonsColorMode: false,
  snapshotGalleryIndex: 0,
  bioregionColorMap: {},
  bioregionOrder: [],
  bioregionPatternReady: false,
  layerDisplayNames: {
    bivariate_municipalities: "Municipality Featured Filter",
    bioregions: "Bioregions",
    isos: "ISOS",
  },
};

const ACCENT = "#FBD124";
const FALLBACK_FILL = "#bdbdbd";
const ISOS_DEFAULT_LAYER_COLOR = "#707070";
const ISOS_DETAIL_ZOOM = 12;
const ISOS_MARKER_FILL = "#ffffff";
const ISOS_MARKER_STROKE = "#111111";
const WHITE_FILL = "#ffffff";
const SVG_NS = "http://www.w3.org/2000/svg";
const MUNICIPALITY_DISPLAY_MODES = {
  BIVARIATE: "bivariate",
  MATERIAL: "building_material_zone",
  HEARTH: "hearth_system_zone",
  MATERIAL_HEARTH: "material_hearth_zone",
};
const MATERIAL_ZONE_COLORS = [
  "#4c78a8",
  "#f58518",
  "#54a24b",
  "#e45756",
  "#72b7b2",
  "#b279a2",
  "#9d755d",
];
const HEARTH_ZONE_COLORS = [
  "#35608f",
  "#af6d2e",
  "#3f7f50",
  "#985f84",
  "#6c7c9b",
  "#477f7b",
  "#8b4d4d",
];
const MATERIAL_HEARTH_ZONE_COLORS = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
  "#5f8fbf",
  "#7a9e48",
  "#ca6f5c",
  "#5d6d7e",
  "#8f77b5",
  "#d6a54e",
];
const MATERIAL_SHORT_BY_ZONE = {
  1: "Wall/plaster",
  2: "Wood blocks",
  3: "Fachwerk infill",
  4: "Log infill",
  5: "Traditional log",
  6: "Kitchen-block log + blocks",
  7: "Kitchen-block log",
};
const HEARTH_SHORT_BY_CODE = {
  A: "Captured-smoke hearth",
  B: "Spark-arrestor hearth",
  C: "Chimney hearth",
  D: "Beam-frame hearth",
  E: "Stone-ring hearth",
  F: "Tuff-vault hearth",
  G: "Masonry chimney",
};
const CANTON_NAME_BY_NUM = {
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
  16: "Appenzell",
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
};
const CANTON_COLOR_BY_NUM = {
  1: "#F0A3FF",
  2: "#0075DC",
  3: "#993F00",
  4: "#4C005C",
  5: "#191919",
  6: "#005C31",
  7: "#2BCE48",
  8: "#FFCC99",
  9: "#808080",
  10: "#94FFB5",
  11: "#8F7C00",
  12: "#9DCC00",
  13: "#C20088",
  14: "#003380",
  15: "#19A405",
  16: "#FFA8BB",
  17: "#426600",
  18: "#FF0010",
  19: "#5EF1F2",
  20: "#00998F",
  21: "#E0FF66",
  22: "#100AFF",
  23: "#990000",
  24: "#FFFF80",
  25: "#FFE100",
  26: "#FF5000",
};

const LAYER_DEFAULT_ORDER = [
  "national_border",
  "cantons",
  "isos",
  "bioregions",
  "population",
  "elevation",
  "municipality_bounds",
  "bivariate_municipalities",
];

const MUNICIPALITY_MODAL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "snapshot", label: "Snapshot" },
  { id: "climate", label: "Climate & Bioclimatic" },
  { id: "built", label: "Built Environment" },
  { id: "context", label: "Context" },
];

const LAYER_META = {
  bivariate_municipalities: { label: "Municipality Featured Filter", hoverable: true, kind: "bivariate" },
  municipality_bounds: { label: "Municipality Bounds", hoverable: false, kind: "local_vector" },
  elevation: { label: "Elevation", hoverable: false, kind: "raster" },
  population: { label: "Population", hoverable: false, kind: "raster" },
  bioregions: { label: "Bioregions", hoverable: true, kind: "vector" },
  isos: { label: "ISOS", hoverable: true, kind: "vector" },
  cantons: { label: "Cantons", hoverable: false, kind: "vector" },
  national_border: { label: "National border", hoverable: false, kind: "vector" },
};

const DIAMOND_LEGEND_COORDS = {
  "3-3": [1, 3],
  "3-2": [2, 2],
  "2-3": [2, 4],
  "3-1": [3, 1],
  "2-2": [3, 3],
  "1-3": [3, 5],
  "2-1": [4, 2],
  "1-2": [4, 4],
  "1-1": [5, 3],
};

const DIAMOND_LEGEND_ORDER = [
  "3-3",
  "3-2", "2-3",
  "3-1", "2-2", "1-3",
  "2-1", "1-2",
  "1-1",
];

const ISOS_CATEGORY_MARKERS = {
  town: "s",
  "small town": "^",
  "special case": "D",
  village: "o",
  "urbanised village": "v",
  hamlet: "p",
  unknown: "x",
};

const ISOS_MARKER_LABELS = {
  s: "town",
  "^": "small town",
  D: "special case",
  o: "village",
  v: "urbanised village",
  p: "hamlet",
  x: "unknown",
};

const ISOS_BIN_SIZES = {
  Low: 20,
  Medium: 40,
  High: 60,
  "Very High": 80,
};

const ISOS_LAYER_COLORS = {
  Bild: "#1f77b4",
  Ortsbild: "#17becf",
};
const CLIMATE_DEFAULT_INDICATOR_KEYS = [
  "CDD_change_gwl3.0",
  "HDD_change_gwl3.0",
  "TropNights_change_gwl3.0",
  "BIO03_change_gwl3.0",
];
const COMPARE_MAX_MUNICIPALITIES = 4;
const COMPARE_COLOURS = [
  "#4c78a8",
  "#f58518",
  "#54a24b",
  "#e45756",
];
const COMPARE_SECTIONS = [
  { id: "metrics", label: "Core Metrics" },
  { id: "snapshot", label: "Snapshot" },
  { id: "weather", label: "Weather Summary" },
];
const COMPARE_SNAPSHOT_CORE_PANEL_IDS = [
  "swiss_ratio",
  "age_distribution",
  "construction_period",
  "heat_source",
  "employment_by_sector",
];
const COMPARE_WEATHER_METRICS = [
  { key: "tempMean", label: "Monthly mean temperature (°C)", digits: 2 },
  { key: "tempMin", label: "Monthly min temperature (°C)", digits: 2 },
  { key: "tempMax", label: "Monthly max temperature (°C)", digits: 2 },
  { key: "rhMedian", label: "Monthly median RH (%)", digits: 1 },
  { key: "ghiTotal", label: "Monthly total GHI (W/m²-hour proxy)", digits: 0 },
];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ISOS_FALLBACK_LAYER_PALETTE = [
  "#4c78a8",
  "#f58518",
  "#e45756",
  "#72b7b2",
  "#54a24b",
  "#eeca3b",
];

const BIOREGION_NOTEBOOK_COLORS = [
  "#1f77b4",
  "#aec7e8",
  "#ffbb78",
  "#98df8a",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#c49c94",
  "#f7b6d2",
  "#c7c7c7",
  "#bcbd22",
  "#17becf",
];

const FRIENDLY_FIELD_LABELS = {
  NAME: "Municipality",
  BFS_NUMMER: "BFS Number",
  KANTONSNUM: "Canton Number",
  canton_name: "Canton",
  temp: "Temp (°C)",
  pct_old1919: "Old Buildings (%)",
  building_material_zone: "Building Material Zone",
  building_material_zone_number: "Building Material Zone Number",
  hearth_system_zone: "Hearth System Zone",
  hearth_system_zone_number: "Hearth System Zone Code",
  "material+hearth_zone": "Material + Hearth Zone",
  climate_risk_score: "Climate Risk Score",
  "climate_risk_gwl3.0": "Stored Climate Risk (GWL 3.0)",
  bi_class: "Bivariate Class",
  DEBioBedeu: "Bioregion",
  RegionName: "Region Name",
  Text: "Description",
  year: "Year",
  jahr: "Year",
  layer: "Layer",
  code: "Code",
  id: "ID",
};

const DEFAULT_HOVER_FIELDS = {
  bivariate_municipalities: [
    "canton_name",
    "temp",
    "pct_old1919",
    "bi_class",
    "building_material_zone",
    "building_material_zone_number",
    "hearth_system_zone",
    "hearth_system_zone_number",
    "material+hearth_zone",
  ],
  bioregions: ["RegionName", "DEBioBedeu"],
  isos: ["Text", "year", "layer"],
};

const LAYER_LEGEND_NOTES = {
  municipality_bounds: "White municipality polygons with light black boundaries.",
  elevation: "Grayscale heightfield overlay (transparent for no-data). Range shown: 0 to 4000.",
  population: "Aggregated population heat overlay (transparent for no-data). Values clipped to 0 to 200.",
  cantons: "Canton boundaries in grayscale (or optional canton colormap).",
  national_border: "Swiss national border line overlay in grayscale.",
};

const el = {
  status: document.getElementById("status"),
  season: document.getElementById("season"),
  tempMethod: document.getElementById("temp-method"),
  nonHabitable: document.getElementById("non-habitable"),
  autoUpdate: document.getElementById("auto-update"),
  kTemp: document.getElementById("k-temp"),
  kOld: document.getElementById("k-old"),
  layerOrderList: document.getElementById("layer-order-list"),
  heatingList: document.getElementById("heating-list"),
  updateBtn: document.getElementById("btn-update"),
  topStackShell: document.getElementById("top-stack-shell"),
  topScrollLeft: document.getElementById("top-scroll-left"),
  topScrollRight: document.getElementById("top-scroll-right"),
  hoverPillRow: document.getElementById("hover-pill-row"),
  appLoader: document.getElementById("app-loader"),
  loaderStage: document.getElementById("app-loader-stage"),
  loaderDetail: document.getElementById("app-loader-detail"),
  loaderHint: document.getElementById("app-loader-hint"),
  loaderRetry: document.getElementById("app-loader-retry"),
  municipalityModal: document.getElementById("municipality-modal"),
  municipalityModalPanel: document.getElementById("municipality-modal-panel"),
  municipalityModalClose: document.getElementById("municipality-modal-close"),
  municipalityModalCompare: document.getElementById("municipality-modal-compare"),
  municipalityModalTitle: document.getElementById("municipality-modal-title"),
  municipalityModalMeta: document.getElementById("municipality-modal-meta"),
  municipalityModalTabs: document.getElementById("municipality-modal-tabs"),
  municipalityModalState: document.getElementById("municipality-modal-state"),
  municipalityModalContent: document.getElementById("municipality-modal-content"),
  municipalityModalMap: document.getElementById("municipality-modal-map"),
  municipalityModalGeochips: document.getElementById("municipality-modal-geochips"),
  compareLauncherWrap: document.getElementById("compare-launcher-wrap"),
  compareLauncher: document.getElementById("compare-launcher"),
  compareLauncherCount: document.getElementById("compare-launcher-count"),
  compareLauncherPopover: document.getElementById("compare-launcher-popover"),
  compareModal: document.getElementById("compare-modal"),
  compareModalPanel: document.getElementById("compare-modal-panel"),
  compareModalReport: document.getElementById("compare-modal-report"),
  compareModalClose: document.getElementById("compare-modal-close"),
  compareModalSections: document.getElementById("compare-modal-sections"),
  compareModalState: document.getElementById("compare-modal-state"),
  compareModalSelected: document.getElementById("compare-modal-selected"),
  compareModalContent: document.getElementById("compare-modal-content"),
};

function setStatus(msg) {
  const warning = state.healthWarning ? ` | ${state.healthWarning}` : "";
  el.status.textContent = `${msg}${warning}`;
}

function syncBodyModalClass() {
  const modalOpen = !!(state.municipalityModalOpen || state.compareModalOpen);
  document.body.classList.toggle("modal-open", modalOpen);
}

function setLoaderStage(stage, detail = "") {
  if (!el.appLoader) return;
  el.appLoader.classList.remove("is-hidden");
  if (el.loaderStage) el.loaderStage.textContent = String(stage || "Loading");
  if (el.loaderDetail) el.loaderDetail.textContent = String(detail || "");
}

function setLoaderHint(text = "") {
  if (!el.loaderHint) return;
  if (text) {
    el.loaderHint.textContent = text;
    el.loaderHint.classList.remove("hidden");
  } else {
    el.loaderHint.textContent = "";
    el.loaderHint.classList.add("hidden");
  }
}

function showLoaderError(message) {
  setLoaderStage("Startup error", message || "Unexpected error while starting the map.");
  setLoaderHint("Use Retry after checking server logs or network status.");
  if (el.loaderRetry) el.loaderRetry.classList.remove("hidden");
}

function hideLoader() {
  if (!el.appLoader) return;
  el.appLoader.classList.add("is-hidden");
}

function normalizeMunicipalityDisplayMode(value) {
  const mode = String(value || "").trim();
  if (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL) return MUNICIPALITY_DISPLAY_MODES.MATERIAL;
  if (mode === MUNICIPALITY_DISPLAY_MODES.HEARTH) return MUNICIPALITY_DISPLAY_MODES.HEARTH;
  if (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL_HEARTH) return MUNICIPALITY_DISPLAY_MODES.MATERIAL_HEARTH;
  return MUNICIPALITY_DISPLAY_MODES.BIVARIATE;
}

function normalizeMaterialZoneNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.trunc(numeric);
}

function _uniqueNumbers(values = []) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const out = [];
  values.forEach((value) => {
    const n = normalizeMaterialZoneNumber(value);
    if (n === null || seen.has(n)) return;
    seen.add(n);
    out.push(n);
  });
  return out;
}

function selectedMaterialHearthZonesArray() {
  return _uniqueLabels([...state.selectedMaterialHearthZones]);
}

function materialHearthOptionLabel(zoneCode) {
  const code = String(zoneCode || "").trim();
  if (!code) return "Unspecified";
  const [leftRaw, rightRaw] = code.split("_");
  const zoneNumber = normalizeMaterialZoneNumber(leftRaw);
  const hearthCode = String(rightRaw || "").trim().toUpperCase();
  const materialShort = summarizeMaterialLabel(zoneNumber, zoneNumber === null ? "" : `Zone ${zoneNumber}`);
  const hearthShort = summarizeHearthLabel("", hearthCode);
  return `${materialShort} · ${hearthShort} (${code})`;
}

function _uniqueLabels(values = []) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const out = [];
  values.forEach((value) => {
    const label = String(value || "").trim();
    if (!label || seen.has(label)) return;
    seen.add(label);
    out.push(label);
  });
  return out;
}

function overlayGeojson(layerId) {
  return state.overlayData?.[layerId] || state.bootstrap?.overlays?.[layerId] || null;
}

function debounce(fn, ms = 350) {
  if (state.debounceHandle) {
    clearTimeout(state.debounceHandle);
  }
  state.debounceHandle = setTimeout(fn, ms);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeBfsId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (!/^\d+$/.test(raw)) return "";
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n <= 0) return "";
  return String(n);
}

function finiteNumberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatMetricValue(value, digits = 2) {
  const n = finiteNumberOrNull(value);
  if (n === null) return "N/A";
  return n.toFixed(digits);
}

function setMunicipalityQueryParam(bfs = null) {
  const url = new URL(window.location.href);
  if (bfs) {
    url.searchParams.set("muni", String(bfs));
  } else {
    url.searchParams.delete("muni");
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function municipalityQueryParam() {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get("muni");
  if (raw === null) {
    return { present: false, value: "" };
  }
  return { present: true, value: normalizeBfsId(raw) };
}

function municipalityBfsFromFeature(feature) {
  return normalizeBfsId(feature?.properties?.BFS_NUMMER);
}

function municipalityProfileTabIsValid(tabId) {
  return MUNICIPALITY_MODAL_TABS.some((tab) => tab.id === tabId);
}

function municipalityModalFocusables() {
  if (!el.municipalityModalPanel) return [];
  return [...el.municipalityModalPanel.querySelectorAll(
    "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
  )].filter((node) => node.offsetParent !== null);
}

function municipalityProfileMetaLine(profile = null) {
  if (!profile) return "";
  const identity = profile.identity || {};
  const canton = String(identity.canton_name || "").trim();
  const bfs = String(profile.bfs || "");
  return canton ? `${canton} | BFS ${bfs}` : `BFS ${bfs}`;
}

function buildMunicipalityKvMarkup(rows = []) {
  const html = rows
    .map((row) => `
      <div class="municipality-kv-row">
        <dt>${escapeHtml(row.label)}</dt>
        <dd>${escapeHtml(row.value)}</dd>
      </div>
    `)
    .join("");
  return `<dl class="municipality-kv">${html}</dl>`;
}

function compareMunicipalityName(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) return "";
  const profile = state.compareProfileCache[key] || state.municipalityModalProfileCache[key];
  if (profile?.identity?.name) return String(profile.identity.name);
  const rec = state.records[key];
  if (rec?.name) return String(rec.name);
  if (rec?.NAME) return String(rec.NAME);
  const feature = municipalityFeatureByBfs(key);
  if (feature?.properties?.NAME) return String(feature.properties.NAME);
  return key;
}

function compareMunicipalityCanton(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) return "";
  const profile = state.compareProfileCache[key] || state.municipalityModalProfileCache[key];
  if (profile?.identity?.canton_name) return String(profile.identity.canton_name);
  const rec = state.records[key];
  if (rec?.canton_name) return String(rec.canton_name);
  return "";
}

function compareMunicipalityLabel(bfs) {
  const name = compareMunicipalityName(bfs);
  const canton = compareMunicipalityCanton(bfs);
  return canton ? `${name} (${canton})` : name;
}

function compareStatusLabel(status) {
  const key = String(status || "").trim();
  if (key === "selected") return "Selected";
  if (key === "filtered_out") return "Filtered out";
  if (key === "missing") return "No climate score";
  return "N/A";
}

function compareColourByBfs(bfs) {
  const idx = state.compareBfsOrder.indexOf(String(bfs));
  const safeIdx = idx < 0 ? 0 : idx;
  return COMPARE_COLOURS[safeIdx % COMPARE_COLOURS.length];
}

function buildMunicipalityOverviewTab(profile) {
  const overview = profile?.overview || {};
  const tags = profile?.tags || {};
  const cards = [];

  cards.push(`
    <article class="municipality-card">
      <h3>Municipality Tags</h3>
      ${buildMunicipalityKvMarkup([
        { label: "Material Zone", value: tags.building_material_zone || "N/A" },
        { label: "Material Zone Number", value: tags.building_material_zone_number ?? "N/A" },
        { label: "Hearth System", value: tags.hearth_system_zone || "N/A" },
        { label: "Hearth Code", value: tags.hearth_system_zone_number || "N/A" },
        { label: "Material + Hearth", value: tags.material_hearth_zone || "N/A" },
      ])}
    </article>
  `);

  cards.push(`
    <article class="municipality-card">
      <h3>Current Metrics</h3>
      ${buildMunicipalityKvMarkup([
        { label: "Temp mean-range", value: formatMetricValue(overview.temperature_mean_range, 2) },
        { label: "Temp winter mean-range", value: formatMetricValue(overview.temperature_winter_mean_range, 2) },
        { label: "Older than 1919 (%)", value: formatMetricValue(overview.older_than_1919_pct, 1) },
        { label: "Population coverage (%)", value: formatMetricValue(overview.population_coverage_pct, 1) },
        { label: "Stored climate risk (GWL 3.0)", value: formatMetricValue(overview["stored_climate_risk_gwl3.0"], 2) },
      ])}
      <p class="municipality-inline-note">Values come from cached municipality attributes.</p>
    </article>
  `);

  const benchmarkRows = Array.isArray(profile?.benchmarks) ? profile.benchmarks.slice(0, 7) : [];
  const benchmarkHtml = benchmarkRows.length
    ? `
      <table class="municipality-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Municipality</th>
            <th>Canton mean</th>
            <th>Swiss mean</th>
          </tr>
        </thead>
        <tbody>
          ${benchmarkRows.map((row) => `
            <tr>
              <td>${escapeHtml(row.label || row.metric_key || "Metric")}</td>
              <td>${escapeHtml(formatMetricValue(row.municipality, 2))}</td>
              <td>${escapeHtml(formatMetricValue(row.canton_mean, 2))}</td>
              <td>${escapeHtml(formatMetricValue(row.swiss_mean, 2))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `
    : "<p class=\"municipality-inline-note\">No benchmark metrics available for this municipality.</p>";

  cards.push(`
    <article class="municipality-card">
      <h3>Benchmark Snapshot</h3>
      ${benchmarkHtml}
    </article>
  `);

  const snapshotData = profile?.snapshot;
  if (snapshotData) {
    const snapshotRows = SNAPSHOT_PANELS.filter((p) => !p.hideFromOverview).map((panel) => {
      const data = snapshotData[panel.id];
      let headline = "N/A";
      if (panel.id === "swiss_ratio") {
        headline = data?.ratio ?? "N/A";
      } else if (data?.items?.length) {
        const top = data.items[0];
        headline = `${escapeHtml(top.label || String(top.code))} (${formatMetricValue(top.share_pct, 1)}%)`;
      }
      return `<tr>
        <td>${escapeHtml(panel.title)}</td>
        <td>${escapeHtml(String(headline))}</td>
      </tr>`;
    }).join("");

    cards.push(`
      <article class="municipality-card">
        <h3>Statistics Overview</h3>
        <table class="municipality-table">
          <thead>
            <tr>
              <th>Statistic</th>
              <th>Headline value</th>
            </tr>
          </thead>
          <tbody>${snapshotRows}</tbody>
        </table>
        <p class="municipality-inline-note">Full interactive charts are available in the Snapshot tab.</p>
      </article>
    `);
  }

  return `<section class="municipality-tab-grid">${cards.join("")}</section>`;
}

function buildMunicipalityClimateTab(profile) {
  const climate = profile?.climate || {};
  const core = Array.isArray(climate.core_progression) ? climate.core_progression : [];
  const severity = Array.isArray(climate.severity_top) ? climate.severity_top : [];

  const progressionRows = core.length
    ? core.map((row) => {
      const values = row.values || {};
      return `
        <div class="municipality-progression-row">
          <div class="municipality-progression-head">
            <strong>${escapeHtml(row.label || row.base_key || "Indicator")}</strong>
            <span>${escapeHtml(row.group || "Climate Indicators")}</span>
          </div>
          <div class="municipality-progression-values">
            GWL 1.5: <strong>${escapeHtml(formatMetricValue(values["gwl1.5"], 2))}</strong> |
            GWL 2.0: <strong>${escapeHtml(formatMetricValue(values["gwl2.0"], 2))}</strong> |
            GWL 3.0: <strong>${escapeHtml(formatMetricValue(values["gwl3.0"], 2))}</strong>
            ${row.gwl3_percentile === null || row.gwl3_percentile === undefined
              ? ""
              : `| Percentile: <strong>${escapeHtml(formatMetricValue(row.gwl3_percentile, 1))}</strong>`}
          </div>
        </div>
      `;
    }).join("")
    : "<p class=\"municipality-inline-note\">No climate progression indicators available.</p>";

  const severityTable = severity.length
    ? `
      <table class="municipality-table">
        <thead>
          <tr>
            <th>Indicator</th>
            <th>GWL 3.0 value</th>
            <th>Percentile</th>
          </tr>
        </thead>
        <tbody>
          ${severity.map((row) => {
            const values = row.values || {};
            return `
              <tr>
                <td>${escapeHtml(row.label || row.base_key || "Indicator")}</td>
                <td>${escapeHtml(formatMetricValue(values["gwl3.0"], 2))}</td>
                <td>${escapeHtml(formatMetricValue(row.gwl3_percentile, 1))}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `
    : "<p class=\"municipality-inline-note\">Severity ranking unavailable for current indicators.</p>";

  return `
    <section class="municipality-tab-grid">
      <article class="municipality-card">
        <h3>Scenario Progression (GWL 1.5 → 2.0 → 3.0)</h3>
        <div class="municipality-progressions">${progressionRows}</div>
      </article>
      <article class="municipality-card">
        <h3>Bioclimatic Severity (Relative)</h3>
        ${severityTable}
        <p class="municipality-inline-note">This is a relative ranking within the current municipality domain.</p>
      </article>
    </section>
  `;
}

function buildMunicipalityBuiltTab(profile) {
  const built = profile?.built_environment || {};
  const heating = built.heating || {};
  const heatingRows = Array.isArray(heating.heating_mix) ? heating.heating_mix : [];
  const heatingTable = heatingRows.length
    ? `
      <table class="municipality-table">
        <thead>
          <tr>
            <th>Heating Type</th>
            <th>Share (%)</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${heatingRows.map((row) => `
            <tr>
              <td>${escapeHtml(row.label || row.code || "Heating type")}</td>
              <td>${escapeHtml(formatMetricValue(row.share_pct, 1))}</td>
              <td>${escapeHtml(formatMetricValue(row.count, 1))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `
    : "<p class=\"municipality-inline-note\">No heating composition data available.</p>";

  return `
    <section class="municipality-tab-grid">
      <article class="municipality-card">
        <h3>Heating Composition</h3>
        ${heatingTable}
      </article>
      <article class="municipality-card">
        <h3>Housing Age Summary</h3>
        ${buildMunicipalityKvMarkup([
          { label: "Old stock share (1919 and earlier, %)", value: formatMetricValue(heating.old_1919_share_pct, 1) },
          { label: "Total building units (proxy)", value: formatMetricValue(heating.total_units, 1) },
        ])}
        <p class="municipality-inline-note">Detailed longitudinal housing stock views are marked for a later iteration.</p>
      </article>
    </section>
  `;
}

function buildMunicipalityContextTab(profile) {
  const context = profile?.context || {};
  const identity = profile?.identity || {};
  const notAvailable = profile?.not_available?.elevation_profile_curve?.message || "Not available in this MVP.";
  return `
    <section class="municipality-tab-grid">
      <article class="municipality-card">
        <h3>Administrative Context</h3>
        ${buildMunicipalityKvMarkup([
          { label: "Canton", value: identity.canton_name || "N/A" },
          { label: "Language", value: identity.language || "N/A" },
          { label: "Bioregion", value: context.bioregion || "N/A" },
        ])}
      </article>
      <article class="municipality-card">
        <h3>Area & Coverage</h3>
        ${buildMunicipalityKvMarkup([
          { label: "Total area (sq km)", value: formatMetricValue(context.area_sq_km, 2) },
          { label: "Inhabited area est. (sq km)", value: formatMetricValue(context.inhabited_area_est_sq_km, 2) },
          { label: "Population coverage (%)", value: formatMetricValue(context.population_coverage_pct, 1) },
        ])}
      </article>
      <article class="municipality-card">
        <h3>Coming Next</h3>
        <p class="municipality-inline-note">${escapeHtml(notAvailable)}</p>
      </article>
    </section>
  `;
}

// ---------------------------------------------------------------------------
// Chart helpers (Chart.js)
// ---------------------------------------------------------------------------

const _chartInstances = {};

function destroyChart(canvasId) {
  if (_chartInstances[canvasId]) {
    _chartInstances[canvasId].destroy();
    delete _chartInstances[canvasId];
  }
}

function destroyAllCharts() {
  Object.keys(_chartInstances).forEach(destroyChart);
}

const SNAPSHOT_PALETTE = [
  "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78",
  "#2ca02c", "#98df8a", "#d62728", "#ff9896",
  "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
  "#e377c2", "#f7b6d2", "#bcbd22", "#dbdb8d",
  "#17becf", "#9edae5", "#7f7f7f", "#c7c7c7",
];
const SNAPSHOT_NONE_COLOUR = "#aaaaaa";

const _chartFontFamily = "Comfortaa, sans-serif";

function renderPieChart(canvasId, labels, values, colours) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  _chartInstances[canvasId] = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colours || SNAPSHOT_PALETTE.slice(0, values.length),
        borderWidth: 1,
        borderColor: "#fff",
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { font: { family: _chartFontFamily, size: 11 }, boxWidth: 14, padding: 8 },
        },
        tooltip: {
          bodyFont: { family: _chartFontFamily },
          titleFont: { family: _chartFontFamily },
        },
      },
    },
  });
}

function renderBarChart(canvasId, labels, values, colours) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  _chartInstances[canvasId] = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colours || SNAPSHOT_PALETTE[0],
        borderWidth: 0,
      }],
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyFont: { family: _chartFontFamily },
          titleFont: { family: _chartFontFamily },
        },
      },
      scales: {
        x: {
          grid: { color: "#f0f0f0" },
          ticks: { font: { family: _chartFontFamily, size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: _chartFontFamily, size: 11 } },
        },
      },
    },
  });
}

function renderStackedBarChart(canvasId, cohorts, maleValues, femaleValues) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  _chartInstances[canvasId] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: cohorts,
      datasets: [
        {
          label: "Male",
          data: maleValues,
          backgroundColor: "#4a6f8a",
          borderWidth: 0,
        },
        {
          label: "Female",
          data: femaleValues,
          backgroundColor: "#c87c5c",
          borderWidth: 0,
        },
      ],
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { family: _chartFontFamily, size: 11 } },
        },
        tooltip: {
          bodyFont: { family: _chartFontFamily },
          titleFont: { family: _chartFontFamily },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: "#f0f0f0" },
          ticks: { font: { family: _chartFontFamily, size: 11 } },
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { family: _chartFontFamily, size: 11 } },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Snapshot gallery
// ---------------------------------------------------------------------------

const SNAPSHOT_PANELS = [
  { id: "swiss_ratio",         title: "Swiss-Born Ratio",               subtitle: "Proportion of Swiss-born to foreign-born residents",    sortMode: null,       hideFromOverview: false },
  { id: "origin",              title: "Origin",                          subtitle: "Resident origin by region",                             sortMode: "by_label", hideFromOverview: true  },
  { id: "age_distribution",    title: "Age Distribution",                subtitle: "Population by five-year age cohort",                   sortMode: null,       hideFromOverview: false },
  { id: "construction_period", title: "Construction Period",             subtitle: "Buildings by decade of construction",                   sortMode: "by_code",  hideFromOverview: false },
  { id: "heat_source",         title: "Heat Source",                     subtitle: "Buildings by primary energy source",                    sortMode: "by_label", hideFromOverview: false },
  { id: "heat_generator",      title: "Heat Generator",                  subtitle: "Buildings by heat generation system",                   sortMode: "by_label", hideFromOverview: false },
  { id: "land_use_10",         title: "Land Use (10 Classes)",           subtitle: "Land use composition by 10 major categories (LU18)",    sortMode: null,       hideFromOverview: true  },
  { id: "area_stats_17",          title: "Area Statistics (17 Classes)",    subtitle: "Area statistics composition by 17 categories (AS18)",         sortMode: null,       hideFromOverview: false },
  { id: "employment_by_sector",   title: "Employment by Sector",            subtitle: "Jobs by economic sector, split by gender (STATENT 2021)",       sortMode: null,       hideFromOverview: false },
  { id: "private_households",     title: "Private Households",              subtitle: "Number of private households by household size (STATPOP)",       sortMode: null,       hideFromOverview: false },
];

function buildSnapshotGalleryHtml(instanceId) {
  const opts = SNAPSHOT_PANELS.map((p, i) =>
    `<option value="${i}">${escapeHtml(p.title)}</option>`
  ).join("");
  return `
    <div class="snapshot-gallery" id="snapshot-gallery-${instanceId}">
      <div class="snapshot-gallery-header">
        <select class="snapshot-gallery-select" id="snapshot-select-${instanceId}" aria-label="Select statistic panel">
          ${opts}
        </select>
      </div>
      <div class="snapshot-gallery-nav-row">
        <button class="snapshot-gallery-nav" id="snapshot-prev-${instanceId}" type="button" aria-label="Previous panel" disabled>&#8249;</button>
        <div class="snapshot-gallery-card" id="snapshot-card-${instanceId}">
          <div class="snapshot-gallery-card-title" id="snapshot-title-${instanceId}"></div>
          <div class="snapshot-gallery-card-subtitle" id="snapshot-subtitle-${instanceId}"></div>
          <div class="snapshot-gallery-card-body" id="snapshot-body-${instanceId}"></div>
        </div>
        <button class="snapshot-gallery-nav" id="snapshot-next-${instanceId}" type="button" aria-label="Next panel">&#8250;</button>
      </div>
    </div>
  `;
}

function _sortSnapshotItems(items, sortMode) {
  const isNone = (it) => (it.label || "").toLowerCase() === "none";
  const normal = items.filter((it) => !isNone(it));
  const noneItems = items.filter(isNone);
  if (sortMode === "by_label") {
    normal.sort((a, b) => (a.label || "").localeCompare(b.label || ""));
  } else if (sortMode === "by_code") {
    normal.sort((a, b) => String(a.code).localeCompare(String(b.code)));
  }
  return [...normal, ...noneItems];
}

function _snapshotItemColours(items) {
  let paletteIdx = 0;
  return items.map((it) => {
    if ((it.label || "").toLowerCase() === "none") return SNAPSHOT_NONE_COLOUR;
    return SNAPSHOT_PALETTE[paletteIdx++ % SNAPSHOT_PALETTE.length];
  });
}

function renderSnapshotPanel(instanceId, snapshot, index) {
  const panel = SNAPSHOT_PANELS[index];
  if (!panel) return;

  const titleEl = document.getElementById(`snapshot-title-${instanceId}`);
  const subtitleEl = document.getElementById(`snapshot-subtitle-${instanceId}`);
  const bodyEl = document.getElementById(`snapshot-body-${instanceId}`);
  const prevBtn = document.getElementById(`snapshot-prev-${instanceId}`);
  const nextBtn = document.getElementById(`snapshot-next-${instanceId}`);
  const selectEl = document.getElementById(`snapshot-select-${instanceId}`);

  if (!titleEl || !bodyEl) return;

  if (titleEl) titleEl.textContent = panel.title;
  if (subtitleEl) subtitleEl.textContent = panel.subtitle;
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === SNAPSHOT_PANELS.length - 1;
  if (selectEl) selectEl.value = String(index);

  const canvasId = `snapshot-canvas-${instanceId}`;
  destroyChart(canvasId);

  const data = snapshot?.[panel.id];

  if (panel.id === "swiss_ratio") {
    const ratio = data?.ratio ?? "N/A";
    const swiss = (data?.swiss ?? 0).toLocaleString();
    const nonSwiss = (data?.non_swiss ?? 0).toLocaleString();
    bodyEl.innerHTML = `
      <div class="snapshot-ratio-display">${escapeHtml(ratio)}</div>
      <div class="snapshot-ratio-detail">
        <span>Swiss-born: <strong>${escapeHtml(swiss)}</strong></span>
        <span>Foreign-born: <strong>${escapeHtml(nonSwiss)}</strong></span>
      </div>
    `;
    return;
  }

  bodyEl.innerHTML = `<canvas id="${canvasId}"></canvas>`;

  const items = Array.isArray(data?.items) ? data.items : [];
  const hasSectorData = panel.id === "employment_by_sector" && (
    Array.isArray(data?.sectors) && data.sectors.length > 0
  );
  if (!items.length && !hasSectorData) {
    bodyEl.innerHTML = `<p class="snapshot-no-data">No data available for this municipality.</p>`;
    return;
  }

  if (panel.id === "age_distribution") {
    const cohorts = Array.isArray(data?.cohorts) ? data.cohorts : items.map((it) => it.label || String(it.code));
    const male = Array.isArray(data?.male) ? data.male : items.map((it) => it.value ?? 0);
    const female = Array.isArray(data?.female) ? data.female : [];
    renderStackedBarChart(canvasId, cohorts, male, female);
  } else if (panel.id === "employment_by_sector") {
    const sectors = Array.isArray(data?.sectors) ? data.sectors : items.map((it) => it.label || String(it.code));
    const male = Array.isArray(data?.male) ? data.male : [];
    const female = Array.isArray(data?.female) ? data.female : [];
    if (!sectors.length || (!male.length && !female.length)) {
      bodyEl.innerHTML = `<p class="snapshot-no-data">No employment data available for this municipality.</p>`;
      return;
    }
    renderStackedBarChart(canvasId, sectors, male, female);
  } else if (panel.id === "land_use_10" || panel.id === "area_stats_17") {
    const labels = items.map((it) => it.label || String(it.code));
    const values = items.map((it) => it.value ?? 0);
    renderBarChart(canvasId, labels, values);
  } else if (panel.id === "private_households") {
    const orderedLabels = Array.isArray(data?.labels) ? data.labels : items.map((it) => it.label || String(it.code));
    const labelIndex = Object.fromEntries(items.map((it) => [it.label || String(it.code), it.value ?? 0]));
    const orderedValues = orderedLabels.map((lbl) => labelIndex[lbl] ?? 0);
    renderBarChart(canvasId, orderedLabels, orderedValues);
  } else {
    const sorted = _sortSnapshotItems(items, panel.sortMode);
    const labels = sorted.map((it) => it.label || String(it.code));
    const values = sorted.map((it) => it.value ?? 0);
    const colours = _snapshotItemColours(sorted);
    renderPieChart(canvasId, labels, values, colours);
  }
}

function wireSnapshotGallery(instanceId, snapshot, initialIndex) {
  let index = Math.max(0, Math.min(SNAPSHOT_PANELS.length - 1, initialIndex || 0));

  function go(newIndex) {
    index = Math.max(0, Math.min(SNAPSHOT_PANELS.length - 1, newIndex));
    state.snapshotGalleryIndex = index;
    renderSnapshotPanel(instanceId, snapshot, index);
  }

  const prevBtn = document.getElementById(`snapshot-prev-${instanceId}`);
  const nextBtn = document.getElementById(`snapshot-next-${instanceId}`);
  const selectEl = document.getElementById(`snapshot-select-${instanceId}`);

  if (prevBtn) prevBtn.addEventListener("click", () => go(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => go(index + 1));
  if (selectEl) selectEl.addEventListener("change", (e) => go(parseInt(e.target.value, 10)));

  renderSnapshotPanel(instanceId, snapshot, index);
}

function buildMunicipalitySnapshotTab(profile) {
  const snapshot = profile?.snapshot;
  const instanceId = "main";
  const bfs = profile?.bfs;
  const galleryHtml = buildSnapshotGalleryHtml(instanceId);
  setTimeout(() => {
    wireSnapshotGallery(instanceId, snapshot, state.snapshotGalleryIndex || 0);
    if (bfs) fetchAndRenderWeatherCharts(bfs);
  }, 0);
  return `
    <section class="municipality-tab-grid">
      <article class="municipality-card municipality-card--full">
        <h3>Statistics Snapshot</h3>
        ${snapshot
          ? galleryHtml
          : '<p class="municipality-inline-note">Statistics data is not yet available for this municipality.</p>'}
      </article>
      <article class="municipality-card municipality-card--full">
        <h3>Local Weather Profile</h3>
        <div id="weather-charts-main">
          <p class="municipality-inline-note">Loading weather data…</p>
        </div>
      </article>
    </section>
  `;
}

// ---------------------------------------------------------------------------
// Local weather — typical monthly day charts
// ---------------------------------------------------------------------------

async function fetchAndRenderWeatherCharts(bfs) {
  const container = document.getElementById("weather-charts-main");
  if (!container) return;
  try {
    const resp = await fetch(`/api/municipality/${encodeURIComponent(bfs)}/weather`);
    if (!resp.ok) {
      container.innerHTML = `<p class="municipality-inline-note">Weather data is not available for this municipality.</p>`;
      return;
    }
    const data = await resp.json();
    if (!data?.variables) {
      container.innerHTML = `<p class="municipality-inline-note">Weather data is not available for this municipality.</p>`;
      return;
    }
    renderWeatherSection(container, data);
  } catch (_err) {
    if (document.getElementById("weather-charts-main") === container) {
      container.innerHTML = `<p class="municipality-inline-note">Weather data could not be loaded.</p>`;
    }
  }
}

function renderWeatherSection(container, data) {
  const station = data.station || {};
  const stationLabel = station.name ? ` — ${escapeHtml(station.name)}` : "";
  const varKeys = ["temp_air", "ghi", "relative_humidity"];
  const parts = [];
  parts.push(`<p class="municipality-inline-note weather-station-note">Nearest EPW station${stationLabel}</p>`);
  for (const key of varKeys) {
    const varData = data.variables?.[key];
    if (!varData) continue;
    parts.push(`<div class="weather-variable-block">
      <div class="weather-variable-label">${escapeHtml(varData.label)}</div>
      <div class="weather-row-wrap">
        <div class="weather-y-axis" id="weather-yaxis-${escapeHtml(key)}"></div>
        <div class="weather-monthly-row" id="weather-row-${escapeHtml(key)}"></div>
      </div>
    </div>`);
  }
  container.innerHTML = parts.join("");

  for (const key of varKeys) {
    const varData = data.variables?.[key];
    if (!varData) continue;
    const rowEl = document.getElementById(`weather-row-${key}`);
    const yAxisEl = document.getElementById(`weather-yaxis-${key}`);
    if (!rowEl) continue;
    renderTypicalMonthlyDayCharts(rowEl, yAxisEl, key, varData);
  }
}

function renderTypicalMonthlyDayCharts(rowEl, yAxisEl, varKey, varData) {
  if (!window.Chart) return;
  const monthly = varData.monthly || [];
  if (!monthly.length) return;

  // Fixed y-axis bounds for specific variables; data-driven for others.
  const Y_FIXED = {
    ghi:               { min: 0,    max: 1200 },
    relative_humidity: { min: 0,    max: 100  },
  };

  let yMin, yMax;
  if (Y_FIXED[varKey]) {
    yMin = Y_FIXED[varKey].min;
    yMax = Y_FIXED[varKey].max;
  } else {
    // Compute shared Y domain across all months and all scatter values.
    yMin = Infinity;
    yMax = -Infinity;
    for (const m of monthly) {
      for (const pts of (m.scatter || [])) {
        for (const v of pts) {
          if (v < yMin) yMin = v;
          if (v > yMax) yMax = v;
        }
      }
      for (const v of (m.medians || [])) {
        if (v !== null && v < yMin) yMin = v;
        if (v !== null && v > yMax) yMax = v;
      }
    }
    // Add a small margin.
    const range = yMax - yMin || 1;
    yMin = Math.floor(yMin - range * 0.05);
    yMax = Math.ceil(yMax + range * 0.05);
  }

  // Remove the HTML Y-axis strip — tick labels are drawn inside the first chart panel.
  if (yAxisEl) yAxisEl.remove();

  for (let mIdx = 0; mIdx < monthly.length; mIdx++) {
    const m = monthly[mIdx];
    const isFirst = mIdx === 0;

    const wrap = document.createElement("div");
    wrap.className = "weather-month-panel";

    const monthLabel = document.createElement("div");
    monthLabel.className = "weather-month-label";
    monthLabel.textContent = m.name;
    wrap.appendChild(monthLabel);

    const canvas = document.createElement("canvas");
    const canvasId = `weather-canvas-${varKey}-${mIdx}`;
    canvas.id = canvasId;
    wrap.appendChild(canvas);
    rowEl.appendChild(wrap);

    // Scatter dataset: flatten scatter[hour] → [{x, y}, ...]
    const scatterPoints = [];
    const scatter = m.scatter || [];
    for (let h = 0; h < scatter.length; h++) {
      for (const v of scatter[h]) {
        scatterPoints.push({ x: h, y: v });
      }
    }

    // Median dataset: [{x: hour, y: median}, ...]
    const medianPoints = (m.medians || []).map((v, h) => ({ x: h, y: v }));

    _chartInstances[canvasId] = new Chart(canvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Daily values",
            data: scatterPoints,
            backgroundColor: varData.colour_scatter,
            borderWidth: 0,
            pointRadius: 2,
            pointHoverRadius: 2,
          },
          {
            label: "Median",
            data: medianPoints,
            type: "line",
            backgroundColor: "transparent",
            borderColor: varData.colour_line,
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.3,
          },
        ],
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: 24,
            grid: { color: "#f0f0f0", drawTicks: false },
            border: { display: false },
            ticks: {
              font: { family: _chartFontFamily, size: 9 },
              color: "#888",
              stepSize: 6,
              callback: (v) => (v === 0 || v === 6 || v === 12 || v === 18 || v === 24) ? String(v) : null,
            },
          },
          y: {
            min: yMin,
            max: yMax,
            grid: { color: "#f0f0f0", drawTicks: false },
            border: { display: false },
            ticks: {
              display: isFirst,
              font: { family: _chartFontFamily, size: 9 },
              color: "#888",
              maxTicksLimit: 5,
            },
            // Non-first panels: collapse the Y axis to zero width so all 11 panels
            // share their full canvas with the plot area.
            // First panel: natural width calculated by Chart.js from tick labels.
            ...(isFirst ? {} : { afterFit: (scale) => { scale.width = 0; } }),
          },
        },
      },
    });
  }
}

function municipalityTabMarkup(profile, tabId) {
  if (tabId === "overview") return buildMunicipalityOverviewTab(profile);
  if (tabId === "snapshot") return buildMunicipalitySnapshotTab(profile);
  if (tabId === "climate") return buildMunicipalityClimateTab(profile);
  if (tabId === "built") return buildMunicipalityBuiltTab(profile);
  return buildMunicipalityContextTab(profile);
}

function municipalityFeatureByBfs(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) return null;
  const features = state.bootstrap?.municipalities?.features || [];
  for (const feature of features) {
    if (municipalityBfsFromFeature(feature) === key) return feature;
  }
  return null;
}

function ensureMunicipalityModalMap() {
  if (state.municipalityModalMapReady) return;
  if (!el.municipalityModalMap || !window.L) return;

  const map = L.map(el.municipalityModalMap, {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
    zoomAnimation: true,
    fadeAnimation: true,
    preferCanvas: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 19,
  }).addTo(map);

  const geometryLayer = L.geoJSON(null, {
    style: {
      color: "#111111",
      weight: 2.2,
      opacity: 1.0,
      fill: true,
      fillColor: "#ffffff",
      fillOpacity: 0.72,
    },
  }).addTo(map);

  const futureLayer = L.layerGroup().addTo(map);

  state.municipalityModalMap = map;
  state.municipalityModalMapGeometryLayer = geometryLayer;
  state.municipalityModalMapFutureLayer = futureLayer;
  state.municipalityModalMapReady = true;
}

function updateMunicipalityModalGeometryMap() {
  if (!state.municipalityModalOpen) return;
  ensureMunicipalityModalMap();
  if (!state.municipalityModalMapReady) return;

  const map = state.municipalityModalMap;
  const geometryLayer = state.municipalityModalMapGeometryLayer;
  if (!map || !geometryLayer) return;

  const feature = municipalityFeatureByBfs(state.municipalityModalSelectedBfs);
  geometryLayer.clearLayers();
  if (feature) {
    geometryLayer.addData(feature);
    const bounds = geometryLayer.getBounds();
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [22, 22], maxZoom: 13 });
    }
  }

  window.requestAnimationFrame(() => {
    map.invalidateSize(true);
  });
}

function renderMunicipalityModalGeochips() {
  if (!el.municipalityModalGeochips) return;
  const profile = state.municipalityModalProfileData;
  const bfs = state.municipalityModalSelectedBfs || "";
  if (!bfs) {
    el.municipalityModalGeochips.innerHTML = "";
    return;
  }

  if (!profile) {
    el.municipalityModalGeochips.innerHTML = `
      <div class="municipality-geochip"><span>BFS</span><strong>${escapeHtml(String(bfs))}</strong></div>
      <div class="municipality-geochip"><span>Status</span><strong>${escapeHtml(state.municipalityModalProfileLoading ? "Loading..." : "Pending")}</strong></div>
    `;
    return;
  }

  const identity = profile.identity || {};
  const tags = profile.tags || {};
  const context = profile.context || {};
  el.municipalityModalGeochips.innerHTML = `
    <div class="municipality-geochip"><span>BFS</span><strong>${escapeHtml(String(profile.bfs || bfs))}</strong></div>
    <div class="municipality-geochip"><span>Canton</span><strong>${escapeHtml(String(identity.canton_name || "N/A"))}</strong></div>
    <div class="municipality-geochip"><span>Bioregion</span><strong>${escapeHtml(String(context.bioregion || "N/A"))}</strong></div>
    <div class="municipality-geochip"><span>Material</span><strong>${escapeHtml(String(tags.building_material_zone_number ?? "N/A"))}</strong></div>
    <div class="municipality-geochip"><span>Hearth</span><strong>${escapeHtml(String(tags.hearth_system_zone_number || "N/A"))}</strong></div>
    <div class="municipality-geochip"><span>Area km²</span><strong>${escapeHtml(formatMetricValue(context.area_sq_km, 2))}</strong></div>
  `;
}

function renderMunicipalityModal() {
  if (!el.municipalityModal) return;
  const open = !!state.municipalityModalOpen;
  if (!open) {
    el.municipalityModal.classList.add("hidden");
    el.municipalityModal.setAttribute("aria-hidden", "true");
    if (el.municipalityModalState) {
      el.municipalityModalState.classList.remove("hidden");
    }
    if (el.municipalityModalGeochips) {
      el.municipalityModalGeochips.innerHTML = "";
    }
    return;
  }

  el.municipalityModal.classList.remove("hidden");
  el.municipalityModal.setAttribute("aria-hidden", "false");
  const profile = state.municipalityModalProfileData;
  const loading = !!state.municipalityModalProfileLoading;
  const hasError = !!state.municipalityModalProfileError;
  const activeTab = municipalityProfileTabIsValid(state.municipalityModalActiveTab)
    ? state.municipalityModalActiveTab
    : "overview";
  state.municipalityModalActiveTab = activeTab;

  if (el.municipalityModalTitle) {
    const title = profile?.identity?.name
      ? `${profile.identity.name} — Municipality Profile`
      : `Municipality ${state.municipalityModalSelectedBfs || ""} — Municipality Profile`;
    el.municipalityModalTitle.textContent = title.trim();
  }
  if (el.municipalityModalMeta) {
    el.municipalityModalMeta.textContent = municipalityProfileMetaLine(profile) || "Loading profile context ...";
  }
  if (el.municipalityModalCompare) {
    const key = normalizeBfsId(state.municipalityModalSelectedBfs);
    const inCompare = key && state.compareBfsOrder.includes(key);
    const compareFull = state.compareBfsOrder.length >= COMPARE_MAX_MUNICIPALITIES;
    const blocked = !inCompare && compareFull;
    el.municipalityModalCompare.disabled = !!blocked;
    el.municipalityModalCompare.textContent = inCompare ? "Remove from compare" : "Add to compare";
    el.municipalityModalCompare.setAttribute(
      "aria-label",
      inCompare ? "Remove municipality from comparison" : "Add municipality to comparison",
    );
  }
  if (el.municipalityModalTabs) {
    el.municipalityModalTabs.innerHTML = MUNICIPALITY_MODAL_TABS
      .map((tab) => {
        const active = tab.id === activeTab ? " is-active" : "";
        return `
          <button
            type="button"
            role="tab"
            class="municipality-modal-tab${active}"
            data-muni-tab="${escapeHtml(tab.id)}"
            aria-selected="${tab.id === activeTab ? "true" : "false"}"
          >
            ${escapeHtml(tab.label)}
          </button>
        `;
      })
      .join("");
  }

  if (el.municipalityModalState) {
    if (loading) {
      el.municipalityModalState.className = "municipality-modal-state";
      el.municipalityModalState.innerHTML = "Loading municipality profile ...";
      el.municipalityModalState.classList.remove("hidden");
    } else if (hasError) {
      el.municipalityModalState.className = "municipality-modal-state is-error";
      el.municipalityModalState.innerHTML = `
        ${escapeHtml(state.municipalityModalProfileError)}
        <button type="button" class="field-option-action" data-muni-profile-retry style="margin-left:0.5rem;">Retry</button>
      `;
      el.municipalityModalState.classList.remove("hidden");
    } else if (!profile) {
      el.municipalityModalState.className = "municipality-modal-state";
      el.municipalityModalState.innerHTML = "No profile data available.";
      el.municipalityModalState.classList.remove("hidden");
    } else {
      el.municipalityModalState.className = "municipality-modal-state hidden";
      el.municipalityModalState.innerHTML = "";
    }
  }

  if (el.municipalityModalContent) {
    if (!loading && !hasError && profile) {
      el.municipalityModalContent.innerHTML = municipalityTabMarkup(profile, activeTab);
      el.municipalityModalContent.classList.remove("hidden");
    } else {
      el.municipalityModalContent.innerHTML = "";
      el.municipalityModalContent.classList.add("hidden");
    }
  }

  renderMunicipalityModalGeochips();
  updateMunicipalityModalGeometryMap();
}

async function ensureMunicipalityProfileLoaded(bfs, force = false) {
  const key = normalizeBfsId(bfs);
  if (!key) {
    throw new Error("Invalid municipality BFS.");
  }
  if (!force && state.municipalityModalProfileCache[key]) {
    return state.municipalityModalProfileCache[key];
  }
  if (state.municipalityModalProfileFetchInFlight[key]) {
    return state.municipalityModalProfileFetchInFlight[key];
  }

  const promise = fetchJson(`/api/municipality/${encodeURIComponent(key)}/profile`)
    .then((data) => {
      state.municipalityModalProfileCache[key] = data;
      return data;
    })
    .finally(() => {
      state.municipalityModalProfileFetchInFlight[key] = null;
    });
  state.municipalityModalProfileFetchInFlight[key] = promise;
  return promise;
}

async function openMunicipalityModal(bfs, preferredTab = "overview") {
  const key = normalizeBfsId(bfs);
  if (!key) return;

  state.municipalityModalReturnFocusEl = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  state.municipalityModalOpen = true;
  state.municipalityModalSelectedBfs = key;
  state.municipalityModalActiveTab = municipalityProfileTabIsValid(preferredTab) ? preferredTab : "overview";
  state.municipalityModalProfileError = "";
  setMunicipalityQueryParam(key);
  syncBodyModalClass();

  const cached = state.municipalityModalProfileCache[key];
  if (cached) {
    state.municipalityModalProfileLoading = false;
    state.municipalityModalProfileData = cached;
    renderMunicipalityModal();
  } else {
    state.municipalityModalProfileLoading = true;
    state.municipalityModalProfileData = null;
    renderMunicipalityModal();
    try {
      const profile = await ensureMunicipalityProfileLoaded(key);
      if (!state.municipalityModalOpen || state.municipalityModalSelectedBfs !== key) return;
      state.municipalityModalProfileData = profile;
      state.municipalityModalProfileError = "";
    } catch (err) {
      if (!state.municipalityModalOpen || state.municipalityModalSelectedBfs !== key) return;
      state.municipalityModalProfileData = null;
      state.municipalityModalProfileError = String(err?.message || "Failed to load municipality profile.");
    } finally {
      if (state.municipalityModalOpen && state.municipalityModalSelectedBfs === key) {
        state.municipalityModalProfileLoading = false;
        renderMunicipalityModal();
      }
    }
  }

  renderMunicipalityModal();
  window.requestAnimationFrame(() => {
    el.municipalityModalClose?.focus();
    updateMunicipalityModalGeometryMap();
  });
}

function closeMunicipalityModal() {
  if (!state.municipalityModalOpen) return;
  destroyAllCharts();
  state.municipalityModalOpen = false;
  state.municipalityModalProfileLoading = false;
  state.municipalityModalProfileError = "";
  state.municipalityModalProfileData = null;
  state.municipalityModalSelectedBfs = null;
  renderMunicipalityModal();
  setMunicipalityQueryParam(null);
  syncBodyModalClass();
  if (state.municipalityModalReturnFocusEl && typeof state.municipalityModalReturnFocusEl.focus === "function") {
    state.municipalityModalReturnFocusEl.focus();
  }
  state.municipalityModalReturnFocusEl = null;
}

function openMunicipalityModalFromFeature(feature) {
  const bfs = municipalityBfsFromFeature(feature);
  if (!bfs) return;
  openMunicipalityModal(bfs);
}

function maybeOpenMunicipalityModalFromQuery() {
  if (state.municipalityModalQueryHandled) return;
  state.municipalityModalQueryHandled = true;
  const query = municipalityQueryParam();
  if (!query.present) return;
  if (!query.value) {
    setMunicipalityQueryParam(null);
    return;
  }
  openMunicipalityModal(query.value);
}

function wireMunicipalityModalEvents() {
  if (!el.municipalityModal) return;

  el.municipalityModal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-muni-modal-close]")) {
      closeMunicipalityModal();
      return;
    }
    const tabNode = target.closest("[data-muni-tab]");
    if (tabNode) {
      const tabId = String(tabNode.getAttribute("data-muni-tab") || "");
      if (municipalityProfileTabIsValid(tabId)) {
        state.municipalityModalActiveTab = tabId;
        renderMunicipalityModal();
      }
      return;
    }
    const retryNode = target.closest("[data-muni-profile-retry]");
    if (retryNode) {
      const bfs = state.municipalityModalSelectedBfs;
      if (bfs) {
        delete state.municipalityModalProfileCache[bfs];
        openMunicipalityModal(bfs, state.municipalityModalActiveTab);
      }
    }
  });

  el.municipalityModalClose?.addEventListener("click", () => {
    closeMunicipalityModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!state.municipalityModalOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMunicipalityModal();
      return;
    }
    if (event.key === "Tab") {
      const focusable = municipalityModalFocusables();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function compareModalFocusables() {
  if (!el.compareModalPanel) return [];
  return [...el.compareModalPanel.querySelectorAll(
    "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
  )].filter((node) => node.offsetParent !== null);
}

function compareModalSectionIsValid(sectionId) {
  return COMPARE_SECTIONS.some((section) => section.id === sectionId);
}

function destroyCompareCharts() {
  (state.compareChartIds || []).forEach((chartId) => destroyChart(chartId));
  state.compareChartIds = [];
}

function clearCompareSelection() {
  state.compareBfsOrder = [];
  renderCompareLauncher();
  if (state.compareModalOpen) {
    renderCompareModal();
  }
  if (state.municipalityModalOpen) {
    renderMunicipalityModal();
  }
  setStatus("Comparison selection cleared.");
}

function toggleCompareMunicipality(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) return;
  const existing = state.compareBfsOrder.indexOf(key);
  if (existing >= 0) {
    state.compareBfsOrder.splice(existing, 1);
  } else if (state.compareBfsOrder.length >= COMPARE_MAX_MUNICIPALITIES) {
    setStatus(`Maximum ${COMPARE_MAX_MUNICIPALITIES} municipalities in comparison.`);
    return;
  } else {
    state.compareBfsOrder.push(key);
    prefetchCompareMunicipalityData(key);
  }
  renderCompareLauncher();
  if (state.compareModalOpen) renderCompareModal();
  if (state.municipalityModalOpen) renderMunicipalityModal();
}

function renderCompareLauncher() {
  if (!el.compareLauncher) return;
  const count = state.compareBfsOrder.length;
  if (el.compareLauncherCount) {
    el.compareLauncherCount.textContent = String(count);
    el.compareLauncherCount.classList.toggle("hidden", count === 0);
  }
  if (el.compareLauncherPopover) {
    if (count === 0) {
      el.compareLauncherPopover.classList.add("hidden");
      el.compareLauncherPopover.innerHTML = "";
    } else {
      const items = state.compareBfsOrder
        .map((bfs) => `<li>${escapeHtml(compareMunicipalityLabel(bfs))}</li>`)
        .join("");
      el.compareLauncherPopover.innerHTML = `<ul>${items}</ul>`;
      el.compareLauncherPopover.classList.remove("hidden");
    }
  }
}

async function ensureCompareProfileLoaded(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) throw new Error("Invalid municipality BFS.");
  if (state.compareProfileCache[key]) return state.compareProfileCache[key];
  if (state.compareProfileFetchInFlight[key]) return state.compareProfileFetchInFlight[key];
  const promise = ensureMunicipalityProfileLoaded(key)
    .then((profile) => {
      state.compareProfileCache[key] = profile;
      return profile;
    })
    .finally(() => {
      state.compareProfileFetchInFlight[key] = null;
      if (state.compareModalOpen) renderCompareModal();
      if (state.municipalityModalOpen) renderMunicipalityModal();
      renderCompareLauncher();
    });
  state.compareProfileFetchInFlight[key] = promise;
  return promise;
}

async function ensureCompareWeatherLoaded(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) throw new Error("Invalid municipality BFS.");
  if (state.compareWeatherCache[key]) return state.compareWeatherCache[key];
  if (state.compareWeatherFetchInFlight[key]) return state.compareWeatherFetchInFlight[key];
  const promise = fetchJson(`/api/municipality/${encodeURIComponent(key)}/weather`)
    .then((data) => {
      state.compareWeatherCache[key] = data;
      state.compareWeatherErrorByBfs[key] = "";
      return data;
    })
    .catch((err) => {
      state.compareWeatherErrorByBfs[key] = String(err?.message || "Weather data unavailable");
      throw err;
    })
    .finally(() => {
      state.compareWeatherFetchInFlight[key] = null;
      if (state.compareModalOpen) renderCompareModal();
    });
  state.compareWeatherFetchInFlight[key] = promise;
  return promise;
}

function prefetchCompareMunicipalityData(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) return;
  Promise.allSettled([
    ensureCompareProfileLoaded(key),
    ensureCompareWeatherLoaded(key),
  ]).catch(() => {});
}

function medianOf(values = []) {
  if (!Array.isArray(values) || !values.length) return null;
  const sorted = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function flattenMonthlyScatter(month = null) {
  if (!month || !Array.isArray(month.scatter)) return [];
  const out = [];
  month.scatter.forEach((hourValues) => {
    if (!Array.isArray(hourValues)) return;
    hourValues.forEach((value) => {
      const n = Number(value);
      if (Number.isFinite(n)) out.push(n);
    });
  });
  if (!out.length && Array.isArray(month.medians)) {
    month.medians.forEach((value) => {
      const n = Number(value);
      if (Number.isFinite(n)) out.push(n);
    });
  }
  return out;
}

function weatherSummarySeries(weatherData = null) {
  const tempMonthly = weatherData?.variables?.temp_air?.monthly || [];
  const rhMonthly = weatherData?.variables?.relative_humidity?.monthly || [];
  const ghiMonthly = weatherData?.variables?.ghi?.monthly || [];
  const tempMean = [];
  const tempMin = [];
  const tempMax = [];
  const rhMedian = [];
  const ghiTotal = [];

  for (let i = 0; i < 12; i += 1) {
    const tempVals = flattenMonthlyScatter(tempMonthly[i]);
    const rhVals = flattenMonthlyScatter(rhMonthly[i]);
    const ghiVals = flattenMonthlyScatter(ghiMonthly[i]);

    if (tempVals.length) {
      const sum = tempVals.reduce((acc, v) => acc + v, 0);
      tempMean.push(sum / tempVals.length);
      tempMin.push(Math.min(...tempVals));
      tempMax.push(Math.max(...tempVals));
    } else {
      tempMean.push(null);
      tempMin.push(null);
      tempMax.push(null);
    }

    rhMedian.push(rhVals.length ? medianOf(rhVals) : null);
    ghiTotal.push(ghiVals.length ? ghiVals.reduce((acc, v) => acc + v, 0) : null);
  }

  return { tempMean, tempMin, tempMax, rhMedian, ghiTotal };
}

function renderCompareGroupedBarChart(canvasId, labels = [], datasets = [], yAxisLabel = "") {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  _chartInstances[canvasId] = new Chart(canvas, {
    type: "bar",
    data: { labels, datasets },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { family: _chartFontFamily, size: 11 } },
        },
        tooltip: {
          bodyFont: { family: _chartFontFamily },
          titleFont: { family: _chartFontFamily },
        },
      },
      scales: {
        x: {
          grid: { color: "#efefef" },
          ticks: { font: { family: _chartFontFamily, size: 10 } },
        },
        y: {
          grid: { color: "#efefef" },
          ticks: { font: { family: _chartFontFamily, size: 10 } },
          title: yAxisLabel
            ? {
                display: true,
                text: yAxisLabel,
                font: { family: _chartFontFamily, size: 10 },
              }
            : { display: false },
        },
      },
    },
  });
  state.compareChartIds.push(canvasId);
}

function snapshotPanelSeries(panelId, snapshotData = null) {
  const block = snapshotData?.[panelId];
  if (!block) return null;
  if (panelId === "swiss_ratio") {
    const swiss = Number(block.swiss);
    const nonSwiss = Number(block.non_swiss);
    const ratio = (Number.isFinite(swiss) && Number.isFinite(nonSwiss) && nonSwiss > 0)
      ? (swiss / nonSwiss)
      : null;
    return { kind: "scalar", label: "Swiss / Non-Swiss ratio", value: ratio, raw: block.ratio ?? null };
  }

  if (panelId === "employment_by_sector" && Array.isArray(block.sectors)) {
    const male = Array.isArray(block.male) ? block.male : [];
    const female = Array.isArray(block.female) ? block.female : [];
    const labels = block.sectors.map((s) => String(s));
    const values = labels.map((_, idx) => {
      const m = Number(male[idx]);
      const f = Number(female[idx]);
      return (Number.isFinite(m) ? m : 0) + (Number.isFinite(f) ? f : 0);
    });
    return { kind: "series", labels, values };
  }

  if (panelId === "age_distribution" && Array.isArray(block.cohorts)) {
    const male = Array.isArray(block.male) ? block.male : [];
    const female = Array.isArray(block.female) ? block.female : [];
    const labels = block.cohorts.map((s) => String(s));
    const values = labels.map((_, idx) => {
      const m = Number(male[idx]);
      const f = Number(female[idx]);
      return (Number.isFinite(m) ? m : 0) + (Number.isFinite(f) ? f : 0);
    });
    return { kind: "series", labels, values };
  }

  if (Array.isArray(block.items) && block.items.length) {
    const labels = block.items.map((item) => String(item.label || item.code || "Item"));
    const values = block.items.map((item) => {
      const v = Number(item.value);
      if (Number.isFinite(v)) return v;
      const share = Number(item.share_pct);
      return Number.isFinite(share) ? share : 0;
    });
    return { kind: "series", labels, values };
  }
  return null;
}

function compareProfileForBfs(bfs) {
  const key = normalizeBfsId(bfs);
  if (!key) return null;
  return state.compareProfileCache[key] || state.municipalityModalProfileCache[key] || null;
}

function compareSnapshotForBfs(bfs) {
  return compareProfileForBfs(bfs)?.snapshot || null;
}

function snapshotPanelTitle(panelId) {
  return SNAPSHOT_PANELS.find((panel) => panel.id === panelId)?.title || panelId;
}

function formatCompareNumber(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(digits);
}

function formatComparePercent(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return `${n.toFixed(digits)}%`;
}

function normaliseSnapshotItemsFromBlock(block = null) {
  if (!block || typeof block !== "object") return [];
  let items = [];
  if (Array.isArray(block.items) && block.items.length) {
    items = block.items.map((item) => ({
      label: String(item?.label || item?.code || "Unknown"),
      value: Number(item?.value),
      share: Number(item?.share_pct),
    }));
  } else if (Array.isArray(block.sectors)) {
    const male = Array.isArray(block.male) ? block.male : [];
    const female = Array.isArray(block.female) ? block.female : [];
    items = block.sectors.map((sector, idx) => {
      const m = Number(male[idx]);
      const f = Number(female[idx]);
      const value = (Number.isFinite(m) ? m : 0) + (Number.isFinite(f) ? f : 0);
      return { label: String(sector || `Sector ${idx + 1}`), value, share: NaN };
    });
  } else if (Array.isArray(block.cohorts)) {
    const male = Array.isArray(block.male) ? block.male : [];
    const female = Array.isArray(block.female) ? block.female : [];
    items = block.cohorts.map((cohort, idx) => {
      const m = Number(male[idx]);
      const f = Number(female[idx]);
      const value = (Number.isFinite(m) ? m : 0) + (Number.isFinite(f) ? f : 0);
      return { label: String(cohort || `Cohort ${idx + 1}`), value, share: NaN };
    });
  }

  const cleaned = items
    .map((item) => ({
      label: String(item.label || "Unknown"),
      value: Number.isFinite(Number(item.value)) ? Number(item.value) : 0,
      share: Number(item.share),
    }))
    .filter((item) => item.label);

  if (!cleaned.length) return [];
  const total = cleaned.reduce((acc, item) => acc + (Number.isFinite(item.value) ? item.value : 0), 0);
  const out = cleaned.map((item) => {
    const share = Number.isFinite(item.share)
      ? item.share
      : (total > 0 ? (100 * item.value / total) : NaN);
    return {
      label: item.label,
      value: item.value,
      share: Number.isFinite(share) ? share : 0,
    };
  });
  out.sort((a, b) => (b.share - a.share) || a.label.localeCompare(b.label));
  return out;
}

function snapshotShareMatrixForPanel(bfss = [], panelId) {
  const categoriesSet = new Set();
  const matrixByBfs = {};
  const dominantByBfs = {};

  bfss.forEach((bfs) => {
    const block = compareSnapshotForBfs(bfs)?.[panelId] || null;
    const items = normaliseSnapshotItemsFromBlock(block);
    const map = {};
    items.forEach((item) => {
      const label = String(item.label || "").trim();
      if (!label) return;
      categoriesSet.add(label);
      map[label] = Number(item.share) || 0;
    });
    matrixByBfs[bfs] = map;
    if (items.length) {
      dominantByBfs[bfs] = { label: items[0].label, share: items[0].share };
    } else {
      dominantByBfs[bfs] = { label: "N/A", share: NaN };
    }
  });

  const categories = [...categoriesSet];
  categories.sort((a, b) => {
    const avgA = bfss.reduce((acc, bfs) => acc + (matrixByBfs[bfs]?.[a] || 0), 0) / Math.max(1, bfss.length);
    const avgB = bfss.reduce((acc, bfs) => acc + (matrixByBfs[bfs]?.[b] || 0), 0) / Math.max(1, bfss.length);
    return (avgB - avgA) || a.localeCompare(b);
  });

  return { categories, matrixByBfs, dominantByBfs };
}

function buildSwissRatioComparisonData(bfss = []) {
  const rows = bfss.map((bfs) => {
    const block = compareSnapshotForBfs(bfs)?.swiss_ratio || {};
    const swiss = Number(block.swiss);
    const nonSwiss = Number(block.non_swiss);
    const ratio = (Number.isFinite(swiss) && Number.isFinite(nonSwiss) && nonSwiss > 0) ? (swiss / nonSwiss) : NaN;
    return {
      bfs,
      label: compareMunicipalityLabel(bfs),
      swiss: Number.isFinite(swiss) ? swiss : NaN,
      nonSwiss: Number.isFinite(nonSwiss) ? nonSwiss : NaN,
      ratio,
    };
  });

  const baseline = rows.find((row) => Number.isFinite(row.ratio))?.ratio;
  rows.forEach((row) => {
    row.delta = Number.isFinite(row.ratio) && Number.isFinite(baseline) ? row.ratio - baseline : NaN;
  });

  const valid = rows.filter((row) => Number.isFinite(row.ratio));
  const findings = [];
  if (valid.length) {
    const highest = [...valid].sort((a, b) => (b.ratio - a.ratio) || a.bfs.localeCompare(b.bfs))[0];
    findings.push(`Highest Swiss/non-Swiss ratio: ${highest.label} (${highest.ratio.toFixed(2)}).`);
    if (valid.length > 1) {
      const min = [...valid].sort((a, b) => (a.ratio - b.ratio) || a.bfs.localeCompare(b.bfs))[0];
      findings.push(`Ratio spread across compared municipalities: ${(highest.ratio - min.ratio).toFixed(2)}.`);
    }
  } else {
    findings.push("No Swiss ratio data is available for the selected municipalities.");
  }
  return { rows, findings };
}

function buildAgeDistributionComparisonData(bfss = []) {
  const cohorts = [];
  const cohortSeen = new Set();
  const sharesByBfs = {};
  const totalsByBfs = {};
  const dominantByBfs = {};

  bfss.forEach((bfs) => {
    const block = compareSnapshotForBfs(bfs)?.age_distribution || {};
    const labels = Array.isArray(block.cohorts) ? block.cohorts.map((v) => String(v || "").trim()).filter(Boolean) : [];
    labels.forEach((label) => {
      if (cohortSeen.has(label)) return;
      cohortSeen.add(label);
      cohorts.push(label);
    });
    const male = Array.isArray(block.male) ? block.male : [];
    const female = Array.isArray(block.female) ? block.female : [];
    const totals = labels.map((_, idx) => {
      const m = Number(male[idx]);
      const f = Number(female[idx]);
      return (Number.isFinite(m) ? m : 0) + (Number.isFinite(f) ? f : 0);
    });
    const total = totals.reduce((acc, value) => acc + value, 0);
    totalsByBfs[bfs] = total;
    const shareMap = {};
    labels.forEach((label, idx) => {
      const share = total > 0 ? (100 * totals[idx] / total) : 0;
      shareMap[label] = share;
    });
    sharesByBfs[bfs] = shareMap;
    const dominant = labels
      .map((label) => ({ label, share: shareMap[label] || 0 }))
      .sort((a, b) => (b.share - a.share) || a.label.localeCompare(b.label))[0];
    dominantByBfs[bfs] = dominant || { label: "N/A", share: NaN };
  });

  const findings = [];
  const validTotals = bfss
    .map((bfs) => ({ bfs, label: compareMunicipalityLabel(bfs), total: totalsByBfs[bfs] || 0 }))
    .filter((item) => item.total > 0);
  if (validTotals.length) {
    const top = [...validTotals].sort((a, b) => (b.total - a.total) || a.bfs.localeCompare(b.bfs))[0];
    findings.push(`Largest age-distribution total: ${top.label} (${Math.round(top.total).toLocaleString()}).`);
  }
  if (cohorts.length > 0 && bfss.length > 1) {
    const spreads = cohorts.map((cohort) => {
      const vals = bfss.map((bfs) => Number(sharesByBfs[bfs]?.[cohort] || 0));
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      return { cohort, spread: max - min };
    }).sort((a, b) => (b.spread - a.spread) || a.cohort.localeCompare(b.cohort));
    if (spreads.length) {
      findings.push(`Largest cohort share spread: ${spreads[0].cohort} (${spreads[0].spread.toFixed(1)} percentage points).`);
    }
  }

  return { cohorts, sharesByBfs, totalsByBfs, dominantByBfs, findings };
}

function buildEmploymentBySectorComparisonData(bfss = []) {
  const sectors = [];
  const sectorSeen = new Set();
  const totalsByBfs = {};
  const sharesByBfs = {};
  const dominantByBfs = {};

  bfss.forEach((bfs) => {
    const block = compareSnapshotForBfs(bfs)?.employment_by_sector || {};
    const labels = Array.isArray(block.sectors) ? block.sectors.map((v) => String(v || "").trim()).filter(Boolean) : [];
    labels.forEach((label) => {
      if (sectorSeen.has(label)) return;
      sectorSeen.add(label);
      sectors.push(label);
    });
    const male = Array.isArray(block.male) ? block.male : [];
    const female = Array.isArray(block.female) ? block.female : [];
    const totals = labels.map((_, idx) => {
      const m = Number(male[idx]);
      const f = Number(female[idx]);
      return (Number.isFinite(m) ? m : 0) + (Number.isFinite(f) ? f : 0);
    });
    const total = totals.reduce((acc, value) => acc + value, 0);
    totalsByBfs[bfs] = total;
    const shareMap = {};
    labels.forEach((label, idx) => {
      shareMap[label] = total > 0 ? (100 * totals[idx] / total) : 0;
    });
    sharesByBfs[bfs] = shareMap;
    const dominant = labels
      .map((label) => ({ label, share: shareMap[label] || 0 }))
      .sort((a, b) => (b.share - a.share) || a.label.localeCompare(b.label))[0];
    dominantByBfs[bfs] = dominant || { label: "N/A", share: NaN };
  });

  const findings = [];
  const validTotals = bfss
    .map((bfs) => ({ bfs, label: compareMunicipalityLabel(bfs), total: totalsByBfs[bfs] || 0 }))
    .filter((item) => item.total > 0);
  if (validTotals.length) {
    const top = [...validTotals].sort((a, b) => (b.total - a.total) || a.bfs.localeCompare(b.bfs))[0];
    findings.push(`Highest employment total: ${top.label} (${Math.round(top.total).toLocaleString()}).`);
  }
  const dominantSet = new Set(
    bfss
      .map((bfs) => dominantByBfs[bfs]?.label)
      .filter((label) => label && label !== "N/A"),
  );
  if (dominantSet.size === 1 && dominantSet.size > 0) {
    findings.push(`All selected municipalities have the same dominant employment sector: ${[...dominantSet][0]}.`);
  } else if (dominantSet.size > 1) {
    findings.push(`Dominant employment sectors vary across municipalities (${dominantSet.size} distinct sectors).`);
  }

  return { sectors, totalsByBfs, sharesByBfs, dominantByBfs, findings };
}

function buildCategoryComparisonData(bfss = [], panelId) {
  const panelTitle = snapshotPanelTitle(panelId);
  const matrix = snapshotShareMatrixForPanel(bfss, panelId);
  const findings = [];
  const validDominant = bfss
    .map((bfs) => ({ bfs, label: compareMunicipalityLabel(bfs), ...(matrix.dominantByBfs[bfs] || {}) }))
    .filter((row) => row.label && row.label !== "N/A");

  const dominantSet = new Set(validDominant.map((row) => row.label));
  if (dominantSet.size === 1 && dominantSet.size > 0) {
    findings.push(`All selected municipalities share the same dominant ${panelTitle.toLowerCase()} category: ${[...dominantSet][0]}.`);
  } else if (dominantSet.size > 1) {
    findings.push(`Dominant ${panelTitle.toLowerCase()} categories vary across municipalities (${dominantSet.size} distinct categories).`);
  }
  const strongest = validDominant
    .filter((row) => Number.isFinite(Number(row.share)))
    .sort((a, b) => (Number(b.share) - Number(a.share)) || a.bfs.localeCompare(b.bfs))[0];
  if (strongest) {
    findings.push(`Highest dominant-category concentration: ${strongest.label} (${Number(strongest.share).toFixed(1)}%).`);
  }

  return {
    panelId,
    panelTitle,
    categories: matrix.categories,
    matrixByBfs: matrix.matrixByBfs,
    dominantByBfs: matrix.dominantByBfs,
    findings,
  };
}

function buildSnapshotCoreComparisonData(bfss = []) {
  const include = new Set(COMPARE_SNAPSHOT_CORE_PANEL_IDS);
  return {
    swissRatio: include.has("swiss_ratio") ? buildSwissRatioComparisonData(bfss) : { rows: [], findings: [] },
    ageDistribution: include.has("age_distribution")
      ? buildAgeDistributionComparisonData(bfss)
      : { cohorts: [], sharesByBfs: {}, totalsByBfs: {}, dominantByBfs: {}, findings: [] },
    constructionPeriod: include.has("construction_period")
      ? buildCategoryComparisonData(bfss, "construction_period")
      : { panelId: "construction_period", panelTitle: snapshotPanelTitle("construction_period"), categories: [], matrixByBfs: {}, dominantByBfs: {}, findings: [] },
    heatSource: include.has("heat_source")
      ? buildCategoryComparisonData(bfss, "heat_source")
      : { panelId: "heat_source", panelTitle: snapshotPanelTitle("heat_source"), categories: [], matrixByBfs: {}, dominantByBfs: {}, findings: [] },
    employment: include.has("employment_by_sector")
      ? buildEmploymentBySectorComparisonData(bfss)
      : { sectors: [], totalsByBfs: {}, sharesByBfs: {}, dominantByBfs: {}, findings: [] },
  };
}

function buildSnapshotFindingListMarkup(findings = []) {
  if (!Array.isArray(findings) || !findings.length) {
    return `<p class="compare-inline-note">No additional findings available.</p>`;
  }
  return `
    <ul class="compare-finding-list">
      ${findings.map((item) => `<li>${escapeHtml(String(item || ""))}</li>`).join("")}
    </ul>
  `;
}

function renderCompareTableMarkup(headers = [], rows = []) {
  return `
    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(String(header || ""))}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell ?? "N/A"))}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function buildCompareSnapshotCoreMarkup(bfss = [], coreData = null) {
  if (!bfss.length || !coreData) return "";

  const swissRows = coreData.swissRatio.rows.map((row) => ([
    row.label,
    Number.isFinite(row.swiss) ? Math.round(row.swiss).toLocaleString() : "N/A",
    Number.isFinite(row.nonSwiss) ? Math.round(row.nonSwiss).toLocaleString() : "N/A",
    Number.isFinite(row.ratio) ? row.ratio.toFixed(2) : "N/A",
    Number.isFinite(row.delta) ? (row.delta >= 0 ? `+${row.delta.toFixed(2)}` : row.delta.toFixed(2)) : "N/A",
  ]));
  const swissMarkup = `
    <section class="compare-core-panel">
      <h4>Swiss-Born Ratio</h4>
      ${renderCompareTableMarkup(["Municipality", "Swiss-born", "Foreign-born", "Ratio", "Delta vs first"], swissRows)}
      ${buildSnapshotFindingListMarkup(coreData.swissRatio.findings)}
    </section>
  `;

  const ageTotalRows = bfss.map((bfs) => ([
    compareMunicipalityLabel(bfs),
    Math.round(coreData.ageDistribution.totalsByBfs[bfs] || 0).toLocaleString(),
    coreData.ageDistribution.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.ageDistribution.dominantByBfs[bfs]?.share, 1),
  ]));
  const ageShareRows = coreData.ageDistribution.cohorts.map((cohort) => ([
    cohort,
    ...bfss.map((bfs) => formatComparePercent(coreData.ageDistribution.sharesByBfs[bfs]?.[cohort], 1)),
  ]));
  const ageMarkup = `
    <section class="compare-core-panel">
      <h4>Age Distribution</h4>
      ${renderCompareTableMarkup(["Municipality", "Total", "Dominant cohort", "Dominant share"], ageTotalRows)}
      ${renderCompareTableMarkup(["Cohort", ...bfss.map((bfs) => compareMunicipalityName(bfs))], ageShareRows)}
      ${buildSnapshotFindingListMarkup(coreData.ageDistribution.findings)}
    </section>
  `;

  const constructionDominantRows = bfss.map((bfs) => ([
    compareMunicipalityLabel(bfs),
    coreData.constructionPeriod.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.constructionPeriod.dominantByBfs[bfs]?.share, 1),
  ]));
  const constructionShareRows = coreData.constructionPeriod.categories.map((category) => ([
    category,
    ...bfss.map((bfs) => formatComparePercent(coreData.constructionPeriod.matrixByBfs[bfs]?.[category], 1)),
  ]));
  const constructionMarkup = `
    <section class="compare-core-panel">
      <h4>Construction Period</h4>
      ${renderCompareTableMarkup(["Municipality", "Dominant category", "Dominant share"], constructionDominantRows)}
      ${renderCompareTableMarkup(["Category", ...bfss.map((bfs) => compareMunicipalityName(bfs))], constructionShareRows)}
      ${buildSnapshotFindingListMarkup(coreData.constructionPeriod.findings)}
    </section>
  `;

  const heatDominantRows = bfss.map((bfs) => ([
    compareMunicipalityLabel(bfs),
    coreData.heatSource.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.heatSource.dominantByBfs[bfs]?.share, 1),
  ]));
  const heatShareRows = coreData.heatSource.categories.map((category) => ([
    category,
    ...bfss.map((bfs) => formatComparePercent(coreData.heatSource.matrixByBfs[bfs]?.[category], 1)),
  ]));
  const heatMarkup = `
    <section class="compare-core-panel">
      <h4>Heat Source</h4>
      ${renderCompareTableMarkup(["Municipality", "Dominant category", "Dominant share"], heatDominantRows)}
      ${renderCompareTableMarkup(["Category", ...bfss.map((bfs) => compareMunicipalityName(bfs))], heatShareRows)}
      ${buildSnapshotFindingListMarkup(coreData.heatSource.findings)}
    </section>
  `;

  const employmentRows = bfss.map((bfs) => ([
    compareMunicipalityLabel(bfs),
    Math.round(coreData.employment.totalsByBfs[bfs] || 0).toLocaleString(),
    coreData.employment.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.employment.dominantByBfs[bfs]?.share, 1),
  ]));
  const employmentShareRows = coreData.employment.sectors.map((sector) => ([
    sector,
    ...bfss.map((bfs) => formatComparePercent(coreData.employment.sharesByBfs[bfs]?.[sector], 1)),
  ]));
  const employmentMarkup = `
    <section class="compare-core-panel">
      <h4>Employment by Sector</h4>
      ${renderCompareTableMarkup(["Municipality", "Total", "Dominant sector", "Dominant share"], employmentRows)}
      ${renderCompareTableMarkup(["Sector", ...bfss.map((bfs) => compareMunicipalityName(bfs))], employmentShareRows)}
      ${buildSnapshotFindingListMarkup(coreData.employment.findings)}
    </section>
  `;

  return `
    <article class="compare-card compare-card--full">
      <h3>Expanded Snapshot Core Panel Compare</h3>
      <p class="compare-inline-note">The five core Snapshot panels are compared side-by-side using municipality ordering from the selected comparison set.</p>
      <div class="compare-core-grid">
        ${swissMarkup}
        ${ageMarkup}
        ${constructionMarkup}
        ${heatMarkup}
        ${employmentMarkup}
      </div>
    </article>
  `;
}

function buildCompareMetricsMarkup() {
  const bfss = state.compareBfsOrder;
  if (!bfss.length) {
    return `<p class="compare-empty">No municipalities selected for comparison yet.</p>`;
  }
  const headers = bfss.map((bfs) => `<th>${escapeHtml(compareMunicipalityName(bfs))}</th>`).join("");
  const rows = [
    {
      label: "Bivariate Class",
      values: bfss.map((bfs) => String(state.records[bfs]?.bi_class || "N/A")),
    },
    {
      label: "Temp (°C)",
      values: bfss.map((bfs) => formatMetricValue(state.records[bfs]?.temp, 2)),
    },
    {
      label: "Old Buildings (%)",
      values: bfss.map((bfs) => formatMetricValue(state.records[bfs]?.pct_old1919, 1)),
    },
    {
      label: "Climate Risk Score",
      values: bfss.map((bfs) => formatMetricValue(state.records[bfs]?.climate_risk_score, 2)),
    },
    {
      label: "Exceptional Status",
      values: bfss.map((bfs) => compareStatusLabel(state.climateStageStatus[bfs] || "missing")),
    },
  ];
  const body = rows.map((row) => `
    <tr>
      <th>${escapeHtml(row.label)}</th>
      ${row.values.map((value) => `<td>${escapeHtml(String(value))}</td>`).join("")}
    </tr>
  `).join("");
  return `
    <article class="compare-card">
      <h3>Core Metrics</h3>
      <table class="compare-table">
        <thead>
          <tr>
            <th>Metric</th>
            ${headers}
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </article>
  `;
}

function buildCompareSnapshotMarkup() {
  const bfss = state.compareBfsOrder;
  if (!bfss.length) {
    return `<p class="compare-empty">No municipalities selected.</p>`;
  }
  const coreData = buildSnapshotCoreComparisonData(bfss);
  const panelOptions = SNAPSHOT_PANELS
    .map((panel) => `<option value="${escapeHtml(panel.id)}"${panel.id === state.compareModalSnapshotPanel ? " selected" : ""}>${escapeHtml(panel.title)}</option>`)
    .join("");

  const panelId = state.compareModalSnapshotPanel;
  const panelLabel = SNAPSHOT_PANELS.find((p) => p.id === panelId)?.title || "Snapshot panel";
  const seriesByBfs = {};
  bfss.forEach((bfs) => {
    const profile = state.compareProfileCache[bfs];
    seriesByBfs[bfs] = snapshotPanelSeries(panelId, profile?.snapshot || null);
  });
  const nonNull = bfss.map((bfs) => seriesByBfs[bfs]).filter(Boolean);

  if (!nonNull.length) {
    return `
      <article class="compare-card">
        <h3>Snapshot Comparison</h3>
        <label class="compare-panel-select-label">
          <span>Snapshot panel</span>
          <select data-compare-snapshot-panel>${panelOptions}</select>
        </label>
        <p class="compare-empty">No snapshot data available for the selected panel.</p>
      </article>
      ${buildCompareSnapshotCoreMarkup(bfss, coreData)}
    `;
  }

  let content = "";
  const scalar = nonNull.every((item) => item.kind === "scalar");
  if (scalar) {
    const rows = bfss.map((bfs) => {
      const item = seriesByBfs[bfs];
      const value = item?.value;
      const raw = item?.raw;
      const shown = Number.isFinite(value) ? Number(value).toFixed(2) : (raw ? String(raw) : "N/A");
      return `<tr><th>${escapeHtml(compareMunicipalityLabel(bfs))}</th><td>${escapeHtml(shown)}</td></tr>`;
    }).join("");
    content = `
      <table class="compare-table">
        <thead><tr><th>Municipality</th><th>${escapeHtml(panelLabel)}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } else {
    const labels = [];
    const labelSet = new Set();
    bfss.forEach((bfs) => {
      const item = seriesByBfs[bfs];
      if (!item || item.kind !== "series") return;
      item.labels.forEach((label) => {
        const key = String(label);
        if (labelSet.has(key)) return;
        labelSet.add(key);
        labels.push(key);
      });
    });
    const datasets = bfss.map((bfs) => {
      const item = seriesByBfs[bfs];
      const valuesByLabel = {};
      if (item && item.kind === "series") {
        item.labels.forEach((label, idx) => {
          valuesByLabel[String(label)] = Number(item.values[idx]) || 0;
        });
      }
      return {
        label: compareMunicipalityName(bfs),
        data: labels.map((label) => valuesByLabel[label] ?? 0),
        backgroundColor: compareColourByBfs(bfs),
        borderWidth: 0,
      };
    });
    const chartId = "compare-snapshot-chart";
    content = `
      <div class="compare-chart-wrap"><canvas id="${chartId}"></canvas></div>
    `;
    window.requestAnimationFrame(() => {
      renderCompareGroupedBarChart(chartId, labels, datasets, panelLabel);
    });
  }

  return `
    <article class="compare-card">
      <h3>Snapshot Comparison</h3>
      <label class="compare-panel-select-label">
        <span>Snapshot panel</span>
        <select data-compare-snapshot-panel>${panelOptions}</select>
      </label>
      ${content}
    </article>
    ${buildCompareSnapshotCoreMarkup(bfss, coreData)}
  `;
}

function buildCompareWeatherMarkup() {
  const bfss = state.compareBfsOrder;
  if (!bfss.length) return `<p class="compare-empty">No municipalities selected.</p>`;
  const withWeather = bfss.filter((bfs) => !!state.compareWeatherCache[bfs]);
  if (!withWeather.length) {
    return `<p class="compare-empty">Weather data is loading or unavailable for selected municipalities.</p>`;
  }

  const stationRows = bfss.map((bfs) => {
    const weather = state.compareWeatherCache[bfs];
    const station = weather?.station?.name ? String(weather.station.name) : "Unavailable";
    return `<li><strong>${escapeHtml(compareMunicipalityName(bfs))}:</strong> ${escapeHtml(station)}</li>`;
  }).join("");

  const blocks = COMPARE_WEATHER_METRICS.map((metric) => {
    const chartId = `compare-weather-${metric.key}`;
    window.requestAnimationFrame(() => {
      const datasets = bfss.map((bfs) => {
        const summary = weatherSummarySeries(state.compareWeatherCache[bfs]);
        const values = summary?.[metric.key] || [];
        return {
          label: compareMunicipalityName(bfs),
          data: MONTH_LABELS.map((_, idx) => {
            const v = values[idx];
            return Number.isFinite(Number(v)) ? Number(v) : null;
          }),
          backgroundColor: compareColourByBfs(bfs),
          borderWidth: 0,
        };
      });
      renderCompareGroupedBarChart(chartId, MONTH_LABELS, datasets, metric.label);
    });
    return `
      <article class="compare-card">
        <h3>${escapeHtml(metric.label)}</h3>
        <div class="compare-chart-wrap"><canvas id="${chartId}"></canvas></div>
      </article>
    `;
  }).join("");

  return `
    <article class="compare-card compare-card--full">
      <h3>Weather station references</h3>
      <ul class="compare-station-list">${stationRows}</ul>
    </article>
    ${blocks}
  `;
}

function markdownCell(value) {
  const text = String(value ?? "N/A")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
  return text || "N/A";
}

function markdownTable(headers = [], rows = []) {
  const head = `| ${headers.map(markdownCell).join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`).join("\n");
  return body ? `${head}\n${sep}\n${body}` : `${head}\n${sep}`;
}

function markdownList(items = []) {
  if (!Array.isArray(items) || !items.length) return "- No findings available.";
  return items.map((item) => `- ${String(item || "").trim()}`).join("\n");
}

function compareWeatherSummaryByBfs(bfss = []) {
  const out = {};
  bfss.forEach((bfs) => {
    const weather = state.compareWeatherCache[bfs] || null;
    out[bfs] = weatherSummarySeries(weather);
  });
  return out;
}

function buildWeatherSummaryFindings(bfss = [], weatherByBfs = {}) {
  const findings = [];
  const annualMeans = bfss
    .map((bfs) => {
      const series = weatherByBfs[bfs]?.tempMean || [];
      const valid = series.map((v) => Number(v)).filter((v) => Number.isFinite(v));
      const annual = valid.length ? valid.reduce((acc, v) => acc + v, 0) / valid.length : NaN;
      return { bfs, label: compareMunicipalityLabel(bfs), annual };
    })
    .filter((row) => Number.isFinite(row.annual));
  if (annualMeans.length) {
    const warmest = [...annualMeans].sort((a, b) => (b.annual - a.annual) || a.bfs.localeCompare(b.bfs))[0];
    findings.push(`Warmest annual mean temperature profile: ${warmest.label} (${warmest.annual.toFixed(2)}°C).`);
    if (annualMeans.length > 1) {
      const coolest = [...annualMeans].sort((a, b) => (a.annual - b.annual) || a.bfs.localeCompare(b.bfs))[0];
      findings.push(`Annual mean spread across compared municipalities: ${(warmest.annual - coolest.annual).toFixed(2)}°C.`);
    }
  }

  let best = null;
  bfss.forEach((bfs) => {
    const values = weatherByBfs[bfs]?.ghiTotal || [];
    values.forEach((value, idx) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      if (!best || n > best.value || (n === best.value && String(bfs).localeCompare(String(best.bfs)) < 0)) {
        best = { bfs, value: n, month: MONTH_LABELS[idx] || `M${idx + 1}` };
      }
    });
  });
  if (best) {
    findings.push(`Highest monthly GHI total: ${compareMunicipalityLabel(best.bfs)} in ${best.month} (${best.value.toFixed(0)}).`);
  }
  return findings;
}

function reportTimestampStamp(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${y}${m}${d}_${hh}${mm}`;
}

function buildComparisonReportMarkdown() {
  const bfss = state.compareBfsOrder;
  if (!bfss.length) return "";

  const now = new Date();
  const coreData = buildSnapshotCoreComparisonData(bfss);
  const weatherByBfs = compareWeatherSummaryByBfs(bfss);
  const weatherFindings = buildWeatherSummaryFindings(bfss, weatherByBfs);

  const lines = [];
  lines.push("# Municipality Comparison Report");
  lines.push("");
  lines.push(`Generated: ${now.toISOString()}`);
  lines.push("");

  const selectedIndicators = [...state.selectedClimateIndicators]
    .map((key) => formatRawFieldLabel(key))
    .join(", ");
  const reportMetaRows = [
    ["Season", String(el.season?.value || "N/A")],
    ["Temperature method", String(el.tempMethod?.value || "N/A")],
    ["Exclude non-habitable areas", el.nonHabitable?.checked ? "Yes" : "No"],
    ["Cold k_temp", String(el.kTemp?.value || "N/A")],
    ["Old k_old", String(el.kOld?.value || "N/A")],
    ["Bivariate class exclusions", [...state.legendSelectedClasses].join(", ") || "None"],
    ["Stage 2 material+hearth reduction", state.applyMaterialHearthFilter ? "Enabled" : "Disabled"],
    ["Stage 3 climate prioritisation", state.applyClimatePriority ? "Enabled" : "Disabled"],
    ["Climate top share (%)", String(normalizeClimateTopShare(state.climateTopSharePct))],
    ["Climate indicators", selectedIndicators || "None"],
    ["Selected municipalities", String(bfss.length)],
  ];
  lines.push("## Report Metadata");
  lines.push("");
  lines.push(markdownTable(["Setting", "Value"], reportMetaRows));
  lines.push("");

  const municipalityRows = bfss.map((bfs) => [
    compareMunicipalityName(bfs),
    compareMunicipalityCanton(bfs) || "N/A",
    bfs,
  ]);
  lines.push("## Municipality Summary");
  lines.push("");
  lines.push(markdownTable(["Municipality", "Canton", "BFS"], municipalityRows));
  lines.push("");

  const analysisRows = bfss.map((bfs) => [
    compareMunicipalityName(bfs),
    String(state.records[bfs]?.bi_class || "N/A"),
    formatCompareNumber(state.records[bfs]?.temp, 2),
    formatComparePercent(state.records[bfs]?.pct_old1919, 1),
    formatCompareNumber(state.records[bfs]?.climate_risk_score, 2),
    compareStatusLabel(state.climateStageStatus[bfs] || "missing"),
  ]);
  lines.push("## Core Analysis Metrics");
  lines.push("");
  lines.push(markdownTable(
    ["Municipality", "Bivariate Class", "Temp (°C)", "Old Buildings (%)", "Climate Risk Score", "Exceptional status"],
    analysisRows,
  ));
  lines.push("");

  lines.push("## Snapshot Core Panels");
  lines.push("");
  const swissRows = coreData.swissRatio.rows.map((row) => [
    row.label,
    Number.isFinite(row.swiss) ? Math.round(row.swiss).toLocaleString() : "N/A",
    Number.isFinite(row.nonSwiss) ? Math.round(row.nonSwiss).toLocaleString() : "N/A",
    Number.isFinite(row.ratio) ? row.ratio.toFixed(2) : "N/A",
    Number.isFinite(row.delta) ? (row.delta >= 0 ? `+${row.delta.toFixed(2)}` : row.delta.toFixed(2)) : "N/A",
  ]);
  lines.push("### Swiss-Born Ratio");
  lines.push("");
  lines.push(markdownTable(["Municipality", "Swiss-born", "Foreign-born", "Ratio", "Delta vs first"], swissRows));
  lines.push("");
  lines.push(markdownList(coreData.swissRatio.findings));
  lines.push("");

  lines.push("### Age Distribution");
  lines.push("");
  const ageTotalRows = bfss.map((bfs) => [
    compareMunicipalityName(bfs),
    Math.round(coreData.ageDistribution.totalsByBfs[bfs] || 0).toLocaleString(),
    coreData.ageDistribution.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.ageDistribution.dominantByBfs[bfs]?.share, 1),
  ]);
  lines.push(markdownTable(["Municipality", "Total", "Dominant cohort", "Dominant share"], ageTotalRows));
  lines.push("");
  const ageShareRows = coreData.ageDistribution.cohorts.map((cohort) => [
    cohort,
    ...bfss.map((bfs) => formatComparePercent(coreData.ageDistribution.sharesByBfs[bfs]?.[cohort], 1)),
  ]);
  lines.push(markdownTable(["Cohort", ...bfss.map((bfs) => compareMunicipalityName(bfs))], ageShareRows));
  lines.push("");
  lines.push(markdownList(coreData.ageDistribution.findings));
  lines.push("");

  lines.push("### Construction Period");
  lines.push("");
  const constructionDominantRows = bfss.map((bfs) => [
    compareMunicipalityName(bfs),
    coreData.constructionPeriod.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.constructionPeriod.dominantByBfs[bfs]?.share, 1),
  ]);
  lines.push(markdownTable(["Municipality", "Dominant category", "Dominant share"], constructionDominantRows));
  lines.push("");
  const constructionShareRows = coreData.constructionPeriod.categories.map((category) => [
    category,
    ...bfss.map((bfs) => formatComparePercent(coreData.constructionPeriod.matrixByBfs[bfs]?.[category], 1)),
  ]);
  lines.push(markdownTable(["Category", ...bfss.map((bfs) => compareMunicipalityName(bfs))], constructionShareRows));
  lines.push("");
  lines.push(markdownList(coreData.constructionPeriod.findings));
  lines.push("");

  lines.push("### Heat Source");
  lines.push("");
  const heatDominantRows = bfss.map((bfs) => [
    compareMunicipalityName(bfs),
    coreData.heatSource.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.heatSource.dominantByBfs[bfs]?.share, 1),
  ]);
  lines.push(markdownTable(["Municipality", "Dominant category", "Dominant share"], heatDominantRows));
  lines.push("");
  const heatShareRows = coreData.heatSource.categories.map((category) => [
    category,
    ...bfss.map((bfs) => formatComparePercent(coreData.heatSource.matrixByBfs[bfs]?.[category], 1)),
  ]);
  lines.push(markdownTable(["Category", ...bfss.map((bfs) => compareMunicipalityName(bfs))], heatShareRows));
  lines.push("");
  lines.push(markdownList(coreData.heatSource.findings));
  lines.push("");

  lines.push("### Employment by Sector");
  lines.push("");
  const employmentRows = bfss.map((bfs) => [
    compareMunicipalityName(bfs),
    Math.round(coreData.employment.totalsByBfs[bfs] || 0).toLocaleString(),
    coreData.employment.dominantByBfs[bfs]?.label || "N/A",
    formatComparePercent(coreData.employment.dominantByBfs[bfs]?.share, 1),
  ]);
  lines.push(markdownTable(["Municipality", "Total", "Dominant sector", "Dominant share"], employmentRows));
  lines.push("");
  const employmentShareRows = coreData.employment.sectors.map((sector) => [
    sector,
    ...bfss.map((bfs) => formatComparePercent(coreData.employment.sharesByBfs[bfs]?.[sector], 1)),
  ]);
  lines.push(markdownTable(["Sector", ...bfss.map((bfs) => compareMunicipalityName(bfs))], employmentShareRows));
  lines.push("");
  lines.push(markdownList(coreData.employment.findings));
  lines.push("");

  lines.push("## Weather Monthly Summaries");
  lines.push("");
  const stationRows = bfss.map((bfs) => {
    const weather = state.compareWeatherCache[bfs];
    const station = weather?.station?.name ? String(weather.station.name) : "Unavailable";
    return [compareMunicipalityName(bfs), station];
  });
  lines.push(markdownTable(["Municipality", "Weather station"], stationRows));
  lines.push("");

  COMPARE_WEATHER_METRICS.forEach((metric) => {
    lines.push(`### ${metric.label}`);
    lines.push("");
    const rows = MONTH_LABELS.map((month, idx) => ([
      month,
      ...bfss.map((bfs) => formatCompareNumber(weatherByBfs[bfs]?.[metric.key]?.[idx], metric.digits)),
    ]));
    lines.push(markdownTable(["Month", ...bfss.map((bfs) => compareMunicipalityName(bfs))], rows));
    lines.push("");
  });

  const keyFindings = [
    ...(coreData.swissRatio.findings || []),
    ...(coreData.ageDistribution.findings || []),
    ...(coreData.constructionPeriod.findings || []),
    ...(coreData.heatSource.findings || []),
    ...(coreData.employment.findings || []),
    ...weatherFindings,
  ].filter(Boolean);

  lines.push("## Key Findings");
  lines.push("");
  lines.push(markdownList(keyFindings));
  lines.push("");

  return lines.join("\n");
}

function downloadComparisonReport() {
  const markdown = buildComparisonReportMarkdown();
  if (!markdown) {
    setStatus("No municipalities selected for comparison report.");
    return;
  }
  const stamp = reportTimestampStamp(new Date());
  const season = String(el.season?.value || "annual");
  const method = String(el.tempMethod?.value || "mean-range");
  const filename = `municipality_comparison_${season}_${method}_${stamp}.md`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus(`Comparison report downloaded (${state.compareBfsOrder.length} municipalities).`);
}

function renderCompareModalSelectedStrip() {
  if (!el.compareModalSelected) return;
  if (!state.compareBfsOrder.length) {
    el.compareModalSelected.innerHTML = "";
    return;
  }
  const cards = state.compareBfsOrder.map((bfs) => {
    const loading = !!(state.compareProfileFetchInFlight[bfs] || state.compareWeatherFetchInFlight[bfs]);
    const label = compareMunicipalityLabel(bfs);
    return `
      <div class="compare-selected-card">
        <div>
          <strong>${escapeHtml(label)}</strong>
          <p>${escapeHtml(`BFS ${bfs}`)}${loading ? " · Loading..." : ""}</p>
        </div>
        <button type="button" data-compare-remove="${escapeHtml(bfs)}" aria-label="Remove ${escapeHtml(label)} from comparison">×</button>
      </div>
    `;
  }).join("");
  el.compareModalSelected.innerHTML = cards;
}

function renderCompareModal() {
  if (!el.compareModal) return;
  if (!state.compareModalOpen) {
    el.compareModal.classList.add("hidden");
    el.compareModal.setAttribute("aria-hidden", "true");
    destroyCompareCharts();
    return;
  }

  el.compareModal.classList.remove("hidden");
  el.compareModal.setAttribute("aria-hidden", "false");
  if (!compareModalSectionIsValid(state.compareModalActiveSection)) {
    state.compareModalActiveSection = "metrics";
  }

  if (el.compareModalSections) {
    el.compareModalSections.innerHTML = COMPARE_SECTIONS
      .map((section) => {
        const active = section.id === state.compareModalActiveSection ? " is-active" : "";
        return `<button type="button" class="compare-modal-section${active}" data-compare-section="${escapeHtml(section.id)}">${escapeHtml(section.label)}</button>`;
      })
      .join("");
  }

  renderCompareModalSelectedStrip();

  const hasSelection = state.compareBfsOrder.length > 0;
  if (el.compareModalReport) {
    el.compareModalReport.disabled = !hasSelection;
  }
  if (el.compareModalState) {
    if (!hasSelection) {
      el.compareModalState.className = "compare-modal-state";
      el.compareModalState.textContent = "No municipalities selected. Open a municipality profile and click Add to compare.";
      el.compareModalState.classList.remove("hidden");
    } else {
      const loading = state.compareBfsOrder.some((bfs) => state.compareProfileFetchInFlight[bfs] || state.compareWeatherFetchInFlight[bfs]);
      if (loading) {
        el.compareModalState.className = "compare-modal-state";
        el.compareModalState.textContent = "Loading comparison datasets ...";
        el.compareModalState.classList.remove("hidden");
      } else {
        el.compareModalState.className = "compare-modal-state hidden";
        el.compareModalState.textContent = "";
      }
    }
  }

  if (el.compareModalContent) {
    destroyCompareCharts();
    if (!hasSelection) {
      el.compareModalContent.innerHTML = "";
      return;
    }
    if (state.compareModalActiveSection === "metrics") {
      el.compareModalContent.innerHTML = buildCompareMetricsMarkup();
    } else if (state.compareModalActiveSection === "snapshot") {
      el.compareModalContent.innerHTML = buildCompareSnapshotMarkup();
    } else {
      el.compareModalContent.innerHTML = buildCompareWeatherMarkup();
    }
  }
}

function openCompareModal() {
  if (state.municipalityModalOpen) {
    closeMunicipalityModal();
  }
  state.compareModalReturnFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  state.compareModalOpen = true;
  if (!compareModalSectionIsValid(state.compareModalActiveSection)) {
    state.compareModalActiveSection = "metrics";
  }
  syncBodyModalClass();
  state.compareBfsOrder.forEach((bfs) => prefetchCompareMunicipalityData(bfs));
  renderCompareModal();
  window.requestAnimationFrame(() => {
    el.compareModalClose?.focus();
  });
}

function closeCompareModal() {
  if (!state.compareModalOpen) return;
  state.compareModalOpen = false;
  renderCompareModal();
  syncBodyModalClass();
  if (state.compareModalReturnFocusEl && typeof state.compareModalReturnFocusEl.focus === "function") {
    state.compareModalReturnFocusEl.focus();
  }
  state.compareModalReturnFocusEl = null;
}

function wireCompareModalEvents() {
  if (el.compareLauncher) {
    el.compareLauncher.addEventListener("click", () => {
      if (state.compareLauncherClickTimer) {
        clearTimeout(state.compareLauncherClickTimer);
        state.compareLauncherClickTimer = null;
        clearCompareSelection();
        return;
      }
      state.compareLauncherClickTimer = setTimeout(() => {
        state.compareLauncherClickTimer = null;
        openCompareModal();
      }, 220);
    });
  }

  el.municipalityModalCompare?.addEventListener("click", () => {
    const bfs = state.municipalityModalSelectedBfs;
    if (!bfs) return;
    toggleCompareMunicipality(bfs);
  });

  el.compareModal?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-compare-close]")) {
      closeCompareModal();
      return;
    }
    const sectionNode = target.closest("[data-compare-section]");
    if (sectionNode) {
      const sectionId = String(sectionNode.getAttribute("data-compare-section") || "");
      if (compareModalSectionIsValid(sectionId)) {
        state.compareModalActiveSection = sectionId;
        renderCompareModal();
      }
      return;
    }
    const removeNode = target.closest("[data-compare-remove]");
    if (removeNode) {
      const bfs = String(removeNode.getAttribute("data-compare-remove") || "");
      toggleCompareMunicipality(bfs);
      return;
    }
  });

  el.compareModalClose?.addEventListener("click", () => {
    closeCompareModal();
  });

  el.compareModalReport?.addEventListener("click", () => {
    downloadComparisonReport();
  });

  el.compareModalContent?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const panelNode = target.closest("[data-compare-snapshot-panel]");
    if (!panelNode) return;
    const panelId = String(panelNode.value || "").trim();
    if (!SNAPSHOT_PANELS.some((panel) => panel.id === panelId)) return;
    state.compareModalSnapshotPanel = panelId;
    renderCompareModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!state.compareModalOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeCompareModal();
      return;
    }
    if (event.key === "Tab") {
      const focusable = compareModalFocusables();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function hashString(text) {
  let hash = 0;
  const s = String(text || "");
  for (let i = 0; i < s.length; i += 1) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function layerPaneName(layerId) {
  return `pane-layer-${String(layerId)}`;
}

function getLayerInstance(layerId) {
  if (layerId === "bivariate_municipalities") {
    return state.muniLayer;
  }
  return state.layerInstances[layerId] || null;
}

function sanitizeLayerOrder(candidate = []) {
  const seen = new Set();
  const out = [];
  (candidate || []).forEach((layerId) => {
    const key = String(layerId || "");
    if (!Object.prototype.hasOwnProperty.call(LAYER_META, key)) return;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(key);
  });
  LAYER_DEFAULT_ORDER.forEach((layerId) => {
    if (seen.has(layerId)) return;
    seen.add(layerId);
    out.push(layerId);
  });
  return out;
}

function defaultLayerVisibility(defaults = {}) {
  const showLayers = defaults.show_layers || {};
  const showOverlays = defaults.show_overlays || {};
  return {
    bivariate_municipalities: Object.prototype.hasOwnProperty.call(showLayers, "bivariate_municipalities")
      ? !!showLayers.bivariate_municipalities
      : true,
    municipality_bounds: Object.prototype.hasOwnProperty.call(showLayers, "municipality_bounds")
      ? !!showLayers.municipality_bounds
      : false,
    national_border: Object.prototype.hasOwnProperty.call(showLayers, "national_border")
      ? !!showLayers.national_border
      : (Object.prototype.hasOwnProperty.call(showOverlays, "national_border") ? !!showOverlays.national_border : false),
    cantons: Object.prototype.hasOwnProperty.call(showLayers, "cantons")
      ? !!showLayers.cantons
      : (Object.prototype.hasOwnProperty.call(showOverlays, "cantons") ? !!showOverlays.cantons : false),
    bioregions: Object.prototype.hasOwnProperty.call(showLayers, "bioregions")
      ? !!showLayers.bioregions
      : (Object.prototype.hasOwnProperty.call(showOverlays, "bioregions") ? !!showOverlays.bioregions : false),
    isos: Object.prototype.hasOwnProperty.call(showLayers, "isos")
      ? !!showLayers.isos
      : (Object.prototype.hasOwnProperty.call(showOverlays, "isos") ? !!showOverlays.isos : true),
    population: Object.prototype.hasOwnProperty.call(showLayers, "population")
      ? !!showLayers.population
      : false,
    elevation: Object.prototype.hasOwnProperty.call(showLayers, "elevation")
      ? !!showLayers.elevation
      : false,
  };
}

function moveLayerOrderItem(sourceId, targetId) {
  const from = state.layerOrder.indexOf(sourceId);
  const to = state.layerOrder.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return;
  const next = [...state.layerOrder];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  state.layerOrder = next;
}

function materialZoneLabel(zoneNumber) {
  const zone = normalizeMaterialZoneNumber(zoneNumber);
  if (zone === null) return "Unspecified";
  const match = state.buildingMaterialZoneOptions.find((opt) => normalizeMaterialZoneNumber(opt.zone_number) === zone);
  const label = String(match?.zone_label || "").trim();
  return label || `Zone ${zone}`;
}

function summarizeMaterialLabel(zoneNumber, zoneLabel = "") {
  const zone = normalizeMaterialZoneNumber(zoneNumber);
  if (zone !== null && MATERIAL_SHORT_BY_ZONE[zone]) return MATERIAL_SHORT_BY_ZONE[zone];
  const source = String(zoneLabel || "").trim();
  if (!source) return "Unspecified material";
  const lower = source.toLowerCase();
  if (lower.includes("fachwerk")) return "Fachwerk infill";
  if (lower.includes("traditional log")) return "Traditional log";
  if (lower.includes("log infill")) return "Log infill";
  if (lower.includes("wood")) return "Wood blocks";
  if (lower.includes("plaster") || lower.includes("wall")) return "Wall/plaster";
  return source.length > 38 ? `${source.slice(0, 35)}...` : source;
}

function buildMaterialZoneColorMap() {
  state.materialZoneColorMap = {};
  const options = state.buildingMaterialZoneOptions || [];
  options.forEach((option, idx) => {
    const zone = normalizeMaterialZoneNumber(option.zone_number);
    if (zone === null) return;
    const fallbackIdx = hashString(String(zone)) % MATERIAL_ZONE_COLORS.length;
    state.materialZoneColorMap[zone] = MATERIAL_ZONE_COLORS[idx] || MATERIAL_ZONE_COLORS[fallbackIdx] || "#8a8a8a";
  });
}

function resolveMaterialZoneColor(zoneNumber) {
  const zone = normalizeMaterialZoneNumber(zoneNumber);
  if (zone === null) return FALLBACK_FILL;
  if (state.materialZoneColorMap[zone]) return state.materialZoneColorMap[zone];
  const fallbackIdx = hashString(String(zone)) % MATERIAL_ZONE_COLORS.length;
  return MATERIAL_ZONE_COLORS[fallbackIdx] || FALLBACK_FILL;
}

function hearthZoneLabel(labelValue) {
  const label = String(labelValue || "").trim();
  return label || "Unspecified";
}

function summarizeHearthLabel(hearthLabel = "", hearthCode = "") {
  const code = String(hearthCode || "").trim().toUpperCase();
  if (code && HEARTH_SHORT_BY_CODE[code]) return HEARTH_SHORT_BY_CODE[code];
  const source = String(hearthLabel || "").trim();
  if (!source) return "Unspecified hearth";
  const lower = source.toLowerCase();
  if (lower.includes("spark")) return "Spark-arrestor hearth";
  if (lower.includes("metal") || lower.includes("chimney")) return "Chimney hearth";
  if (lower.includes("burgunder") || lower.includes("smoke capture")) return "Captured-smoke hearth";
  if (lower.includes("balkenger")) return "Beam-frame hearth";
  if (lower.includes("steinwulst")) return "Stone-ring hearth";
  if (lower.includes("tuff")) return "Tuff-vault hearth";
  if (lower.includes("kamin")) return "Masonry chimney";
  return source.length > 38 ? `${source.slice(0, 35)}...` : source;
}

function deriveHearthCode(hearthSystemZoneNumber = "", materialHearthZone = "") {
  const direct = String(hearthSystemZoneNumber || "").trim().toUpperCase();
  if (/^[A-Z]$/.test(direct)) return direct;
  const combo = String(materialHearthZone || "").trim();
  if (combo.includes("_")) {
    const parts = combo.split("_");
    const candidate = String(parts[1] || "").trim().toUpperCase();
    if (/^[A-Z]$/.test(candidate)) return candidate;
  }
  return "";
}

function deriveMaterialHearthCode(row) {
  const combo = String(row?.materialHearthZone || "").trim();
  if (combo) return combo;
  const zone = normalizeMaterialZoneNumber(row?.zoneNumber);
  const hearthCode = deriveHearthCode(row?.hearthSystemZoneNumber, row?.materialHearthZone);
  const left = zone === null ? "U" : String(zone);
  const right = hearthCode || "U";
  return `${left}_${right}`;
}

function buildHearthZoneColorMap() {
  state.hearthZoneColorMap = {};
  const options = _uniqueLabels(state.hearthSystemZoneOptions || []);
  options.forEach((label, idx) => {
    const key = hearthZoneLabel(label);
    const fallbackIdx = hashString(key) % HEARTH_ZONE_COLORS.length;
    state.hearthZoneColorMap[key] = HEARTH_ZONE_COLORS[idx] || HEARTH_ZONE_COLORS[fallbackIdx] || "#8a8a8a";
  });
}

function resolveHearthZoneColor(labelValue) {
  const key = hearthZoneLabel(labelValue);
  if (state.hearthZoneColorMap[key]) return state.hearthZoneColorMap[key];
  const fallbackIdx = hashString(key) % HEARTH_ZONE_COLORS.length;
  return HEARTH_ZONE_COLORS[fallbackIdx] || FALLBACK_FILL;
}

function materialHearthCodeFromRecord(rec = {}) {
  return deriveMaterialHearthCode({
    materialHearthZone: rec?.["material+hearth_zone"],
    zoneNumber: rec?.building_material_zone_number,
    hearthSystemZoneNumber: rec?.hearth_system_zone_number,
  });
}

function materialHearthLegendEntryFromRecord(rec = {}) {
  const zoneNumber = normalizeMaterialZoneNumber(rec?.building_material_zone_number);
  const zoneLabel = zoneNumber === null ? "Unspecified" : materialZoneLabel(zoneNumber);
  const hearthLabel = hearthZoneLabel(rec?.hearth_system_zone);
  const comboCode = materialHearthCodeFromRecord(rec);
  const hearthCode = deriveHearthCode(rec?.hearth_system_zone_number, comboCode);
  const materialShort = summarizeMaterialLabel(zoneNumber, zoneLabel);
  const hearthShort = summarizeHearthLabel(hearthLabel, hearthCode);
  return {
    code: comboCode,
    zoneNumber,
    zoneLabel,
    materialShort,
    hearthShort,
    label: `${materialShort} · ${hearthShort}`,
  };
}

function collectMaterialHearthLegendEntries() {
  const byCode = new Map();
  Object.values(state.records || {}).forEach((rec) => {
    const entry = materialHearthLegendEntryFromRecord(rec || {});
    if (!entry.code || byCode.has(entry.code)) return;
    byCode.set(entry.code, entry);
  });
  return [...byCode.values()].sort((a, b) => {
    const az = a.zoneNumber === null ? Number.POSITIVE_INFINITY : Number(a.zoneNumber);
    const bz = b.zoneNumber === null ? Number.POSITIVE_INFINITY : Number(b.zoneNumber);
    if (az !== bz) return az - bz;
    const hearthCmp = String(a.hearthShort || "").localeCompare(String(b.hearthShort || ""));
    if (hearthCmp !== 0) return hearthCmp;
    return String(a.code || "").localeCompare(String(b.code || ""));
  });
}

function buildMaterialHearthZoneColorMap() {
  state.materialHearthZoneColorMap = {};
  const entries = collectMaterialHearthLegendEntries();
  entries.forEach((entry, idx) => {
    const fallbackIdx = hashString(entry.code) % MATERIAL_HEARTH_ZONE_COLORS.length;
    state.materialHearthZoneColorMap[entry.code] =
      MATERIAL_HEARTH_ZONE_COLORS[idx] || MATERIAL_HEARTH_ZONE_COLORS[fallbackIdx] || "#8a8a8a";
  });
}

function resolveMaterialHearthZoneColor(recOrCode = null) {
  const code = typeof recOrCode === "string"
    ? String(recOrCode || "").trim()
    : materialHearthCodeFromRecord(recOrCode || {});
  if (!code) return FALLBACK_FILL;
  if (state.materialHearthZoneColorMap[code]) return state.materialHearthZoneColorMap[code];
  const fallbackIdx = hashString(code) % MATERIAL_HEARTH_ZONE_COLORS.length;
  return MATERIAL_HEARTH_ZONE_COLORS[fallbackIdx] || FALLBACK_FILL;
}

function exceptionalLegendCoverage() {
  const coverage = {
    hasAny: false,
    biClasses: new Set(),
    materialZones: new Set(),
    hearthZones: new Set(),
    materialHearthCodes: new Set(),
  };
  [...state.exceptional].forEach((bfs) => {
    const rec = state.records[String(bfs)];
    if (!rec) return;
    coverage.hasAny = true;

    const biClass = String(rec.bi_class || "").trim();
    if (biClass) coverage.biClasses.add(biClass);

    const zoneNumber = normalizeMaterialZoneNumber(rec.building_material_zone_number);
    if (zoneNumber !== null) coverage.materialZones.add(zoneNumber);

    coverage.hearthZones.add(hearthZoneLabel(rec.hearth_system_zone));

    const materialHearthCode = materialHearthCodeFromRecord(rec);
    if (materialHearthCode) coverage.materialHearthCodes.add(materialHearthCode);
  });
  return coverage;
}

function municipalityLegendExceptionalToggleMarkup() {
  const checked = state.municipalityLegendExceptionalOnly ? " checked" : "";
  return `
    <label class="legend-filter-toggle">
      <input type="checkbox" data-municipality-legend-exceptional${checked}>
      <span>Exceptional only</span>
    </label>
  `;
}

function normalizeCantonNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.trunc(numeric);
}

function cantonNumberFromFeature(feature) {
  return normalizeCantonNumber(feature?.properties?.KANTONSNUM);
}

function cantonNameFromFeature(feature) {
  const fromFeature = String(feature?.properties?.NAME || "").trim();
  if (fromFeature) return fromFeature;
  const cantonNumber = cantonNumberFromFeature(feature);
  if (cantonNumber !== null && CANTON_NAME_BY_NUM[cantonNumber]) {
    return CANTON_NAME_BY_NUM[cantonNumber];
  }
  return cantonNumber === null ? "Unknown canton" : `Canton ${cantonNumber}`;
}

function cantonColorFromNumber(cantonNumber) {
  if (cantonNumber !== null && CANTON_COLOR_BY_NUM[cantonNumber]) {
    return CANTON_COLOR_BY_NUM[cantonNumber];
  }
  return "#9a9a9a";
}

function cantonStyle(feature = null) {
  const opacity = normalizeOpacity(state.layerOpacity.cantons, 0.9);
  if (!state.cantonsColorMode) {
    return {
      color: "#4d4d4d",
      weight: 1.1,
      opacity,
      fill: false,
      fillOpacity: 0,
      interactive: false,
    };
  }
  const cantonNumber = cantonNumberFromFeature(feature);
  return {
    color: "#222222",
    weight: 0.9,
    opacity,
    fill: true,
    fillColor: cantonColorFromNumber(cantonNumber),
    fillOpacity: Math.min(1, opacity + 0.12),
    interactive: false,
  };
}

function refreshCantonStyles() {
  const cantonLayer = getLayerInstance("cantons");
  if (!cantonLayer || typeof cantonLayer.setStyle !== "function") return;
  cantonLayer.setStyle((feature) => cantonStyle(feature));
}

function cantonLegendEntries() {
  const byNumber = new Map();
  const features = overlayGeojson("cantons")?.features || [];
  features.forEach((feature) => {
    const cantonNumber = cantonNumberFromFeature(feature);
    if (cantonNumber === null || byNumber.has(cantonNumber)) return;
    byNumber.set(cantonNumber, cantonNameFromFeature(feature));
  });

  return [...byNumber.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cantonNumber, name]) => ({
      cantonNumber,
      name: String(name || CANTON_NAME_BY_NUM[cantonNumber] || `Canton ${cantonNumber}`),
      color: cantonColorFromNumber(cantonNumber),
    }));
}

function bioregionKeyFromProps(props) {
  const primary = String(props?.DEBioBedeu ?? "").trim();
  if (primary) return primary;
  const fallback = String(props?.RegionName ?? "").trim();
  if (fallback) return fallback;
  return "Unknown";
}

function buildBioregionColorMap() {
  state.bioregionColorMap = {};
  state.bioregionOrder = [];
  const features = overlayGeojson("bioregions")?.features || [];
  features.forEach((feature) => {
    const key = bioregionKeyFromProps(feature?.properties || {});
    if (state.bioregionColorMap[key]) return;
    const idx = state.bioregionOrder.length;
    const fallbackIdx = hashString(key) % BIOREGION_NOTEBOOK_COLORS.length;
    state.bioregionColorMap[key] = BIOREGION_NOTEBOOK_COLORS[idx] || BIOREGION_NOTEBOOK_COLORS[fallbackIdx] || "#6b6b6b";
    state.bioregionOrder.push(key);
  });
}

function resolveBioregionColor(regionKey) {
  const key = String(regionKey ?? "").trim() || "Unknown";
  if (state.bioregionColorMap[key]) {
    return state.bioregionColorMap[key];
  }
  const idx = state.bioregionOrder.length;
  const fallbackIdx = hashString(key) % BIOREGION_NOTEBOOK_COLORS.length;
  const color = BIOREGION_NOTEBOOK_COLORS[idx] || BIOREGION_NOTEBOOK_COLORS[fallbackIdx] || "#6b6b6b";
  state.bioregionColorMap[key] = color;
  state.bioregionOrder.push(key);
  return color;
}

function bioregionPatternToken(regionKey) {
  const raw = String(regionKey || "unknown")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safe = raw || "region";
  return `${safe}-${hashString(regionKey).toString(36)}`;
}

function bioregionPatternId(regionKey, variant = "base") {
  return `bioregion-${bioregionPatternToken(regionKey)}-${variant}`;
}

function getBioregionSvgContainer() {
  const pane = state.map?.getPane(layerPaneName("bioregions"));
  if (!pane) return null;
  return pane.querySelector("svg");
}

function ensureBioregionPatternDefs() {
  const svg = getBioregionSvgContainer();
  if (!svg) {
    state.bioregionPatternReady = false;
    return false;
  }

  let defs = svg.querySelector("defs[data-bioregion-patterns='1']");
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs");
    defs.setAttribute("data-bioregion-patterns", "1");
    svg.insertBefore(defs, svg.firstChild);
  }

  state.bioregionOrder.forEach((regionKey) => {
    const color = resolveBioregionColor(regionKey);
    ["base", "hover"].forEach((variant) => {
      const patternId = bioregionPatternId(regionKey, variant);
      if (defs.querySelector(`#${patternId}`)) return;

      const pattern = document.createElementNS(SVG_NS, "pattern");
      pattern.setAttribute("id", patternId);
      pattern.setAttribute("patternUnits", "userSpaceOnUse");
      pattern.setAttribute("width", "8");
      pattern.setAttribute("height", "8");

      const bg = document.createElementNS(SVG_NS, "rect");
      bg.setAttribute("width", "8");
      bg.setAttribute("height", "8");
      bg.setAttribute("fill", color);
      bg.setAttribute("fill-opacity", variant === "hover" ? "0.24" : "0.14");
      pattern.appendChild(bg);

      const hatch = document.createElementNS(SVG_NS, "path");
      hatch.setAttribute("d", "M-2,8 L8,-2 M0,10 L10,0 M6,10 L10,6");
      hatch.setAttribute("stroke", color);
      hatch.setAttribute("stroke-width", variant === "hover" ? "1.8" : "1.35");
      hatch.setAttribute("stroke-opacity", variant === "hover" ? "1.0" : "0.92");
      hatch.setAttribute("fill", "none");
      pattern.appendChild(hatch);

      defs.appendChild(pattern);
    });
  });

  state.bioregionPatternReady = true;
  return true;
}

function applyBioregionPattern(layer, regionKey, isHover = false) {
  if (!layer?._path) return;
  if (!ensureBioregionPatternDefs()) return;
  const patternId = bioregionPatternId(regionKey, isHover ? "hover" : "base");
  layer._path.setAttribute("fill", `url(#${patternId})`);
  layer._path.setAttribute("fill-opacity", "1");
}

function isSafeHttpUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") return false;
  const trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_err) {
    return false;
  }
}

function safeOpenExternalUrl(rawUrl) {
  if (!isSafeHttpUrl(rawUrl)) return;
  try {
    const url = new URL(rawUrl.trim());
    const opened = window.open(url.href, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  } catch (_err) {
    // no-op on invalid URLs or blocked popups
  }
}

function normalizeMarkerCode(props) {
  const raw = String(props?.markers ?? "").trim();
  if (Object.prototype.hasOwnProperty.call(ISOS_MARKER_LABELS, raw)) {
    return raw;
  }
  const category = String(props?.settlement_category ?? "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ISOS_CATEGORY_MARKERS, category)) {
    return ISOS_CATEGORY_MARKERS[category];
  }
  return "o";
}

function normalizeMarkerSize(props) {
  const rawSize = Number(props?.marker_sizes);
  if (Number.isFinite(rawSize) && rawSize > 0) {
    return rawSize;
  }
  const bin = String(props?.quality_bin ?? "");
  if (Object.prototype.hasOwnProperty.call(ISOS_BIN_SIZES, bin)) {
    return ISOS_BIN_SIZES[bin];
  }
  return 40;
}

function mapMarkerSizeToPixels(sizeValue) {
  const n = Number(sizeValue);
  if (!Number.isFinite(n)) return 4.6;
  if (n <= 20) return 3.8;
  if (n <= 40) return 4.6;
  if (n <= 60) return 5.4;
  return 6.2;
}

function polygonPoints(cx, cy, radius, sides, rotationDeg = 0) {
  const pts = [];
  const rot = (rotationDeg * Math.PI) / 180;
  for (let i = 0; i < sides; i += 1) {
    const angle = ((2 * Math.PI * i) / sides) + rot;
    const x = cx + (radius * Math.cos(angle));
    const y = cy + (radius * Math.sin(angle));
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function buildIsosSvg(markerCode, pixelRadius, layerColor, clickable, strokeColor = ISOS_MARKER_STROKE) {
  const center = 12;
  const strokeWidth = 1.4;
  const fillColor = layerColor || ISOS_DEFAULT_LAYER_COLOR;
  const shapeClass = clickable ? "isos-symbol clickable" : "isos-symbol";
  let shapeMarkup = "";

  if (markerCode === "o") {
    shapeMarkup = `<circle class="isos-fill" cx="${center}" cy="${center}" r="${pixelRadius.toFixed(2)}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "s") {
    const d = pixelRadius * 2;
    const x = center - pixelRadius;
    const y = center - pixelRadius;
    shapeMarkup = `<rect class="isos-fill" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${d.toFixed(2)}" height="${d.toFixed(2)}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "^") {
    const p1 = `${center.toFixed(2)},${(center - pixelRadius).toFixed(2)}`;
    const p2 = `${(center - pixelRadius).toFixed(2)},${(center + pixelRadius).toFixed(2)}`;
    const p3 = `${(center + pixelRadius).toFixed(2)},${(center + pixelRadius).toFixed(2)}`;
    shapeMarkup = `<polygon class="isos-fill" points="${p1} ${p2} ${p3}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "v") {
    const p1 = `${(center - pixelRadius).toFixed(2)},${(center - pixelRadius).toFixed(2)}`;
    const p2 = `${(center + pixelRadius).toFixed(2)},${(center - pixelRadius).toFixed(2)}`;
    const p3 = `${center.toFixed(2)},${(center + pixelRadius).toFixed(2)}`;
    shapeMarkup = `<polygon class="isos-fill" points="${p1} ${p2} ${p3}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "D") {
    shapeMarkup = `<polygon class="isos-fill" points="${polygonPoints(center, center, pixelRadius, 4, -45)}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "p") {
    shapeMarkup = `<polygon class="isos-fill" points="${polygonPoints(center, center, pixelRadius, 5, -90)}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  } else {
    const r = pixelRadius * 0.85;
    shapeMarkup = `
      <line class="isos-line" x1="${(center - r).toFixed(2)}" y1="${(center - r).toFixed(2)}" x2="${(center + r).toFixed(2)}" y2="${(center + r).toFixed(2)}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <line class="isos-line" x1="${(center + r).toFixed(2)}" y1="${(center - r).toFixed(2)}" x2="${(center - r).toFixed(2)}" y2="${(center + r).toFixed(2)}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
    `;
  }

  return `<svg class="${shapeClass}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">${shapeMarkup}</svg>`;
}

function resolveIsosLayerColor(layerName) {
  const key = String(layerName ?? "").trim() || "Unknown";
  if (state.isosLayerColorMap[key]) {
    return state.isosLayerColorMap[key];
  }
  if (Object.prototype.hasOwnProperty.call(ISOS_LAYER_COLORS, key)) {
    state.isosLayerColorMap[key] = ISOS_LAYER_COLORS[key];
    return state.isosLayerColorMap[key];
  }
  const idx = hashString(key) % ISOS_FALLBACK_LAYER_PALETTE.length;
  state.isosLayerColorMap[key] = ISOS_FALLBACK_LAYER_PALETTE[idx] || ISOS_DEFAULT_LAYER_COLOR;
  return state.isosLayerColorMap[key];
}

function getIsosIcon(markerCode, markerSize, layerColor, clickable, strokeColor = ISOS_MARKER_STROKE) {
  const px = mapMarkerSizeToPixels(markerSize);
  const key = `${markerCode}|${px}|${layerColor}|${strokeColor}|${clickable ? "1" : "0"}`;
  if (state.isosIconCache[key]) {
    return state.isosIconCache[key];
  }

  const iconPx = px + 6;
  state.isosIconCache[key] = L.divIcon({
    className: clickable ? "isos-icon-wrapper isos-url-marker" : "isos-icon-wrapper isos-static-marker",
    html: buildIsosSvg(markerCode, px, layerColor, clickable, strokeColor),
    iconSize: [iconPx, iconPx],
    iconAnchor: [iconPx / 2, iconPx / 2],
    tooltipAnchor: [0, -Math.round(iconPx / 2)],
  });

  return state.isosIconCache[key];
}

function currentIsosRenderMode() {
  if (!state.map) return "symbol";
  return state.map.getZoom() >= ISOS_DETAIL_ZOOM ? "symbol" : "simple";
}

function layerHasData(layerId) {
  if (layerId === "bivariate_municipalities") {
    return !!(state.bootstrap?.municipalities?.features || []).length;
  }
  if (layerId === "municipality_bounds") {
    return !!(state.bootstrap?.municipalities?.features || []).length;
  }
  const kind = LAYER_META[layerId]?.kind;
  if (kind === "raster") {
    return !!state.bootstrap?.raster_overlays?.[layerId];
  }
  if (kind === "vector") {
    const manifestCount = Number(state.overlayManifest?.[layerId]?.feature_count);
    if (Number.isFinite(manifestCount) && manifestCount >= 0) {
      return manifestCount > 0;
    }
    return !!(overlayGeojson(layerId)?.features || []).length;
  }
  return false;
}

function ensureLayerPanes() {
  if (!state.map) return;
  state.layerOrder.forEach((layerId) => {
    const paneName = layerPaneName(layerId);
    if (!state.map.getPane(paneName)) {
      state.map.createPane(paneName);
    }
  });
}

function applyLayerPaneOrder() {
  if (!state.map) return;
  const total = state.layerOrder.length;
  state.layerOrder.forEach((layerId, idx) => {
    const pane = state.map.getPane(layerPaneName(layerId));
    if (!pane) return;
    pane.style.zIndex = String(state.layerPaneZBase + (total - idx));
  });
}

function sanitizeLayerVisibility() {
  state.layerOrder.forEach((layerId) => {
    if (!Object.prototype.hasOwnProperty.call(state.layerVisibility, layerId)) {
      state.layerVisibility[layerId] = false;
    }
    if (!layerHasData(layerId)) {
      state.layerVisibility[layerId] = false;
    }
  });
}

function normalizeOpacity(value, fallback = 1.0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return Number(fallback);
  return Math.max(0, Math.min(1, n));
}

function getDefaultLayerOpacity(layerId) {
  if (layerId === "elevation" || layerId === "population") {
    return normalizeOpacity(state.bootstrap?.raster_overlays?.[layerId]?.default_opacity, 0.6);
  }
  if (layerId === "municipality_bounds") return 0.38;
  if (layerId === "cantons") return 0.9;
  if (layerId === "national_border") return 1.0;
  return 1.0;
}

function ensureLayerOpacityDefaults() {
  state.layerOrder.forEach((layerId) => {
    if (!Object.prototype.hasOwnProperty.call(state.layerOpacity, layerId)) {
      state.layerOpacity[layerId] = getDefaultLayerOpacity(layerId);
    } else {
      state.layerOpacity[layerId] = normalizeOpacity(state.layerOpacity[layerId], getDefaultLayerOpacity(layerId));
    }
  });
}

function applyRasterOpacity(layerId, value) {
  const layer = getLayerInstance(layerId);
  if (!layer || typeof layer.setOpacity !== "function") return;
  layer.setOpacity(normalizeOpacity(value, getDefaultLayerOpacity(layerId)));
}

function applyVectorOverlayOpacity(layerId, value) {
  const layer = getLayerInstance(layerId);
  if (!layer || typeof layer.setStyle !== "function") return;
  const opacity = normalizeOpacity(value, getDefaultLayerOpacity(layerId));
  if (layerId === "municipality_bounds") {
    layer.setStyle({
      opacity,
      fillOpacity: Math.min(1, opacity + 0.35),
    });
    return;
  }
  if (layerId === "cantons") {
    refreshCantonStyles();
    return;
  }
  if (layerId === "national_border") {
    layer.setStyle({ opacity });
  }
}

function applyConfiguredLayerOpacities() {
  const adjustableLayers = ["elevation", "population", "municipality_bounds", "cantons", "national_border"];
  adjustableLayers.forEach((layerId) => {
    if (!state.layerVisibility[layerId]) return;
    const value = normalizeOpacity(state.layerOpacity[layerId], getDefaultLayerOpacity(layerId));
    state.layerOpacity[layerId] = value;
    if (LAYER_META[layerId]?.kind === "raster") {
      applyRasterOpacity(layerId, value);
    } else {
      applyVectorOverlayOpacity(layerId, value);
    }
  });
}

function renderLayerOrderControls() {
  if (!el.layerOrderList) return;

  const rows = state.layerOrder
    .map((layerId) => {
      const meta = LAYER_META[layerId] || { label: formatRawFieldLabel(layerId) };
      const kind = meta.kind;
      const available = layerHasData(layerId);
      const checked = available && !!state.layerVisibility[layerId];
      const checkedAttr = checked ? " checked" : "";
      const disabledAttr = available ? "" : " disabled";
      const unavailableClass = available ? "" : " is-unavailable";
      const draggableAttr = available ? "true" : "false";
      const unavailableTitle = available ? "" : " title=\"Data unavailable\"";
      const isLoading = kind === "vector" && !!state.overlayFetchInFlight[layerId];
      const hasError = kind === "vector" && !!state.layerLoadErrors[layerId];
      const stateBadge = isLoading
        ? "<span class=\"layer-order-state\">loading</span>"
        : (hasError ? "<span class=\"layer-order-state is-error\">error</span>" : "");
      return `
        <div class="layer-order-pill${unavailableClass}" data-layer-id="${escapeHtml(layerId)}" draggable="${draggableAttr}"${unavailableTitle}>
          <label class="layer-order-check">
            <input type="checkbox" data-layer-visible="${escapeHtml(layerId)}"${checkedAttr}${disabledAttr}>
            <span>${escapeHtml(meta.label)}</span>
          </label>
          ${stateBadge}
          <span class="layer-order-handle" aria-hidden="true">⋮⋮</span>
        </div>
      `;
    })
    .join("");

  el.layerOrderList.innerHTML = rows;

  let draggedId = null;
  const pillNodes = [...el.layerOrderList.querySelectorAll(".layer-order-pill[data-layer-id]")];

  pillNodes.forEach((row) => {
    row.addEventListener("dragstart", (event) => {
      if (row.classList.contains("is-unavailable")) {
        event.preventDefault();
        return;
      }
      draggedId = row.dataset.layerId;
      row.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        try {
          event.dataTransfer.setData("text/plain", draggedId || "");
        } catch (_err) {
          // Safari can reject setData for some drag sources.
        }
      }
    });

    row.addEventListener("dragover", (event) => {
      const targetId = row.dataset.layerId;
      if (!draggedId || !targetId || draggedId === targetId) return;
      event.preventDefault();
      row.classList.add("drag-over");
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", (event) => {
      const targetId = row.dataset.layerId;
      if (!draggedId || !targetId) return;
      event.preventDefault();
      row.classList.remove("drag-over");
      moveLayerOrderItem(draggedId, targetId);
      draggedId = null;
      renderLayerOrderControls();
      applyLayerOrderAndVisibility();
    });

    row.addEventListener("dragend", () => {
      draggedId = null;
      pillNodes.forEach((pill) => {
        pill.classList.remove("dragging");
        pill.classList.remove("drag-over");
      });
    });
  });

  [...el.layerOrderList.querySelectorAll("input[data-layer-visible]")].forEach((node) => {
    node.addEventListener("change", () => {
      const layerId = node.dataset.layerVisible;
      if (!layerId) return;
      state.layerVisibility[layerId] = !!node.checked;
      applyLayerOrderAndVisibility();
      renderLayerOrderControls();
    });
  });
}

function getExcludedHeatingTypes() {
  return [...el.heatingList.querySelectorAll("input[type='checkbox']:checked")].map((node) => node.value);
}

function currentPayload() {
  const mode = normalizeMunicipalityDisplayMode(state.municipalityDisplayMode);
  return {
    season: el.season.value,
    temp_method: el.tempMethod.value,
    exclude_non_habitable: el.nonHabitable.checked,
    excluded_heating_types: getExcludedHeatingTypes(),
    k_temp: Number(el.kTemp.value || 1.0),
    k_old: Number(el.kOld.value || 1.0),
    excluded_bivariate_classes: mode === MUNICIPALITY_DISPLAY_MODES.BIVARIATE ? [...state.legendSelectedClasses] : [],
    selected_material_hearth_zones: selectedMaterialHearthZonesArray(),
    apply_material_hearth_filter: !!state.applyMaterialHearthFilter,
    apply_climate_priority: !!state.applyClimatePriority,
    climate_indicator_keys: [...state.selectedClimateIndicators],
    climate_top_share_pct: normalizeClimateTopShare(state.climateTopSharePct),
  };
}

function normalizeClimateTopShare(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 25;
  return Math.min(100, Math.max(1, Math.round(numeric)));
}

function formatRawFieldLabel(key) {
  const text = String(key || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "Field";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function fieldLabel(key) {
  return FRIENDLY_FIELD_LABELS[key] || formatRawFieldLabel(key);
}

function formatTooltipValue(key, value) {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "N/A";
    if (key === "temp") return `${value.toFixed(2)} °C`;
    if (key === "pct_old1919") return `${value.toFixed(1)}%`;
    if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(3);
  }
  if (typeof value === "string" && value.trim() === "") return "N/A";
  return String(value);
}

function recordForFeature(feature) {
  const bfs = String(feature.properties?.BFS_NUMMER ?? "");
  return state.records[bfs] || null;
}

function municipalityDataObject(feature) {
  const rec = recordForFeature(feature) || {};
  return {
    ...(feature.properties || {}),
    ...rec,
  };
}

function buildTooltipHtml(layerKey, dataObj) {
  let title = state.layerDisplayNames[layerKey] || layerKey;
  if (layerKey === "bivariate_municipalities") {
    const municipalityName = String(dataObj?.name || dataObj?.NAME || "").trim();
    if (municipalityName) {
      title = municipalityName;
    }
  }
  const schema = state.hoverSchemas[layerKey] || [];
  const selected = state.hoverSelectedFields[layerKey] || new Set();
  const fields = schema.filter((key) => selected.has(key));

  if (fields.length === 0) {
    return `<strong>${escapeHtml(title)}</strong><br>No fields selected`;
  }

  const lines = fields.map((key) => {
    const label = fieldLabel(key);
    const value = formatTooltipValue(key, dataObj?.[key]);
    return `${escapeHtml(label)}: ${escapeHtml(value)}`;
  });

  return `<strong>${escapeHtml(title)}</strong><br>${lines.join("<br>")}`;
}

function bindTooltipForLayer(layerKey, feature, leafletLayer, dataObj = null) {
  const obj = dataObj || { ...(feature.properties || {}) };
  leafletLayer.bindTooltip(buildTooltipHtml(layerKey, obj), { sticky: true });
}

function collectPropertyKeys(geojson) {
  if (!geojson?.features) return [];
  const keys = new Set();
  for (const feature of geojson.features) {
    const props = feature?.properties || {};
    Object.keys(props).forEach((k) => keys.add(k));
  }
  return [...keys];
}

function sortSchemaKeys(keys) {
  return [...keys].sort((a, b) => {
    const la = fieldLabel(a);
    const lb = fieldLabel(b);
    const byLabel = la.localeCompare(lb);
    if (byLabel !== 0) return byLabel;
    return String(a).localeCompare(String(b));
  });
}

function setLayerSchema(layerKey, keys) {
  const schema = sortSchemaKeys(keys.filter((k) => k && k !== "geometry"));
  state.hoverSchemas[layerKey] = schema;

  const existing = state.hoverSelectedFields[layerKey];
  if (!existing) {
    const defaults = DEFAULT_HOVER_FIELDS[layerKey] || [];
    state.hoverSelectedFields[layerKey] = new Set(defaults.filter((k) => schema.includes(k)));
  } else {
    state.hoverSelectedFields[layerKey] = new Set([...existing].filter((k) => schema.includes(k)));
  }
}

function refreshHoverSchema(layerKey) {
  if (layerKey === "isos") {
    setLayerSchema("isos", collectPropertyKeys(overlayGeojson("isos")));
    return;
  }
  if (layerKey === "bioregions") {
    setLayerSchema("bioregions", collectPropertyKeys(overlayGeojson("bioregions")));
    return;
  }

  const keys = new Set(collectPropertyKeys(state.bootstrap?.municipalities));
  Object.values(state.records || {}).forEach((rec) => {
    Object.keys(rec).forEach((k) => keys.add(k));
  });
  setLayerSchema("bivariate_municipalities", [...keys]);
}

function getVisibleStackLayers() {
  return state.layerOrder.filter((layerId) => !!state.layerVisibility[layerId] && layerHasData(layerId));
}

function layerMainOptionsMarkup(layerId) {
  const meta = LAYER_META[layerId];
  if (meta?.hoverable) {
    if (layerId !== "bivariate_municipalities" && !state.overlayDataLoaded[layerId]) {
      if (state.layerLoadErrors[layerId]) {
        return `<p class="layer-option-placeholder">Failed to load layer fields. Toggle layer on again to retry.</p>`;
      }
      if (state.overlayFetchInFlight[layerId]) {
        return `<p class="layer-option-placeholder">Loading layer fields ...</p>`;
      }
      return `<p class="layer-option-placeholder">Enable this layer to load hover fields.</p>`;
    }
    const schema = state.hoverSchemas[layerId] || [];
    const selected = state.hoverSelectedFields[layerId] || new Set();
    let municipalityControls = "";
    if (layerId === "bivariate_municipalities") {
      const mode = normalizeMunicipalityDisplayMode(state.municipalityDisplayMode);
      const materialHearthOptions = (state.materialHearthZoneOptions || [])
        .map((option) => {
          const zoneCode = String(option.zone_code || "").trim();
          if (!zoneCode) return "";
          const checked = state.selectedMaterialHearthZones.has(zoneCode) ? " checked" : "";
          const label = materialHearthOptionLabel(zoneCode);
          return `
            <label>
              <input type="checkbox" data-material-hearth-zone="${escapeHtml(zoneCode)}"${checked}>
              <span>${escapeHtml(label)}</span>
            </label>
          `;
        })
        .filter(Boolean)
        .join("");

      municipalityControls = `
        <div class="municipality-mode-controls" data-municipality-options-root>
          <label class="municipality-mode-select">
            <span>Display mode</span>
            <select data-municipality-mode>
              <option value="${MUNICIPALITY_DISPLAY_MODES.BIVARIATE}"${mode === MUNICIPALITY_DISPLAY_MODES.BIVARIATE ? " selected" : ""}>Bivariate Class</option>
              <option value="${MUNICIPALITY_DISPLAY_MODES.MATERIAL}"${mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL ? " selected" : ""}>Building Material Zone</option>
              <option value="${MUNICIPALITY_DISPLAY_MODES.HEARTH}"${mode === MUNICIPALITY_DISPLAY_MODES.HEARTH ? " selected" : ""}>Hearth System Zone</option>
              <option value="${MUNICIPALITY_DISPLAY_MODES.MATERIAL_HEARTH}"${mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL_HEARTH ? " selected" : ""}>Material + Hearth Groups</option>
            </select>
          </label>
          <div class="field-option-toolbar">
            <p class="field-option-summary">${state.selectedMaterialHearthZones.size} group${state.selectedMaterialHearthZones.size === 1 ? "" : "s"} selected</p>
            <button type="button" class="field-option-action" data-clear-material-hearth-zones>Clear all</button>
          </div>
          <div class="material-zone-fields" data-material-hearth-zone-scroll>
            ${materialHearthOptions || "<label>No material + hearth groups available</label>"}
          </div>
        </div>
      `;
    }
    const summaryMarkup = schema.length
      ? `
        <div class="field-option-toolbar">
          <p class="field-option-summary">${selected.size} field${selected.size === 1 ? "" : "s"} selected</p>
          <button type="button" class="field-option-action" data-clear-hover-fields="${escapeHtml(layerId)}">Clear all</button>
        </div>
      `
      : "";
    const fieldsHtml = schema.length
      ? schema
          .map((field) => {
            const checked = selected.has(field) ? " checked" : "";
            return `<label><input type="checkbox" data-hover-layer="${escapeHtml(layerId)}" data-hover-field="${escapeHtml(field)}"${checked}> ${escapeHtml(fieldLabel(field))}</label>`;
          })
          .join("")
      : "<label>No fields available</label>";
    return `${municipalityControls}${summaryMarkup}<div class="layer-option-fields">${fieldsHtml}</div>`;
  }

  const opacity = normalizeOpacity(state.layerOpacity[layerId], getDefaultLayerOpacity(layerId));
  return `
    <div class="layer-opacity-row">
      <label>
        <span>Opacity</span>
        <span class="layer-opacity-value" data-layer-opacity-value="${escapeHtml(layerId)}">${opacity.toFixed(2)}</span>
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value="${opacity.toFixed(2)}"
        data-layer-opacity="${escapeHtml(layerId)}"
      />
    </div>
  `;
}

function compactLegendMarkup(layerId) {
  const note = LAYER_LEGEND_NOTES[layerId] || "Map overlay layer.";
  return `<p class="layer-legend-compact">${escapeHtml(note)}</p>`;
}

function climateRiskOptionsMarkup() {
  const options = Array.isArray(state.climateIndicatorOptions) ? state.climateIndicatorOptions : [];
  if (!options.length) {
    return `<p class="layer-option-placeholder">No climate indicators available.</p>`;
  }

  const groups = new Map();
  options.forEach((option) => {
    const group = String(option.group || "Indicators");
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(option);
  });

  const selectedCount = options.filter((option) => state.selectedClimateIndicators.has(option.key)).length;
  const helperText = selectedCount === 0
    ? `<p class="climate-risk-helper">No indicators selected; climate-risk prioritization disabled.</p>`
    : `<p class="climate-risk-helper">Equal weighting. Scores are minmax-normalized across all municipalities.</p>`;

  const groupMarkup = [...groups.entries()]
    .map(([group, groupOptions]) => {
      const items = groupOptions
        .map((option) => {
          const checked = state.selectedClimateIndicators.has(option.key) ? " checked" : "";
          return `
            <label>
              <input type="checkbox" data-climate-indicator="${escapeHtml(option.key)}"${checked}>
              <span>${escapeHtml(option.label || option.key)}</span>
            </label>
          `;
        })
        .join("");
      return `
        <section class="climate-risk-group">
          <h4>${escapeHtml(group)}</h4>
          <div class="climate-risk-fields">${items}</div>
        </section>
      `;
    })
    .join("");

  return `
    <div class="climate-risk-summary">
      <div class="field-option-toolbar">
        <p class="climate-risk-summary-text">${selectedCount} indicator${selectedCount === 1 ? "" : "s"} selected</p>
        <button type="button" class="field-option-action" data-clear-climate-indicators>Clear all</button>
      </div>
      <label class="climate-risk-share-control">
        <span>Top share (%)</span>
        <input
          type="number"
          min="1"
          max="100"
          step="1"
          value="${normalizeClimateTopShare(state.climateTopSharePct)}"
          data-climate-top-share
        />
      </label>
    </div>
    ${helperText}
    <div class="climate-risk-groups">${groupMarkup}</div>
  `;
}

function climateRiskInfoMarkup() {
  const stats = state.lastClimateStats || {};
  const indicatorCount = Number(stats.climate_indicator_count || 0);
  const ignored = Array.isArray(stats.climate_ignored_indicators) ? stats.climate_ignored_indicators : [];
  const selectionDisabled = state.selectedClimateIndicators.size === 0;
  const ignoredMarkup = ignored.length
    ? `
      <div class="climate-risk-note">
        <strong>Ignored indicators</strong>
        <ul class="climate-risk-note-list">
          ${ignored
            .map((item) => `<li>${escapeHtml(item.key || "indicator")}: ${escapeHtml(formatRawFieldLabel(item.reason || "ignored"))}</li>`)
            .join("")}
        </ul>
      </div>
    `
    : "";
  const stateText = !state.applyClimatePriority
    ? "Stage 3 climate prioritization is toggled off."
    : (!selectionDisabled && state.climateStageEnabled
      ? `Selecting the top ${normalizeClimateTopShare(state.climateTopSharePct)}% globally from Stage 2 material + hearth survivors.`
      : "Climate prioritization is disabled until at least one usable indicator remains selected.");

  return `
    <div class="climate-risk-info">
      <p>Climate risk is a relative composite exposure score built from projected climate-change indicators.</p>
      <p>Selected municipality indicators are used directly, minmax-normalized to a <strong>0 to 1</strong> range across all municipalities, and combined with equal weights.</p>
      <p>Higher scores indicate stronger projected climate stress relative to the rest of the current analysis domain, not absolute risk or impact.</p>
      <p>Because minmax normalization is domain-dependent, the score reflects comparison within the current municipality set and can be stretched by extreme values.</p>
      <p>${escapeHtml(stateText)}</p>
      <p class="climate-risk-note">Usable indicators in current score: <strong>${indicatorCount}</strong>.</p>
      ${ignoredMarkup}
    </div>
  `;
}

function exceptionalFlowInfoMarkup() {
  const comboChecked = state.applyMaterialHearthFilter ? " checked" : "";
  const climateChecked = state.applyClimatePriority ? " checked" : "";
  return `
    <div class="climate-risk-info">
      <p>Exceptional places are selected in three stages.</p>
      <p><strong>Stage 1:</strong> Bivariate Class identifies exceptional municipalities from temperature and old-building thresholds.</p>
      <p><strong>Stage 2:</strong> If selected, material + hearth groups are reduced to the top 3 per group by Stage 1 severity.</p>
      <p><strong>Stage 3:</strong> Climate prioritization ranks remaining municipalities globally and keeps the top share.</p>
      <div class="flow-toggle-list">
        <label><input type="checkbox" data-stage-toggle="material-hearth"${comboChecked}> Apply Stage 2 (Material + Hearth top-3)</label>
        <label><input type="checkbox" data-stage-toggle="climate"${climateChecked}> Apply Stage 3 (Climate prioritization)</label>
      </div>
    </div>
  `;
}

function sortExceptionalRows(rows = []) {
  const statusRank = {
    selected: 0,
    filtered_out: 1,
    missing: 2,
  };
  return [...rows].sort((a, b) => {
    const aScore = Number.isFinite(Number(a.climateRiskScore)) ? Number(a.climateRiskScore) : Number.NEGATIVE_INFINITY;
    const bScore = Number.isFinite(Number(b.climateRiskScore)) ? Number(b.climateRiskScore) : Number.NEGATIVE_INFINITY;
    if (aScore !== bScore) return bScore - aScore;

    const aStatus = Object.prototype.hasOwnProperty.call(statusRank, a.status) ? statusRank[a.status] : 99;
    const bStatus = Object.prototype.hasOwnProperty.call(statusRank, b.status) ? statusRank[b.status] : 99;
    if (aStatus !== bStatus) return aStatus - bStatus;

    const labelCmp = a.label.localeCompare(b.label);
    if (labelCmp !== 0) return labelCmp;
    return a.bfs.localeCompare(b.bfs);
  });
}

function collectExceptionalRows() {
  return [...state.exceptionalStage1]
    .map((bfs) => {
      const rec = state.records[bfs] || {};
      const name = String(rec.name || rec.NAME || bfs);
      const canton = String(rec.canton_name || rec.KANTONSNUM || "").trim();
      const label = canton ? `${name} (${canton})` : name;
      const status = String(state.climateStageStatus[bfs] || "selected");
      const climateRiskScore = rec.climate_risk_score;
      const storedClimateRisk = rec["climate_risk_gwl3.0"];
      const zoneNumber = normalizeMaterialZoneNumber(rec.building_material_zone_number);
      const zoneLabel = zoneNumber === null
        ? "Unspecified"
        : materialZoneLabel(zoneNumber);
      const hearthSystemZone = String(rec.hearth_system_zone || "").trim();
      const hearthSystemZoneNumber = String(rec.hearth_system_zone_number || "").trim();
      const materialHearthZone = String(rec["material+hearth_zone"] || "").trim();
      return {
        bfs: String(bfs),
        name,
        canton,
        label,
        status,
        climateRiskScore,
        storedClimateRisk,
        zoneNumber,
        zoneLabel,
        hearthSystemZone,
        hearthSystemZoneNumber,
        materialHearthZone,
        temp: rec.temp,
        pctOld1919: rec.pct_old1919,
        biClass: rec.bi_class,
      };
    });
}

function groupedExceptionalRows() {
  const rows = collectExceptionalRows();
  if (!rows.length) return [];

  const groupsByKey = new Map();
  rows.forEach((row) => {
    const zonePart = row.zoneNumber === null ? "zone-missing" : `zone-${row.zoneNumber}`;
    const hearth = hearthZoneLabel(row.hearthSystemZone);
    const hearthPart = hearth ? `hearth-${hearth}` : "hearth-missing";
    const key = `${zonePart}__${hearthPart}`;
    if (!groupsByKey.has(key)) {
      const comboCode = deriveMaterialHearthCode(row);
      const materialShort = summarizeMaterialLabel(row.zoneNumber, row.zoneLabel);
      const hearthCode = deriveHearthCode(row.hearthSystemZoneNumber, row.materialHearthZone);
      const hearthShort = summarizeHearthLabel(row.hearthSystemZone, hearthCode);
      groupsByKey.set(key, {
        key,
        zoneNumber: row.zoneNumber,
        hearthText: hearthShort,
        title: `${materialShort} · ${hearthShort} (${comboCode})`,
        rows: [],
      });
    }
    groupsByKey.get(key).rows.push(row);
  });

  return [...groupsByKey.values()]
    .map((group) => ({ ...group, rows: sortExceptionalRows(group.rows) }))
    .sort((a, b) => {
      const az = a.zoneNumber === null ? Number.POSITIVE_INFINITY : Number(a.zoneNumber);
      const bz = b.zoneNumber === null ? Number.POSITIVE_INFINITY : Number(b.zoneNumber);
      if (az !== bz) return az - bz;
      return String(a.hearthText || "").localeCompare(String(b.hearthText || ""));
    });
}

function exceptionalRows() {
  return groupedExceptionalRows().flatMap((group) => (
    group.rows.map((row) => ({
      ...row,
      groupLabel: String(group.title || "Group"),
    }))
  ));
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function downloadExceptionalCsv() {
  const rows = exceptionalRows();
  if (!rows.length) return;

  const header = [
    "bfs",
    "municipality",
    "canton",
    "group_label",
    "building_material_zone_number",
    "building_material_zone",
    "hearth_system_zone",
    "hearth_system_zone_number",
    "material_plus_hearth_zone",
    "status",
    "climate_risk_score",
    "stored_climate_risk_gwl3_0",
    "temp",
    "pct_old1919",
    "bi_class",
  ];

  const lines = [
    header.join(","),
    ...rows.map((row) => [
      row.bfs,
      row.name,
      row.canton,
      row.groupLabel || "",
      row.zoneNumber ?? "",
      row.zoneLabel || "",
      row.hearthSystemZone || "",
      row.hearthSystemZoneNumber || "",
      row.materialHearthZone || "",
      row.status,
      Number.isFinite(Number(row.climateRiskScore)) ? Number(row.climateRiskScore).toFixed(6) : "",
      Number.isFinite(Number(row.storedClimateRisk)) ? Number(row.storedClimateRisk).toFixed(6) : "",
      Number.isFinite(Number(row.temp)) ? Number(row.temp).toFixed(6) : "",
      Number.isFinite(Number(row.pctOld1919)) ? Number(row.pctOld1919).toFixed(6) : "",
      row.biClass || "",
    ].map(csvEscape).join(",")),
  ];

  const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const season = String(el.season?.value || "annual");
  const method = String(el.tempMethod?.value || "mean-range").replace(/[^a-z0-9_-]+/gi, "_");
  link.href = url;
  link.download = `exceptional_places_${season}_${method}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function syncTopRowNav() {
  if (!el.hoverPillRow || !el.topScrollLeft || !el.topScrollRight) return;
  const maxScrollLeft = Math.max(0, el.hoverPillRow.scrollWidth - el.hoverPillRow.clientWidth);
  const hasOverflow = maxScrollLeft > 2;
  const scrollLeft = el.hoverPillRow.scrollLeft;

  el.topScrollLeft.disabled = !hasOverflow || scrollLeft <= 1;
  el.topScrollRight.disabled = !hasOverflow || scrollLeft >= (maxScrollLeft - 1);
}

function wireTopRowNav() {
  if (state.topRowNavWired) return;
  state.topRowNavWired = true;

  if (el.hoverPillRow) {
    el.hoverPillRow.addEventListener("scroll", () => {
      syncTopRowNav();
    }, { passive: true });
  }
  if (el.topScrollLeft) {
    el.topScrollLeft.addEventListener("click", () => {
      el.hoverPillRow?.scrollBy({ left: -320, behavior: "smooth" });
    });
  }
  if (el.topScrollRight) {
    el.topScrollRight.addEventListener("click", () => {
      el.hoverPillRow?.scrollBy({ left: 320, behavior: "smooth" });
    });
  }
  window.addEventListener("resize", () => {
    syncTopRowNav();
  });
  syncTopRowNav();
}

function renderLayerStacks() {
  if (!el.hoverPillRow) return;

  const climateScrollNode = el.hoverPillRow.querySelector(".climate-risk-groups");
  if (climateScrollNode) {
    state.climateIndicatorScrollTop = climateScrollNode.scrollTop;
  }
  const municipalityOptionsBodyNode = el.hoverPillRow.querySelector("[data-municipality-options-body]");
  if (municipalityOptionsBodyNode) {
    state.municipalityOptionsScrollTop = municipalityOptionsBodyNode.scrollTop;
  }
  const materialHearthZoneScrollNode = el.hoverPillRow.querySelector("[data-material-hearth-zone-scroll]");
  if (materialHearthZoneScrollNode) {
    state.materialHearthZoneScrollTop = materialHearthZoneScrollNode.scrollTop;
  }
  [...el.hoverPillRow.querySelectorAll("[data-layer-legend]")].forEach((node) => {
    const layerId = String(node.dataset.layerLegend || "").trim();
    if (!layerId) return;
    state.layerLegendScrollTop[layerId] = Number(node.scrollTop || 0);
  });

  [...el.hoverPillRow.querySelectorAll("details[data-layer][data-stack-role]")].forEach((node) => {
    const layerId = node.dataset.layer;
    const role = node.dataset.stackRole;
    if (!layerId || !role) return;
    if (role === "main") state.layerStackOpenMain[layerId] = node.open;
    if (role === "legend") state.layerStackOpenLegend[layerId] = node.open;
  });
  [...el.hoverPillRow.querySelectorAll("details[data-analysis-role]")].forEach((node) => {
    const role = node.dataset.analysisRole;
    if (role === "climate-main") state.analysisStackOpenClimateMain = node.open;
    if (role === "climate-legend") state.analysisStackOpenClimateLegend = node.open;
    if (role === "exceptional-main") state.analysisStackOpenExceptional = node.open;
    if (role === "exceptional-info") state.analysisStackOpenExceptionalInfo = node.open;
  });

  const visibleLayers = getVisibleStackLayers();
  const analysisStacks = [];
  if (state.bootstrap) {
    const exceptionalOpenAttr = state.analysisStackOpenExceptional ? " open" : "";
    const exceptionalInfoOpenAttr = state.analysisStackOpenExceptionalInfo ? " open" : "";
    analysisStacks.push(`
      <section class="analysis-stack exceptional-stack" data-analysis-stack="exceptional">
        <details class="layer-legend-pill" data-analysis-role="exceptional-main"${exceptionalOpenAttr}>
          <summary class="layer-pill-summary">
            <span class="layer-pill-title-wrap">
              <span class="layer-pill-title">Exceptional Places</span>
            </span>
            <span class="layer-pill-count" data-analysis-exceptional-count>${state.exceptional.size}</span>
          </summary>
          <div class="layer-pill-body">
            <div class="exceptional-toolbar">
              <button
                type="button"
                class="exceptional-download"
                data-download-exceptional
                ${state.exceptionalStage1.size === 0 ? "disabled" : ""}
              >
                Download CSV
              </button>
            </div>
            <div data-analysis-exceptional-list aria-live="polite"></div>
          </div>
        </details>
        <details class="layer-legend-pill" data-analysis-role="exceptional-info"${exceptionalInfoOpenAttr}>
          <summary class="layer-pill-summary">
            <span class="layer-pill-title">Exceptional Flow Info</span>
          </summary>
          <div class="layer-pill-body">${exceptionalFlowInfoMarkup()}</div>
        </details>
      </section>
    `);
  }
  if (state.climateIndicatorOptions.length > 0) {
    const climateMainOpenAttr = state.analysisStackOpenClimateMain ? " open" : "";
    const climateLegendOpenAttr = state.analysisStackOpenClimateLegend ? " open" : "";
    analysisStacks.push(`
      <section class="analysis-stack climate-risk-stack" data-analysis-stack="climate-risk">
        <details class="layer-main-pill" data-analysis-role="climate-main"${climateMainOpenAttr}>
          <summary class="layer-pill-summary">
            <span class="layer-pill-title">Climate Risk Options</span>
            <span class="layer-pill-count">${state.selectedClimateIndicators.size}</span>
          </summary>
          <div class="layer-pill-body">
            ${climateRiskOptionsMarkup()}
          </div>
        </details>
        <details class="layer-legend-pill" data-analysis-role="climate-legend"${climateLegendOpenAttr}>
          <summary class="layer-pill-summary">
            <span class="layer-pill-title">Climate Risk Info</span>
          </summary>
          <div class="layer-pill-body">${climateRiskInfoMarkup()}</div>
        </details>
      </section>
    `);
  }

  if (analysisStacks.length === 0 && visibleLayers.length === 0) {
    if (el.topStackShell) el.topStackShell.classList.add("hidden");
    el.hoverPillRow.innerHTML = "";
    syncTopRowNav();
    return;
  }

  if (el.topStackShell) el.topStackShell.classList.remove("hidden");

  const stacksHtml = visibleLayers
    .map((layerId) => {
      const label = LAYER_META[layerId]?.label || formatRawFieldLabel(layerId);
      const mainOpen = state.layerStackOpenMain[layerId] === true;
      const defaultLegendOpen = layerId === "bivariate_municipalities";
      const municipalityMode = normalizeMunicipalityDisplayMode(state.municipalityDisplayMode);
      const legendTitle = layerId === "bivariate_municipalities"
        ? (municipalityMode === MUNICIPALITY_DISPLAY_MODES.BIVARIATE
            ? "Bivariate Class Legend"
            : (municipalityMode === MUNICIPALITY_DISPLAY_MODES.MATERIAL
              ? "Building Material Zone Legend"
              : (municipalityMode === MUNICIPALITY_DISPLAY_MODES.HEARTH
                ? "Hearth System Zone Legend"
                : "Material + Hearth Group Legend")))
        : `${label} Legend`;
      const legendOpen = state.layerStackOpenLegend[layerId] === true
        || (!Object.prototype.hasOwnProperty.call(state.layerStackOpenLegend, layerId) && defaultLegendOpen);
      const mainOpenAttr = mainOpen ? " open" : "";
      const legendOpenAttr = legendOpen ? " open" : "";
      const bodyAttrs = layerId === "bivariate_municipalities" ? ' data-municipality-options-body' : "";

      return `
        <section class="layer-stack" data-layer-stack="${escapeHtml(layerId)}">
          <details class="layer-main-pill" data-layer="${escapeHtml(layerId)}" data-stack-role="main"${mainOpenAttr}>
            <summary class="layer-pill-summary">
              <span class="layer-pill-title">${escapeHtml(label)} Options</span>
            </summary>
            <div class="layer-pill-body"${bodyAttrs}>
              ${layerMainOptionsMarkup(layerId)}
            </div>
          </details>
          <details class="layer-legend-pill" data-layer="${escapeHtml(layerId)}" data-stack-role="legend"${legendOpenAttr}>
            <summary class="layer-pill-summary">
              <span class="layer-pill-title">${escapeHtml(legendTitle)}</span>
            </summary>
            <div class="layer-pill-body" data-layer-legend="${escapeHtml(layerId)}"></div>
          </details>
        </section>
      `;
    })
    .join("");

  el.hoverPillRow.innerHTML = `${analysisStacks.join("")}${stacksHtml}`;

  [...el.hoverPillRow.querySelectorAll("details[data-layer][data-stack-role]")].forEach((node) => {
    node.addEventListener("toggle", () => {
      const layerId = node.dataset.layer;
      const role = node.dataset.stackRole;
      if (!layerId || !role) return;
      if (role === "main") state.layerStackOpenMain[layerId] = node.open;
      if (role === "legend") state.layerStackOpenLegend[layerId] = node.open;
    });
  });

  [...el.hoverPillRow.querySelectorAll("details[data-analysis-role]")].forEach((node) => {
    node.addEventListener("toggle", () => {
      const role = node.dataset.analysisRole;
      if (role === "climate-main") state.analysisStackOpenClimateMain = node.open;
      if (role === "climate-legend") state.analysisStackOpenClimateLegend = node.open;
      if (role === "exceptional-main") state.analysisStackOpenExceptional = node.open;
      if (role === "exceptional-info") state.analysisStackOpenExceptionalInfo = node.open;
    });
  });

  [...el.hoverPillRow.querySelectorAll("input[data-hover-layer][data-hover-field]")].forEach((node) => {
    node.addEventListener("change", () => {
      const layerKey = node.dataset.hoverLayer;
      const fieldKey = node.dataset.hoverField;
      if (!layerKey || !fieldKey) return;
      if (!state.hoverSelectedFields[layerKey]) {
        state.hoverSelectedFields[layerKey] = new Set();
      }
      if (node.checked) state.hoverSelectedFields[layerKey].add(fieldKey);
      else state.hoverSelectedFields[layerKey].delete(fieldKey);
      refreshTooltips(layerKey);
      renderLayerStacks();
    });
  });

  [...el.hoverPillRow.querySelectorAll("button[data-clear-hover-fields]")].forEach((node) => {
    node.addEventListener("click", () => {
      const layerKey = node.dataset.clearHoverFields;
      if (!layerKey) return;
      state.hoverSelectedFields[layerKey] = new Set();
      refreshTooltips(layerKey);
      renderLayerStacks();
    });
  });

  [...el.hoverPillRow.querySelectorAll("select[data-municipality-mode]")].forEach((node) => {
    node.addEventListener("change", () => {
      state.municipalityDisplayMode = normalizeMunicipalityDisplayMode(node.value);
      updateMunicipalityStyles();
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("input[data-material-hearth-zone]")].forEach((node) => {
    node.addEventListener("change", () => {
      const code = String(node.dataset.materialHearthZone || "").trim();
      if (!code) return;
      if (node.checked) state.selectedMaterialHearthZones.add(code);
      else state.selectedMaterialHearthZones.delete(code);
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("button[data-clear-material-hearth-zones]")].forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedMaterialHearthZones = new Set();
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("input[data-climate-indicator]")].forEach((node) => {
    node.addEventListener("change", () => {
      const key = node.dataset.climateIndicator;
      if (!key) return;
      if (node.checked) state.selectedClimateIndicators.add(key);
      else state.selectedClimateIndicators.delete(key);
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("button[data-clear-climate-indicators]")].forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedClimateIndicators = new Set();
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("input[data-climate-top-share]")].forEach((node) => {
    const syncTopShare = () => {
      state.climateTopSharePct = normalizeClimateTopShare(node.value);
      node.value = String(state.climateTopSharePct);
    };
    node.addEventListener("input", () => {
      syncTopShare();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
    node.addEventListener("change", () => {
      syncTopShare();
      if (!el.autoUpdate.checked) renderLayerStacks();
    });
  });

  [...el.hoverPillRow.querySelectorAll("input[data-stage-toggle]")].forEach((node) => {
    node.addEventListener("change", () => {
      const stage = String(node.dataset.stageToggle || "").trim();
      if (stage === "material-hearth") state.applyMaterialHearthFilter = !!node.checked;
      if (stage === "climate") state.applyClimatePriority = !!node.checked;
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("input[data-layer-opacity]")].forEach((node) => {
    const layerId = node.dataset.layerOpacity;
    if (!layerId) return;
    node.addEventListener("input", () => {
      const value = normalizeOpacity(node.value, getDefaultLayerOpacity(layerId));
      state.layerOpacity[layerId] = value;
      const valueNode = el.hoverPillRow.querySelector(`[data-layer-opacity-value="${layerId}"]`);
      if (valueNode) valueNode.textContent = value.toFixed(2);
      if (LAYER_META[layerId]?.kind === "raster") {
        applyRasterOpacity(layerId, value);
      } else {
        applyVectorOverlayOpacity(layerId, value);
      }
    });
  });

  visibleLayers.forEach((layerId) => {
    const legendMount = el.hoverPillRow.querySelector(`[data-layer-legend="${layerId}"]`);
    if (!legendMount) return;
    if (layerId === "bivariate_municipalities") {
      renderMunicipalityLegend(legendMount);
    } else if (layerId === "cantons") {
      renderCantonsLegend(legendMount);
    } else if (layerId === "isos") {
      renderIsosLegend(legendMount);
    } else if (layerId === "bioregions") {
      renderBioregionLegend(legendMount);
    } else {
      legendMount.innerHTML = compactLegendMarkup(layerId);
    }
  });
  [...el.hoverPillRow.querySelectorAll("input[data-municipality-legend-exceptional]")].forEach((node) => {
    node.addEventListener("change", () => {
      state.municipalityLegendExceptionalOnly = !!node.checked;
      renderLayerStacks();
    });
  });
  visibleLayers.forEach((layerId) => {
    const legendMount = el.hoverPillRow.querySelector(`[data-layer-legend="${layerId}"]`);
    if (!legendMount) return;
    const previousTop = Number(state.layerLegendScrollTop[layerId] || 0);
    if (previousTop > 0) {
      legendMount.scrollTop = previousTop;
    }
  });

  [...el.hoverPillRow.querySelectorAll("input[data-canton-color-mode]")].forEach((node) => {
    node.addEventListener("change", () => {
      state.cantonsColorMode = !!node.checked;
      refreshCantonStyles();
      renderLayerStacks();
    });
  });

  renderExceptionalPlaces(
    el.hoverPillRow.querySelector("[data-analysis-exceptional-list]"),
    el.hoverPillRow.querySelector("[data-analysis-exceptional-count]"),
  );

  const exceptionalDownloadBtn = el.hoverPillRow.querySelector("[data-download-exceptional]");
  if (exceptionalDownloadBtn) {
    exceptionalDownloadBtn.addEventListener("click", () => {
      downloadExceptionalCsv();
    });
  }

  const restoredClimateScrollNode = el.hoverPillRow.querySelector(".climate-risk-groups");
  if (restoredClimateScrollNode && state.climateIndicatorScrollTop > 0) {
    restoredClimateScrollNode.scrollTop = state.climateIndicatorScrollTop;
  }
  const restoredMunicipalityOptionsBodyNode = el.hoverPillRow.querySelector("[data-municipality-options-body]");
  if (restoredMunicipalityOptionsBodyNode && state.municipalityOptionsScrollTop > 0) {
    restoredMunicipalityOptionsBodyNode.scrollTop = state.municipalityOptionsScrollTop;
  }
  const restoredMaterialHearthZoneScrollNode = el.hoverPillRow.querySelector("[data-material-hearth-zone-scroll]");
  if (restoredMaterialHearthZoneScrollNode && state.materialHearthZoneScrollTop > 0) {
    restoredMaterialHearthZoneScrollNode.scrollTop = state.materialHearthZoneScrollTop;
  }
  syncTopRowNav();
}

function muniStyle(feature) {
  const rec = recordForFeature(feature);
  const biClass = String(rec?.bi_class || "");
  const mode = normalizeMunicipalityDisplayMode(state.municipalityDisplayMode);
  const isSelectedClass = biClass.length > 0 && state.legendSelectedClasses.has(biClass);
  const materialHearthCode = materialHearthCodeFromRecord(rec || {});
  const isSelectedMaterialHearth =
    materialHearthCode.length > 0 && state.legendSelectedMaterialHearthGroups.has(materialHearthCode);
  let fill = rec?.bi_color || FALLBACK_FILL;
  if (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL) {
    fill = resolveMaterialZoneColor(rec?.building_material_zone_number);
  } else if (mode === MUNICIPALITY_DISPLAY_MODES.HEARTH) {
    fill = resolveHearthZoneColor(rec?.hearth_system_zone);
  } else if (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL_HEARTH) {
    fill = isSelectedMaterialHearth ? WHITE_FILL : resolveMaterialHearthZoneColor(rec || {});
  } else if (isSelectedClass) {
    fill = WHITE_FILL;
  }
  const exceptional = rec && state.exceptional.has(String(rec.bfs));
  return {
    color: exceptional ? "#111111" : "#ffffff",
    weight: exceptional ? 3.6 : 0.6,
    opacity: exceptional ? 1.0 : 0.9,
    fillColor: fill,
    fillOpacity:
      (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL
        || mode === MUNICIPALITY_DISPLAY_MODES.HEARTH
        || mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL_HEARTH)
        ? 0.86
        : (isSelectedClass ? 1.0 : 0.82),
  };
}

function bringExceptionalMunicipalityOutlinesToFront() {
  if (!state.muniLayer || !state.map || !state.map.hasLayer(state.muniLayer)) return;
  state.muniLayer.eachLayer((leaf) => {
    const feature = leaf.feature || {};
    const rec = recordForFeature(feature);
    if (!rec) return;
    if (!state.exceptional.has(String(rec.bfs))) return;
    if (typeof leaf.bringToFront === "function") {
      leaf.bringToFront();
    }
  });
}

function refreshMunicipalityTooltips() {
  if (!state.muniLayer) return;
  state.muniLayer.eachLayer((layer) => {
    const feature = layer.feature;
    layer.unbindTooltip();
    bindTooltipForLayer("bivariate_municipalities", feature, layer, municipalityDataObject(feature));
  });
}

function bioregionStyle(feature, isHover = false) {
  const regionKey = bioregionKeyFromProps(feature?.properties || {});
  const color = resolveBioregionColor(regionKey);
  return {
    color,
    weight: isHover ? 1.6 : 1.2,
    opacity: isHover ? 1.0 : 0.94,
    fill: true,
    fillColor: color,
    fillOpacity: isHover ? 0.24 : 0.14,
  };
}

function overlayStyle(kind, feature = null) {
  if (kind === "municipality_bounds") {
    const opacity = normalizeOpacity(state.layerOpacity.municipality_bounds, 0.38);
    return {
      color: "#111111",
      weight: 0.7,
      opacity,
      fill: true,
      fillColor: "#ffffff",
      fillOpacity: Math.min(1, opacity + 0.35),
      interactive: true,
    };
  }
  if (kind === "national_border") {
    return {
      color: "#111111",
      weight: 2.0,
      opacity: normalizeOpacity(state.layerOpacity.national_border, 1.0),
      fill: false,
      interactive: false,
    };
  }
  if (kind === "cantons") {
    return cantonStyle(feature);
  }
  if (kind === "municipalities") return { color: "#8a8a8a", weight: 0.4, fill: false, interactive: false };
  return { color: "#666666", weight: 0.8, fill: false, interactive: false };
}

function createIsosLayer(geojson, mode = "symbol") {
  const paneName = layerPaneName("isos");
  return L.geoJSON(geojson, {
    pane: paneName,
    interactive: true,
    pointToLayer: (feature, latlng) => {
      const props = feature?.properties || {};
      const markerSize = normalizeMarkerSize(props);
      const clickable = isSafeHttpUrl(props.url);

      if (mode === "simple") {
        return L.circleMarker(latlng, {
          pane: paneName,
          interactive: true,
          bubblingMouseEvents: false,
          radius: Math.max(1.9, mapMarkerSizeToPixels(markerSize) - 1.5),
          color: ISOS_MARKER_STROKE,
          weight: 1.1,
          fillColor: ISOS_MARKER_FILL,
          fillOpacity: 0.97,
        });
      }

      const markerCode = normalizeMarkerCode(props);
      const icon = getIsosIcon(markerCode, markerSize, ISOS_MARKER_FILL, clickable, ISOS_MARKER_STROKE);
      return L.marker(latlng, {
        pane: paneName,
        interactive: true,
        bubblingMouseEvents: false,
        icon,
        keyboard: false,
      });
    },
    onEachFeature: (feature, layer) => {
      const url = feature?.properties?.url;
      bindTooltipForLayer("isos", feature, layer);
      if (isSafeHttpUrl(url)) {
        layer.on("mouseover", () => {
          state.map?.getContainer()?.style.setProperty("cursor", "pointer");
        });
        layer.on("mouseout", () => {
          state.map?.getContainer()?.style.removeProperty("cursor");
        });
        layer.on("click", () => safeOpenExternalUrl(url));
      }
    },
  });
}

function maybeRefreshIsosRenderMode(forcedMode = null) {
  const isosGeo = overlayGeojson("isos");
  if (!state.map || !isosGeo || !state.layerInstances.isos) return;
  const desiredMode = forcedMode || currentIsosRenderMode();
  if (state.isZoomingMap && !forcedMode && desiredMode === "symbol") return;
  if (desiredMode === state.isosRenderMode) return;

  const oldLayer = state.layerInstances.isos;
  const wasVisible = state.map.hasLayer(oldLayer);
  if (wasVisible) {
    state.map.removeLayer(oldLayer);
  }

  state.layerInstances.isos = createIsosLayer(isosGeo, desiredMode);
  state.isosRenderMode = desiredMode;

  if (wasVisible && state.layerVisibility.isos) {
    state.layerInstances.isos.addTo(state.map);
  }
  applyLayerPaneOrder();
  renderLayerStacks();
}

function scheduleIsosModeRefresh(delayMs = 180) {
  if (state.isosZoomSettleHandle) {
    clearTimeout(state.isosZoomSettleHandle);
  }
  state.isosZoomSettleHandle = setTimeout(() => {
    state.isosZoomSettleHandle = null;
    if (!state.layerVisibility.isos) return;
    maybeRefreshIsosRenderMode();
  }, delayMs);
}

function createRasterLayer(layerId) {
  const meta = state.bootstrap?.raster_overlays?.[layerId];
  if (!meta || !meta.url || !Array.isArray(meta.bounds)) return null;
  const opacity = normalizeOpacity(state.layerOpacity[layerId], meta.default_opacity ?? 0.6);
  return L.imageOverlay(meta.url, meta.bounds, {
    pane: layerPaneName(layerId),
    interactive: false,
    opacity,
  });
}

function createVectorLayer(kind, geojson) {
  if (!geojson || !Array.isArray(geojson.features) || geojson.features.length === 0) {
    return null;
  }

  const paneName = layerPaneName(kind);
  if (kind === "isos") {
    return createIsosLayer(geojson, state.isosRenderMode);
  }

  if (kind === "bioregions") {
    return L.geoJSON(geojson, {
      pane: paneName,
      interactive: true,
      style: (feature) => bioregionStyle(feature, false),
      onEachFeature: (feature, layer) => {
        const regionKey = bioregionKeyFromProps(feature?.properties || {});
        bindTooltipForLayer("bioregions", feature, layer);
        layer.on("add", () => {
          applyBioregionPattern(layer, regionKey, false);
        });
        layer.on("mouseover", () => {
          layer.setStyle(bioregionStyle(feature, true));
          applyBioregionPattern(layer, regionKey, true);
        });
        layer.on("mouseout", () => {
          layer.setStyle(bioregionStyle(feature, false));
          applyBioregionPattern(layer, regionKey, false);
        });
      },
    });
  }

  if (kind === "municipality_bounds") {
    return L.geoJSON(geojson, {
      pane: paneName,
      interactive: true,
      bubblingMouseEvents: false,
      style: (feature) => overlayStyle(kind, feature),
      onEachFeature: (feature, layer) => {
        layer.on("click", () => {
          openMunicipalityModalFromFeature(feature);
        });
      },
    });
  }

  return L.geoJSON(geojson, {
    pane: paneName,
    interactive: false,
    style: (feature) => overlayStyle(kind, feature),
  });
}

async function ensureOverlayLoaded(layerId) {
  if (LAYER_META[layerId]?.kind !== "vector") return;
  if (state.overlayDataLoaded[layerId]) return;
  if (!layerHasData(layerId)) return;
  if (state.overlayFetchInFlight[layerId]) {
    return state.overlayFetchInFlight[layerId];
  }

  const url = String(
    state.overlayManifest?.[layerId]?.url
    || `/api/overlay/${encodeURIComponent(layerId)}`,
  );
  const label = LAYER_META[layerId]?.label || formatRawFieldLabel(layerId);
  state.layerLoadErrors[layerId] = null;

  const promise = (async () => {
    setStatus(`Loading ${label} layer ...`);
    const geojson = await fetchJson(url);
    state.overlayData[layerId] = geojson;
    state.overlayDataLoaded[layerId] = true;
    state.layerInstances[layerId] = createVectorLayer(layerId, geojson);

    if (layerId === "isos") {
      refreshHoverSchema("isos");
      buildIsosLayerColorMap();
      state.isosIconCache = {};
      state.isosRenderMode = currentIsosRenderMode();
    } else if (layerId === "bioregions") {
      buildBioregionColorMap();
      refreshHoverSchema("bioregions");
    }
  })()
    .catch((err) => {
      state.layerLoadErrors[layerId] = String(err.message || err || "Unknown error");
      state.layerVisibility[layerId] = false;
      throw err;
    })
    .finally(() => {
      state.overlayFetchInFlight[layerId] = null;
      renderLayerOrderControls();
      applyLayerOrderAndVisibility();
    });

  state.overlayFetchInFlight[layerId] = promise;
  renderLayerOrderControls();
  return promise;
}

function initializeLayerInstances() {
  state.layerInstances = {};
  state.layerOrder.forEach((layerId) => {
    const kind = LAYER_META[layerId]?.kind;
    if (kind === "bivariate") return;
    if (kind === "local_vector") {
      state.layerInstances[layerId] = createVectorLayer(layerId, state.bootstrap?.municipalities || null);
      return;
    }
    if (kind === "raster") {
      state.layerInstances[layerId] = createRasterLayer(layerId);
      return;
    }
    if (kind === "vector") {
      state.layerInstances[layerId] = createVectorLayer(layerId, overlayGeojson(layerId));
      return;
    }
    state.layerInstances[layerId] = null;
  });
}

function refreshOverlayTooltips(layerKey) {
  const overlayLayer = state.layerInstances[layerKey];
  if (!overlayLayer) return;
  overlayLayer.eachLayer((leaf) => {
    if (!leaf.feature) return;
    leaf.unbindTooltip();
    bindTooltipForLayer(layerKey, leaf.feature, leaf);
  });
}

function refreshTooltips(layerKey) {
  if (layerKey === "bivariate_municipalities") {
    refreshMunicipalityTooltips();
    return;
  }
  if (layerKey === "bioregions" || layerKey === "isos") {
    refreshOverlayTooltips(layerKey);
  }
}

function bivariateClassAriaLabel(biClass) {
  const [oldQRaw, tempQRaw] = String(biClass || "").split("-");
  const oldQ = Number(oldQRaw);
  const tempQ = Number(tempQRaw);
  const oldText = oldQ === 3 ? "high buildings" : oldQ === 2 ? "medium buildings" : "low buildings";
  const tempText = tempQ === 3 ? "high temperature" : tempQ === 2 ? "medium temperature" : "low temperature";
  return `${tempText}, ${oldText}`;
}

function toggleLegendClass(biClass) {
  const key = String(biClass || "");
  if (!key) return;
  if (state.legendSelectedClasses.has(key)) {
    state.legendSelectedClasses.delete(key);
  } else {
    state.legendSelectedClasses.add(key);
  }
  updateMunicipalityStyles();
  renderLayerStacks();
  if (el.autoUpdate.checked) {
    debounce(() => recompute(false), 350);
  }
}

function toggleMaterialHearthLegendGroup(groupCode) {
  const key = String(groupCode || "").trim();
  if (!key) return;
  if (state.legendSelectedMaterialHearthGroups.has(key)) {
    state.legendSelectedMaterialHearthGroups.delete(key);
  } else {
    state.legendSelectedMaterialHearthGroups.add(key);
  }
  updateMunicipalityStyles();
  renderLayerStacks();
}

function renderMaterialZoneLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;
  const options = state.buildingMaterialZoneOptions || [];
  if (!options.length) {
    mount.innerHTML = "<p class=\"layer-option-placeholder\">No material zone data available.</p>";
    return;
  }
  const exceptionalOnly = !!state.municipalityLegendExceptionalOnly;
  const coverage = exceptionalLegendCoverage();

  const rows = options
    .map((option) => {
      const zone = normalizeMaterialZoneNumber(option.zone_number);
      if (zone === null) return "";
      if (exceptionalOnly && (!coverage.hasAny || !coverage.materialZones.has(zone))) return "";
      const color = resolveMaterialZoneColor(zone);
      const label = materialZoneLabel(zone);
      return `
        <div class="material-legend-row">
          <span class="material-legend-swatch" style="background:${escapeHtml(color)}"></span>
          <span>${escapeHtml(label)} (${zone})</span>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  if (!rows) {
    mount.innerHTML = `
      ${municipalityLegendExceptionalToggleMarkup()}
      <p class="layer-option-placeholder">No legend members match current exceptional municipalities.</p>
    `;
    return;
  }

  mount.innerHTML = `
    ${municipalityLegendExceptionalToggleMarkup()}
    <div class="material-legend">
      ${rows}
    </div>
    <p class="legend-caption">Display colors show building material zones.</p>
  `;
}

function renderHearthZoneLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;
  const options = _uniqueLabels(state.hearthSystemZoneOptions || []);
  if (!options.length) {
    mount.innerHTML = "<p class=\"layer-option-placeholder\">No hearth zone data available.</p>";
    return;
  }
  const exceptionalOnly = !!state.municipalityLegendExceptionalOnly;
  const coverage = exceptionalLegendCoverage();

  const rows = options
    .map((label) => {
      const normalized = hearthZoneLabel(label);
      if (exceptionalOnly && (!coverage.hasAny || !coverage.hearthZones.has(normalized))) return "";
      const color = resolveHearthZoneColor(normalized);
      return `
        <div class="material-legend-row">
          <span class="material-legend-swatch" style="background:${escapeHtml(color)}"></span>
          <span>${escapeHtml(normalized)}</span>
        </div>
      `;
    })
    .join("");

  if (!rows) {
    mount.innerHTML = `
      ${municipalityLegendExceptionalToggleMarkup()}
      <p class="layer-option-placeholder">No legend members match current exceptional municipalities.</p>
    `;
    return;
  }

  mount.innerHTML = `
    ${municipalityLegendExceptionalToggleMarkup()}
    <div class="material-legend">
      ${rows}
    </div>
    <p class="legend-caption">Display colors show hearth system zones.</p>
  `;
}

function renderMaterialHearthLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;

  const entries = collectMaterialHearthLegendEntries();
  if (!entries.length) {
    mount.innerHTML = "<p class=\"layer-option-placeholder\">No material + hearth data available.</p>";
    return;
  }
  const exceptionalOnly = !!state.municipalityLegendExceptionalOnly;
  const coverage = exceptionalLegendCoverage();
  const filteredEntries = exceptionalOnly
    ? entries.filter((entry) => coverage.hasAny && coverage.materialHearthCodes.has(String(entry.code || "")))
    : entries;
  if (!filteredEntries.length) {
    mount.innerHTML = `
      ${municipalityLegendExceptionalToggleMarkup()}
      <p class="layer-option-placeholder">No legend members match current exceptional municipalities.</p>
    `;
    return;
  }

  const grouped = new Map();
  filteredEntries.forEach((entry) => {
    const zone = entry.zoneNumber;
    const groupKey = zone === null ? "zone-unspecified" : `zone-${zone}`;
    if (!grouped.has(groupKey)) {
      const heading = zone === null
        ? "Unspecified material"
        : `${entry.materialShort} (${zone})`;
      grouped.set(groupKey, { key: groupKey, zoneNumber: zone, heading, rows: [] });
    }
    grouped.get(groupKey).rows.push(entry);
  });

  const sections = [...grouped.values()]
    .sort((a, b) => {
      const az = a.zoneNumber === null ? Number.POSITIVE_INFINITY : Number(a.zoneNumber);
      const bz = b.zoneNumber === null ? Number.POSITIVE_INFINITY : Number(b.zoneNumber);
      if (az !== bz) return az - bz;
      return String(a.heading || "").localeCompare(String(b.heading || ""));
    })
    .map((group) => {
      const rows = group.rows
        .map((entry) => {
          const code = String(entry.code || "").trim();
          const active = state.legendSelectedMaterialHearthGroups.has(code) ? " is-active" : "";
          const color = resolveMaterialHearthZoneColor(code);
          return `
            <button
              type="button"
              class="material-legend-row material-legend-button material-hearth-legend-item${active}"
              data-material-hearth-group="${escapeHtml(code)}"
              aria-label="${escapeHtml(entry.label)} (${escapeHtml(code)}). Click to whiten matching municipalities."
              aria-pressed="${active ? "true" : "false"}"
              title="${escapeHtml(entry.label)} (${escapeHtml(code)}). Click to whiten matching municipalities."
            >
              <span class="material-legend-swatch" style="background:${escapeHtml(color)}"></span>
              <span>${escapeHtml(entry.hearthShort)} (${escapeHtml(code)})</span>
            </button>
          `;
        })
        .join("");
      return `
        <section class="material-hearth-legend-group">
          <h4>${escapeHtml(group.heading)}</h4>
          <div class="material-hearth-legend-items">
            ${rows}
          </div>
        </section>
      `;
    })
    .join("");

  mount.innerHTML = `
    ${municipalityLegendExceptionalToggleMarkup()}
    <div class="material-legend">
      ${sections}
    </div>
    <p class="legend-caption">Click groups to whiten matching municipalities (visual only).</p>
  `;

  [...mount.querySelectorAll("button[data-material-hearth-group]")].forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleMaterialHearthLegendGroup(btn.dataset.materialHearthGroup);
    });
  });
}

function renderMunicipalityLegend(targetNode = null) {
  const mode = normalizeMunicipalityDisplayMode(state.municipalityDisplayMode);
  if (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL) {
    renderMaterialZoneLegend(targetNode);
    return;
  }
  if (mode === MUNICIPALITY_DISPLAY_MODES.HEARTH) {
    renderHearthZoneLegend(targetNode);
    return;
  }
  if (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL_HEARTH) {
    renderMaterialHearthLegend(targetNode);
    return;
  }
  renderLegend(targetNode);
}

function renderLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;
  const exceptionalOnly = !!state.municipalityLegendExceptionalOnly;
  const coverage = exceptionalLegendCoverage();

  const classColor = {};
  Object.values(state.records).forEach((r) => {
    if (r.bi_class && r.bi_color) classColor[r.bi_class] = r.bi_color;
  });
  const visibleClasses = DIAMOND_LEGEND_ORDER.filter((biClass) => {
    if (!exceptionalOnly) return true;
    return coverage.hasAny && coverage.biClasses.has(biClass);
  });
  if (!visibleClasses.length) {
    mount.innerHTML = `
      ${municipalityLegendExceptionalToggleMarkup()}
      <p class="layer-option-placeholder">No legend members match current exceptional municipalities.</p>
    `;
    return;
  }

  const cellsHtml = visibleClasses
    .map((biClass) => {
      const [gridRow, gridCol] = DIAMOND_LEGEND_COORDS[biClass] || [3, 3];
      const color = classColor[biClass] || FALLBACK_FILL;
      const active = state.legendSelectedClasses.has(biClass) ? " is-active" : "";
      const aria = bivariateClassAriaLabel(biClass);
      return `
        <button
          type="button"
          class="diamond-cell${active}"
          data-bi-class="${escapeHtml(biClass)}"
          aria-label="Bivariate class ${escapeHtml(biClass)} (${escapeHtml(aria)}). Click to whiten and exclude from Stage 1."
          aria-pressed="${active ? "true" : "false"}"
          title="${escapeHtml(biClass)}: ${escapeHtml(aria)}. Click to whiten and exclude from Stage 1."
          style="background:${escapeHtml(color)}; --grid-row:${gridRow}; --grid-col:${gridCol};"
        >
          <span class="sr-only">${escapeHtml(biClass)}</span>
        </button>
      `;
    })
    .join("");

  mount.innerHTML = `
    ${municipalityLegendExceptionalToggleMarkup()}
    <div class="diamond-legend">
      <div class="diamond-corner diamond-top">High Temperature<br>High Buildings</div>
      <div class="diamond-corner diamond-right">High Temperature<br>Low Buildings</div>
      <div class="diamond-corner diamond-bottom">Low Temperature<br>Low Buildings</div>
      <div class="diamond-corner diamond-left">Low Temperature<br>High Buildings</div>
      <div class="diamond-center" role="group" aria-label="Bivariate class selection">
        ${cellsHtml}
      </div>
    </div>
    <p class="legend-caption">Clicked bivariate classes are whitened and excluded from Stage 1.</p>
  `;

  [...mount.querySelectorAll("button[data-bi-class]")].forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleLegendClass(btn.dataset.biClass);
    });
  });
}

function renderExceptionalPlaces(listNode = null, countNode = null) {
  const listMount = listNode;
  const countMount = countNode;
  const selectedCount = state.exceptional.size;
  const totalCount = state.exceptionalStage1.size;
  if (countMount) {
    countMount.textContent = totalCount > 0 ? `${selectedCount} / ${totalCount}` : "0";
  }
  if (!listMount) return;

  if (totalCount === 0) {
    listMount.innerHTML = "<p class=\"exceptional-empty\">No exceptional places for current filters.</p>";
    return;
  }

  const groups = groupedExceptionalRows();
  const groupMarkup = groups
    .map((group) => {
      const groupSelected = group.rows.filter((row) => row.status === "selected").length;
      const groupTotal = group.rows.length;
      const groupTitle = String(group.title || "Group");
      const items = group.rows
        .map(({ bfs, label, status, climateRiskScore }) => {
          const statusClass = status === "selected"
            ? "is-selected"
            : (status === "missing" ? "is-missing" : "is-filtered-out");
          const badgeText = status === "selected"
            ? "Selected"
            : (status === "missing" ? "No climate data" : "Filtered out");
          const riskText = Number.isFinite(Number(climateRiskScore))
            ? Number(climateRiskScore).toFixed(2)
            : "N/A";
          return `
            <li class="exceptional-item ${statusClass}">
              <span class="exceptional-label">${escapeHtml(label)} [${escapeHtml(bfs)}]</span>
              <span class="exceptional-meta">Climate risk score: ${escapeHtml(riskText)}</span>
              <span class="exceptional-badge">${escapeHtml(badgeText)}</span>
            </li>
          `;
        })
        .join("");

      return `
        <section class="exceptional-group">
          <header class="exceptional-group-head">
            <h4>${escapeHtml(groupTitle)}</h4>
            <span>${groupSelected} / ${groupTotal}</span>
          </header>
          <ul class="exceptional-list">${items}</ul>
        </section>
      `;
    })
    .join("");

  listMount.innerHTML = `<div class="exceptional-groups">${groupMarkup}</div>`;
}

function buildIsosLayerColorMap() {
  state.isosLayerColorMap = {};
  const features = overlayGeojson("isos")?.features || [];
  features.forEach((feature) => {
    const layerName = String(feature?.properties?.layer ?? "").trim() || "Unknown";
    resolveIsosLayerColor(layerName);
  });
}

function renderIsosLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;
  if (!state.overlayDataLoaded.isos) {
    if (state.layerLoadErrors.isos) {
      mount.innerHTML = "<p class=\"layer-option-placeholder\">Unable to load ISOS legend.</p>";
      return;
    }
    mount.innerHTML = "<p class=\"layer-option-placeholder\">Loading ISOS legend ...</p>";
    return;
  }

  const features = overlayGeojson("isos")?.features || [];
  if (features.length === 0) {
    mount.innerHTML = "";
    return;
  }

  const seenCodes = new Set();
  const seenLayers = new Set();
  features.forEach((feature) => {
    const props = feature?.properties || {};
    seenCodes.add(normalizeMarkerCode(props));
    seenLayers.add(String(props.layer ?? "").trim() || "Unknown");
  });

  const markerOrder = ["s", "^", "D", "o", "v", "p", "x"];
  const markerRows = markerOrder
    .filter((code) => seenCodes.has(code))
    .map((code) => {
      const label = formatRawFieldLabel(ISOS_MARKER_LABELS[code] || "unknown");
      const icon = buildIsosSvg(code, 5.6, "#9a9a9a", false);
      return `<div class="isos-legend-row"><span class="isos-legend-symbol">${icon}</span><span>${escapeHtml(label)}</span></div>`;
    })
    .join("");

  const layerRows = [...seenLayers]
    .sort((a, b) => a.localeCompare(b))
    .map((layerName) => {
      const color = resolveIsosLayerColor(layerName);
      return `<div class="isos-legend-row"><span class="isos-layer-swatch" style="background:${escapeHtml(color)}"></span><span>${escapeHtml(layerName)}</span></div>`;
    })
    .join("");

  const sizeRows = Object.entries(ISOS_BIN_SIZES)
    .map(([label, rawSize]) => {
      const icon = buildIsosSvg("o", mapMarkerSizeToPixels(rawSize), "#9a9a9a", false);
      return `<div class="isos-legend-row"><span class="isos-legend-symbol">${icon}</span><span>${escapeHtml(label)}</span></div>`;
    })
    .join("");

  mount.innerHTML = `
    <div class="isos-legend">
      <h3>ISOS Symbols</h3>
      <div class="isos-legend-section">
        <h4>Layer</h4>
        ${layerRows}
      </div>
      <div class="isos-legend-section">
        <h4>Settlement Category</h4>
        ${markerRows}
      </div>
      <div class="isos-legend-section">
        <h4>Quality Score</h4>
        ${sizeRows}
      </div>
    </div>
  `;
}

function renderCantonsLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;

  const checked = state.cantonsColorMode ? " checked" : "";
  const toggleMarkup = `
    <label class="cantons-color-toggle">
      <input type="checkbox" data-canton-color-mode${checked}>
      <span>Use canton colormap</span>
    </label>
  `;

  if (!state.overlayDataLoaded.cantons) {
    if (state.layerLoadErrors.cantons) {
      mount.innerHTML = `
        <div class="cantons-legend">
          ${toggleMarkup}
          <p class="layer-option-placeholder">Unable to load canton legend.</p>
        </div>
      `;
      return;
    }
    mount.innerHTML = `
      <div class="cantons-legend">
        ${toggleMarkup}
        <p class="layer-option-placeholder">Loading canton data ...</p>
      </div>
    `;
    return;
  }

  if (!state.cantonsColorMode) {
    mount.innerHTML = `
      <div class="cantons-legend">
        ${toggleMarkup}
        <p class="layer-legend-compact">Canton boundary line overlay in grayscale.</p>
      </div>
    `;
    return;
  }

  const rows = cantonLegendEntries()
    .map((entry) => (
      `<div class="cantons-legend-row">
        <span class="cantons-legend-swatch" style="background:${escapeHtml(entry.color)}"></span>
        <span>${escapeHtml(entry.name)} (${entry.cantonNumber})</span>
      </div>`
    ))
    .join("");

  mount.innerHTML = `
    <div class="cantons-legend">
      ${toggleMarkup}
      <div class="cantons-legend-list">
        ${rows || "<p class=\"layer-option-placeholder\">No canton entries available.</p>"}
      </div>
    </div>
  `;
}

function renderBioregionLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;
  if (!state.overlayDataLoaded.bioregions) {
    if (state.layerLoadErrors.bioregions) {
      mount.innerHTML = "<p class=\"layer-option-placeholder\">Unable to load bioregion legend.</p>";
      return;
    }
    mount.innerHTML = "<p class=\"layer-option-placeholder\">Loading bioregion legend ...</p>";
    return;
  }

  const features = overlayGeojson("bioregions")?.features || [];
  if (features.length === 0) {
    mount.innerHTML = "";
    return;
  }

  const seen = new Set();
  const orderedKeys = [];
  features.forEach((feature) => {
    const key = bioregionKeyFromProps(feature?.properties || {});
    if (seen.has(key)) return;
    seen.add(key);
    orderedKeys.push(key);
    resolveBioregionColor(key);
  });

  const rows = orderedKeys
    .map((key) => {
      const color = resolveBioregionColor(key);
      return `
        <div class="bioregion-legend-row">
          <span class="bioregion-swatch" style="--bioregion-color:${escapeHtml(color)}"></span>
          <span>${escapeHtml(key)}</span>
        </div>
      `;
    })
    .join("");

  mount.innerHTML = `<div class="bioregion-legend">${rows}</div>`;
}

function renderMunicipalities(fitBounds = false) {
  if (state.muniLayer) {
    if (state.map.hasLayer(state.muniLayer)) {
      state.map.removeLayer(state.muniLayer);
    }
    state.muniLayer = null;
  }

  state.muniLayer = L.geoJSON(state.bootstrap.municipalities, {
    pane: layerPaneName("bivariate_municipalities"),
    interactive: true,
    style: muniStyle,
    onEachFeature: (feature, layer) => {
      bindTooltipForLayer("bivariate_municipalities", feature, layer, municipalityDataObject(feature));
      layer.on("click", () => {
        openMunicipalityModalFromFeature(feature);
      });
    },
  });
  state.layerInstances.bivariate_municipalities = state.muniLayer;

  if (fitBounds) {
    state.map.fitBounds(state.muniLayer.getBounds(), { padding: [20, 20] });
  }
  applyLayerOrderAndVisibility();
}

function updateMunicipalityStyles() {
  if (!state.muniLayer) return;
  state.muniLayer.setStyle(muniStyle);
  bringExceptionalMunicipalityOutlinesToFront();
  refreshMunicipalityTooltips();
}

function refreshBioregionStyles() {
  const bioregionLayer = state.layerInstances.bioregions;
  if (!bioregionLayer) return;
  if (!state.map?.hasLayer(bioregionLayer)) return;

  if (!ensureBioregionPatternDefs()) return;

  bioregionLayer.eachLayer((leaf) => {
    const feature = leaf.feature || {};
    const regionKey = bioregionKeyFromProps(feature.properties || {});
    leaf.setStyle(bioregionStyle(feature, false));
    applyBioregionPattern(leaf, regionKey, false);
  });
}

function applyLayerOrderAndVisibility() {
  if (!state.map) return;

  sanitizeLayerVisibility();
  ensureLayerOpacityDefaults();
  ensureLayerPanes();
  applyLayerPaneOrder();

  state.layerOrder.forEach((layerId) => {
    const kind = LAYER_META[layerId]?.kind;
    const shouldShow = !!state.layerVisibility[layerId];
    if (kind === "vector" && shouldShow && !state.overlayDataLoaded[layerId]) {
      ensureOverlayLoaded(layerId).catch((err) => {
        setStatus(`Failed loading ${LAYER_META[layerId]?.label || layerId}: ${err.message}`);
      });
      return;
    }

    const layer = getLayerInstance(layerId);
    if (!layer) return;
    const has = state.map.hasLayer(layer);
    if (shouldShow && !has) {
      layer.addTo(state.map);
    } else if (!shouldShow && has) {
      state.map.removeLayer(layer);
    }
  });

  if (state.layerVisibility.isos) {
    maybeRefreshIsosRenderMode();
  } else {
    if (state.isosZoomSettleHandle) {
      clearTimeout(state.isosZoomSettleHandle);
      state.isosZoomSettleHandle = null;
    }
    state.map.getContainer().style.removeProperty("cursor");
  }

  if (state.layerVisibility.bioregions) {
    refreshBioregionStyles();
  }

  if (state.layerVisibility.bivariate_municipalities && state.muniLayer && state.map.hasLayer(state.muniLayer)) {
    bringExceptionalMunicipalityOutlinesToFront();
    refreshMunicipalityTooltips();
  }

  applyConfiguredLayerOpacities();
  renderLayerStacks();
}

function initHeatingControls(options = [], defaults = []) {
  const defaultSet = new Set((defaults || []).map(String));
  const html = options
    .map((opt) => {
      const checked = defaultSet.has(String(opt.code)) ? "checked" : "";
      return `<label><input type="checkbox" value="${opt.code}" ${checked}/> ${opt.label}</label>`;
    })
    .join("");
  el.heatingList.innerHTML = html || "<small>No heating options available</small>";

  el.heatingList.querySelectorAll("input[type='checkbox']").forEach((node) => {
    node.addEventListener("change", () => {
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });
}

function initMap() {
  state.map = L.map("map", {
    zoomControl: true,
    zoomAnimation: true,
    markerZoomAnimation: true,
    fadeAnimation: true,
  });
  ensureLayerPanes();
  applyLayerPaneOrder();

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 19,
  }).addTo(state.map);

  state.map.on("zoomstart", () => {
    state.isZoomingMap = true;
    if (state.layerVisibility.isos) {
      maybeRefreshIsosRenderMode("simple");
    }
  });

  state.map.on("zoomend", () => {
    state.isZoomingMap = false;
    if (state.layerVisibility.isos) {
      scheduleIsosModeRefresh(220);
    }
  });
}

async function fetchJson(url, options = undefined) {
  const response = await fetch(url, options);
  if (response.status === 304) {
    const retry = await fetch(url, { ...(options || {}), cache: "force-cache" });
    if (!retry.ok) {
      const text = await retry.text();
      throw new Error(`${retry.status} ${retry.statusText}: ${text}`);
    }
    return retry.json();
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}

async function waitUntilReady(maxMs = 180000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const h = await fetchJson("/health");
      if (h.warning) {
        state.healthWarning = h.warning;
      }
      if (h.error) {
        throw new Error(h.error);
      }
      if (h.ready) {
        return;
      }
      setLoaderStage("Preparing datasets", "Building server-side caches ...");
      setStatus("Loading datasets ...");
    } catch (err) {
      if (String(err.message || "").length > 0 && !String(err.message).includes("503")) {
        throw err;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Startup timeout while waiting for data loading");
}

async function recompute(isInitial = false, rethrowOnError = false) {
  try {
    setStatus("Updating map ...");
    const payload = currentPayload();
    const data = await fetchJson("/api/recompute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    state.records = data.records || {};
    buildMaterialHearthZoneColorMap();
    const validMaterialHearthCodes = new Set(Object.keys(state.materialHearthZoneColorMap));
    state.legendSelectedMaterialHearthGroups = new Set(
      [...state.legendSelectedMaterialHearthGroups].filter((code) => validMaterialHearthCodes.has(code)),
    );
    state.exceptional = new Set((data.exceptional_ids || []).map(String));
    state.exceptionalStage1 = new Set((data.stage1_exceptional_ids || []).map(String));
    state.climateStageStatus = data.climate_stage_status || {};
    state.lastClimateStats = data.stats || {};
    state.climateStageEnabled = !!state.lastClimateStats.climate_stage_enabled;

    refreshHoverSchema("bivariate_municipalities");

    if (isInitial) {
      renderMunicipalities(true);
    } else {
      updateMunicipalityStyles();
    }

    applyLayerOrderAndVisibility();

    const n = Object.keys(state.records).length;
    const e = state.exceptional.size;
    const stage1 = state.exceptionalStage1.size;
    const stage1BaseExceptional = Number(state.lastClimateStats.stage1_exceptional_count ?? stage1);
    const stage2ComboFiltered = Number(
      state.lastClimateStats.stage2_combo_filtered_count
      ?? state.lastClimateStats.stage2_material_filtered_count
      ?? stage1,
    );
    const stage1CandidateAfterFilter = Number(state.lastClimateStats.stage1_candidate_record_count_after_filter ?? n);
    const stage1CandidateExcluded = Number(state.lastClimateStats.stage1_candidate_record_excluded_count ?? 0);
    const hasStage1ClassExclusion = stage1CandidateExcluded > 0;
    const stage2FilterEnabled = !!(
      state.lastClimateStats.stage2_combo_filter_enabled
      ?? state.lastClimateStats.stage2_material_filter_enabled
    );
    const stage4PriorityEnabled = !!state.lastClimateStats.stage4_climate_priority_enabled;
    if (Object.prototype.hasOwnProperty.call(state.lastClimateStats, "apply_material_hearth_filter")) {
      state.applyMaterialHearthFilter = !!state.lastClimateStats.apply_material_hearth_filter;
    } else if (Object.prototype.hasOwnProperty.call(state.lastClimateStats, "apply_material_filter")) {
      state.applyMaterialHearthFilter = !!state.lastClimateStats.apply_material_filter;
    }
    if (Object.prototype.hasOwnProperty.call(state.lastClimateStats, "apply_climate_priority")) {
      state.applyClimatePriority = !!state.lastClimateStats.apply_climate_priority;
    }

    let prefix = "";
    if (stage2FilterEnabled) {
      prefix = `${n} municipalities, ${stage2ComboFiltered} exceptional after material + hearth top-3 (from ${stage1BaseExceptional})`;
    } else if (hasStage1ClassExclusion) {
      prefix = `${n} municipalities, ${stage1} exceptional from ${stage1CandidateAfterFilter} class-filtered candidates`;
    } else {
      prefix = `${n} municipalities, ${stage1} exceptional after bivariate class filter`;
    }

    if (stage4PriorityEnabled) {
      setStatus(`${prefix}, ${e} climate-priority`);
    } else {
      setStatus(prefix);
    }
    if (state.compareModalOpen) {
      renderCompareModal();
    }
  } catch (err) {
    setStatus(`Error: ${err.message}`);
    console.error(err);
    if (rethrowOnError) {
      throw err;
    }
  }
}

function wireAutoUpdateEvents() {
  const triggerNodes = [
    el.season,
    el.tempMethod,
    el.nonHabitable,
    el.kTemp,
    el.kOld,
  ].filter(Boolean);

  triggerNodes.forEach((node) => {
    node.addEventListener("change", () => {
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
    node.addEventListener("input", () => {
      if (el.autoUpdate.checked && (node === el.kTemp || node === el.kOld)) {
        debounce(() => recompute(false), 350);
      }
    });
  });

  el.updateBtn.addEventListener("click", () => recompute(false));
}

async function boot() {
  if (el.loaderRetry) {
    el.loaderRetry.classList.add("hidden");
    el.loaderRetry.addEventListener("click", () => window.location.reload());
  }
  setLoaderHint("");

  try {
    setLoaderStage("Checking server", "Contacting backend ...");
    state.bootHintTimer = setTimeout(() => {
      setLoaderHint("Still preparing data. First cold start can take a while on PythonAnywhere.");
    }, 10000);

    setStatus("Checking server ...");
    await waitUntilReady();
    setLoaderStage("Loading core map", "Fetching bootstrap payload ...");
    setStatus("Loading bootstrap data ...");
    state.bootstrap = await fetchJson("/api/bootstrap");

    const defaults = state.bootstrap.controls?.defaults || {};
    const options = state.bootstrap.controls || {};
    state.overlayManifest = state.bootstrap.overlay_manifest || {};
    state.overlayData = {};
    state.overlayDataLoaded = {};
    state.overlayFetchInFlight = {};
    state.layerLoadErrors = {};

    const preloadedOverlays = state.bootstrap.overlays || {};
    Object.keys(LAYER_META).forEach((layerId) => {
      if (LAYER_META[layerId]?.kind !== "vector") return;
      const payload = preloadedOverlays[layerId];
      const hasFeatures = !!(payload?.features && Array.isArray(payload.features) && payload.features.length > 0);
      if (hasFeatures) {
        state.overlayData[layerId] = payload;
        state.overlayDataLoaded[layerId] = true;
      } else {
        state.overlayDataLoaded[layerId] = false;
      }
      state.overlayFetchInFlight[layerId] = null;
      state.layerLoadErrors[layerId] = null;
    });

    state.layerOrder = sanitizeLayerOrder(defaults.layer_order || LAYER_DEFAULT_ORDER);
    state.layerVisibility = defaultLayerVisibility(defaults);
    sanitizeLayerVisibility();

    initMap();

    el.season.value = defaults.season || "annual";
    el.tempMethod.value = defaults.temp_method || "mean-range";
    el.nonHabitable.checked = defaults.exclude_non_habitable !== false;
    el.autoUpdate.checked = defaults.auto_update !== false;
    el.kTemp.value = String(defaults.k_temp ?? 1.0);
    el.kOld.value = String(defaults.k_old ?? 1.0);
    state.climateIndicatorOptions = Array.isArray(options.climate_indicator_options) ? options.climate_indicator_options : [];
    const availableClimateKeys = new Set(
      (state.climateIndicatorOptions || [])
        .map((opt) => String(opt?.key || "").trim())
        .filter(Boolean),
    );
    const preferredDefaults = CLIMATE_DEFAULT_INDICATOR_KEYS.filter((key) => availableClimateKeys.has(key));
    const bootstrapDefaults = (defaults.climate_indicator_keys || [])
      .map((key) => String(key || "").trim())
      .filter((key) => availableClimateKeys.has(key));
    state.selectedClimateIndicators = new Set(
      preferredDefaults.length ? preferredDefaults : bootstrapDefaults,
    );
    state.climateTopSharePct = normalizeClimateTopShare(defaults.climate_top_share_pct ?? 25);
    state.municipalityDisplayMode = normalizeMunicipalityDisplayMode(defaults.municipality_display_mode);
    state.buildingMaterialZoneOptions = Array.isArray(options.building_material_zone_options)
      ? options.building_material_zone_options
          .map((item) => ({
            zone_number: normalizeMaterialZoneNumber(item.zone_number),
            zone_label: String(item.zone_label || "").trim(),
          }))
          .filter((item) => item.zone_number !== null)
      : [];
    state.materialHearthZoneOptions = Array.isArray(options.material_hearth_zone_options)
      ? _uniqueLabels(
          options.material_hearth_zone_options.map((item) => {
            if (typeof item === "string") return item;
            return item?.zone_code;
          }),
        ).map((zoneCode) => ({ zone_code: zoneCode }))
      : [];
    const availableMaterialHearthCodes = new Set(
      state.materialHearthZoneOptions
        .map((item) => String(item.zone_code || "").trim())
        .filter(Boolean),
    );
    state.selectedMaterialHearthZones = new Set(
      _uniqueLabels(defaults.selected_material_hearth_zones || [])
        .filter((code) => availableMaterialHearthCodes.has(code)),
    );
    state.hearthSystemZoneOptions = Array.isArray(options.hearth_system_zone_options)
      ? _uniqueLabels(
          options.hearth_system_zone_options.map((item) => {
            if (typeof item === "string") return item;
            return item?.zone_label;
          }),
        )
      : [];
    if (Object.prototype.hasOwnProperty.call(defaults, "apply_material_hearth_filter")) {
      state.applyMaterialHearthFilter = defaults.apply_material_hearth_filter !== false;
    } else {
      state.applyMaterialHearthFilter = defaults.apply_material_filter !== false;
    }
    state.applyClimatePriority = defaults.apply_climate_priority !== false;
    buildMaterialZoneColorMap();
    buildHearthZoneColorMap();
    buildMaterialHearthZoneColorMap();

    if (Array.isArray(options.temperature_methods) && options.temperature_methods.length) {
      el.tempMethod.innerHTML = options.temperature_methods
        .map((m) => `<option value="${m}">${m}</option>`)
        .join("");
      el.tempMethod.value = defaults.temp_method || options.temperature_methods[0];
    }

    initHeatingControls(options.heating_options || [], defaults.excluded_heating_types || []);

    if (state.overlayDataLoaded.isos) {
      refreshHoverSchema("isos");
      buildIsosLayerColorMap();
    }
    if (state.overlayDataLoaded.bioregions) {
      refreshHoverSchema("bioregions");
      buildBioregionColorMap();
    }
    state.isosIconCache = {};
    state.isosRenderMode = currentIsosRenderMode();
    ensureLayerOpacityDefaults();

    initializeLayerInstances();
    wireTopRowNav();
    renderLayerOrderControls();
    applyLayerOrderAndVisibility();
    wireAutoUpdateEvents();
    wireMunicipalityModalEvents();
    wireCompareModalEvents();
    renderCompareLauncher();

    setLoaderStage("Computing municipality featured classes", "Calculating initial map values ...");
    await recompute(true, true);
    maybeOpenMunicipalityModalFromQuery();

    setLoaderStage("Ready", "Map loaded.");
    setLoaderHint("");
    hideLoader();
  } catch (err) {
    setStatus(`Bootstrap error: ${err.message}`);
    showLoaderError(String(err.message || err));
    console.error(err);
  } finally {
    if (state.bootHintTimer) {
      clearTimeout(state.bootHintTimer);
      state.bootHintTimer = null;
    }
  }
}

boot();
