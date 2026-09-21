# 08 — GCP Resources & Deployment Path

## 1. Resource registry (all `rumper-*`, project `rumper-499015`)

| Resource | Name |
|---|---|
| GCP project | `rumper-499015` (exists, owner access) |
| Region | `asia-southeast2` (Jakarta, ADR-005) |
| Enabled APIs | `generativelanguage` · `geocoding-backend` · `places-backend` · `routes` · `elevation-backend` · `secretmanager` · (deploy: `run`, `cloudbuild`, `artifactregistry`) |
| API key — Gemini | `rumper-gemini-key` (restricted to Generative Language API) |
| API key — Maps | `rumper-maps-key` (restricted to Geocoding/Places/Routes) |
| Secret | `rumper-env` — whole backend `.env` as one secret (ADR-006) |
| Postgres (local now) | db `rumper` (`createdb rumper`); later Cloud SQL `rumper-db` |
| Cloud Run service | `rumper-api` (when deployed) |
| Artifact Registry | `rumper` (when deployed) |
| Runtime SA | `rumper-run@rumper-499015.iam.gserviceaccount.com` |

## 2. One-time provisioning (CLI, idempotent)

```bash
gcloud config set project rumper-499015

gcloud services enable generativelanguage.googleapis.com \
  geocoding-backend.googleapis.com places-backend.googleapis.com \
  routes.googleapis.com secretmanager.googleapis.com

# API keys (api-keys API itself must be enabled)
gcloud services enable apikeys.googleapis.com
gcloud services api-keys create --display-name="rumper-gemini-key" \
  --api-target=service=generativelanguage.googleapis.com
gcloud services api-keys create --display-name="rumper-maps-key" \
  --api-target=service=geocoding-backend.googleapis.com \
  --api-target=service=places-backend.googleapis.com \
  --api-target=service=routes.googleapis.com

# Secret: whole .env (rotate by adding versions)
gcloud secrets create rumper-env --replication-policy=automatic
gcloud secrets versions add rumper-env --data-file=backend/.env
```

`backend/.env` keys:

```
GEMINI_API_KEY=…
GEMINI_MODEL=gemini-3.5-flash
MAPS_API_KEY=…
DATABASE_URL=postgresql+asyncpg://localhost/rumper
FRONTEND_ORIGIN=http://localhost:3000
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=…
LANGSMITH_PROJECT=rumper
```

Ingestion jobs (docs/10 §3) run locally via CLI now; in GCP they become a Cloud Run
Job `rumper-ingest` triggered weekly by Cloud Scheduler (same module, same image).

## 3. Local-first run

```bash
createdb rumper                  # once
cd backend && uv sync && uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev   # :3000, proxies /api → :8000
```

## 4. Deploy path (documented, executed after local validation)

Mirrors nihonjung doc 28: Cloud Build → Artifact Registry → migrate → Cloud Run
(`rumper-api`), secret mounted as file (`--set-secrets /secrets/env=rumper-env:latest
--set-env-vars ENV_FILE=/secrets/env`), runtime SA with `secretmanager.secretAccessor`
only. **Frontend ships inside the same image** (ADR-009): the Dockerfile builds the
Vite bundle into `backend/static/` and FastAPI serves it — one Cloud Run service,
scale-to-zero, no LB/CDN. Cloud SQL Postgres replaces local db; `DATABASE_URL`
changes inside the secret only.

## 5. Cost guardrails (TF-3: < Rp50k variable per report)

Per Mini Check ≈ 3 grounded Gemini calls + 1 composer call + ~2 Routes calls +
~6 Places calls — well under target at prototype volume. Budget alert at $25/mo on
the project is recommended (set in console or `gcloud billing budgets`).
