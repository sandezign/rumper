# 01 — Runtime & Config

Source: `app/main.py`, `app/core/config.py`. Specs: docs/01 (architecture), docs/08 (GCP).

## 1. App factory (`app/main.py`)

`FastAPI(title="Rumper API", version="0.2.0", lifespan=lifespan)` with
`logging.basicConfig(level=logging.INFO)` at import time.

**Lifespan** (asynccontextmanager):
- startup: `await init_checkpointer()` (doc 02 §2) then `await seed_model_prices()`
  (doc 03 §4);
- shutdown: `await close_checkpointer()`.

**CORS**: `CORSMiddleware` with `allow_origins=settings.frontend_origins` (the
comma-split allow-list — e.g. `https://rumper.web.app,http://localhost:3000`),
`allow_credentials=True`, all methods/headers. Credentials matter — the session is a
cookie (doc 03).

**Hardening middleware** (added after CORS, so they wrap it; doc 03 §1.2):
`OriginCheckMiddleware` (CSRF origin allow-list on unsafe `/api` requests) and
`SecurityHeadersMiddleware` (outermost — nosniff, frame-deny, referrer policy,
permissions policy, HSTS on https, `Cache-Control: no-store` for `/api/*`).

**Routers** (in order): `auth`, `chat`, `intakes`, `checks` (doc 07).

**Health**: `GET /api/health` → `HealthResponse {status: "ok", db: bool}`; `db` is the
result of executing `select 1` on the engine, `False` on any exception.

**Static SPA (ADR-009)**: if `backend/static/index.html` exists:
- mount `StaticFiles` at `/assets` from `backend/static/assets`;
- a catch-all `GET /{full_path:path}` (excluded from the OpenAPI schema) returns the
  exact file when `static/<full_path>` is an existing file, otherwise `index.html`
  (client-side routing fallback). Registered **after** all API routes so `/api/*` wins.

The static dir is resolved relative to the file:
`Path(__file__).resolve().parents[1] / "static"`.

## 1a. Running it — `make dev`, and the moved-repo trap

`make dev` → `uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`.

**A venv is not relocatable.** `uv venv` bakes its own absolute path into `bin/activate` and
into the shebang of every console script (`uvicorn`, `alembic`, `pytest`, …). Move or rename
the checkout and all of them point at a directory that no longer exists:

```
$ head -1 .venv/bin/uvicorn
#!/Users/fjung/dev/rumper/backend/.venv/bin/python      # ← old path, gone
$ .venv/bin/uvicorn --version
bad interpreter: ... no such file or directory
```

`.venv/bin/python` keeps working (it is a symlink to the pyenv base interpreter, and
`pyvenv.cfg` still resolves `sys.prefix` correctly), so `.venv/bin/python -m uvicorn` succeeds
and hides the problem. But `uv run uvicorn` cannot exec the broken console script, falls
through to `PATH`, and finds the **pyenv** `uvicorn` — which runs on pyenv's `site-packages`.
The failure then surfaces deep inside LangChain and looks like a dependency bug:

```
ImportError: cannot import name 'ModelProfile' from 'langchain_core.language_models'
```

That is an old `langchain-core` (0.3.x) being imported against `langchain-google-genai` 4.x.
We pin `langchain-core>=1.4.3`. A global env may also drag in `transformers`/`torch` — if you
see NumPy/torch warnings in this project's traceback, you are in the wrong interpreter, because
we depend on neither.

`uv` warns about the stale environment, and the warning is the real clue — read the path:

```
warning: `VIRTUAL_ENV=/old/path/backend/.venv` does not match the project environment path `.venv`
```

**Fix after moving the checkout** — rebuild, or repoint in place:

```bash
rm -rf .venv && uv sync                     # clean rebuild (authoritative, from uv.lock)
# or, in place:
grep -rl '/old/path/backend/.venv' .venv/bin/ \
  | xargs perl -pi -e 's{/old/path/backend/\.venv}{'"$PWD"'/.venv}g'
```

Then `deactivate` (or open a new shell) — an already-activated stale venv keeps the dead path
exported in `VIRTUAL_ENV` and on `PATH`.

Verify before debugging dependencies:

```bash
uv run python -c "import sys, importlib.metadata as m; print(sys.executable, m.version('langchain-core'))"
# .../rumper-apps/rumper/backend/.venv/bin/python3 1.4.3
```

**A dead reloader still holds the port.** When the worker dies on import, the `--reload` parent
survives and keeps :8000 bound with nothing serving it. `lsof -nP -iTCP:8000` then shows the
socket `CLOSED`, and the Vite dev proxy returns 500s for `/api/*` that look like backend bugs.
Kill the reloader before restarting.

## 2. Settings (`app/core/config.py`)

`pydantic-settings` `BaseSettings`; env file is `backend/.env` by default, overridable
via the `ENV_FILE` environment variable (Secret Manager mount path in Cloud Run,
doc 09 §4). `extra="ignore"`; `get_settings()` is `@lru_cache`d (one instance per
process — env changes need a restart).

| Field | Default | Meaning |
|---|---|---|
| `gemini_api_key` | **required** | Gemini API key (all LLM calls) |
| `gemini_model` | `gemini-3.5-flash` | single model for every call; also the usage-ledger model id |
| `maps_api_key` | **required** | Google Maps Platform key (`rumper-maps-key`) |
| `database_url` | `postgresql+asyncpg://localhost/rumper` | SQLAlchemy async URL |
| `frontend_origin` | `http://localhost:3000` | CORS + CSRF allow-list, **comma-separated** (`settings.frontend_origins`). Cookie `secure` is decided per-request (https?), not from this. |
| `app_secret` | dev placeholder (40 chars) | HS256 key for access JWTs — ≥32 bytes (RFC 7518), MUST be overridden in prod |
| `google_oauth_client_id` | `""` | GIS client id; ID-token `aud` must match |
| `google_oauth_client_secret` | `""` | reserved (GIS one-tap flow doesn't need it) |
| `default_token_limit` | `50_000` | per-user daily token quota at signup (docs/13) |
| `langsmith_tracing` | `False` | enable LangSmith tracing (ADR-011) |
| `langsmith_api_key` | `None` | |
| `langsmith_project` | `rumper` | |
| `researcher_timeout_seconds` | `75.0` | per-researcher budget (docs/11 §4) |
| `graph_timeout_seconds` | `480.0` | whole research graph hard timeout |
| `max_refine_iterations` | `1` | search⇄assess refinement loops (doc 05 §2) |
| `llm_temperature` | `0.2` | default temperature for research calls |
| `composer_temperature` | `0.4` | narrative composer temperature |

**LangSmith bridge**: LangSmith reads `os.environ`, not pydantic. When
`langsmith_tracing && langsmith_api_key`, `get_settings()` does
`os.environ.setdefault("LANGSMITH_TRACING", "true")`, `LANGSMITH_API_KEY`,
`LANGSMITH_PROJECT` — `setdefault` so explicit env always wins.

`.env.example` ships only the v1 keys (`GEMINI_API_KEY`, `GEMINI_MODEL`,
`MAPS_API_KEY`, `DATABASE_URL`, `FRONTEND_ORIGIN`); auth/quota/tracing keys are added
to `.env` by hand when those features are configured.

### SPA cache headers (2026-08-30)

Symptom: a deploy succeeded, the container served the new bundle, and the browser still
showed the old frontend.

Cause: `FileResponse` sends no `Cache-Control`. With only `ETag`/`Last-Modified` present,
browsers fall back to *heuristic* caching (commonly ~10% of the age since `Last-Modified`)
and may reuse `index.html` without revalidating. Since `index.html` is the file that names
the content-hashed bundles, a stale copy keeps requesting the previous build's assets — the
deploy looks like it never landed.

Now:

| path | header | why |
|---|---|---|
| `/assets/*` | `public, max-age=31536000, immutable` | Vite content-hashes the filename, so the bytes behind a URL never change |
| everything else (`index.html`) | `no-cache, must-revalidate` | it names the hashes, so it must be re-fetched every load |

`no-cache` means "revalidate before use", not "do not store". Starlette's raw `FileResponse`
does not implement conditional `304` (that logic lives in `StaticFiles`), so revalidation
currently costs a full 200 — 706 bytes, which is not worth a custom handler.
