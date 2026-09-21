# PRD: Analysis Region - Overview (Ringkasan) Panel

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-17 |
| **Last Updated** | 2026-07-18 |
| **Version** | 1.1 |
| **Related Docs** | `docs/16-workspace-shell-and-analysis.md`, `docs/prd/core-workspace/unified-implementation-blueprint.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time homebuyers receiving their Mini Check need an immediate, high-level understanding of the property's risk profile before diving into the granular evidence. Without a clear, hierarchical overview, users may fixate on a mediocre overall score while missing a critical red flag (like extreme flood risk or high-voltage cables) that makes the property unlivable.

**Evidence:**
- Users often glance at the final "number" (score) without reading the context.
- Critical red flags must not be buried behind tabs or accordion clicks.

**Key Insight:**
The Overview panel is not just a summary; it is a **safety mechanism**. It must visually enforce the "Red-Flag Override" rule from the scoring engine (`STD-SCR-001`), ensuring that a high score does not hide a fatal flaw. Furthermore, it must strictly separate the AI's objective findings from human interpretation.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Highlight Critical Risks | Red Flag visibility | 100% of critical findings appear above the fold |
| G2 | Prevent Score Misinterpretation | Disclaimer interaction | Users read/acknowledge the "Hasil Awal" disclaimer |
| G3 | Route to Evidence | Click-through rate | > 60% of users click a Priority Finding to open the Evidence Tab |

---

## 3. Non-Goals

- **Not building:** Granular map layer toggles on this tab (that belongs to the Evidence panel).
- **Not solving for:** Detailed POI lists (handled in the Nearby Facilities panel).
- **Not changing:** The scoring logic. This UI strictly consumes the `Report` API payload.

---

## 4. Target Users

### Primary Persona
- **Who:** "Si Perencana" (The Planner / Cautious Homebuyer)
- **Context:** Just received the generated report and is looking at the screen for the first time.
- **Motivation:** Wants to know immediately: "Is this place a disaster, or should I keep considering it?"
- **Jobs to be done:** "As a homebuyer, I want a quick, scannable summary of the property's health so that I can decide if it's worth reviewing the detailed evidence."

---

## 5. User Stories & Key Flows

### Story 1: Viewing a property with a Critical Red Flag
**As a** user checking a property near a river, **I want to** be warned immediately if it's a severe flood zone, **so that** I don't waste time looking at nearby cafes.

**Flow:**
1. User lands on the `Overview` tab.
2. The system checks `report.red_flags`.
3. A large, high-contrast **Red-Flag Banner** appears at the very top of the page (e.g., "⚠️ ALERT: Risiko Banjir Ekstrem").
4. Below the banner, the ScoreCard displays the score (e.g., 32/100).
5. User clicks the Red-Flag banner, which automatically switches them to the `Evidence` tab and expands the specific flood evidence row.

### Story 2: Reviewing the Category Breakdown
**As a** user, **I want to** see how the 5 categories performed at a glance, **so that** I know where the weaknesses are.

**Flow:**
1. User views the **ScoreCard** at the top of the Overview tab.
2. The ScoreCard displays the circular score ring alongside 5 horizontal bar charts (Banjir, Commute, Akses, Fasilitas, Lingkungan) with percentage labels.
3. User immediately sees which categories are weak (short red bars) vs strong (long blue/teal bars).
4. User scrolls to the **Priority Findings** section below.
5. Clicking a finding card navigates the user to the `Evidence` tab and scrolls to that category.
6. **Map sync:** Clicking a finding card also updates the Map floating tab to the corresponding category (e.g., clicking "Ketahanan Banjir" switches the Map to "Red Flags" tab).

---

## 6. Solution Overview (Wireframe Specification)

**Approach:** 
The Overview Panel acts as the dashboard homepage for the Mini Check. It follows a strict vertical hierarchy: ScoreCard (with integrated bar charts) → Disclaimer → Overview Summary → Priority Findings.

**Component Hierarchy & Wireframe:**

```text
┌─────────────────────────────────────────────┐
│  Grand Galaxy City                    (54)  │
│  Grand Galaxy City, RT.009/RW.012,   /100   │
│  Pekayon Jaya, Kec. Bekasi Sel...          │
│                                             │
│  Banjir    ████░░░░░░░░░░░░░░░░  24%       │
│  Commute   █████████░░░░░░░░░░░  50%       │
│  Akses     ████████████░░░░░░░░  64%       │
│  Fasilitas ████████████████████  100%       │
│  Lingkungan████████████░░░░░░░░  64%       │
├─────────────────────────────────────────────┤
│  ⓘ Analisis ini disusun otomatis            │
│    berdasarkan agregasi data sekunder.      │
├─────────────────────────────────────────────┤
│  Overview                                   │
│  Lokasi ini memiliki beberapa keunggulan... │
│  Selengkapnya ∨                             │
├─────────────────────────────────────────────┤
│  TEMUAN PRIORITAS  2                        │
│  ┌───────────────────────────────────┐      │
│  │ ● Risiko tinggi                   │      │
│  │ Ketahanan Banjir                  │      │
│  │ Pada Maret 2025, banjir di Grand  │      │
│  │ Galaxy City mencapai ketinggian...│      │
│  └───────────────────────────────────┘      │
│  ┌───────────────────────────────────┐      │
│  │ ● Perlu perhatian                 │      │
│  │ ...                               │      │
│  └───────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

**Component Details:**

1. **`ScoreCard` (Consolidated Header Card):**
   - **Left:** Property name + full address.
   - **Right:** Circular Progress Ring for `rls_score` (e.g., 54/100). **Crucial Design Rule:** The ring color maps to the semantic risk band (Red 0-40, Amber 41-70, Teal/Blue 71-100). **Never** use Brand Green.
   - **Below:** 5 horizontal bar charts, one per Rumper category, showing the individual category percentage. Bar colors follow the same semantic band rules (red for low, amber for medium, blue/teal for high).

2. **`DisclaimerBanner`:** Yellow/amber info banner. Text: "Analisis ini disusun otomatis berdasarkan agregasi data sekunder."

3. **`OverviewSummary`:** A plain-language paragraph summarizing the report, truncated by default with a "Selengkapnya ∨" expand toggle.

4. **`PriorityFindings`:** Section header showing "TEMUAN PRIORITAS" + count badge. Contains `FindingCard` components:
   - Each card has a severity dot (● Risiko tinggi = red, ● Perlu perhatian = amber).
   - Title, 2-3 sentence description.
   - **Click interaction:** Switches `activeAnalysisTab` to `evidence`, sets `selectedEvidence` to the finding's ID, and updates `activeMapTab` to the corresponding map category.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Frontend** | New | Create `OverviewPanel.tsx`, `ScoreCard.tsx`, `CategoryBarChart.tsx`, `FindingCard.tsx` in `src/features/analysis/components/`. |
| **State** | Modified | Dispatches: `setActiveAnalysisTab('evidence')`, `setSelectedEvidence(id)`, `setActiveMapTab(category)` when clicking findings. |

### Dependencies on `Report` API
This panel relies on:
- `report.score.rls_score`
- `report.score.band_label`
- `report.score.categories[]` (individual category scores for bar charts)
- `report.red_flags`
- `report.overview.summary`
- `report.overview.priority_findings`

---

## 8. Implementation Approach (Build Order)

This component will be built in **Sprint 2** (as defined in the Unified Blueprint).

| PR Scope | Estimated Size | Dependencies |
|----------|---------------|--------------|
| ScoreCard with circular ring + 5 bar charts | ~200 lines | Shared UI components (Ring, Badges) |
| DisclaimerBanner + OverviewSummary | ~80 lines | None |
| PriorityFindings grid + FindingCard | ~150 lines | None |
| Cross-panel navigation events (→ Evidence tab, → Map tab) | ~70 lines | `ReportState` from Sprint 1 |

---
