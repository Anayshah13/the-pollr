# Pollr

Interactive preference aggregation for DJSCE committees.

> **Disclaimer**  
> This is a learning project. It is not intended to harm, defame, or damage the reputation of any committee, club, or team. Votes are anonymous and aggregated. UI numbers come from submitted ballots, not personal editorial rankings.

---

## What it does

Students vote in three modes. The backend stores those ballots and turns them into a live **Pollr Score**.

| Mode | What you do | How it scores |
|------|-------------|----------------|
| **Swipe** | Pick one of two committees | Winner +50, loser −25 → mapped to [−100, 100] |
| **Tier** | Place every committee in S–F | S/A/B/C/F = +100 / +50 / 0 / −50 / −100 |
| **Rank** | Order a category (or all) | Linear +100…−100 by position |

Each mode is confidence-adjusted with `n / (n + 10)`. The final Pollr Score is the equal mean of whichever modes have data.

Landing and analytics show only metrics that can be computed from real ballots (overall / by category, sample sizes, tier entropy, direct head-to-head). No fake ELO fill-ins.

---

## Tech stack (what exists now)

### Frontend — `frontend/`
- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS**
- **Framer Motion** + **GSAP** (vote UX / motion)
- **Lucide** icons
- Optional **Google Analytics** via `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Talks to the API through `/api/v1/*` (Next rewrite → FastAPI)

### Backend — `api/`
- **FastAPI** + **Uvicorn**
- **SQLAlchemy 2** (async) + **Pydantic Settings**
- Anonymous session cookie (`pollr_sid`), no login
- Vote write APIs + leaderboard / H2H / insights
- Scoring + aggregation in Python services

### Database
- **Local default:** SQLite (`api/pollr.local.db`) — no cloud password required
- **Optional cloud:** Supabase Postgres (schema + 46-committee seed already applied on the Pollr project)
- **Optional Docker Postgres:** `docker-compose.yml`

### Repo layout

```
the-pollr/
├── api/                 FastAPI app, tests, scripts
├── frontend/            Next.js UI
├── supabase/migrations/ SQL schema (applied to Supabase)
├── docker-compose.yml   Local Postgres (optional)
└── README.md
```

---

## Quick start (no passwords)

You only need Python 3.11+ and Node 18+.

### 1. API

```bash
# from repo root
python -m venv .venv

# Windows
.\.venv\Scripts\pip install -r api\requirements.txt
cd api
copy .env.example .env
..\.venv\Scripts\python scripts\init_sqlite.py
..\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

```bash
# macOS / Linux
source .venv/bin/activate
pip install -r api/requirements.txt
cd api
cp .env.example .env
python scripts/init_sqlite.py
uvicorn app.main:app --reload --port 8000
```

API health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # optional
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Leave `NEXT_PUBLIC_API_URL` empty so Next proxies `/api/v1` to `http://127.0.0.1:8000`.

### 3. Tests

```bash
cd api
# with DATABASE_URL pointing at your local sqlite (default in .env)
pytest
```

---

## Environment files (do not commit secrets)

| File | Committed? | Purpose |
|------|------------|---------|
| `api/.env` | **No** (gitignored) | Local API config |
| `api/.env.example` | Yes | Safe template |
| `frontend/.env.local` | **No** (gitignored) | Local frontend / GA id |
| `frontend/.env.example` | Yes | Safe template |
| `api/pollr.local.db` | **No** (gitignored) | Local SQLite data |

Never commit database passwords, service-role keys, or real `.env` / `.env.local` files.

---

## About the “Supabase password”

You do **not** need any password to develop or push this repo.

Local mode uses **SQLite**. That is enough for swipe / tier / rank + live rankings.

If you later want the API to use the cloud Supabase Postgres instead of SQLite:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **Pollr**
2. **Project Settings → Database → Database password** (reset if you forgot it)
3. Put it only in local `api/.env` as `DATABASE_URL=postgresql+asyncpg://postgres:...@db.<ref>.supabase.co:5432/postgres`

That password never goes in git.

---

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/sessions` | Create / refresh anonymous session cookie |
| `GET` | `/api/v1/committees` | Committee catalog |
| `POST` | `/api/v1/votes/swipe` | Pairwise vote |
| `PUT` | `/api/v1/votes/tier` | Full S–F ballot |
| `PUT` | `/api/v1/votes/rank` | Ordered list for a scope |
| `GET` | `/api/v1/analytics/leaderboard` | Pollr Score board |
| `GET` | `/api/v1/analytics/head-to-head` | Direct pairwise share |
| `GET` | `/api/v1/analytics/insights` | Category leaders + controversy |

---

## Security notes

- Frontend never holds a database password or service-role key
- Vote tables use RLS default-deny on Supabase; FastAPI connects with the server `DATABASE_URL`
- Session identity is an HttpOnly cookie UUID (no login / no email)
- Rate limit on swipe; tier/rank upsert one ballot per session (and scope for rank)

---
