const state = {
  bootstrap: null,
  records: {},
  exceptional: new Set(),
  legendSelectedClasses: new Set(),
  map: null,
  muniLayer: null,
  layerOrder: [],
  layerVisibility: {},
  layerOpacity: {},
  layerInstances: {},
  layerPaneZBase: 390,
  debounceHandle: null,
  hoverSchemas: {},
  hoverSelectedFields: {},
  layerStackOpenMain: {},
  layerStackOpenLegend: {},
  layerStackOpenExceptional: {},
  healthWarning: "",
  isosLayerColorMap: {},
  isosIconCache: {},
  isosRenderMode: "symbol",
  isosZoomSettleHandle: null,
  isZoomingMap: false,
  bioregionColorMap: {},
  bioregionOrder: [],
  bioregionPatternReady: false,
  layerDisplayNames: {
    bivariate_municipalities: "Bivariate Municipalities",
    bioregions: "Bioregions",
    isos: "ISOS",
  },
};

const ACCENT = "#FBD124";
const FALLBACK_FILL = "#bdbdbd";
const ISOS_DEFAULT_LAYER_COLOR = "#707070";
const ISOS_DETAIL_ZOOM = 12;
const WHITE_FILL = "#ffffff";
const SVG_NS = "http://www.w3.org/2000/svg";

const LAYER_DEFAULT_ORDER = [
  "national_border",
  "cantons",
  "isos",
  "bioregions",
  "population",
  "elevation",
  "bivariate_municipalities",
];

const LAYER_META = {
  bivariate_municipalities: { label: "Bivariate municipalities", hoverable: true, kind: "bivariate" },
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
  elevation: "Grayscale heightfield overlay (transparent for no-data). Range shown: 0 to 4000.",
  population: "Aggregated population heat overlay (transparent for no-data). Values clipped to 0 to 200.",
  cantons: "Canton boundary line overlay in grayscale.",
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
  hoverPillRow: document.getElementById("hover-pill-row"),
};

function setStatus(msg) {
  const warning = state.healthWarning ? ` | ${state.healthWarning}` : "";
  el.status.textContent = `${msg}${warning}`;
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
    national_border: Object.prototype.hasOwnProperty.call(showLayers, "national_border")
      ? !!showLayers.national_border
      : (Object.prototype.hasOwnProperty.call(showOverlays, "national_border") ? !!showOverlays.national_border : true),
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
  const features = state.bootstrap?.overlays?.bioregions?.features || [];
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
  if (!Number.isFinite(n)) return 5.5;
  if (n <= 20) return 4.5;
  if (n <= 40) return 5.5;
  if (n <= 60) return 6.5;
  return 7.5;
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

function buildIsosSvg(markerCode, pixelRadius, layerColor, clickable) {
  const center = 12;
  const strokeWidth = 1.4;
  const fillColor = layerColor || ISOS_DEFAULT_LAYER_COLOR;
  const shapeClass = clickable ? "isos-symbol clickable" : "isos-symbol";
  let shapeMarkup = "";

  if (markerCode === "o") {
    shapeMarkup = `<circle class="isos-fill" cx="${center}" cy="${center}" r="${pixelRadius.toFixed(2)}" fill="${fillColor}" stroke="#111111" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "s") {
    const d = pixelRadius * 2;
    const x = center - pixelRadius;
    const y = center - pixelRadius;
    shapeMarkup = `<rect class="isos-fill" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${d.toFixed(2)}" height="${d.toFixed(2)}" fill="${fillColor}" stroke="#111111" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "^") {
    const p1 = `${center.toFixed(2)},${(center - pixelRadius).toFixed(2)}`;
    const p2 = `${(center - pixelRadius).toFixed(2)},${(center + pixelRadius).toFixed(2)}`;
    const p3 = `${(center + pixelRadius).toFixed(2)},${(center + pixelRadius).toFixed(2)}`;
    shapeMarkup = `<polygon class="isos-fill" points="${p1} ${p2} ${p3}" fill="${fillColor}" stroke="#111111" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "v") {
    const p1 = `${(center - pixelRadius).toFixed(2)},${(center - pixelRadius).toFixed(2)}`;
    const p2 = `${(center + pixelRadius).toFixed(2)},${(center - pixelRadius).toFixed(2)}`;
    const p3 = `${center.toFixed(2)},${(center + pixelRadius).toFixed(2)}`;
    shapeMarkup = `<polygon class="isos-fill" points="${p1} ${p2} ${p3}" fill="${fillColor}" stroke="#111111" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "D") {
    shapeMarkup = `<polygon class="isos-fill" points="${polygonPoints(center, center, pixelRadius, 4, -45)}" fill="${fillColor}" stroke="#111111" stroke-width="${strokeWidth}" />`;
  } else if (markerCode === "p") {
    shapeMarkup = `<polygon class="isos-fill" points="${polygonPoints(center, center, pixelRadius, 5, -90)}" fill="${fillColor}" stroke="#111111" stroke-width="${strokeWidth}" />`;
  } else {
    const r = pixelRadius * 0.85;
    shapeMarkup = `
      <line class="isos-line" x1="${(center - r).toFixed(2)}" y1="${(center - r).toFixed(2)}" x2="${(center + r).toFixed(2)}" y2="${(center + r).toFixed(2)}" stroke="${fillColor}" stroke-width="${strokeWidth}" />
      <line class="isos-line" x1="${(center + r).toFixed(2)}" y1="${(center - r).toFixed(2)}" x2="${(center - r).toFixed(2)}" y2="${(center + r).toFixed(2)}" stroke="${fillColor}" stroke-width="${strokeWidth}" />
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

function getIsosIcon(markerCode, markerSize, layerColor, clickable) {
  const px = mapMarkerSizeToPixels(markerSize);
  const key = `${markerCode}|${px}|${layerColor}|${clickable ? "1" : "0"}`;
  if (state.isosIconCache[key]) {
    return state.isosIconCache[key];
  }

  const iconPx = px + 8;
  state.isosIconCache[key] = L.divIcon({
    className: clickable ? "isos-icon-wrapper isos-url-marker" : "isos-icon-wrapper isos-static-marker",
    html: buildIsosSvg(markerCode, px, layerColor, clickable),
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
  const kind = LAYER_META[layerId]?.kind;
  if (kind === "raster") {
    return !!state.bootstrap?.raster_overlays?.[layerId];
  }
  if (kind === "vector") {
    return !!(state.bootstrap?.overlays?.[layerId]?.features || []).length;
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
  if (layerId === "cantons" || layerId === "national_border") {
    layer.setStyle({ opacity });
  }
}

function applyConfiguredLayerOpacities() {
  const adjustableLayers = ["elevation", "population", "cantons", "national_border"];
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
      const available = layerHasData(layerId);
      const checked = available && !!state.layerVisibility[layerId];
      const checkedAttr = checked ? " checked" : "";
      const disabledAttr = available ? "" : " disabled";
      const unavailableClass = available ? "" : " is-unavailable";
      const draggableAttr = available ? "true" : "false";
      const unavailableTitle = available ? "" : " title=\"Data unavailable\"";
      return `
        <div class="layer-order-pill${unavailableClass}" data-layer-id="${escapeHtml(layerId)}" draggable="${draggableAttr}"${unavailableTitle}>
          <label class="layer-order-check">
            <input type="checkbox" data-layer-visible="${escapeHtml(layerId)}"${checkedAttr}${disabledAttr}>
            <span>${escapeHtml(meta.label)}</span>
          </label>
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
  return {
    season: el.season.value,
    temp_method: el.tempMethod.value,
    exclude_non_habitable: el.nonHabitable.checked,
    excluded_heating_types: getExcludedHeatingTypes(),
    k_temp: Number(el.kTemp.value || 1.0),
    k_old: Number(el.kOld.value || 1.0),
  };
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
    setLayerSchema("isos", collectPropertyKeys(state.bootstrap?.overlays?.isos));
    return;
  }
  if (layerKey === "bioregions") {
    setLayerSchema("bioregions", collectPropertyKeys(state.bootstrap?.overlays?.bioregions));
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
    const schema = state.hoverSchemas[layerId] || [];
    const selected = state.hoverSelectedFields[layerId] || new Set();
    const fieldsHtml = schema.length
      ? schema
          .map((field) => {
            const checked = selected.has(field) ? " checked" : "";
            return `<label><input type="checkbox" data-hover-layer="${escapeHtml(layerId)}" data-hover-field="${escapeHtml(field)}"${checked}> ${escapeHtml(fieldLabel(field))}</label>`;
          })
          .join("")
      : "<label>No fields available</label>";
    return `<div class="layer-option-fields">${fieldsHtml}</div>`;
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

function renderLayerStacks() {
  if (!el.hoverPillRow) return;

  [...el.hoverPillRow.querySelectorAll("details[data-layer][data-stack-role]")].forEach((node) => {
    const layerId = node.dataset.layer;
    const role = node.dataset.stackRole;
    if (!layerId || !role) return;
    if (role === "main") state.layerStackOpenMain[layerId] = node.open;
    if (role === "legend") state.layerStackOpenLegend[layerId] = node.open;
    if (role === "exceptional") state.layerStackOpenExceptional[layerId] = node.open;
  });

  const visibleLayers = getVisibleStackLayers();
  if (visibleLayers.length === 0) {
    el.hoverPillRow.classList.add("hidden");
    el.hoverPillRow.innerHTML = "";
    return;
  }

  el.hoverPillRow.classList.remove("hidden");

  const stacksHtml = visibleLayers
    .map((layerId) => {
      const label = LAYER_META[layerId]?.label || formatRawFieldLabel(layerId);
      const mainOpen = state.layerStackOpenMain[layerId] === true;
      const defaultLegendOpen = layerId === "bivariate_municipalities";
      const legendOpen = state.layerStackOpenLegend[layerId] === true
        || (!Object.prototype.hasOwnProperty.call(state.layerStackOpenLegend, layerId) && defaultLegendOpen);
      const exceptionalOpen = state.layerStackOpenExceptional[layerId] === true;
      const mainOpenAttr = mainOpen ? " open" : "";
      const legendOpenAttr = legendOpen ? " open" : "";
      const exceptionalOpenAttr = exceptionalOpen ? " open" : "";

      const exceptionalPill = layerId === "bivariate_municipalities"
        ? `
          <details class="layer-exceptional-pill" data-layer="${escapeHtml(layerId)}" data-stack-role="exceptional"${exceptionalOpenAttr}>
            <summary class="layer-pill-summary">
              <span class="layer-pill-title">Exceptional Places</span>
              <span class="layer-pill-count" data-exceptional-count="${escapeHtml(layerId)}">${state.exceptional.size}</span>
            </summary>
            <div class="layer-pill-body" data-exceptional-list="${escapeHtml(layerId)}" aria-live="polite"></div>
          </details>
        `
        : "";

      return `
        <section class="layer-stack" data-layer-stack="${escapeHtml(layerId)}">
          <details class="layer-main-pill" data-layer="${escapeHtml(layerId)}" data-stack-role="main"${mainOpenAttr}>
            <summary class="layer-pill-summary">
              <span class="layer-pill-title">${escapeHtml(label)} Options</span>
            </summary>
            <div class="layer-pill-body">
              ${layerMainOptionsMarkup(layerId)}
            </div>
          </details>
          <details class="layer-legend-pill" data-layer="${escapeHtml(layerId)}" data-stack-role="legend"${legendOpenAttr}>
            <summary class="layer-pill-summary">
              <span class="layer-pill-title">${escapeHtml(label)} Legend</span>
            </summary>
            <div class="layer-pill-body" data-layer-legend="${escapeHtml(layerId)}"></div>
          </details>
          ${exceptionalPill}
        </section>
      `;
    })
    .join("");

  el.hoverPillRow.innerHTML = stacksHtml;

  [...el.hoverPillRow.querySelectorAll("details[data-layer][data-stack-role]")].forEach((node) => {
    node.addEventListener("toggle", () => {
      const layerId = node.dataset.layer;
      const role = node.dataset.stackRole;
      if (!layerId || !role) return;
      if (role === "main") state.layerStackOpenMain[layerId] = node.open;
      if (role === "legend") state.layerStackOpenLegend[layerId] = node.open;
      if (role === "exceptional") state.layerStackOpenExceptional[layerId] = node.open;
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
      renderLegend(legendMount);
    } else if (layerId === "isos") {
      renderIsosLegend(legendMount);
    } else if (layerId === "bioregions") {
      renderBioregionLegend(legendMount);
    } else {
      legendMount.innerHTML = compactLegendMarkup(layerId);
    }

    if (layerId === "bivariate_municipalities") {
      const exceptionalListMount = el.hoverPillRow.querySelector(`[data-exceptional-list="${layerId}"]`);
      const exceptionalCountMount = el.hoverPillRow.querySelector(`[data-exceptional-count="${layerId}"]`);
      renderExceptionalPlaces(exceptionalListMount, exceptionalCountMount);
    }
  });
}

function muniStyle(feature) {
  const rec = recordForFeature(feature);
  const biClass = String(rec?.bi_class || "");
  const isSelectedClass = biClass.length > 0 && state.legendSelectedClasses.has(biClass);
  const fill = isSelectedClass ? WHITE_FILL : (rec?.bi_color || FALLBACK_FILL);
  const exceptional = rec && state.exceptional.has(String(rec.bfs));
  return {
    color: exceptional ? ACCENT : "#ffffff",
    weight: exceptional ? 2.5 : 0.6,
    opacity: exceptional ? 1.0 : 0.9,
    fillColor: fill,
    fillOpacity: isSelectedClass ? 1.0 : 0.82,
  };
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

function overlayStyle(kind) {
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
    return {
      color: "#4d4d4d",
      weight: 1.1,
      opacity: normalizeOpacity(state.layerOpacity.cantons, 0.9),
      fill: false,
      interactive: false,
    };
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
      const layerColor = resolveIsosLayerColor(props.layer);
      const clickable = isSafeHttpUrl(props.url);

      if (mode === "simple") {
        return L.circleMarker(latlng, {
          pane: paneName,
          interactive: true,
          bubblingMouseEvents: false,
          radius: Math.max(2.4, mapMarkerSizeToPixels(markerSize) - 1.4),
          color: layerColor,
          weight: 1.1,
          fillColor: layerColor,
          fillOpacity: 0.82,
        });
      }

      const markerCode = normalizeMarkerCode(props);
      const icon = getIsosIcon(markerCode, markerSize, layerColor, clickable);
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
  if (!state.map || !state.bootstrap?.overlays?.isos || !state.layerInstances.isos) return;
  const desiredMode = forcedMode || currentIsosRenderMode();
  if (state.isZoomingMap && !forcedMode && desiredMode === "symbol") return;
  if (desiredMode === state.isosRenderMode) return;

  const oldLayer = state.layerInstances.isos;
  const wasVisible = state.map.hasLayer(oldLayer);
  if (wasVisible) {
    state.map.removeLayer(oldLayer);
  }

  state.layerInstances.isos = createIsosLayer(state.bootstrap.overlays.isos, desiredMode);
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

  return L.geoJSON(geojson, {
    pane: paneName,
    interactive: false,
    style: () => overlayStyle(kind),
  });
}

function initializeLayerInstances() {
  state.layerInstances = {};
  state.layerOrder.forEach((layerId) => {
    const kind = LAYER_META[layerId]?.kind;
    if (kind === "bivariate") return;
    if (kind === "raster") {
      state.layerInstances[layerId] = createRasterLayer(layerId);
      return;
    }
    if (kind === "vector") {
      state.layerInstances[layerId] = createVectorLayer(layerId, state.bootstrap?.overlays?.[layerId]);
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
          aria-label="Class ${escapeHtml(biClass)} (${escapeHtml(aria)})"
          aria-pressed="${active ? "true" : "false"}"
          title="${escapeHtml(biClass)}: ${escapeHtml(aria)}"
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
    <p class="legend-caption">Click classes to whiten matching municipalities.</p>
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
  const count = state.exceptional.size;
  if (countMount) {
    countMount.textContent = String(count);
  }
  if (!listMount) return;

  if (count === 0) {
    listMount.innerHTML = "<p class=\"exceptional-empty\">No exceptional places for current filters.</p>";
    return;
  }

  const rows = [...state.exceptional]
    .map((bfs) => {
      const rec = state.records[bfs] || {};
      const name = String(rec.name || rec.NAME || bfs);
      const canton = String(rec.canton_name || rec.KANTONSNUM || "").trim();
      const label = canton ? `${name} (${canton})` : name;
      return { bfs: String(bfs), label };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const items = rows
    .map(({ bfs, label }) => `<li>${escapeHtml(label)} [${escapeHtml(bfs)}]</li>`)
    .join("");
  listMount.innerHTML = `<ul class="exceptional-list">${items}</ul>`;
}

function buildIsosLayerColorMap() {
  state.isosLayerColorMap = {};
  const features = state.bootstrap?.overlays?.isos?.features || [];
  features.forEach((feature) => {
    const layerName = String(feature?.properties?.layer ?? "").trim() || "Unknown";
    resolveIsosLayerColor(layerName);
  });
}

function renderIsosLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;

  const features = state.bootstrap?.overlays?.isos?.features || [];
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

function renderBioregionLegend(targetNode = null) {
  const mount = targetNode;
  if (!mount) return;

  const features = state.bootstrap?.overlays?.bioregions?.features || [];
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
    const layer = getLayerInstance(layerId);
    if (!layer) return;
    const shouldShow = !!state.layerVisibility[layerId];
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

async function recompute(isInitial = false) {
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

    refreshHoverSchema("bivariate_municipalities");

    if (isInitial) {
      renderMunicipalities(true);
    } else {
      updateMunicipalityStyles();
    }

    applyLayerOrderAndVisibility();

    const n = Object.keys(state.records).length;
    const e = state.exceptional.size;
    setStatus(`${n} municipalities, ${e} exceptional`);
  } catch (err) {
    setStatus(`Error: ${err.message}`);
    console.error(err);
  }
}

function wireAutoUpdateEvents() {
  [el.season, el.tempMethod, el.nonHabitable, el.kTemp, el.kOld].forEach((node) => {
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
  try {
    setStatus("Checking server ...");
    await waitUntilReady();
    setStatus("Loading bootstrap data ...");
    state.bootstrap = await fetchJson("/api/bootstrap");

    const defaults = state.bootstrap.controls?.defaults || {};
    const options = state.bootstrap.controls || {};
    state.layerOrder = sanitizeLayerOrder(defaults.layer_order || LAYER_DEFAULT_ORDER);
    state.layerVisibility = defaultLayerVisibility(defaults);
    sanitizeLayerVisibility();

    initMap();

    el.season.value = defaults.season || "annual";
    el.tempMethod.value = defaults.temp_method || "mean-mean";
    el.nonHabitable.checked = defaults.exclude_non_habitable !== false;
    el.autoUpdate.checked = defaults.auto_update !== false;
    el.kTemp.value = String(defaults.k_temp ?? 1.0);
    el.kOld.value = String(defaults.k_old ?? 1.0);

    if (Array.isArray(options.temperature_methods) && options.temperature_methods.length) {
      el.tempMethod.innerHTML = options.temperature_methods
        .map((m) => `<option value="${m}">${m}</option>`)
        .join("");
      el.tempMethod.value = defaults.temp_method || options.temperature_methods[0];
    }

    initHeatingControls(options.heating_options || [], defaults.excluded_heating_types || []);

    refreshHoverSchema("isos");
    refreshHoverSchema("bioregions");
    buildIsosLayerColorMap();
    buildBioregionColorMap();
    state.isosIconCache = {};
    state.isosRenderMode = currentIsosRenderMode();
    ensureLayerOpacityDefaults();

    initializeLayerInstances();
    renderLayerOrderControls();
    applyLayerOrderAndVisibility();
    wireAutoUpdateEvents();

    await recompute(true);
  } catch (err) {
    setStatus(`Bootstrap error: ${err.message}`);
    console.error(err);
  }
}

boot();
