# Project Context

## Project Snapshot

| Field | Detail |
|---|---|
| Project name | Map Panel Improvements (CW_Jul-Q3-2026-Map-Panel-improvement) |
| Product family | Rumper |
| Product module | Core Workspace (Location Risk Dashboard) |
| Menu / feature area | Map Panel & Interactive Geospatial Evidence |
| Work type | Improvement |
| Stage | Define |
| Owner | Rumper Product & Engineering Team |
| Date updated | 2026-07-13 |

## Background

The Core Workspace is transitioning to ensure the AI assistant is subordinate to verified, structured evidence. First-time home buyers face "information asymmetry" and need an intuitive way to digest complex geospatial risk data (flood zones, commute times, infrastructure). A text-only report or a static map is insufficient. The Map Panel needs to evolve into an interactive workspace where users can visually verify claims, toggle thematic layers (like InaRISK flood boundaries), and inspect detailed Points of Interest (POIs) to build trust before making a high-stakes financial decision.

## Target User

| Field | Detail |
|---|---|
| Primary user | "Si Commuter" & "Si Perencana" (First-time home buyers in Jabodetabek) |
| Secondary user | Rumper Human Consultants (Tinjauan Analis) |
| Core job-to-be-done | Visually verify location risks (floods, distance to transit/hospitals) to validate AI claims before a site visit. |
| Main pain point | Trusting an AI-generated property score without seeing the raw geospatial evidence or knowing what to verify on-site. |
| Known behaviors | Relies heavily on visual proof on maps; visits properties physically but often misses weekday/seasonal context. |

## Business Context

| Area | Detail |
|---|---|
| Business goal | Establish Rumper as an objective, independent Location Risk Advisor by increasing data transparency and user trust. |
| Success metric | Map interaction rate (>50%), Checklist engagement (>50%), Time to first action (<3 mins). |
| Stakeholders | Product Manager, Engineering Lead, Design Team. |
| Constraints | Must use Leaflet + OSM tiles; must be responsive (map becomes a sheet/overlay on mobile); strict semantic colors (no brand-green for scores). |
| Risks / sensitivities | Rendering too many markers could impact mobile performance; reliance on third-party APIs (InaRISK, Google Maps) which may timeout. |

## Current State

The Map Workspace currently serves as a static visual aid alongside the AI chat and analysis. It lacks deep interactivity, thematic layers, and detailed context linking the map markers directly to the AI's claims, data limitations, and field validation steps.

## Desired Outcome

Deliver an enhanced, interactive Map Panel that includes:
1. **Thematic Layers via Toggles & Tabs:** Ability to filter specific data layers using the **Segmented Tab Bar** (`Red Flags`, `Commute`, etc.) and the individual **Toggle Switches** inside the Evidence Risk tab to isolate risk polygons (e.g., flood zones) or hide specific POIs.
2. **Interactive POI Popups:** Detailed cards upon clicking map pins that show the distance radius, specific CLAIM / TEMUAN, KEPERCAYAAN BUKTI (Data Confidence), KETERBATASAN DATA (limitations), and a LANGKAH LAPANGAN (actionable field step).
3. **Integration with Analysis:** Seamless visual correlation with the Evidence Risk and Nearby Facilities tabs, empowering the user to transition from digital analysis to physical validation.
4. **Map Legend:** A floating legend card explicitly showing data sources (Google Maps - InaRISK BNPB) and color scales for risk overlays to boost trust and transparency.

## Relevant Links

| Type | Link / Note |
|---|---|
| PRD | [`docs/prd/core-workspace/core-workspace.md`](file:///Users/arisandy/Downloads/rumper/docs/prd/core-workspace/core-workspace.md) |
| Screenshots | Provided UI mockups (Map Panel active layers, RS Hermina Galaxy popup, Bukti toggles, Checklist CTA). |
| Existing docs | [`docs/16-workspace-shell-and-analysis.md`](file:///Users/arisandy/Downloads/rumper/docs/16-workspace-shell-and-analysis.md) |

## Locked Decisions

| Decision | Reason | Date |
|---|---|---|
| Three-Region Layout | Ensures evidence is viewed side-by-side with spatial context on desktop; prevents users from missing map details. | 2026-06-28 |
| Subordinate AI Chat | The chat is a side-rail guide, not the primary deliverable. Evidence and maps outrank chat. | 2026-06-28 |
| OpenStreetMap usage | Reduces API costs vs Google Maps while providing sufficient detail for markers and polygons. | 2026-06-28 |

## Open Questions

| Question | Owner | Priority |
|---|---|---|
| Map Performance Optimization: What is the hard cap on POI markers rendered on mobile to prevent crashes? | Engineering Lead | High |
| Error Handling: How do we visually represent an InaRISK timeout state on the map without failing the entire report? | Design / PM | Medium |

## AI Session Quick Start

```text
Project: Map Panel Improvements
Product module: Core Workspace (Location Risk Dashboard)
Menu / feature area: Map Panel & Interactive POIs
Stage: Define
User: First-time home buyers in Jabodetabek who need to visually verify location risks.
Business goal: Increase user trust and field validation prep by making AI claims visually transparent.
Today I need: To align the PRD and context documents with the finalized UI designs.
Constraints: Responsive design requirements, Leaflet/OSM stack, semantic color rules.
```
