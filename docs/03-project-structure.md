# 03 — Project Structure

Implementation-level documentation lives **next to the code** and is rebuild-grade
(SDD: delete the code, the docs suffice to rewrite it):

- [`backend/docs/`](../backend/docs/README.md) — runtime/config, database, auth+usage,
  providers, research pipeline, chat workspace, endpoints, prompts, jobs/ops.
- [`frontend/docs/`](../frontend/docs/README.md) — routing/workspace, API client,
  components/pages, build + design tokens.

```
rumper/
├── CLAUDE.md                  # root guardrails
├── docs/                      # this spec set (00–14): what/why + contracts
├── ARCHITECTURE.md, PRDs…     # vision tier (existing)
├── backend/
│   ├── pyproject.toml         # uv-managed (Python 3.12)
│   ├── .env.example           # template (real .env gitignored)
│   ├── Makefile               # dev/migrate/ingest/deploy helpers
│   ├── alembic.ini
│   ├── migrations/versions/   # 3 revisions: core, geo+trace, users/chat/usage
│   ├── static/                # Vite build output, served by FastAPI (ADR-009)
│   ├── docs/                  # ← implementation docs (backend/docs/README.md)
│   └── app/
│       ├── main.py            # app factory + CORS + routers + SPA fallback
│       ├── core/
│       │   ├── config.py      # pydantic-settings; .env / ENV_FILE
│       │   ├── auth.py        # Google ID-token verify + session cookie + quota gate
│       │   └── usage.py       # WIB daily quota, ContextVar attribution, ledger
│       ├── db/
│       │   ├── session.py     # async engine + session factory
│       │   └── checkpointer.py# LangGraph AsyncPostgresSaver (durable threads)
│       ├── models/            # intake, research, chat, geo, usage, user
│       ├── schemas/           # api.py (REST), research.py (agent IO), chat.py
│       ├── routers/
│       │   ├── auth.py        # /api/auth/google|me|logout
│       │   ├── chat.py        # projects, conversations, SSE turn + progress
│       │   ├── intakes.py     # POST /api/intakes (ops fallback)
│       │   └── checks.py      # GET /api/checks/{id} + /map
│       ├── providers/
│       │   ├── llm.py         # single Gemini entry point (grounded + structured)
│       │   ├── gmaps.py       # Geocoding / Routes v2 / Places (httpx)
│       │   ├── hazards.py     # InaRISK flood + elevation, point_cache
│       │   └── osm.py         # Overpass batch client (ingestion only)
│       ├── services/
│       │   ├── research_graph.py  # deep-research LangGraph (docs/11)
│       │   ├── orchestrator.py    # job lifecycle, progress, persistence
│       │   ├── spatial.py         # SpatialFacts + deterministic categories
│       │   ├── scoring.py         # STD-SCR-001 deterministic engine
│       │   ├── composer.py        # Mini Check narrative (facts only)
│       │   ├── chat_graph.py      # checkpointed chat turn graph (docs/12)
│       │   ├── chat_service.py    # turn driver + research trigger
│       │   └── researchers/       # base helpers + deterministic commute
│       ├── prompts/               # agent-skill-format .md prompts + render()
│       └── jobs/
│           └── ingest_geo.py      # weekly OSM warehouse ingestion (docs/10)
├── frontend/
│   ├── package.json           # Vite 6 + React 19 + TS + Tailwind v4
│   ├── vite.config.ts         # dev proxy /api → :8000; outDir → ../backend/static
│   ├── docs/                  # ← implementation docs (frontend/docs/README.md)
│   └── src/
│       ├── main.tsx           # routes: / and /c/:threadId (workspace), /form, /check/:id
│       ├── index.css          # Tailwind @theme tokens + map/chat classes
│       ├── lib/api.ts         # typed client (docs/05/12/13/14) + SSE parsing
│       ├── components/        # Workspace, Sidebar, ChatArea, MapPanel, LoginModal
│       └── pages/             # Intake (ops form), Check (ops report view)
└── cloudbuild.yaml            # deploy path (doc 08) — added when we deploy
```

Rules: code lives in its layer (no flat dumps in `app/`); routers thin, logic in
`services/`; all external IO behind `providers/`; prompts are files, not inline
strings; components never `fetch` directly — everything through `lib/api.ts`.
