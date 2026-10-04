# 05 — Research Pipeline (deep-research graph, spatial facts, scoring)

Source: `app/services/research_graph.py`, `spatial.py`, `scoring.py`, `composer.py`,
`orchestrator.py`, `researchers/base.py`, `researchers/commute.py`,
`app/schemas/research.py`. Specs: docs/06 (agent rules), docs/07 (STD-SCR-001),
docs/10 (warehouse), docs/11 (graph shape).

## 1. Agent IO schemas (`schemas/research.py`)

`Confidence = Literal["data_kuat", "data_sedang", "perlu_validasi"]`.
`CATEGORIES = ("banjir", "commute", "akses", "fasilitas", "lingkungan")` with id-ID
labels in `CATEGORY_LABELS` (Ketahanan Banjir, Efisiensi Commute, Akses Fisik dan
Jalan, Fasilitas Esensial, Kualitas Lingkungan dan Red Flags).

Internal (code-owned) models:
- `Evidence{source_title, url?, published_at?, accessed_at, kind}` where
  `kind ∈ grounded_search|routes_api|places_api|geocoding|warehouse|inarisk|elevation_api`.
- `Finding{claim, evidence[], confidence, limitation="", validation_action="",
  is_red_flag, is_critical, is_evidence_gap}`.
- `CategoryResult{category, findings[], proposed_score?, score_rationale,
  confidence="perlu_validasi"}`.
- `ResearchBrief` — facts-only researcher input: property/address/coords,
  kelurahan/kecamatan/kota, `in_jabodetabek`, workplace text+coords, `transport_mode`,
  `purpose`, `buying_stage`, `dp_timeline`, `concerns[]`, `concern_notes`.

LLM-facing **Draft** models (the only shapes the model may emit; it cites sources by
**index**, never by URL):
- `FindingDraft{claim, source_indices[], confidence, limitation, validation_action,
  is_red_flag, is_critical}`
- `CategoryDraft{findings[], proposed_score 0..100?, score_rationale, confidence}`
- `PlanDraft{banjir[≤3], akses[≤3], lingkungan[≤3]}` (lists of search queries)
- `CategoryAssessment{category, sufficient, missing="", refined_queries[≤2]}`,
  `AssessDraft{assessments[]}`
- `SummaryDraft{summary}`

Shared helpers (`researchers/base.py`):
- `brief_block(brief)` — id-ID text block of the brief for prompts (location,
  kelurahan/kecamatan, workplace+mode, concerns, notes).
- `evidence_gap_result(category, what_is_missing, validation_action)` — a
  `CategoryResult` with one `is_evidence_gap` finding, `proposed_score=None`,
  rationale "Evidence gap — tidak dinilai.", confidence `perlu_validasi`.

## 2. The LangGraph (`research_graph.py`)

Topology: `spatial_scan → plan → search ⇄ assess → extract → score → compose → END`,
with conditional edges after `search` and `assess`. Two compile variants:
`build_graph()` (plain, for tests) and `graph()` (lazy singleton compiled with the
Postgres checkpointer — research jobs are durable threads `job:<job_id>`, replayable
for audit).

Constants: `TEXTUAL = ("banjir", "akses", "lingkungan")` (the three web-researched
categories — commute and fasilitas are deterministic); `MAX_GROUNDED_CALLS = 15`
(whole-job grounded-search budget); `GUARDRAILS = render("guardrails")` prepended via
prompts; `_GAP_ACTIONS[cat]` — fixed id-ID field-validation actions used for evidence
gaps; `_CATEGORY_TOPIC[cat]` — topic strings for fallback queries.

State (`ResearchState`, TypedDict of plain dicts so checkpoints stay serializable):
`brief` (dumped ResearchBrief) · `spatial` (fact sheet §3) · `plans
{cat: [queries]}` · `notes {cat: [{query, text, sources[]}]}` · `iteration` ·
`grounded_calls` · `results {cat: dumped CategoryResult}` · `engine`
(`{category_scores, rls_score, band, recommendation}`) · `summary` · `checklist`.

### Nodes

**spatial_scan** — `build_spatial_facts(brief)`; computes the two deterministic
results immediately: `commute` (§6) and `fasilitas` (§5); initializes
`notes={cat: []}`, `iteration=0`, `grounded_calls=0`.

**plan** — `set_operation("plan")`; prompt `research_plan` (guardrails + brief block +
`spatial.describe_for_llm`); `structured(PlanDraft, max_output_tokens=700,
thinking_budget=0)`. Keeps at most **2** queries per category; a category may never
start empty — fallback query = first topic phrase + property name/address.

**search** — `set_operation("search")`. Budget = `MAX_GROUNDED_CALLS −
grounded_calls`; collect `(cat, query)` tasks across TEXTUAL plans up to budget; run
all concurrently. Each call: `grounded(render("research_search", category, query),
max_output_tokens=1100, thinking_budget=0)` wrapped in `asyncio.wait_for(timeout=40)`;
failure → note with empty text (assess sees the gap). Appends notes, adds
`len(tasks)` to `grounded_calls`, clears `plans`.

**route_after_search** — `iteration == 0 → "assess"` else `"extract"`: only the first
round gets a sufficiency check; refinement-round results go straight to extract
(extraction reads ALL notes — a second assess adds latency, not signal).

**assess** — `set_operation("assess")`. Builds per-category blocks of
`- query / hasil` pairs (each result truncated to 1500 chars, empty shown as
`(kosong)`); `structured(AssessDraft, 700, thinking 0)`. For each category with
`sufficient=false` and non-empty `refined_queries`, set `plans[cat] =
refined_queries[:2]`. `iteration += 1`.

**route_after_assess** — `"search"` iff any plans pending AND `iteration <=
settings.max_refine_iterations` (default 1) AND `grounded_calls < 15`; else
`"extract"`.

**extract** — `set_operation("extract")`; per TEXTUAL category concurrently:
1. `seeds = _seed_findings(cat, spatial)` — deterministic findings injected by
   **code** (§2.1).
2. Notes with non-empty text; union of their sources deduped by URL (order
   preserved) → numbered source list.
3. No notes → seeds-only `CategoryResult(proposed_score=None, rationale "Hanya fakta
   spasial; riset web tidak menghasilkan temuan.", confidence data_sedang)`; no seeds
   either → `evidence_gap_result` with `_GAP_ACTIONS[cat]`.
4. Else prompt `research_extract` (guardrails, category, spatial description,
   `research_text[:20000]` as `[query: ...]\n<text>` blocks, numbered source list);
   `structured(CategoryDraft, max_output_tokens=2200, thinking_budget=256)`. On
   exception → fall back to seeds (or gap result), rationale "Ekstraksi gagal — fakta
   spasial saja.", confidence perlu_validasi.
5. Map each `FindingDraft`: resolve `source_indices` (bounds-checked) to `Evidence`
   (`kind=grounded_search`, accessed today). **Floors** (docs/06 §4): finding with no
   resolved evidence → `is_evidence_gap=True`, confidence forced `perlu_validasi`;
   web-sourced `data_kuat` demoted to `data_sedang` (web evidence is area-level at
   best). Findings = seeds + drafts.
6. Category confidence = **worst** finding confidence
   (data_kuat < data_sedang < perlu_validasi).

**score** — pure: `scoring.compute(results, spatial, brief.transport_mode)` → state
`engine` + `checklist`.

**compose** — `composer.compose_summary(brief, results, engine)` → `summary`.

### 2.1 `_seed_findings(cat, facts)` (deterministic, code-injected)

- **banjir**: if `flood` → claim "Indeks bahaya banjir InaRISK BNPB ... {index}
  (kelas {class})", evidence InaRISK (`kind=inarisk`, url inarisk.bnpb.go.id),
  `data_sedang`, limitation "Resolusi raster area, bukan per-rumah.",
  `is_red_flag = class == "tinggi"`. If `elevation` → claim with elevation_m and the
  ±relative_m vs the 500 m grid (+" — indikasi cekungan." when `low_lying`), evidence
  Google Elevation API (`kind=elevation_api`), `data_kuat`,
  `is_red_flag = low_lying`.
- **akses**: for `nearest_toll` ("pintu tol") and `nearest_station` ("stasiun") →
  "... terdekat: {name} ~{distance_km} km", evidence "OpenStreetMap warehouse (data
  {ingested_at})" (`kind=warehouse`), `data_kuat`, limitation straight-line distance.
- **lingkungan**: every `red_flag_features` entry → "Terdeteksi {label}: {name}
  ~{distance_km} km", warehouse evidence, `data_sedang`, `is_red_flag=True`,
  `is_critical=f["critical"]`.

## 3. SpatialFacts (`services/spatial.py`)

Geo queries use a cheap bounding-box prefilter on the `(kind, lat, lng)` index
(`deg = radius_km / 111`), then exact haversine filter + sort, returning
`{name, kind, lat, lng, distance_km (2dp), ingested_at (date ISO)}`.
`_nearest` = `_within(..., limit=1)[0]`.

Red-flag rule table `(kind, label id-ID, search_km, flag_km, critical_km)`:

| kind | label | search | flag ≤ | critical ≤ |
|---|---|---|---|---|
| sutet_tower | jalur SUTET (listrik tegangan tinggi) | 1.0 | 0.25 | 0.25 |
| landfill | TPA/pengolahan sampah | 3.0 | 1.5 | 1.0 |
| industrial | kawasan industri | 2.0 | 1.0 | — |
| cemetery | pemakaman | 1.0 | 0.3 | — |
| rail_point | rel kereta aktif | 1.0 | 0.2 | — |

`_FACILITY_KINDS = [hospital, clinic, pharmacy, school, market, supermarket, station]`.

`build_spatial_facts(brief)` (empty dict when no coords): concurrently fetches
`point_hazards`, nearest toll (25 km), nearest station (15 km), nearest of each
facility kind (10 km), and `_within(limit=3)` per red-flag rule at its search radius.
`red_flag_features` = matches within `flag_km`, each with `label` and
`critical = critical_km is not None and distance <= critical_km`. Returns
`{flood, elevation, nearest_toll, nearest_station, facilities{kind: nearest?},
red_flag_features[]}`.

`describe_for_llm(spatial)` — compact id-ID line list (InaRISK index/class, elevation
±relative, nearest toll/station, red flags with `[KRITIS]` marker, facility distances);
`"(belum ada data spasial untuk titik ini)"` when empty.

`build_map_facts(lat, lng)` — richer variant for the map panel (docs/14): facilities
via `_within(5 km, limit=8)` for 6 kinds (no station) flattened into one list; red
flags via `_within(3 km, limit=6)` per rule **without** the flag_km filter (context,
not verdict; `critical` still computed); plus flood/elevation/nearest toll+station.
Key difference from research facts: list `red_flags` (wide) vs `red_flag_features`
(strict).

## 4. Job lifecycle (`services/orchestrator.py`)

`build_brief(intake, geo)` maps an `Intake` row + geocode dict to `ResearchBrief`
(concerns JSONB → `categories`/`notes`).

`run_research(job_id, geo)` — runs as a background task with its own sessions
(ADR-007):
1. Mark job `running`, set `started_at`, generate and store `trace_id`
   (uuid4, doubles as the LangSmith run id).
2. `_invoke_graph` with `asyncio.wait_for(timeout=settings.graph_timeout_seconds)`:
   `graph().astream({"brief": dump}, config={"run_id": trace_id,
   "metadata": {"job_id"}, "configurable": {"thread_id": f"job:{job_id}"}},
   stream_mode=["updates", "custom"])`. `updates` carries each node's full state (final
   state = last node's output). `custom` carries server-owned loader progress: each node
   emits its phase at its top via `research_graph._progress` (so the bar reflects the node
   that is *running*), and `search` emits per-query `done/total`; the orchestrator's
   `_ProgressTracker` maps phase → `_PHASES` `(step 1–5, base pct, label)` (search fills a
   28→62 band by `done/total`), clamps monotonically, and writes
   `research_jobs.categories_done|progress_pct|progress_note`. The FE renders these verbatim.
3. Persist, in one session: per category — every `Finding` row + one `CategoryScore`
   (engine post-clamp `score`, researcher `proposed_score`, confidence, rationale);
   one `Report` (rls/band/recommendation/summary/checklist); job → `done` +
   `finished_at`.
4. Any exception → log, job `failed` with the fixed id-ID error "Riset gagal
   diproses. Coba lagi, atau bagikan pin Google Maps yang lebih tepat."

## 5. Deterministic fasilitas scoring (`spatial.fasilitas_result`)

No facilities at all → evidence-gap result ("Cakupan OSM area ini mungkin tipis.").
Otherwise start at **100** and walk the check table
`(kind, label, max_km, penalty, relevant)`:

| kind | label | within | miss penalty | relevant when |
|---|---|---|---|---|
| hospital | RS | 5.0 | −25 | always |
| clinic | klinik | 3.0 | 0 | always |
| pharmacy | apotek | 3.0 | −15 | always |
| market | pasar | 3.0 | 0 | always |
| supermarket | supermarket | 3.0 | −15 | always |
| school | sekolah | 3.0 | −15 | purpose startswith `tinggal_keluarga` |

Present-within-range → `data_kuat` finding ("Keberadaan fasilitas tidak sama dengan
kualitasnya."); missing + penalty → `data_sedang` finding ("Data OSM Indonesia bisa
tidak lengkap.") and subtract. market/supermarket are one logical need: the second
found is skipped, and the supermarket miss-penalty is waived when a market was found.
Transit users (`transport_mode ∈ krl|campuran`): station ≤ 8 km → finding (first-mile
caveat), else −10. Final `proposed_score` clamped 0..100, confidence `data_kuat`,
rationale "Skor deterministik dari cakupan fasilitas warehouse OSM."

## 6. Deterministic commute (`researchers/commute.py` + toll enrichment)

`spatial.commute_result` runs `commute.run(brief)` then, for
`transport_mode ∈ mobil|campuran` with a known `nearest_toll`, appends a warehouse
finding about toll distance.

`commute.run`:
- Missing any coordinate → evidence gap ("Titik tempat kerja belum dapat dipetakan...").
- Departure anchors: next **Tuesday 07:00 WIB** (peak) and **13:00 WIB** (off-peak
  baseline) via `gmaps.next_weekday_at_wib(1, 7|13)`.
- Mode map: krl/transjakarta/campuran → `TRANSIT` ("transportasi umum"); motor →
  `TWO_WHEELER` ("motor"); else `DRIVE` ("mobil"). TWO_WHEELER route unavailable →
  retry as DRIVE labeled "mobil (estimasi; rute motor tidak tersedia)". Peak route
  still None → evidence gap. Off-peak failure falls back to peak (ratio 1.0).
  TRANSIT also fetches a DRIVE comparison finding.
- Score (pure): peak ≤45→90, ≤60→75, ≤75→62, ≤90→50, ≤120→35, else 20; minus 10 when
  `peak/off-peak > 1.8`; minus 5 per transfer beyond 2; clamp 0..100.
- Findings (`kind=routes_api`, `data_kuat`, fixed limitation/validation strings):
  main duration/distance(/transfers) claim; optional drive comparison; peak > 90 min →
  extra `is_red_flag` finding ("tergolong berat untuk rutinitas harian").

## 7. Scoring engine (`services/scoring.py`) — STD-SCR-001, pure code

`WEIGHTS = {banjir: .30, commute: .25, akses: .15, fasilitas: .15, lingkungan: .15}`.
`BAND_LABELS`: relatif_kuat "Relatif kuat" · layak_dengan_catatan "Layak dengan
catatan" · hati_hati "Hati-hati" · risiko_tinggi "Risiko tinggi / perlu validasi
kuat". `RECOMMENDATION_LABELS`: proceed "Lanjutkan dengan catatan standar" ·
proceed_with_caution "Lanjutkan dengan catatan" · verify_further "Validasi lebih
lanjut sebelum memutuskan" · avoid_until_resolved "Tunda sampai risiko utama
terjawab". `DISCLAIMER` — fixed id-ID string (preliminary, not a guarantee, validate
before booking fee/DP); rendered verbatim in reports.

### `spatial_baseline(category, spatial, transport_mode) -> int | None`

- **banjir** (needs `flood`): base by class rendah/sedang/tinggi → 80/55/30; elevation
  `low_lying` → −10, else `elevation_m >= 25` → +5.
- **akses** (needs toll or station): base 70; toll ≤5 km → +10, >15 km → −10;
  station (only for krl/campuran) ≤3 km → +10, >8 km → −5.
- **lingkungan**: base 85 minus per-kind penalty counted **once per kind**:
  sutet_tower 40, landfill 30, industrial 15, rail_point 10, cemetery 5 (unknown 10).
- commute/fasilitas → None. All clamped 0..100.

### `clamp_category(result, baseline) -> int | None`

- commute/fasilitas: pass `proposed_score` through (their researchers are
  deterministic).
- both proposal and baseline None → None (unscored).
- baseline present: proposal (or baseline when proposal None) clamped to
  **baseline ± 15** — the LLM can adjust, never override the warehouse signal.
- any `is_critical` finding → cap **24** (kritis band, returned immediately);
  any `is_red_flag` → cap **64**;
- category confidence `perlu_validasi` **without** baseline → clamp into 40..75;
- final clamp 0..100.

### `compute(results, spatial, transport_mode) -> EngineOutput`

1. Per category: `clamp_category(r, spatial_baseline(...))`.
2. **RLS**: needs ≥ 3 scored categories; weighted mean over the scored subset with
   weights renormalized (`Σ sᵢwᵢ / Σ wᵢ`), rounded 2dp; else None.
3. Band: ≥80 relatif_kuat · ≥65 layak_dengan_catatan · ≥50 hati_hati · else
   risiko_tinggi.
4. Recommendation: rls None → verify_further; ≥80 **and** no red flags **and** no
   unscored core category (banjir/commute) → proceed; ≥65 → proceed_with_caution;
   ≥50 → verify_further; else avoid_until_resolved.
5. **Critical override** (STD-SCR-001 §7 — a high total can never hide a critical
   flag): any critical finding floors proceed/proceed_with_caution to verify_further;
   and if `rls < 50` or ≥2 critical findings → avoid_until_resolved.
6. Checklist: every finding that `is_red_flag or is_evidence_gap or confidence ==
   perlu_validasi` and has a `validation_action` contributes
   `{item: validation_action, category, reason: claim}`, deduped by action text,
   in category order.

`EngineOutput{category_scores, rls_score, band, recommendation, checklist}`.

## 8. Narrative composer (`services/composer.py`)

Gemini phrases the structured fact sheet — **no new facts** (ADR-008). Builds fact
lines from the first 4 findings of each category tagged
`[label/RED FLAG|GAP|temuan/confidence]`, a one-line buyer context (purpose, mode,
concerns), band + recommendation **labels** (never raw numbers — the prompt forbids
quoting scores). `set_operation("compose")`; up to 2 attempts of
`structured(SummaryDraft, temperature=settings.composer_temperature,
max_output_tokens=500, thinking_budget=0)`; returns the stripped summary, or `""` on
total failure — the structured report renders fine without a narrative (doc 01 §3).
