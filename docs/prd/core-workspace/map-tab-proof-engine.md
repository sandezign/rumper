# PRD: Interactive Evidence Map (The Proof Engine)

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-13 |
| **Last Updated** | 2026-07-18 |
| **Version** | 0.2 |
| **Related Docs** | `docs/14-map-delivery.md`, `docs/09-frontend.md`, `docs/prd/core-workspace/unified-implementation-blueprint.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?
First-time homebuyers in Jabodetabek lack a way to visually verify the claims made by property agents or abstract AI risk scores. When looking at a "64% Flood Risk Score," buyers need to know exactly *where* the flood is and *who* verified it, otherwise they remain skeptical and anxious about their purchase. 

**Evidence:**
- Real estate platforms currently only show generic map pins, offering zero risk transparency.
- The Rumper Pre-mortem identified "data accuracy" (Tiger #2) as a key risk.
- Buyers need visual proof to build confidence in the AI's preliminary Mini Check.

**Key Insight:**
The map shouldn't just be a navigation tool; it needs to be an interactive "Proof Engine." Every marker on the map must act as clickable evidence with cited sources and confidence levels, transforming abstract AI research into undeniable geographic reality.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Increase visual interaction with evidence | Map Tab Click Rate | >70% of users click at least 2 map tabs |
| G2 | Build trust in data accuracy | Tooltip Click Rate | >50% of users click a marker to view source |
| G3 | Maintain snappy map performance | Layer Switch Latency | <150ms between tab clicks |

---

## 3. Non-Goals

- **Not building:** Custom user-dragged routing or live traffic data (we use typical/historical).
- **Not solving for:** 3D maps or Street View integration.
- **Not changing:** The underlying scoring engine logic (STD-SCR-001). The map only visualizes existing data.

---

## 4. Target Users

### Primary Persona
- **Who:** First-time homebuyer in Jabodetabek
- **Context:** Reviewing their generated preliminary Mini Check for a shortlisted property.
- **Motivation:** Looking to verify if the property is truly safe from floods and close to their workplace.
- **Current workaround:** Manually cross-referencing Google Maps, local news for floods, and asking neighbors.
- **Jobs to be done:** "When I review a property's risk score, I want to see the physical evidence on a map so that I can confidently trust the analysis."

---

## 5. User Stories & Key Flows

### Story 1: Verifying Environmental Hazards
**As a** homebuyer, **I want to** click the Red Flags tab and see exact hazard zones, **so that** I can visually confirm if my future home is in danger.

**Flow:**
1. User receives the Mini Check.
2. User clicks the "Red Flags" pill on the **floating top navigation bar**.
3. The map background dims; bright red overlay polygons appear for flood zones and SUTET lines.
4. User clicks a red polygon.
5. An Evidence Card tooltip appears showing: "High Flood Risk | Source: InaRISK BNPB | Confidence: Data Kuat".

### Story 2: Two-Way Synchronization (Map → Analysis)
**As a** homebuyer, **I want to** click a map tab and see the Analysis panel update, **so that** I can read the evidence details alongside the geospatial view.

**Flow:**
1. User clicks the `Commute` pill on the Map floating navigation bar.
2. State update: `activeMapTab = 'commute'`.
3. **Cross-sync:** The Analysis panel automatically switches to the `Evidence Risk` tab.
4. The Evidence list scrolls to and highlights the "Commute" category evidence rows.
5. Non-commute evidence rows dim (`opacity: 0.5`) to focus attention.

### Story 3: Two-Way Synchronization (Analysis → Map)
**As a** homebuyer, **I want to** hover over text in the AI report and see the map update, **so that** I immediately know where the mentioned risk is located.

**Flow:**
1. User reads the left-hand Analysis panel and clicks a Finding Card ("Ketahanan Banjir").
2. State update: `activeAnalysisTab = 'evidence'`, `selectedEvidence = flood_id`.
3. **Cross-sync:** The Map floating nav switches to the `Red Flags` tab.
4. The map zooms to the flood zone polygon and highlights it with a pulsing animation.

### Flows NOT Covered
- Comparing two properties side-by-side on the map.

---

## 6. Solution Overview

**Approach:** The map panel features a clean, overlay-driven UI with a **floating top navigation bar**, an **interactive legend**, and **bottom-right zoom controls**. All previous bottom-anchored colored pills and top-left score bars have been removed in favor of this streamlined layout.

**Key Design Decisions:**

1. **Floating Top Navigation Bar.** A horizontal row of filter pills positioned at the top-center of the map: `● Overview` · `● Red Flags` · `● Commute` · `● Facilities` · `● Toll & Access`. Each pill has a colored dot indicator. Clicking a pill toggles the active map layers and triggers cross-panel synchronization with the Analysis panel.

2. **Interactive Legend (Top-Right).** A collapsible panel showing the map's visual language. The legend content dynamically updates based on the active tab:

```text
┌─ Overview ──────────────────────┐
│ ○  Hati-hati                    │
│    Zone ±3 km (5–10 mnt)        │
│ ○  Range banjir (±1 km)         │
│ ◉  Rumah Kandidat               │
│                                 │
│ Sources: Google Maps ·          │
│          InaRISK BNPB           │
├─ Flood overlay ─────────────────┤
│ ■ 100.0% – 100.0%    (darkest) │
│ ■   0.0% – 100.0%              │
│ ■   0.0% – 100.0%              │
│ ■   0.0% – 100.0%   (lightest) │
└─────────────────────────────────┘
```

3. **Zoom Controls (Bottom-Right).** Standard `+` / `−` buttons positioned at the bottom-right corner. Leaflet config: `zoomControl: false` then manually add `L.control.zoom({ position: 'bottomright' })`.

4. **Confidence-Based Rendering.** Markers visually indicate reliability (solid lines for *Data Kuat*, dashed for *Perlu Validasi*). This embodies radical transparency.

5. **Empty State Honesty.** If no facilities are found, display a clear text overlay stating the evidence gap rather than an empty map.

6. **Score Bars Removed from Map.** The 5-category horizontal bar charts and circular score ring that were previously rendered in the map header area have been moved to the **Overview Panel** in the Analysis Panel. The map is now exclusively for geospatial visualization.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Database** | None | SpatialFacts and risk data already exist via `geo-data-warehouse` |
| **Backend** | Minor | Ensure GeoJSON responses include source and confidence metadata |
| **Frontend** | Major | Map rendering engine (Leaflet/OSM), floating nav component, interactive legend, state sync with Analysis panel |
| **API** | Modified | Map data endpoints need to return rich metadata properties |

### Cross-Panel State Dependencies

```typescript
// Map listens to these state changes from Analysis
activeMapTab     // set by Analysis FindingCard clicks or Map pill clicks
selectedEvidence // set by Evidence accordion clicks or Map marker clicks

// Map dispatches these state changes to Analysis  
activeAnalysisTab // set to 'evidence' when a Map pill is clicked
selectedEvidence  // set when a Map marker/polygon is clicked
```

---

## 8. Hypotheses & Assumptions

| # | Hypothesis | Validation Method | Status |
|---|-----------|-------------------|--------|
| H1 | We believe users will trust the AI more if they see sources on the map | User interviews + Tooltip Click Rate | Unvalidated |
| H2 | We believe two-way sync (text to map) increases comprehension | Usability testing completion time | Unvalidated |
| H3 | We believe floating top nav is more discoverable than bottom pills | A/B test Map Tab Click Rate | Unvalidated |

**Key assumptions that could invalidate this plan:**
- **Map rendering performance will degrade with too many complex polygons.** **Mitigation:** Pre-simplify GeoJSON paths and strictly limit the radius (e.g., 3km max) for data loading.

---

## 9. Success Metrics

### Primary KPI
- **Metric:** Tab Engagement Rate
- **Baseline:** [TODO]
- **Target:** >70% interaction rate
- **Timeline:** 2 weeks post-launch

### Guardrail Metrics (must not regress)
- Map load time: must stay under 2 seconds.
- Overall Mini Check completion time.

---

## 10. Implementation Approach (Build Order)

This component will be built in **Sprint 4** (as defined in the Unified Blueprint).

| PR Scope | Estimated Size | Dependencies |
|----------|---------------|--------------|
| Leaflet map setup + OSM tiles + base markers | ~200 lines | AppShell (Sprint 1) |
| Floating top navigation bar component | ~150 lines | `ReportState` |
| Interactive legend (dynamic content by tab) | ~120 lines | Floating nav |
| Cross-panel sync logic (Map ↔ Analysis) | ~150 lines | Evidence Panel (Sprint 3) |
| Zoom controls (bottom-right) | ~30 lines | Leaflet setup |

---
