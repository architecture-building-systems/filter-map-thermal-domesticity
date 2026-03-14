# 07_filter_map Agent Guide

This file is the working guide for agents editing `00_Proposal/07_filter_map`.

## Main API (Backend)
- `GET /` -> serves `templates/index.html`
- `GET /health` -> readiness + warning/error metadata
- `GET /api/bootstrap` -> core municipality payload + control defaults + overlay/raster manifests
- `GET /api/overlay/<layer_id>` -> lazy GeoJSON overlays
- `GET /api/raster/<layer_id>.png` -> cached raster PNG overlays
- `GET /api/municipality/<bfs>/profile` -> cached municipality profile payload
- `POST /api/recompute` -> recompute bivariate classes + stage outputs

## Recompute Pipeline (Authoritative Order)
1. Temperature aggregation per BFS (`season`, `temp_method`, `exclude_non_habitable`).
2. Old-building percentage from building-stock data with heating exclusions.
3. Bivariate record construction (`temp`, `% old`, `bi_class`, `bi_color`).
4. Stage 1 exceptional detection (k-threshold logic, method-aware temp direction).
5. Stage 2 reduction by building-material group (`top_n_per_group`).
6. Stage 3 reduction by hearth-system group (`top_n_per_group`).
7. Stage 4 climate-priority selection from surviving Stage 3 set.

Do not silently change stage order.

## Frontend State Model (High-Value Keys)
- `state.records`, `state.exceptional`, `state.exceptionalStage1`, `state.climateStageStatus`
- `state.layerOrder`, `state.layerVisibility`, `state.layerOpacity`, `state.layerInstances`
- `state.hoverSchemas`, `state.hoverSelectedFields`
- `state.legendSelectedClasses` (also affects Stage 1 candidate scope)
- `state.municipalityDisplayMode` (`bivariate`, `building_material_zone`, `hearth_system_zone`)

Preserve session persistence behavior for selections/open states unless explicitly changing product behaviour.

## UI Composition Rules
- Right-side `#control-pill` is the persistent control center.
- Top row (`#hover-pill-row`) hosts dynamic stacks (analysis + visible layer options/legends).
- Municipality modal is a two-column explorer (left map geometry, right tab content).
- Visual language: Comfortaa, monochrome surfaces, accent `#FBD124` for active/focus.

Avoid introducing a separate visual system unless explicitly requested.

## Layering + Interactivity Rules
- Non-hover overlays must stay `interactive: false` to avoid stealing pointer events.
- Hoverable layers (municipality featured filter, bioregions, ISOS) must keep tooltip bindings intact.
- ISOS should remain above municipality fills when visible.
- Exceptional outlines must remain visually dominant after style refresh.

If touching pane/z-index logic, verify hover still works for all hoverable layers.

## Data Rules
- BFS identifiers are treated as canonical string keys in state/payloads.
- Deterministic ordering is required for lists/legends/status outputs (stable tie-breakers).
- Keep API response keys backward-compatible where possible; if adding new fields, do not remove existing keys casually.

## Performance Rules
- Keep `/api/bootstrap` lean; use overlay lazy-loading path for heavy vectors.
- Prefer cached responses/payload reuse (bootstrap, overlays, profile, rasters).
- Avoid forcing expensive recompute or full layer rebuilds on purely visual toggles.

## Do / Don’t Patterns
### DO
```python
# Backend: keep validation/defaulting near request parsing
season = str(body.get("season", "annual"))
if season not in VALID_SEASONS:
    season = "annual"
```

```js
// Frontend: update only affected styles when possible
state.legendSelectedClasses.toggle?.(biClass)
updateMunicipalityStyles()
```

### DON’T
```python
# Don't reorder stage logic implicitly inside helper functions
# (it breaks list/highlight semantics downstream)
```

```js
// Don't make decorative overlays interactive
interactive: true  // for non-hover boundary overlays
```

## Validation Checklist After Changes
- Preferred environment: run checks in conda env `py312` (it contains the project geospatial/runtime deps).
  - Example: `conda run -n py312 python -m py_compile app.py services/*.py`
  - Example: `conda run -n py312 node --check static/app.js`
- Python syntax: `python3 -m py_compile app.py services/*.py`
- JS syntax: `node --check static/app.js`
- Manual smoke:
  - `/health`
  - `/api/bootstrap`
  - `/api/recompute` with defaults
  - municipality hover + exceptional outlines + legends

## Common Pitfalls (Regression Traps)
- Hover silently breaks when a non-hover overlay is left `interactive: true`.
- Exceptional outline can disappear under neighbors unless exceptional paths are re-brought to front after style refresh.
- Stage semantics drift quickly if stage order or candidate set transitions are changed implicitly.
- Bivariate legend clicks have analytical meaning (Stage 1 exclusions), not just visual whitening.
- Scroll reset in checklist-heavy pills happens when rerender does not preserve/restore container `scrollTop`.
- Invalid modal query params (`?muni=0`, empty, non-numeric) can trigger avoidable 404 calls if not normalized early.
- Top-row stack scrollbar can become unusable if container/pointer-events/z-index are altered incorrectly.

## Related Files
- `app.py` - API routes, request parsing, recompute orchestration
- `services/data_store.py` - cached data loading, bootstrap payload, raster/overlay/profile prep
- `services/compute.py` - bivariate and staged selection algorithms
- `services/climate_metrics.py` - climate indicator config + scoring helpers
- `static/app.js` - map state machine, modal rendering, layer controls, interactions
- `static/app.css` - visual system, responsive layout, stack/modal styling
- `templates/index.html` - app shell mounts and script/style wiring

## Writing Conventions

**No emoticons in code**: Never add emoji or emoticons to code files, comments, or print statements.

**British English**: All user-facing text MUST use British English spelling and terminology:
- "normalised" (not "normalized")
- "optimisation" (not "optimization")
- "behaviour" (not "behavior")
- "colour" (not "color")
- "centre" (not "center")


## Design Guidelines

1. **Typography and scale**
   - Use Comfortaa for UI text; do not introduce additional font families without explicit request.
   - Keep base sizing stable across environments:
     - `html, body { font-size: 16px; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }`
   - Prefer `rem`-based sizing for pills, labels, and controls.

2. **Colour system**
   - Control UI remains monochrome with accent `#FBD124` for active, selected, and focus states.
   - Keep text high-contrast (`#1a1a1a`-range) and muted helper text grey; do not use accent as body text colour.
   - Data-driven thematic colours belong to map layers and legends only (not global control chrome).

3. **Pill and control consistency**
   - Reuse existing pill patterns (`<details>/<summary>` stacks, section headers, count badges, compact rows).
   - New controls must match existing spacing density and border/radius language in `static/app.css`.
   - Avoid one-off visual variants unless they are reusable and documented.

4. **Interaction rules**
   - Preserve immediate feedback for info hints/tooltips (no delayed hover timers).
   - Keep top-row stacks horizontally scrollable and clickable; do not block scrollbars with pointer-event layering.
   - Keep gallery-style arrow controls keyboard-focusable and visually disabled at boundaries.

5. **Accessibility**
   - Maintain visible `:focus-visible` treatment (accent outline/ring) on interactive elements.
   - Ensure form controls and icon-only buttons have clear labels (`aria-label` where needed).
   - Use semantic controls (`button`, `label`, `summary`) instead of clickable `div`s.
   - Target at least ~32px hit area for frequently used toggles/checks in dense panels.

6. **Map overlay UX**
   - Non-hover layers stay non-interactive; hoverable layers must keep tooltip usability.
   - Exceptional outlines must remain clearly legible above neighbouring municipality geometry.
   - Legend text must reflect the active municipality display mode:
     - `Bivariate Class` mode -> `Bivariate Class Legend`
     - `Building Material Zone` mode -> `Building Material Zone Legend`
     - `Hearth System Zone` mode -> `Hearth System Zone Legend`

7. **Modal layout conventions**
   - Municipality modal stays inset (not full-bleed) so base map context remains visible.
   - Maintain two-column structure: left geometry map, right analytical content.
   - Keep modal open/close interactions accessible (`Esc`, close button, backdrop with safe behaviour).

8. **Responsive expectations**
   - Validate at common widths: ~1440, ~1024, ~768, and small mobile.
   - No clipped summaries, hidden close buttons, or non-scrollable content areas.
   - When space is tight, prefer internal scrolling over overlap.

9. **Implementation discipline**
   - Prefer CSS class updates over ad-hoc inline style injection.
   - If introducing new tokens (spacing/colour/radius), place them centrally in `static/app.css`.
   - Keep naming descriptive and mode-aware so new agents can discover intent quickly.
