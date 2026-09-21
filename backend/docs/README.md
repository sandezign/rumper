# Backend implementation docs (rebuild-grade)

These docs describe the FastAPI backend at **implementation level**: every module, its
exact behavior, constants, schemas, and algorithms. Together with the root spec set
(`docs/00–14`, the *what/why* tier) they are sufficient to rebuild `backend/app/` from
scratch. Per SDD, when code and these docs disagree, fix one of them in the same PR.

Division of labor with the root `docs/`:

- `docs/` (repo root) — product behavior, contracts, decisions (ADRs). Source of truth
  for *what* the system does.
- `backend/docs/` (here) — *how* the backend implements it: file-by-file responsibilities,
  function signatures, rule tables, magic numbers, error handling.

## Reading order

| Doc | Covers | Source files |
|---|---|---|
| [01-runtime-and-config.md](01-runtime-and-config.md) | App factory, lifespan, CORS, SPA serving, settings | `app/main.py`, `app/core/config.py` |
| [02-database.md](02-database.md) | Engine/session, LangGraph checkpointer, every table, migrations | `app/db/*`, `app/models/*`, `migrations/` |
| [03-auth-and-usage.md](03-auth-and-usage.md) | Google login, session cookie, daily token quota, usage ledger | `app/core/auth.py`, `app/core/usage.py` |
| [04-providers.md](04-providers.md) | LLM gateway, Google Maps, InaRISK/elevation, Overpass | `app/providers/*` |
| [05-research-pipeline.md](05-research-pipeline.md) | Deep-research LangGraph, spatial facts, scoring engine, composer | `app/services/research_graph.py`, `spatial.py`, `scoring.py`, `composer.py`, `orchestrator.py`, `researchers/*` |
| [06-chat-workspace.md](06-chat-workspace.md) | Chat graph, turn driver, conversation state machine | `app/services/chat_graph.py`, `chat_service.py` |
| [07-endpoints.md](07-endpoints.md) | Every HTTP endpoint as implemented (incl. SSE protocols) | `app/routers/*`, `app/schemas/*` |
| [08-prompts.md](08-prompts.md) | Prompt registry format + per-prompt reference | `app/prompts/*` |
| [09-jobs-and-operations.md](09-jobs-and-operations.md) | Geo ingestion job, Makefile, local setup from zero, deploy | `app/jobs/*`, `Makefile`, `pyproject.toml` |

## Project layout and layering rules

```
backend/
├── pyproject.toml        # uv-managed; Python >= 3.12
├── .env.example          # template; real .env is gitignored
├── Makefile               # dev/migrate/ingest/deploy helpers (doc 09)
├── alembic.ini
├── migrations/            # alembic; env.py swaps async driver for sync
├── static/                # Vite build output (served by FastAPI in prod, ADR-009)
└── app/
    ├── main.py            # FastAPI app factory + CORS + routers + SPA
    ├── core/              # config, auth, usage metering (no business logic)
    ├── db/                # engine/session factory + LangGraph checkpointer
    ├── models/            # SQLAlchemy ORM, one module per domain
    ├── schemas/           # Pydantic: api.py (REST), research.py (agent IO), chat.py
    ├── routers/           # thin HTTP layer; logic lives in services/
    ├── providers/         # ALL external IO: llm, gmaps, hazards, osm
    ├── services/          # orchestration, graphs, scoring, spatial, composer
    │   └── researchers/   # deterministic category researchers + shared helpers
    ├── prompts/           # agent-skill-format .md prompt files + render()
    └── jobs/              # batch CLI jobs (geo ingestion)
```

Hard rules (CLAUDE.md):

1. Routers are thin — parse/validate/authorize, then call `services/`.
2. All external IO goes through `providers/`; nothing else opens HTTP connections
   (exception: `core/auth.py` calls Google's tokeninfo endpoint and mirrors the
   login avatar directly — auth concerns, not data IO).
3. All LLM calls go through `providers/llm.py`; all prompt text lives in `prompts/*.md`
   and is rendered via `app.prompts.render(name, **vars)` — never inline prose.
4. Scoring (`services/scoring.py`) is pure code: no LLM, no IO, fully reproducible.
5. User-facing strings (error details, findings, summaries) are Bahasa Indonesia.
6. JSON is `snake_case`; IDs are UUIDs (stringified in JSON).

## Dependencies (pyproject)

Runtime: `fastapi>=0.115`, `uvicorn[standard]>=0.32`, `pydantic>=2.9`,
`pydantic-settings>=2.5`, `sqlalchemy[asyncio]>=2.0`, `asyncpg>=0.30`,
`psycopg2-binary>=2.9` (alembic only), `alembic>=1.13`, `google-genai>=1.0`,
`httpx>=0.27`, `langgraph>=1.2.4`, `langsmith>=0.8.12`, `pyjwt>=2.13.0`,
`langgraph-checkpoint-postgres>=3.1.0`, `psycopg[binary]>=3.3.4`,
`psycopg-pool>=3.3.1`, `langchain-google-genai>=4.2.5`, `langchain-core>=1.4.3`.
Dev: `pytest>=8.0`, `pytest-asyncio>=0.24`.

Three Postgres drivers coexist deliberately: **asyncpg** for the app engine,
**psycopg3** (+pool) for the LangGraph checkpointer, **psycopg2** for alembic's
synchronous migrations.
