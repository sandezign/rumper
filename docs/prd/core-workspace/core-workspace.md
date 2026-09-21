# PRD: Core Workspace

> [!IMPORTANT]  
> **Architecture Update:** The implementation details, component dependency graph, and build order for the Core Workspace (along with the Evidence Risk Panel and Map Proof Engine) have been consolidated. Please see the [Unified Implementation Blueprint](file:///Users/arisandy/Downloads/rumper/docs/prd/core-workspace/unified-implementation-blueprint.md) for the single source of truth regarding state management and frontend architecture.

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-08 |
| **Last Updated** | 2026-07-18 |
| **Version** | 0.3 |
| **Related Docs** | `docs/12-chat-workspace.md`, `docs/14-map-delivery.md`, `docs/16-workspace-shell-and-analysis.md`, `docs/prd/core-workspace/evidence-risk-panel.md`, `docs/prd/core-workspace/overview-panel.md`, `docs/prd/core-workspace/nearby-facilities-panel.md`, `docs/prd/core-workspace/unified-implementation-blueprint.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time home buyers in Jabodetabek need an intuitive way to digest complex geospatial risk data (flood zones, commute times, infrastructure) alongside their personalized research results. A traditional, text-only generative AI chat interface is insufficient because it forces users to read long paragraphs to extract spatial and quantitative data, leading to fatigue and diminished trust in the data's accuracy.

**Evidence:**
- Text-only reports bore users and fail to visually communicate spatial risks like flood radiuses or SUTET proximity.
- A generic GPT/Gemini chat interface can perform shallow surveys but struggles to present structured, deterministic evidence clearly.
- The core value proposition of Rumper is the geo-warehouse and deep research; the interface must elevate this evidence above generic AI chatter.

**Key Insight:**
The AI assistant must be *subordinate* to the verified analysis. Rather than acting as the primary deliverable, the chat acts as a guide (intake & QA) while the actual visual evidence is delivered via a structured three-region workspace: Chat Rail, Analysis Region, and Map Workspace.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Increase data comprehension | Time to first action | Users click "Tinjau analis" or download PDF within 3 mins of report generation |
| G2 | Maximize map engagement | Map interaction rate | > 50% of users interact with map popups or layers |
| G3 | Ensure safety & trust | AI Hallucination rate in QA | 0% (Strictly grounded in report factsheet) |

---

## 3. Non-Goals

- **Not building:** A free-text research engine. The chat cannot trigger new research queries outside the predefined scope.
- **Not solving for:** Real-time navigation routing (we only display pre-calculated commute/radius data).
- **Not changing:** The underlying scoring logic (handled in the Backend Engine Module).

---

## 4. Target Users

### Primary Persona
- **Who:** "Si Commuter" & "Si Perencana" (Young professionals / young couples in Jabodetabek).
- **Context:** They have just completed the onboarding wizard and are waiting for, or viewing, their property's risk report.
- **Motivation:** To clearly see the red flags and understand the score so they can make a go/no-go decision on the property.
- **Current workaround:** Looking at separate Google Maps tabs and scrolling through PDF reports.
- **Jobs to be done:** "As a first-time home buyer, I want to see all the risks visually mapped and structured so that I can quickly grasp the severity of the issues."

---

## 5. User Stories & Key Flows

### Story 1: Viewing the Analysis
**As a** user who just completed intake, **I want to** see my Mini Check report in a structured format, **so that** I can easily digest the scores, red flags, and evidence.

**Flow:**
1. After the research loader finishes, the three-region workspace opens.
2. The user's focus is drawn to the center **Analysis Region**.
3. User views the `Overview` tab (Overall RLS Score e.g., 54/100, Warning Disclaimer, Priority Findings grid, and Evidence Limitations).
4. User clicks the `Evidence Risk` tab to see paginated evidence cards categorized by risk (e.g., Ketahanan Banjir, Aksesibilitas). Each card features a status badge (ALERT, AMAN, WARNING, INFO) and an actionable **Map Layer Toggle switch** (defaulting to ON) allowing users to show or hide the specific risk layers on the map. *(See `docs/prd/core-workspace/evidence-risk-panel.md` for detailed content mapping and wireframes)*.
5. User clicks the `Nearby Facilities` tab to view a structured field validation checklist with a progress tracker. At the bottom, a prominent **Analyst Review Prompt ("Minta tinjauan analis")** encourages users to consult a Rumper human expert to verify their findings.

### Story 2: Exploring the Map
**As a** user concerned about physical risks, **I want to** see exactly where the flood zones and SUTET towers are relative to the property, **so that** I can judge the proximity myself.

**Flow:**
1. User looks at the right **Map Workspace** region.
2. User interacts with the **Segmented Tab Bar** above the map (`Overview`, `Red Flags`, `Commute`, `Facilities`, `Toll & Access`). Clicking a tab filters the active map layers to focus on specific issues.
3. User notices the **Floating Legend Card** on the top right, which displays active layer radii (e.g., ±3 km, ±1 km), the color scale for flood overlays, and explicitly credits data sources: "Sources: Google Maps - InaRISK BNPB".
4. User clicks on a specific POI marker (e.g., a Hospital like RS Hermina Galaxy).
5. An **Interactive POI Detail Card** popup displays over the map containing:
   - Header image and radius distance (e.g., ~0.48 km).
   - **CLAIM / TEMUAN:** The specific AI finding.
   - **KEPERCAYAAN BUKTI:** Confidence level badge (e.g., `Data Kuat (High)`).
   - **KETERBATASAN DATA:** Limitations of the source data.
   - **LANGKAH LAPANGAN:** A specific checklist step to validate the POI.
   - **Action Button:** "Navigasi di Google Maps" to help users drive there.
6. On mobile, the user toggles this map as a full-screen sheet via the "Peta risiko" button.

### Story 3: Asking Follow-up Questions (Report QA)
**As a** user who doesn't understand a specific finding, **I want to** ask the AI assistant for clarification, **so that** I can confidently interpret the report.

**Flow:**
1. User sees a persistent chat input bar at the bottom of the AI column (collapsed by default).
2. User types a question or clicks a suggested prompt chip.
3. The **AI column expands** in the middle (between Analysis and Map), pushing the Map panel to compress from the left.
4. The conversation thread appears along with the **"Deep Thinking" accordion logger** showing the AI's analysis steps.
5. The AI replies strictly using the generated report factsheet as context.
6. If the user asks an off-topic question, the AI politely redirects them to the report.
7. User clicks the collapse icon (↗) at the top-right of the AI column header to hide it; the **Map stretches back to full width**.

---

## 4. Solution Overview

**Approach:** 
The Core Workspace is a **two-region layout** featuring a Global Header, an Analysis Panel (left), and a Map Panel (right). The AI Assistant is a **floating overlay column** that appears in the middle when invoked, closed by default.

```
┌──────────────────────────────────────────────────┐
│ Global Header (72px)                             │
├──────────────────────┬───────────────────────────┤
│ Analysis Panel       │ Map Panel                 │
│ ~40% (flex-shrink)   │ ~60% (flex-grow)          │
└──────────────────────┴───────────────────────────┘

When AI is expanded:
┌──────────────────────────────────────────────────┐
│ Global Header (72px)                             │
├───────────────┬──────────┬───────────────────────┤
│ Analysis      │ AI Chat  │ Map Panel             │
│ Panel         │ ~380px   │ (compressed)           │
└───────────────┴──────────┴───────────────────────┘
```

**Global Header:**
- **Left:** Rumper logo + brand mark
- **Center:** "Analisis properti – diperbarui {date}"
- **Right:** `Unduh laporan` (primary button) + `Active Audit dropdown` (e.g., "Grand Galaxy City ▾") + Profile avatar
- **Removed:** "Tinjau analis" button (removed from prototype scope)

**Key Design Decisions:**

1. **Two-Region Layout with Floating AI.** The AI Assistant is no longer a persistent sidebar. It is hidden by default, allowing the Map to occupy maximum screen width (~60%). When invoked, it slides in as a ~380px middle column. This reinforces that **evidence outranks AI chatter** — the chat is on-demand, not permanent.
2. **Map Stretches When AI is Collapsed.** When the user closes the AI column, the Map panel stretches wider to the left, giving users maximum geospatial real estate.
3. **No 'Brand Green' for Scores.** The score ring uses semantic risk colors (band tinted) rather than the brand's safe green, reinforcing that the tool is an objective auditor, not a cheerleader.
4. **Interactive Leaflet Map with Floating Overlays.** OSM tiles (ADR-009) with a floating top tab navigation bar (`Overview`, `Red Flags`, `Commute`, `Facilities`, `Toll & Access`) and an interactive collapsible legend on the top-right. Zoom controls moved to bottom-right.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Frontend** | Major | `AppShell.tsx` (2-column grid + AI overlay), Analysis Panel (`src/features/analysis/*`), Map Panel (`src/features/map/*`), AI Overlay (`src/features/assistant/*`). |
| **Backend** | Modified | `GET /api/checks/{intake_id}/map` endpoint to serve map markers + facilities directory. |
| **Integrations**| None | Uses standard Leaflet + OSM tiles. |

### API Surface
- [x] **Existing endpoint:** `GET /api/checks/{intake_id}/map` (Returns JSON payload of property, RLS scores, flood data, nearest tolls/stations, facilities, and red flags).

---

## 8. Hypotheses & Assumptions

| # | Hypothesis | Validation Method | Status |
|---|-----------|-------------------|--------|
| H1 | We believe presenting the map alongside the analysis will increase trust in the data because users can visually verify the claims. | We'll know we're right if map interaction rates exceed 50%. | Unvalidated |
| H2 | We believe restricting the AI chat to a side rail will prevent users from treating the tool as a generic chatbot. | We'll know we're right if off-topic prompt rates are < 5%. | Unvalidated |

**Key assumptions that could invalidate this plan:**
- **Map rendering performance.** Rendering too many OSM/Leaflet markers might crash lower-end mobile devices. **Mitigation:** Cap facility markers (e.g., max 8 per kind within 5km) and red flags within 3km.

---

## 9. Success Metrics

### Primary KPI
- **Metric:** Report Engagement Time
- **Target:** Users spend > 2 minutes reading the analysis and interacting with the map.

### Guardrail Metrics (must not regress)
- **AI QA Hallucinations:** Must be 0%. The LLM must not invent evidence not present in the Mini Check report.

---

## 10. Risk Assessment

| Risk Type | Level | Description | Mitigation |
|-----------|-------|-------------|------------|
| **Value** | Low | High value for users needing visual proof. | |
| **Usability** | Low | Two-region layout is spacious; AI overlay is on-demand. | Responsive design: Map becomes a full-screen sheet below 1024px. |
| **Feasibility**| Medium | Cross-panel synchronization between map tabs and analysis tabs. | Clear unidirectional data flow from the `ReportState` object. |
| **Viability** | Low | Uses free OSM tiles, reducing external API costs. | |

---

## 11. Dependencies & Risks

### Third-Party Dependencies
- [x] **Leaflet + OpenStreetMap (OSM)** — Required for Map Workspace rendering.

---

## 12. Implementation Approach

### PR Breakdown Strategy

| # | PR Scope | Estimated Size | Dependencies | Labels |
|---|----------|---------------|--------------|--------|
| 1 | AppShell 2-column grid + header (no Tinjau Analis) | ~300 lines | None | `frontend`, `ui` |
| 2 | Analysis Panel (Overview with ScoreCard + bars, Evidence with inline checklist, Nearby Facilities) | ~700 lines | PR 1 | `frontend`, `components` |
| 3 | Map Panel (Leaflet, floating nav, interactive legend, zoom bottom-right) | ~500 lines | PR 1 | `frontend`, `map` |
| 4 | Cross-panel sync (Map tab ↔ Analysis tab bidirectional binding) | ~300 lines | PR 2, PR 3 | `frontend`, `state` |
| 5 | AI Assistant floating overlay (expand/collapse, chat, Deep Thinking) | ~400 lines | PR 1 | `frontend`, `ai` |

---

## 13. Stakeholder Sign-Off

| Role | Name | Status |
|------|------|--------|
| PM | [TODO] | [ ] Approved |
| Eng Lead | [TODO] | [ ] Approved |
| Design | [TODO] | [ ] Approved |
