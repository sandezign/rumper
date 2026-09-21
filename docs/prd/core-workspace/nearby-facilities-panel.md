# PRD: Analysis Region - Nearby Facilities (Fasilitas Sekitar)

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-17 |
| **Last Updated** | 2026-07-18 |
| **Version** | 1.1 |
| **Related Docs** | `docs/16-workspace-shell-and-analysis.md`, `docs/prd/core-workspace/unified-implementation-blueprint.md`, `docs/prd/core-workspace/core-workspace.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time homebuyers evaluate properties based on two factors: **Risk** (floods, commute, infrastructure) and **Lifestyle/Convenience** (cafes, gyms, schools). Rumper's core scoring engine (`STD-SCR-001`) excels at risk, but currently ignores broader lifestyle amenities. Users are forced to switch to Google Maps to manually search for nearby grocery stores, gyms, or public toilets, breaking the continuous research flow. 

**Note on Pivot:** This panel replaces the original "Field Validation Checklist" tab. The actionable field checklist items have been fully merged into the `Evidence Risk` panel under the inline "Langkah Validasi" (Validation Steps) checklist within each evidence accordion row.

**Tab Position:** This is the **third tab** in the Analysis Panel, displayed as: `Overview` · `Evidence Risk [6]` · `Nearby Facilities [12]`. The count badge `[12]` reflects the total number of facility categories available.

**Key Insight:**
While Rumper remains an "objective risk advisor," providing a comprehensive directory of Nearby Facilities acts as a high-value bonus feature. However, to maintain trust in our objective risk scoring, these lifestyle POIs must be visually separated from the core score components. The UI must clarify that the presence of a local cafe does not improve the property's structural flood resilience score.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Retain Users in App | App session time | Users no longer tab-switch to Google Maps to check neighborhood POIs |
| G2 | Spatial Discovery | Map sync rate | > 70% of clicks on a facility category successfully filter and zoom the Map Workspace |
| G3 | Protect Score Integrity | User surveys/feedback | Users understand that lifestyle POIs do not impact the RLS score |

---

## 3. Non-Goals

- **Not building:** A routing/navigation engine. We only display proximity/radius, not driving directions.
- **Not changing:** The `RLS_SCORE` algorithm. Lifestyle categories (Recreation, Retail) do NOT affect the score. Only specific essential facilities (Hospitals, Schools) are scored, and their scores are presented in the Evidence tab, not here.

---

## 4. Target Users

### Primary Persona
- **Who:** "Si Lifestyle" / "Si Perencana" (Young professionals)
- **Context:** They are satisfied that the risk score is acceptable, and now want to know if the neighborhood is highly livable.
- **Motivation:** Wants to ensure their daily needs (coffee, gym, groceries) are met within a short distance.
- **Jobs to be done:** "As a homebuyer, I want to see a categorized list of everything in my neighborhood so that I can visualize my daily lifestyle."

---

## 5. User Stories & Key Flows

### Story 1: Exploring a Category and Syncing the Map
**As a** user exploring neighborhood livability, **I want to** click on a category like "Education" and see all schools appear on the map, **so that** I know exactly where they are relative to the house.

**Flow:**
1. User navigates to the `Fasilitas Sekitar` tab.
2. User sees a vertical list of categories (Other, Education, Retail, Health, etc.).
3. User clicks the `Education` row.
4. **State Update:** Global `ReportState` updates `activeMapTab` or triggers a `MapFilterEvent` with the 'Education' category.
5. **Map Sync:** The Map Workspace automatically zooms out to fit the bounds of the Education POIs and hides unrelated markers (like flood zones) to reduce visual clutter.
6. The `Education` row in the panel highlights to show it is actively driving the map view.

---

## 6. Solution Overview (Wireframe Specification)

**Approach:** 
A highly scannable, categorized directory list based on the provided design reference. 

**Component Hierarchy:**

1. **`DirectoryHeader`:** Contains a brief tooltip or disclaimer: *"Info tambahan: Fasilitas ini disediakan untuk referensi gaya hidup dan tidak mempengaruhi Skor RLS (kecuali Fasilitas Esensial)."*
2. **`CategoryList`:** A flat vertical list.
3. **`CategoryRow`:** The primary interactive element.

**CategoryRow Layout (Mockup):**
```text
[ Icon: 🎓 ]   Education                 [ 9 ]   [ 5 school, 3 childcare, 1 preschool ]
-----------------------------------------------------------------------------------------
[ Icon: 🛒 ]   Retail                    [ 5 ]   [ 3 hairdresser, 1 newsagent, 1 superm.. ]
-----------------------------------------------------------------------------------------
[ Icon: 🏥 ]   Health                    [ 4 ]   [ 2 pharmacy, 1 aged care, 1 gp clinic ]
```

**Interaction Rules:**
- **Hover:** Row background slightly dims. Map markers belonging to this category gently pulse.
- **Click:** Sets the active filter. The map adjusts its bounds to fit these POIs. A blue indicator (as seen in the reference) highlights the count number `[ 9 ]` to show active selection.
- **Truncation:** The sub-category breakdown string ("5 school, 3 childcare...") truncates with an ellipsis if it exceeds the container width.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Frontend** | New | Create `FacilitiesPanel.tsx` and `CategoryRow.tsx` in `src/features/analysis/components/`. |
| **Backend API** | Modified | The `GET /checks/:id` or map endpoint must be expanded to return grouped POI arrays matching these new categories (Education, Retail, Health, Recreation, Automotive, Food/Drink). |
| **State** | Modified | Global `ReportState` requires a new slice: `activeFacilityCategory` to drive map filtering. |

### Data Grouping Logic
The frontend expects data pre-grouped by the backend. Example schema expectation:
```json
"facilities_directory": [
  {
    "category": "Education",
    "icon": "graduation-cap",
    "total": 9,
    "breakdown_string": "5 school, 3 childcare, 1 preschool",
    "pois": [ { "id": "poi-1", "lat": -6.2, "lng": 106.8, "name": "SDN 01", "sub_type": "school" } ]
  }
]
```

---

## 8. Implementation Approach (Build Order)

This component will be built in **Sprint 5.5** (between Sprint 5 Synchronization and Sprint 6 AI), replacing the old Checklist panel tasks.

| PR Scope | Estimated Size | Dependencies |
|----------|---------------|--------------|
| FacilitiesPanel UI & Row Components | ~200 lines | Shared UI components |
| Map Sync Logic (activeFacilityCategory state) | ~150 lines | Map Panel (Sprint 4) & ReportState |

---
