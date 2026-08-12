# Pollr API

FastAPI backend for anonymous swipe / tier / rank voting and Pollr Score aggregation.

## Local (SQLite — default)

No cloud password needed.

```bash
# from repo root, with .venv already created
pip install -r api/requirements.txt
cd api
cp .env.example .env
python scripts/init_sqlite.py
uvicorn app.main:app --reload --port 8000
```

## Optional: Supabase Postgres

Only if you want cloud persistence instead of SQLite:

1. Supabase Dashboard → Pollr → Project Settings → Database
2. Copy / reset the **database password**
3. Set `DATABASE_URL` in local `api/.env` (never commit that file)

## Tests

```bash
pytest
```
