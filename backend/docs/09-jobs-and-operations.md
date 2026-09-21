# 09 — Jobs & Operations

Source: `app/jobs/ingest_geo.py`, `Makefile`. Specs: docs/08 (GCP), docs/10
(warehouse cadence).

## 1. Geo ingestion job (`app/jobs/ingest_geo.py`)

Batch CLI, weekly cadence; idempotent **delete+insert per kind**:

```
uv run python -m app.jobs.ingest_geo                  # all datasets
uv run python -m app.jobs.ingest_geo toll_gate school # subset
```

Per kind (`ingest_kind`):
1. Insert an `IngestionRun(dataset=kind, status=running)` and commit (the run row is
   visible even if the process dies).
2. `osm.fetch(kind)` (doc 04 §4).
3. In a fresh session: `DELETE FROM geo_features WHERE kind = :kind`, bulk insert the
   fetched features, mark the run `done` with `feature_count` + `finished_at`.
4. Any exception → run `failed`, `error` truncated to 500 chars; returns 0.

`main` runs kinds **sequentially** with a 5 s pause (be polite to Overpass).
Unknown dataset names abort with the list of valid kinds. Run via
`make ingest-geo [ARGS="toll_gate sutet_tower"]`.

After `make db-reset`, the warehouse is empty — research still works (spatial facts
degrade to evidence gaps / no baselines) but re-ingest ASAP.

## 2. Local setup from zero

```bash
# prerequisites: Python 3.12+, uv, Node 20+, local Postgres
createdb rumper
cd backend
cp .env.example .env            # fill GEMINI_API_KEY, MAPS_API_KEY; add auth keys (doc 01 §2)
make install                    # uv sync
make migrate                    # alembic upgrade head
make ingest-geo                 # fill the geo warehouse (~minutes, Overpass-rate-limited)
make dev                        # uvicorn app.main:app on 127.0.0.1:8000 (reload)

cd ../frontend
npm install
npm run dev                     # vite on :3000, /api proxied to :8000
```

Auth needs `GOOGLE_OAUTH_CLIENT_ID` in `.env` **and** `VITE_GOOGLE_CLIENT_ID` for the
frontend; the map panel needs `VITE_GOOGLE_MAPS_KEY` (frontend/docs/README §3).
LangGraph checkpoint tables are created automatically at first startup.

## 3. Makefile reference

| target | does |
|---|---|
| `install` | `uv sync` |
| `dev` | uvicorn `app.main:app` on 127.0.0.1:8000 `--reload` (serves the frontend build too) |
| `migrate` | `alembic upgrade head` |
| `revision m="msg"` | `alembic revision --autogenerate` |
| `db-reset` | terminate connections, drop+create local `rumper`, migrate (warns about geo re-ingest) |
| `ingest-geo [ARGS=…]` | run the ingestion job |
| `build-fe` | `cd ../frontend && npm run build` → emits into `backend/static` |
| `reset-usage [EMAIL=…]` | delete today's (WIB) `usage_events`, optionally for one user — dev quota reset |
| `secret-push` | push the whole `.env` as ONE Secret Manager secret `rumper-env` (create or add version) in project `rumper-499015` |
| `lint` / `fmt` | `uvx ruff check .` / `uvx ruff format .` |

Vars: `PROJECT ?= rumper-499015`, `REGION ?= asia-southeast2`.

## 4. Deployment shape (docs/08, ADR-009)

Single Cloud Run service in `asia-southeast2`: the FastAPI image serves both the API
and the built SPA from `backend/static` (`make build-fe` before image build). Config
arrives as the `rumper-env` secret mounted as a file with `ENV_FILE` pointing at it
(doc 01 §2). All cloud resources are named `rumper-*`. No secrets in the repo or the
browser bundle — the two `VITE_*` values (Maps browser key, OAuth client id) are
referrer-restricted public identifiers, not secrets.
