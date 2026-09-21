# 02 — Tech Stack & Decisions (ADRs)

## Stack (mirrors nihonjung patterns where they fit)

| Layer | Choice |
|---|---|
| Backend | Python 3.12 · FastAPI · uvicorn · uv (package manager) |
| ORM / migrations | SQLAlchemy 2 async (asyncpg) · Alembic |
| Database | PostgreSQL, local db **`rumper`** (`createdb rumper`); Cloud SQL later |
| LLM | Gemini **`gemini-3.5-flash`** via `google-genai` SDK, single entry `app/providers/llm.py`, Pydantic structured output, Google Search grounding for evidence (fallback: `gemini-3.1-flash-lite`) |
| Geo data | Google Maps Platform: Geocoding, Routes (traffic-aware), Places (Nearby/Text) |
| Frontend | **Vite + React + TypeScript + Tailwind static SPA**, served by the FastAPI container (ADR-009) |
| Cloud | GCP `rumper-499015`, `asia-southeast2`; Secret Manager (`rumper-env`); Cloud Run (deploy path documented, local-first) |

## ADRs

### ADR-001 — Rule-based scoring engine; AI proposes, code disposes
Accepted. RLS formula, weights, bands, red-flag override, recommendation selection are
deterministic code (ARCHITECTURE.md §5 exclusion list; pre-mortem tiger #1). Researchers
may *propose* a category score with rationale; the engine clamps proposals against
rubric rules (doc 07 §3) and computes everything else. Re-running with identical inputs
must give identical RLS (TF-2 gate: ±2 points).

### ADR-002 — Gemini + Google Search grounding is the evidence source for textual research
Accepted. Flood history, environment red flags, and access context need news/social/web
evidence with citations. Grounded search returns source URLs we store per finding; a
finding without grounded sources is automatically `Perlu validasi` or an evidence gap.
Replaces manual analyst Googling at PoC; analysts keep quality review.

### ADR-003 — STD-SCR-001 (0–100 × weights) supersedes ARCHITECTURE.md §4.3 (1–5 formula)
Accepted. rumper-2's operational standard is newer and analyst-tested. Weights stay
30/25/15/15/15; bands: 80–100 Relatif kuat · 65–79.99 Layak dengan catatan ·
50–64.99 Hati-hati · <50 Risiko tinggi / perlu validasi kuat.

### ADR-004 — Deterministic data beats LLM judgment where APIs exist
Accepted. Commute (Routes API with `departure_time` traffic) and amenities (Places
radius search) are scored by code from API responses; the LLM only phrases the
narrative. LLM-proposed scores are limited to flood / access / red-flags where evidence
is textual — and are clamped (ADR-001).

### ADR-005 — Region `asia-southeast2` (Jakarta); all resources named `rumper-*`
Accepted. Users and data are Indonesian; Jakarta region minimizes latency.
(nihonjung uses Singapore; we deliberately differ.) Resource registry: doc 08 §1.

### ADR-006 — One secret `rumper-env` holds the whole backend `.env`
Accepted. Copies nihonjung ADR-017: Cloud Run mounts the secret as a file; rotation =
push new version. Locally `backend/.env` (gitignored, template `backend/.env.example`).

### ADR-007 — Background task orchestration, not a queue
Accepted (prototype only). Research runs as an in-process FastAPI background task with
per-category timeouts. Cloud Tasks/Jobs deferred until volume justifies (Phase 2 gate).

### ADR-008 — Mini Check is preliminary by contract
Accepted. API and UI must label output `mini_check_preliminary`; recommendation wording
follows STD-SCR-001 §8 four-option enum; disclaimer is a fixed string in code, not
LLM-generated. Final reports remain in the human concierge workflow.

### ADR-009 — Vite static SPA served by FastAPI; no Next.js, no extra infra
Accepted. Constraints: deploy on our GCP (not Vercel), MVP budget for <500 users, no
load balancer / self-managed CDN. Next.js's strengths (SSR/ISR/edge) need Vercel-like
infra to shine and buy us nothing for a logged-out two-route flow. A Vite + React SPA
builds to static assets that the FastAPI container serves (`/` and `/check/*` →
`index.html`; `/api/*` → routers) — **one Cloud Run service total**, scale-to-zero,
small bundle, no SEO requirement at prototype (landing/SEO stays on the rumper-2
website). Revisit only if SEO or personalization-at-edge becomes a requirement.

### ADR-011 — LangGraph deep-research workflow; LangSmith tracing
Accepted (supersedes the single-pass researcher set of docs/06 v1). Research runs as a
LangGraph state machine with an explicit plan → search → assess → refine loop
(docs/11), mirroring nihonjung's graph idiom. LangSmith traces every job
(`LANGSMITH_TRACING=true`, project `rumper`); `research_jobs.trace_id` links report ↔ trace.

### ADR-012 — Pre-collected geo warehouse over per-request API calls
Accepted. Location facts that don't change daily (toll gates, stations, facilities,
SUTET lines, landfills, industrial zones, flood hazard index, elevation) are batch-
ingested (docs/10) into Postgres and queried locally at research time. Live APIs remain
only for: traffic-aware routing (inherently realtime), grounded news/social search, and
fallback when the warehouse is empty for an area. Benefits: depth (SUTET/TPA detection
the Places API can't do), speed, cost, and reproducibility.

### ADR-013 — Plain lat/lng + haversine now; PostGIS when polygons matter
Accepted. At Jabodetabek scale (≤ ~100k features) bbox-prefilter + haversine is
sufficient and keeps local/Cloud SQL setup trivial. Switch to PostGIS when we ingest
true flood polygons or do real point-in-polygon work (Phase 2 item, ARCHITECTURE §4.2).

### ADR-010 — Listing-independence is structural, not just editorial
Accepted (context). Zillow integrated First Street climate-risk scores into listings
(2024-25 research showed risk data shifts buyer behavior), then removed it after
seller/agent pressure (Grist, 2025). Lesson: risk transparency attached to the *seller
funnel* gets neutered. Rumper is buyer-paid and never embedded in listings — this is
the moat and must not be traded for listing-platform distribution.
Refs: zillow.com/research/climate-risk-home-value-34936 · grist.org/housing/zillow-deletes-climate-risk-data-from-listings-after-complaints-it-harms-sales

### ADR-017 — Google Maps is the sole map provider; Leaflet is not reintroduced
Accepted (2026-08-30). The UI/UX revamp prototype
(`rumper-web-gamification-main`) is built on `react-leaflet`, but the shipped app is Google
Maps only (docs/14 §2) and our own geo data already comes from Google services: geocoding,
Places autocomplete, Elevation, and the Routes API that draws real street routes. Running two
map stacks would mean two marker systems, two coordinate-rendering paths, and a second tile
bill, while losing Street View in the evidence inspector — a capability Leaflet cannot
replace and which the inspector depends on (docs/14 §2).

The revamp's map *design* is adopted in full — `TAB_CONFIG`, the 0.75 s `flyTo` on tab change,
the layer pills, the info bar, the floating detail card. Its map *library* is not. Those
behaviours are re-implemented on `@vis.gl/react-google-maps`.

Consequence: doc 18 GAP-16 is closed; the revamp's `MapPanel.tsx` is a visual reference, not a
port target.

### ADR-019 — OSM stays the warehouse; Google reconciles only what is rendered
Accepted (2026-08-30). Rendering OSM-sourced coordinates on a Google basemap put markers
beside the features Google labels. The fix is **not** to re-source the warehouse from Google:

1. **We are not licensed to store it.** Maps Platform terms allow storing `place_id`
   indefinitely and caching lat/lng for at most 30 days; other Places content may not be
   pre-fetched, cached or stored. A permanent Places-derived POI warehouse is out of bounds
   regardless of budget.
2. **The cost is not viable.** Enumerating Jabodetabek (~14,150 km²) at the granularity Nearby
   Search requires is ~$4.5k–14k per pass at the $32/1,000 Pro floor, against a weekly cadence.
3. **We would lose the differentiating data.** SUTET lines, TPA/landfill, industrial land use
   and cemeteries are OSM tags with no Places equivalent — they are precisely the red-flag
   detection ADR-012 was written to protect.

Instead, a three-tier ladder (docs/10 §5): **Tier 1** fixes the real defect for free — Overpass
`out center` returns a *bounding-box* centre, so area features now use full geometry and a true
area-weighted centroid. **Tier 2** reconciles only the ≤~15 features actually surfaced per
check against Google, storing the `place_id` permanently and the coordinate under a 30-day TTL
(~$0.48 per first-time check in a new area, ~$0 thereafter). **Tier 3** — replacing the
warehouse — is rejected on 1 and 2 above.

Every feature carries `pos_source`, so the map can state how a marker was placed and never
makes a precision claim its geometry does not support. This extends CLAUDE.md rule 2
(evidence + confidence) from claims to coordinates.
