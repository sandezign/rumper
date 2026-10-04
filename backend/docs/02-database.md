# 02 — Database

Source: `app/db/session.py`, `app/db/checkpointer.py`, `app/models/*`, `migrations/`.
Specs: docs/04 (data model), docs/10 (geo warehouse), docs/13 (users/usage).

## 1. Engine & sessions (`app/db/session.py`)

- `Base(DeclarativeBase)` — single metadata for all models.
- `get_engine()` — lazy module-global `create_async_engine(settings.database_url,
  pool_size=5, max_overflow=5)`.
- `session_factory()` — lazy `async_sessionmaker(engine, expire_on_commit=False)`.
  Background tasks and providers always open their **own** session via
  `session_factory()()`; only request handlers use the `get_db` dependency
  (`async with session_factory()() as session: yield session`).

## 2. LangGraph checkpointer (`app/db/checkpointer.py`)

Durable graph state in the same Postgres (nihonjung doc-34 pattern). Chat
conversations are threads (`thread_id = <conversation_id>`); research jobs are threads
(`thread_id = job:<job_id>`).

- `_conninfo()` normalizes the SQLAlchemy URL to libpq form: strips any of
  `postgresql+asyncpg://`, `postgresql+psycopg2://`, `postgresql+psycopg://`,
  `postgres://` → `postgresql://...`.
- `init_checkpointer()` (idempotent, called from lifespan): creates an
  `AsyncConnectionPool(min_size=1, max_size=4, max_idle=120, max_lifetime=1800,
  timeout=30, check=check_connection, kwargs={"autocommit": True,
  "prepare_threshold": 0}, open=False)`, opens it, wraps in `AsyncPostgresSaver`,
  and runs `setup()` (idempotent creation of the `checkpoint*` tables).
  `prepare_threshold=0` keeps it safe behind transaction-mode poolers (Neon/PgBouncer).
- `get_checkpointer()` lazily initializes; `close_checkpointer()` closes the pool and
  resets the globals.

## 3. Tables (SQLAlchemy ORM)

Conventions: PK `id UUID default uuid4` unless noted; timestamps are
`DateTime(timezone=True)` with `server_default=func.now()`; JSON columns are JSONB.

### intakes (`models/intake.py`)
| column | type | notes |
|---|---|---|
| full_name, whatsapp | Text | `whatsapp` is PII — never logged |
| property_name, maps_link | Text? | |
| address_text | Text | raw user input |
| lat, lng | Double? | geocoded property point |
| formatted_address | Text? | from Geocoding API |
| in_jabodetabek | Boolean default true | substring heuristic, doc 04 §2 |
| purpose, buying_stage, dp_timeline | Text? | enums enforced at API layer only |
| workplace_text | Text | + `workplace_lat/lng Double?` |
| transport_mode | Text | `mobil\|motor\|krl\|transjakarta\|campuran` |
| concerns | JSONB default {} | `{"categories": [...], "notes": str?}` |
| consent_whatsapp, consent_privacy | Boolean | |
| created_at | timestamptz | |

### research_jobs (`models/research.py`)
`intake_id UUID FK intakes.id UNIQUE` (one job per intake) · `status Text
default 'pending'` (`pending|running|done|failed`) · `error Text?` ·
`categories_done Integer default 0` (coarse loader step 0–5, doc 05 §4) ·
`progress_pct Integer default 0` (0–100 loader bar) · `progress_note Text?` (live id-ID
loader label) — server-owned progress the FE renders verbatim ·
`trace_id Text?` (LangSmith run id) · `started_at/finished_at timestamptz?`.

### findings
`job_id FK research_jobs.id` · `category Text`
(`banjir|commute|akses|fasilitas|lingkungan`) · `claim Text` ·
`evidence JSONB default []` (list of Evidence dicts, doc 05 §1) · `confidence Text`
(`data_kuat|data_sedang|perlu_validasi`) · `limitation Text default ''` ·
`validation_action Text default ''` · `is_red_flag/is_critical/is_evidence_gap
Boolean default false`.

### category_scores
`UniqueConstraint(job_id, category)` · `score Integer?` (post-clamp, engine-owned) ·
`proposed_score Integer?` (researcher/LLM proposal) · `confidence Text` ·
`rationale Text default ''`.

### reports
`job_id FK UNIQUE` · `report_type Text default 'mini_check_preliminary'` ·
`rls_score Numeric(5,2)?` · `band Text?` · `recommendation Text` ·
`summary Text default ''` · `checklist JSONB default []`
(`[{item, category, reason}]`) · `created_at`.

### geo_features (`models/geo.py`) — the warehouse (docs/10)
`kind Text` (`toll_gate|station|hospital|clinic|school|market|supermarket|pharmacy|
sutet_tower|landfill|industrial|cemetery|rail_point`) · `name Text default ''` ·
`lat/lng Double` · `source Text default 'osm'` · `osm_id BigInteger?` ·
`meta JSONB default {}` · `ingested_at timestamptz`.
Index: `ix_geo_features_kind_lat_lng (kind, lat, lng)` — supports the bounding-box
prefilter in `services/spatial.py`.

### point_cache
`UniqueConstraint(kind, lat_r, lng_r)` · `kind Text` (`inarisk_flood|elevation`) ·
`lat_r/lng_r Double` (rounded to 4dp ≈ 11 m) · `value JSONB default {}` ·
`fetched_at timestamptz`. Empty `{}` value = upstream said NoData (cached negative).

### ingestion_runs
`dataset Text` · `status Text default 'running'` (`running|done|failed`) ·
`feature_count Integer default 0` · `error Text?` · `started_at/finished_at`.

### users (`models/user.py`)
`google_sub Text UNIQUE` · `email Text` · `name Text default ''` · `picture Text?`
(Google URL, fallback only) · `picture_base64 Text?` (mirrored avatar as data URI,
≤1 MB decoded — doc 03 §1.1) · `tokens_used BigInteger default 0` (lifetime counter) ·
`token_limit Integer default 50_000` (daily quota) · `created_at`.

### refresh_tokens (`models/user.py`)
`user_id FK users.id ON DELETE CASCADE, indexed` · `token_hash Text UNIQUE`
(sha256 hex — raw secrets never stored) · `expires_at timestamptz` ·
`revoked_at timestamptz?` (set on rotation/logout/reuse-revocation) · `created_at`.
Single-use rotation semantics: doc 03 §1.

### projects / conversations / messages (`models/chat.py`)
- **projects**: `user_id FK users.id` · `name Text`.
- **conversations**: `user_id FK` · `project_id FK projects.id?` ·
  `title Text default 'Percakapan baru'` · `state Text default 'gathering'`
  (`gathering|researching|report_qa`) · `intake_draft JSONB default {}` ·
  `intake_id FK intakes.id?` · `created_at` · `updated_at` (`onupdate=func.now()`).
- **messages**: `conversation_id FK` · `role Text` (`user|assistant`) ·
  `content Text` · `meta JSONB default {}` (holds `suggestions`) · `created_at`.

### usage_events / model_prices (`models/usage.py`)
- **usage_events** (one row per metered LLM call): `user_id FK users.id
  ON DELETE CASCADE, nullable` · `provider Text default 'gemini'` ·
  `kind Text default 'llm'` · `operation Text`
  (`chat_turn|plan|search|assess|extract|compose|summary|unknown`) · `model Text?` ·
  `input_tokens/output_tokens/total_tokens Integer default 0` ·
  `est_cost_usd Numeric(12,6) default 0` · `meta JSONB`
  (`conversation_id`, `job_id` as strings) · `created_at`.
- **model_prices**: PK `model Text` · `input_usd_per_1m / output_usd_per_1m
  Numeric(10,4)` · `updated_at` (onupdate now).

## 4. Migrations (alembic)

`migrations/env.py` imports `app.models` to register all tables on `Base.metadata`,
then overwrites `sqlalchemy.url` with `settings.database_url.replace("+asyncpg",
"+psycopg2")` — alembic runs synchronously on psycopg2. Standard offline/online
runners; `script.py.mako` is stock.

History (one concern per revision):
1. `7e3bbde7aea9_initial_schema` — intakes, research_jobs, findings, category_scores,
   reports.
2. `5f7346062bd0_geo_warehouse_trace_id` — geo_features, point_cache, ingestion_runs,
   `research_jobs.trace_id`.
3. `c2d67dc26842_users_chat_usage` — users, projects, conversations, messages,
   usage_events, model_prices.
4. `f0a1b2c3d4e5_refresh_tokens_picture_base64` — refresh_tokens,
   `users.picture_base64`.

Commands: `make migrate` (upgrade head), `make revision m="msg"` (autogenerate),
`make db-reset` (drop+create local `rumper` db, upgrade head — geo warehouse must be
re-ingested afterwards, doc 09). The LangGraph `checkpoint*` tables are **not**
alembic-managed; `AsyncPostgresSaver.setup()` owns them.
