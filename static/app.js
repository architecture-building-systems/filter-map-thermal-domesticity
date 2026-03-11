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
  municipalityDisplayMode: "bivariate",
  buildingMaterialZoneOptions: [],
  selectedBuildingMaterialZones: new Set(),
  hearthSystemZoneOptions: [],
  selectedHearthSystemZones: new Set(),
  materialZoneColorMap: {},
  hearthZoneColorMap: {},
  applyMaterialFilter: true,
  applyHearthFilter: true,
  applyClimatePriority: true,
  climateIndicatorScrollTop: 0,
  municipalityOptionsScrollTop: 0,
  materialZoneScrollTop: 0,
  hearthZoneScrollTop: 0,
  analysisStackOpenClimateMain: false,
  analysisStackOpenClimateLegend: false,
  analysisStackOpenExceptional: false,
  analysisStackOpenExceptionalInfo: false,
  legendSelectedClasses: new Set(),
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
  healthWarning: "",
  isosLayerColorMap: {},
  isosIconCache: {},
  isosRenderMode: "symbol",
  isosZoomSettleHandle: null,
  isZoomingMap: false,
  bootHintTimer: null,
  topRowNavWired: false,
  cantonsColorMode: false,
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
  bivariate_municipalities: ["name", "canton_name", "temp", "pct_old1919", "bi_class"],
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
  municipalityModalTitle: document.getElementById("municipality-modal-title"),
  municipalityModalMeta: document.getElementById("municipality-modal-meta"),
  municipalityModalTabs: document.getElementById("municipality-modal-tabs"),
  municipalityModalState: document.getElementById("municipality-modal-state"),
  municipalityModalContent: document.getElementById("municipality-modal-content"),
  municipalityModalMap: document.getElementById("municipality-modal-map"),
  municipalityModalGeochips: document.getElementById("municipality-modal-geochips"),
};

function setStatus(msg) {
  const warning = state.healthWarning ? ` | ${state.healthWarning}` : "";
  el.status.textContent = `${msg}${warning}`;
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

function selectedMaterialZoneNumbersArray() {
  return [...state.selectedBuildingMaterialZones]
    .map((v) => normalizeMaterialZoneNumber(v))
    .filter((v) => v !== null);
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

function selectedHearthSystemZonesArray() {
  return _uniqueLabels([...state.selectedHearthSystemZones]);
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

function municipalityTabMarkup(profile, tabId) {
  if (tabId === "overview") return buildMunicipalityOverviewTab(profile);
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
  document.body.classList.add("modal-open");

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
  state.municipalityModalOpen = false;
  state.municipalityModalProfileLoading = false;
  state.municipalityModalProfileError = "";
  state.municipalityModalProfileData = null;
  state.municipalityModalSelectedBfs = null;
  renderMunicipalityModal();
  setMunicipalityQueryParam(null);
  document.body.classList.remove("modal-open");
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
    selected_building_material_zone_numbers: selectedMaterialZoneNumbersArray(),
    selected_hearth_system_zones: selectedHearthSystemZonesArray(),
    apply_material_filter: !!state.applyMaterialFilter,
    apply_hearth_filter: !!state.applyHearthFilter,
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
  const title = state.layerDisplayNames[layerKey] || layerKey;
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
      const zoneOptions = (state.buildingMaterialZoneOptions || [])
        .map((option) => {
          const zoneNumber = normalizeMaterialZoneNumber(option.zone_number);
          if (zoneNumber === null) return "";
          const checked = state.selectedBuildingMaterialZones.has(zoneNumber) ? " checked" : "";
          const zoneLabel = String(option.zone_label || `Zone ${zoneNumber}`);
          return `
            <label>
              <input type="checkbox" data-material-zone="${zoneNumber}"${checked}>
              <span>${escapeHtml(zoneLabel)} (${zoneNumber})</span>
            </label>
          `;
        })
        .filter(Boolean)
        .join("");
      const hearthOptions = (state.hearthSystemZoneOptions || [])
        .map((label) => {
          const normalized = String(label || "").trim();
          if (!normalized) return "";
          const checked = state.selectedHearthSystemZones.has(normalized) ? " checked" : "";
          return `
            <label>
              <input type="checkbox" data-hearth-zone="${escapeHtml(normalized)}"${checked}>
              <span>${escapeHtml(normalized)}</span>
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
            </select>
          </label>
          <div class="field-option-toolbar">
            <p class="field-option-summary">${state.selectedBuildingMaterialZones.size} zone${state.selectedBuildingMaterialZones.size === 1 ? "" : "s"} selected</p>
            <button type="button" class="field-option-action" data-clear-material-zones>Clear all</button>
          </div>
          <div class="material-zone-fields" data-material-zone-scroll>
            ${zoneOptions || "<label>No material zones available</label>"}
          </div>
          <div class="field-option-toolbar">
            <p class="field-option-summary">${state.selectedHearthSystemZones.size} hearth group${state.selectedHearthSystemZones.size === 1 ? "" : "s"} selected</p>
            <button type="button" class="field-option-action" data-clear-hearth-zones>Clear all</button>
          </div>
          <div class="material-zone-fields" data-hearth-zone-scroll>
            ${hearthOptions || "<label>No hearth zones available</label>"}
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
    ? "Stage 4 climate prioritization is toggled off."
    : (!selectionDisabled && state.climateStageEnabled
      ? `Selecting the top ${normalizeClimateTopShare(state.climateTopSharePct)}% within each hearth group from Stage 3 exceptional municipalities.`
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
  const materialChecked = state.applyMaterialFilter ? " checked" : "";
  const hearthChecked = state.applyHearthFilter ? " checked" : "";
  const climateChecked = state.applyClimatePriority ? " checked" : "";
  return `
    <div class="climate-risk-info">
      <p>Exceptional places are selected in four stages.</p>
      <p><strong>Stage 1:</strong> Municipality Featured Filter identifies exceptional municipalities from temperature and old-building thresholds.</p>
      <p><strong>Stage 2:</strong> If selected, material groups are reduced to the top 3 per group by Stage 1 severity.</p>
      <p><strong>Stage 3:</strong> If selected, hearth groups are reduced to the top 3 per group by Stage 1 severity.</p>
      <p><strong>Stage 4:</strong> Climate prioritization ranks each remaining hearth group separately and keeps the top share within each hearth group.</p>
      <div class="flow-toggle-list">
        <label><input type="checkbox" data-stage-toggle="material"${materialChecked}> Apply Stage 2 (Material filter)</label>
        <label><input type="checkbox" data-stage-toggle="hearth"${hearthChecked}> Apply Stage 3 (Hearth filter)</label>
        <label><input type="checkbox" data-stage-toggle="climate"${climateChecked}> Apply Stage 4 (Climate prioritization)</label>
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

function exceptionalGroupingMode() {
  const materialOn = !!state.applyMaterialFilter;
  const hearthOn = !!state.applyHearthFilter;
  if (materialOn && hearthOn) return "material_hearth";
  if (materialOn) return "material";
  if (hearthOn) return "hearth";
  return "all";
}

function groupedExceptionalRows() {
  const rows = collectExceptionalRows();
  const mode = exceptionalGroupingMode();
  if (!rows.length) return [];

  if (mode === "all") {
    return [
      {
        key: "all",
        title: "All Stage 1 Exceptional Places",
        rows: sortExceptionalRows(rows),
      },
    ];
  }

  const groupsByKey = new Map();
  if (mode === "material") {
    rows.forEach((row) => {
      const key = row.zoneNumber === null ? "zone-missing" : `zone-${row.zoneNumber}`;
      if (!groupsByKey.has(key)) {
        groupsByKey.set(key, {
          key,
          zoneNumber: row.zoneNumber,
          title: row.zoneNumber === null ? "Unspecified Zone" : `${row.zoneLabel} (${row.zoneNumber})`,
          rows: [],
        });
      }
      groupsByKey.get(key).rows.push(row);
    });

    const orderedZoneNumbers = (state.buildingMaterialZoneOptions || [])
      .map((opt) => normalizeMaterialZoneNumber(opt.zone_number))
      .filter((v) => v !== null);

    const groups = [];
    const seen = new Set();
    orderedZoneNumbers.forEach((zoneNumber) => {
      const key = `zone-${zoneNumber}`;
      const group = groupsByKey.get(key);
      if (!group) return;
      group.rows = sortExceptionalRows(group.rows);
      groups.push(group);
      seen.add(key);
    });

    [...groupsByKey.keys()]
      .filter((key) => !seen.has(key))
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        const group = groupsByKey.get(key);
        if (!group) return;
        group.rows = sortExceptionalRows(group.rows);
        groups.push(group);
      });
    return groups;
  }

  if (mode === "hearth") {
    rows.forEach((row) => {
      const hearth = hearthZoneLabel(row.hearthSystemZone);
      const key = hearth ? `hearth-${hearth}` : "hearth-missing";
      if (!groupsByKey.has(key)) {
        groupsByKey.set(key, {
          key,
          hearth,
          title: hearth || "Unspecified Hearth",
          rows: [],
        });
      }
      groupsByKey.get(key).rows.push(row);
    });

    const orderedHearth = _uniqueLabels(state.hearthSystemZoneOptions || []);
    const groups = [];
    const seen = new Set();
    orderedHearth.forEach((label) => {
      const hearth = hearthZoneLabel(label);
      const key = `hearth-${hearth}`;
      const group = groupsByKey.get(key);
      if (!group) return;
      group.rows = sortExceptionalRows(group.rows);
      groups.push(group);
      seen.add(key);
    });

    [...groupsByKey.keys()]
      .filter((key) => !seen.has(key))
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        const group = groupsByKey.get(key);
        if (!group) return;
        group.rows = sortExceptionalRows(group.rows);
        groups.push(group);
      });
    return groups;
  }

  // material_hearth mode
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
  const materialZoneScrollNode = el.hoverPillRow.querySelector("[data-material-zone-scroll]");
  if (materialZoneScrollNode) {
    state.materialZoneScrollTop = materialZoneScrollNode.scrollTop;
  }
  const hearthZoneScrollNode = el.hoverPillRow.querySelector("[data-hearth-zone-scroll]");
  if (hearthZoneScrollNode) {
    state.hearthZoneScrollTop = hearthZoneScrollNode.scrollTop;
  }

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
              : "Hearth System Zone Legend"))
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

  [...el.hoverPillRow.querySelectorAll("input[data-material-zone]")].forEach((node) => {
    node.addEventListener("change", () => {
      const zone = normalizeMaterialZoneNumber(node.dataset.materialZone);
      if (zone === null) return;
      if (node.checked) state.selectedBuildingMaterialZones.add(zone);
      else state.selectedBuildingMaterialZones.delete(zone);
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("button[data-clear-material-zones]")].forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedBuildingMaterialZones = new Set();
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("input[data-hearth-zone]")].forEach((node) => {
    node.addEventListener("change", () => {
      const label = String(node.dataset.hearthZone || "").trim();
      if (!label) return;
      if (node.checked) state.selectedHearthSystemZones.add(label);
      else state.selectedHearthSystemZones.delete(label);
      renderLayerStacks();
      if (el.autoUpdate.checked) debounce(() => recompute(false), 350);
    });
  });

  [...el.hoverPillRow.querySelectorAll("button[data-clear-hearth-zones]")].forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedHearthSystemZones = new Set();
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
      if (stage === "material") state.applyMaterialFilter = !!node.checked;
      if (stage === "hearth") state.applyHearthFilter = !!node.checked;
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
  const restoredMaterialZoneScrollNode = el.hoverPillRow.querySelector("[data-material-zone-scroll]");
  if (restoredMaterialZoneScrollNode && state.materialZoneScrollTop > 0) {
    restoredMaterialZoneScrollNode.scrollTop = state.materialZoneScrollTop;
  }
  const restoredHearthZoneScrollNode = el.hoverPillRow.querySelector("[data-hearth-zone-scroll]");
  if (restoredHearthZoneScrollNode && state.hearthZoneScrollTop > 0) {
    restoredHearthZoneScrollNode.scrollTop = state.hearthZoneScrollTop;
  }
  syncTopRowNav();
}

function muniStyle(feature) {
  const rec = recordForFeature(feature);
  const biClass = String(rec?.bi_class || "");
  const mode = normalizeMunicipalityDisplayMode(state.municipalityDisplayMode);
  const isSelectedClass = biClass.length > 0 && state.legendSelectedClasses.has(biClass);
  let fill = rec?.bi_color || FALLBACK_FILL;
  if (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL) {
    fill = resolveMaterialZoneColor(rec?.building_material_zone_number);
  } else if (mode === MUNICIPALITY_DISPLAY_MODES.HEARTH) {
    fill = resolveHearthZoneColor(rec?.hearth_system_zone);
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
      (mode === MUNICIPALITY_DISPLAY_MODES.MATERIAL || mode === MUNICIPALITY_DISPLAY_MODES.HEARTH)
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

function renderMaterialZoneLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;
  const options = state.buildingMaterialZoneOptions || [];
  if (!options.length) {
    mount.innerHTML = "<p class=\"layer-option-placeholder\">No material zone data available.</p>";
    return;
  }

  const rows = options
    .map((option) => {
      const zone = normalizeMaterialZoneNumber(option.zone_number);
      if (zone === null) return "";
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

  mount.innerHTML = `
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

  const rows = options
    .map((label) => {
      const normalized = hearthZoneLabel(label);
      const color = resolveHearthZoneColor(normalized);
      return `
        <div class="material-legend-row">
          <span class="material-legend-swatch" style="background:${escapeHtml(color)}"></span>
          <span>${escapeHtml(normalized)}</span>
        </div>
      `;
    })
    .join("");

  mount.innerHTML = `
    <div class="material-legend">
      ${rows}
    </div>
    <p class="legend-caption">Display colors show hearth system zones.</p>
  `;
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
  renderLegend(targetNode);
}

function renderLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;

  const classColor = {};
  Object.values(state.records).forEach((r) => {
    if (r.bi_class && r.bi_color) classColor[r.bi_class] = r.bi_color;
  });

  const cellsHtml = DIAMOND_LEGEND_ORDER
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
    const stage2MaterialFiltered = Number(
      state.lastClimateStats.stage2_material_filtered_count
      ?? state.lastClimateStats.stage1_material_filtered_count
      ?? stage1,
    );
    const stage3HearthFiltered = Number(state.lastClimateStats.stage3_hearth_filtered_count ?? stage1);
    const stage1CandidateAfterFilter = Number(state.lastClimateStats.stage1_candidate_record_count_after_filter ?? n);
    const stage1CandidateExcluded = Number(state.lastClimateStats.stage1_candidate_record_excluded_count ?? 0);
    const hasStage1ClassExclusion = stage1CandidateExcluded > 0;
    const stage2FilterEnabled = !!state.lastClimateStats.stage2_material_filter_enabled;
    const stage3FilterEnabled = !!state.lastClimateStats.stage3_hearth_filter_enabled;
    const stage4PriorityEnabled = !!state.lastClimateStats.stage4_climate_priority_enabled;
    if (Object.prototype.hasOwnProperty.call(state.lastClimateStats, "apply_material_filter")) {
      state.applyMaterialFilter = !!state.lastClimateStats.apply_material_filter;
    }
    if (Object.prototype.hasOwnProperty.call(state.lastClimateStats, "apply_hearth_filter")) {
      state.applyHearthFilter = !!state.lastClimateStats.apply_hearth_filter;
    }
    if (Object.prototype.hasOwnProperty.call(state.lastClimateStats, "apply_climate_priority")) {
      state.applyClimatePriority = !!state.lastClimateStats.apply_climate_priority;
    }

    let prefix = "";
    if (stage2FilterEnabled && stage3FilterEnabled) {
      prefix = `${n} municipalities, ${stage2MaterialFiltered} exceptional after material-zone filter (from ${stage1BaseExceptional}), ${stage3HearthFiltered} after hearth filter`;
    } else if (stage3FilterEnabled) {
      prefix = `${n} municipalities, ${stage3HearthFiltered} exceptional after hearth filter (from ${stage1BaseExceptional})`;
    } else if (stage2FilterEnabled) {
      prefix = `${n} municipalities, ${stage2MaterialFiltered} exceptional after material-zone filter (from ${stage1BaseExceptional})`;
    } else if (hasStage1ClassExclusion) {
      prefix = `${n} municipalities, ${stage1} exceptional from ${stage1CandidateAfterFilter} class-filtered candidates`;
    } else {
      prefix = `${n} municipalities, ${stage1} exceptional after municipality featured filter`;
    }

    if (stage4PriorityEnabled) {
      setStatus(`${prefix}, ${e} hearth-wise climate-priority`);
    } else {
      setStatus(prefix);
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
    state.selectedClimateIndicators = new Set((defaults.climate_indicator_keys || []).map(String));
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
    state.selectedBuildingMaterialZones = new Set(
      _uniqueNumbers(defaults.selected_building_material_zone_numbers || [])
        .map((v) => normalizeMaterialZoneNumber(v))
        .filter((v) => v !== null),
    );
    state.hearthSystemZoneOptions = Array.isArray(options.hearth_system_zone_options)
      ? _uniqueLabels(
          options.hearth_system_zone_options.map((item) => {
            if (typeof item === "string") return item;
            return item?.zone_label;
          }),
        )
      : [];
    state.selectedHearthSystemZones = new Set(
      _uniqueLabels(defaults.selected_hearth_system_zones || []),
    );
    state.applyMaterialFilter = defaults.apply_material_filter !== false;
    state.applyHearthFilter = defaults.apply_hearth_filter !== false;
    state.applyClimatePriority = defaults.apply_climate_priority !== false;
    buildMaterialZoneColorMap();
    buildHearthZoneColorMap();

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
