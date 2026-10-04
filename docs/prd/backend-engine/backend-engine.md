# PRD: Backend Engine Modules

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-08 |
| **Last Updated** | 2026-07-08 |
| **Version** | 0.1 |
| **Related Docs** | `docs/06-agent-pipeline.md`, `docs/07-scoring-and-confidence.md`, `docs/10-geo-data-warehouse.md`, `docs/11-deep-research-graph.md`, `prd-decision-insight-system.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time home buyers in Jabodetabek require accurate, unbiased location risk assessments. However, relying on a single-pass LLM prompt to gather and score this data leads to hallucinations, false precision, and inconsistent scoring. Furthermore, treating a lack of data as "low risk" creates dangerous blind spots. The system needs a robust, multi-step backend engine that combines deterministic geospatial queries with an iterative AI research loop to produce evidence-backed, reproducible risk scores.

**Evidence:**
- Traditional dashboards overwhelm users with raw metrics (e.g., "distance: 2 km") without translating them into lifestyle impacts.
- Single-pass LLM prompts often invent citations or fail to gather enough deep context about specific local issues (e.g., specific river flood histories).
- Pre-mortem tiger #1 (inconsistent scoring) and #2 (data accuracy) indicate that relying entirely on AI for the final score is a liability.
- Pre-mortem tiger #6 (unbounded research time) necessitates strict loop limits.

**Key Insight:**
To build absolute trust, AI must act as an *assistant researcher*, not the final arbiter. The backend must rely on a **Geo Data Warehouse** for deterministic facts first. Then, an iterative **LangGraph Research Pipeline** (plan → search → assess → refine) gathers qualitative context. Finally, a pure-code **Scoring Engine** clamps the AI's proposals against the deterministic baselines and strictly enforces red-flag overrides to guarantee decision safety.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Reproducibility & Consistency | Score variance on same inputs | 0% variance (TF-2 Standard) |
| G2 | Prevent unbounded AI costs | Grounded calls per job | ≤ 15 calls hard cap |
| G3 | Rapid Delivery | End-to-end research time | < 3 minutes per Mini Check |

---

## 3. Non-Goals

- **Not building:** ML-based predictive scoring. The scoring engine is 100% deterministic code based on rubrics.
- **Not solving for:** Real-time data ingestion. The Geo Data Warehouse uses batch-ingested data (weekly updates) or cached point lookups.
- **Not changing:** We are not providing investment advice or property value appreciation forecasts.

---

## 4. Target Users

### Primary Persona
- **Who:** Internal System / Rumper App Frontend.
- **Context:** An intake request has just been submitted via the Onboarding Wizard.
- **Motivation:** To accurately and quickly process the user's location and lifestyle parameters into a Mini Check report.
- **Current workaround:** Manual analyst desk research (SOP-RSCH-001) which takes hours.
- **Jobs to be done:** "As the Rumper platform, I need to execute a time-boxed, deeply researched risk audit so that the buyer gets an immediate, reliable second opinion."

---

## 5. System Workflows

### Flow 1: Geo Data Warehouse Spatial Scan
**Trigger:** Research job started.
1. Backend queries `geo_features` and `point_cache` tables for the target coordinate.
2. Identifies InaRISK flood class, Google Elevation profile, and nearest facilities (toll, station, hospital, etc.).
3. Identifies Red Flag Features (SUTET ≤ 250m, Landfill ≤ 1.5km, etc.).
4. Computes deterministic Category Results for `commute` and `fasilitas`.
5. Outputs `SpatialFacts` as seed findings for the AI graph.

### Flow 2: LangGraph Research Loop
**Trigger:** Spatial scan completes.
1. **Plan:** AI generates targeted search queries (based on `SpatialFacts`) for textual categories (`banjir`, `akses`, `lingkungan`).
2. **Search:** Parallel grounded Gemini calls using Google Search.
3. **Assess:** AI reviews gathered notes. If sufficient, proceed. If missing data and `iteration < 2`, refine queries and loop back to Search.
4. **Extract:** AI extracts structured `CategoryDraft` findings, strictly citing sources by index.

### Flow 3: Deterministic Scoring & Composition
**Trigger:** Extraction completes.
1. The `scoring.py` engine receives the extracted drafts and SpatialFacts.
2. It clamps the AI-proposed scores using the deterministic spatial baselines (e.g., if InaRISK is `tinggi`, score cannot exceed 45).
3. Evaluates critical red-flags. If any exist, the recommendation floor is capped at `verify_further`.
4. Calculates the final RLS (Risk Location Score) out of 100.
5. Composes the final narrative and outputs the `Report` object to the frontend.

---

## 6. Solution Overview

**Approach:** 
The Backend Engine is divided into three core modules:
1. **Geo Data Warehouse:** A PostgreSQL DB caching batch-ingested OSM data and InaRISK APIs.
2. **LangGraph Pipeline:** An iterative agent workflow (Gemini Deep Research pattern) strictly budgeted (max 2 loops, max 15 grounded calls).
3. **Scoring Engine:** A pure Python function (`STD-SCR-001`) that implements a Trust Schema (Observation → Evidence → Interpretation → Limit → Action) and enforces data gaps as "Perlu Validasi", never "Low Risk".

**Key Design Decisions:**

1. **Deterministic Clamping.** The AI is allowed to propose scores based on textual research, but the Scoring Engine clamps these proposals mathematically based on hard geospatial facts.
2. **Missing Data is Not Low Risk.** A strict rule: `No data != Low risk`. Null values must fall back to an "Evidence Gap" status, triggering a required field validation action for the user.
3. **Traceability.** All LangGraph runs are traced to LangSmith (`LANGSMITH_TRACING=true`) for analyst debugging and QA, separate from the billing ledger.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Database** | Modified | `geo_features`, `point_cache`, `ingestion_runs` tables. `findings` schema with strict foreign keys. |
| **Backend** | New / Modified | `app.jobs.ingest_geo` scripts, `services/spatial.py`, `services/scoring.py` (v2 clamping), LangGraph orchestration module. |
| **Integrations**| Affected | Google Search tool (via Gemini), InaRISK BNPB ArcGIS REST, Google Elevation API, Google Routes API (for commute). |

---

## 8. Hypotheses & Assumptions

| # | Hypothesis | Validation Method | Status |
|---|-----------|-------------------|--------|
| H1 | We believe an iterative LangGraph loop will gather higher quality evidence than a single prompt. | We'll know we're right if human analysts accept >90% of the AI's evidence citations without modification. | Unvalidated |
| H2 | We believe querying a local Geo Data Warehouse for facilities is faster and cheaper than hitting the live Google Places API. | We'll know we're right if the `spatial_scan` step completes in < 2 seconds. | Validated |

**Key assumptions that could invalidate this plan:**
- **InaRISK API Reliability.** If the external BNPB API goes down frequently, our flood baselines will fail. **Mitigation:** Implement aggressive caching in `point_cache` (90-day TTL) so repeated queries in the same area don't hit the external API.

---

## 9. Success Metrics

### Primary KPI
- **Metric:** End-to-end Pipeline Duration
- **Target:** < 180 seconds average execution time.

### Secondary KPIs
- **Metric:** Red-Flag Detection Accuracy
- **Target:** 100% match rate when compared against manual analyst checks on known bad properties.

### Guardrail Metrics (must not regress)
- **Max API Calls:** Never exceed the 15 grounded Google Search calls budget per job.

---

## 10. Risk Assessment

| Risk Type | Level | Description | Mitigation |
|-----------|-------|-------------|------------|
| **Value** | Low | High value; this is the core intellectual property of Rumper. | |
| **Usability** | N/A | Backend system. | |
| **Feasibility**| High | Managing complex async state loops in LangGraph with strict timeouts is difficult. | Use strict `TypedDict` states, hard timeouts per node, and LangSmith tracing to debug loop failures. |
| **Viability** | Medium | LLM token costs could spike if loops don't terminate. | Hard `MAX_ITERATIONS (2)` constraint coded into the graph router edges. |

---

## 11. Dependencies & Risks

### Third-Party Dependencies
- [x] **LangSmith** — Required for graph tracing and observability.
- [x] **Google Elevation API / Routes API** — Required for spatial baselines.
- [x] **InaRISK BNPB API** — Required for flood hazard index.
- [x] **OSM Overpass API** — Required for weekly data ingestion jobs.

---

## 12. Implementation Approach

### PR Breakdown Strategy

| # | PR Scope | Estimated Size | Dependencies | Labels |
|---|----------|---------------|--------------|--------|
| 1 | Geo Data Warehouse (DB Schema, Ingestion Jobs, `spatial_py`) | ~500 lines | None | `backend`, `database`, `geo` |
| 2 | Scoring Engine v2 (Clamping logic, STD-SCR-001) | ~300 lines | PR 1 | `backend`, `engine` |
| 3 | LangGraph Pipeline (State, Nodes, Edges, Router) | ~600 lines | PR 1, 2 | `backend`, `ai`, `langgraph` |
| 4 | Tracing & Observability (LangSmith Integration) | ~150 lines | PR 3 | `backend`, `ops` |

---

## 13. Stakeholder Sign-Off

| Role | Name | Status |
|------|------|--------|
| PM | [TODO] | [ ] Approved |
| Eng Lead | [TODO] | [ ] Approved |
| Design | [TODO] | [ ] Approved |
