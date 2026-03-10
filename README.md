# 07_filter_map standalone app

## Run

```bash
cd 00_Proposal/07_filter_map
python -m pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5050`.

## PythonAnywhere Notes

1. Install dependencies from `requirements.txt` (includes `flask-compress` for gzip JSON responses).
2. Configure static files to serve `00_Proposal/07_filter_map/static` at `/static/`.
3. The app now uses progressive overlay loading:
   - `/api/bootstrap` loads core map data only.
   - overlay GeoJSON is fetched lazily via `/api/overlay/<layer_id>`.
4. Compression is automatic:
   - prefers `flask-compress` when installed,
   - falls back to manual JSON gzip in `app.py` if the package is unavailable.
   - check `/health` field `compression_backend` to confirm active mode.
5. First cold start can still take longer while `DataStore.load()` warms caches; warm requests are much faster.
6. For paid plans, a periodic ping to `/health` can reduce cold-start delay.
7. Municipality geometry is cached to `.cache/` after first build to reduce repeated cold-start processing.
8. Optional tuning: set `MUNI_SIMPLIFY_TOL` (default `0.0012`) to trade shape detail for faster transfer/render.

## Notes

1. UI uses Comfortaa from Google Fonts.
2. Monochrome control styling with accent `#FBD124`.
3. Bivariate fill colors remain data-driven.
