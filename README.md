# Rumper

Buyer-side **location risk advisor** for first-time homebuyers in Jabodetabek. This repo
holds the product/business docs **and** the working prototype of the **AI Research Agent**
that automates analyst desk research (SOP-RSCH-001) into a preliminary **Mini Check**.

> The spec set is the source of truth (Specs-Driven Development). Start at
> [`docs/00-overview.md`](docs/00-overview.md). Guardrails: [`CLAUDE.md`](CLAUDE.md).

## Architecture at a glance

```
frontend/  Vite + React 19 SPA (chat workspace + intake + Mini Check result)
backend/   FastAPI + LangGraph research pipeline (Python 3.12, uv) + Postgres
```

- The frontend talks to the backend over **same-origin `/api`** (cookies carry the session).
- In **production** the backend serves the built SPA, and Firebase Hosting (site `rumper`)
  rewrites `/api/**` to the Cloud Run service `rumper-api`. Deployed origin:
  **https://rumper.web.app**.
- In **development** the Vite dev server (`:3000`) proxies `/api` to the backend (`:8000`).

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | frontend (Vite 6 / React 19) |
| Python | 3.12 | backend |
| [uv](https://docs.astral.sh/uv/) | latest | Python deps + task runner |
| PostgreSQL | 14+ | local DB named `rumper` |
| Google Maps Platform key | — | Geocoding, Routes, Places (`MAPS_API_KEY`) |
| Gemini API key | — | LLM calls (`GEMINI_API_KEY`) |

> Want to iterate on the UI **without** a local backend or any keys? Jump to
> [Frontend only (against the prod API)](#mode-b--frontend-only-against-the-prod-api).

---

## Run mode A — full stack (local backend + frontend) — primary dev loop

### 1. Backend

```bash
cd backend
cp .env.example .env          # then fill in GEMINI_API_KEY and MAPS_API_KEY (minimum)
uv sync                       # install deps           (= make install)
createdb rumper               # one-time local Postgres DB
uv run alembic upgrade head   # run migrations         (= make migrate)
make ingest-geo               # fill the geo warehouse (toll gates, stations, …)
make dev                      # uvicorn on http://127.0.0.1:8000 (--reload)
```

Minimum `backend/.env` (other settings have sensible defaults — see `app/core/config.py`):

```ini
GEMINI_API_KEY=...
MAPS_API_KEY=...
DATABASE_URL=postgresql+asyncpg://localhost/rumper
# For Google sign-in (the chat workspace requires login):
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
APP_SECRET=<random string ≥32 bytes>
```

### 2. Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000  (proxies /api → :8000)
```

Open **http://localhost:3000**. See [`frontend/README.md`](frontend/README.md) for the
frontend-only env vars (`VITE_GOOGLE_MAPS_KEY` for the map, `VITE_GOOGLE_CLIENT_ID` for login).

---

## Run mode B — frontend only (against the prod API)

Run just the SPA and point its `/api` proxy at the deployed backend — handy for UI/design
work when you don't want to stand up Postgres + keys locally.

```bash
cd frontend
npm install
VITE_API_PROXY=https://rumper.web.app npm run dev
# or persist it: echo 'VITE_API_PROXY=https://rumper.web.app' >> .env.local
```

**Login works in this mode — no backend redeploy needed.** The dev proxy makes the remote
session behave same-origin, so it works against the deployed API as-is:

- it rewrites the request `Origin` to the target, so the backend's CSRF check passes
  (instead of `403 "Origin tidak diizinkan."`), and
- it strips `Secure`/`Domain` on the session cookie, so the browser stores it over
  `http://localhost` (a remote https API marks the cookie `Secure`, which the browser
  otherwise drops on http).

Both rewrites are **dev-only** — they trigger only when `VITE_API_PROXY` is an `https://`
origin, and never touch prod. The only external requirement: the Google OAuth client must
list **`http://localhost:3000`** as an *Authorized JavaScript origin* (Cloud Console →
Credentials) so the sign-in popup works.

> The browser's network tab will show requests to `http://localhost:3000/api/...` — that's
> expected. A Vite proxy is server-side: the browser talks to the dev server, which forwards
> `/api` to the remote origin internally. The URL staying on localhost is not an error.
>
> You're talking to the **real** deployed backend — sign-ins, audits, and chat create real
> sessions/data in prod. Use a test account.
>
> (Separately, the backend accepts a **comma-separated** `FRONTEND_ORIGIN`, e.g.
> `https://rumper.web.app,http://localhost:3000`. That's only needed for a **direct**,
> non-proxied cross-origin client — the proxy path above does not require it.)
>
> No backend at all needed for the first-run loader: open
> **http://localhost:3000/dev/research-loading** (dev-only mock, see frontend README).

---

## Run mode C — prod-like single origin (local)

Serve the built SPA from the backend, exactly like production (one origin, no proxy):

```bash
cd backend && make build-fe   # builds frontend → backend/static
make dev                      # FastAPI serves the SPA + /api at http://127.0.0.1:8000
```

---

## Common backend tasks (`backend/Makefile`)

| Command | What it does |
|---|---|
| `make install` | `uv sync` |
| `make dev` | run the API on `:8000` with reload (serves the FE build too) |
| `make migrate` | `alembic upgrade head` |
| `make revision m="msg"` | autogenerate a migration |
| `make db-reset` | drop + recreate the local `rumper` DB and migrate (re-ingest geo after!) |
| `make ingest-geo [ARGS="toll_gate sutet_tower"]` | ingest OSM warehouse datasets |
| `make build-fe` | build the frontend into `backend/static` |
| `make reset-usage [EMAIL=you@example.com]` | clear today's token-usage events (dev quota reset) |
| `make lint` / `make fmt` | ruff check / format |

## Figma MCP (Claude Code only)

Lets Claude Code read Figma frames directly when implementing designs — it is a **dev-tool
integration, not an app dependency**: nothing in `frontend/` or `backend/` imports it, and
it has no effect on the build.

```bash
cp .env.example .env          # repo-root .env is gitignored
# add your Figma personal access token (figd_…):
#   FIGMA_API_KEY=figd_...
claude                        # approve the "figma" server when prompted (first run only)
```

| File | Role |
|---|---|
| `.mcp.json` | project-scoped server registration — **committed, contains no secret** |
| `scripts/figma-mcp.sh` | launcher: reads `FIGMA_API_KEY` from the gitignored `.env`, disables telemetry, pins the image dir |
| `.env` | the token itself — **gitignored, never commit** (CLAUDE.md rule 5) |

Tools exposed: `get_figma_data` (layout/styles/content for a file or node) and
`download_figma_images`, which writes to `frontend/docs/design/figma-exports/`.
Token scope only needs **File content: read-only**. Rotate it in Figma → Settings →
Security if it is ever pasted somewhere shared.

## Layout & docs

- `docs/` — prototype spec set; index at [`docs/00-overview.md`](docs/00-overview.md).
- `backend/docs/` — rebuild-grade backend implementation docs.
- `frontend/docs/` — frontend implementation docs (routing, API client, components).
- `ARCHITECTURE.md`, `context.md`, business plan & PRD — vision tier.
