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
4. First cold start can still take longer while `DataStore.load()` warms caches; warm requests are much faster.
5. For paid plans, a periodic ping to `/health` can reduce cold-start delay.

## Notes

1. UI uses Comfortaa from Google Fonts.
2. Monochrome control styling with accent `#FBD124`.
3. Bivariate fill colors remain data-driven.
