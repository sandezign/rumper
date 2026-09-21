# Product Requirements Document (PRD)

## 1. Meta
- **Project**: Map Panel Improvements
- **Product Module**: Core Workspace
- **Target Persona**: First-time home buyers in Jabodetabek

## 2. Goals & Success Metrics
| Goal | Metric | Target |
|---|---|---|
| Increase data comprehension | Time to first action | Users click "Tinjau analis" or download PDF within 3 mins |
| Maximize map engagement | Map interaction rate / Tab click rate | > 50% interact with map popups; > 70% click at least 2 map tabs |
| Build trust in data accuracy | Tooltip Click Rate | > 50% of users click a marker to view source |
| Ensure safety & trust | AI Hallucination rate in QA | 0% |
| Maintain snappy map performance| Layer Switch Latency | < 150ms between tab clicks |

## 3. Scope & Requirements

### 3.1 Three-Region Workspace Layout
- **Left**: Assistant Rail (~340px) for Report QA. Collapses/expands.
- **Center**: Analysis Region (Overview, Evidence Risk, Nearby Facilities).
- **Right**: Map Workspace.

### 3.2 Evidence Risk Panel (Analysis Region)
- Mapped to Rumper's 5 core categories: Banjir, Lingkungan & Red Flags, Commute, Akses, Fasilitas Esensial.
- Each finding is a collapsible row with severity/confidence badges.
- Includes a **Map Layer Visibility Control** toggle (default ON) to filter map clutter.

### 3.3 Interactive Proof Engine (Map Workspace)
- **Segmented Tab Bar**: Toggles map layers (`Overview`, `Red Flags`, `Commute`, `Facilities`, `Toll & Access`).
- **Floating Legend Card**: Shows radii, color scales, and explicit data sources (e.g., InaRISK, Google Maps).
- **Confidence-Based Rendering**: Visual indicators for reliability (e.g., solid vs dashed lines).
- **Interactive POI Popups**: Shows distance, claim, confidence, data limitations, and field validation steps.
- **Two-Way Synchronization**: Hovering over text in the analysis panel updates the map tab, zooms, and highlights the corresponding marker.

## 4. Non-Goals
- Real-time navigation routing.
- Free-text generic research engine.
- 3D maps or Street View integration.
- Changing the underlying scoring logic (STD-SCR-001).

## 5. Technical Considerations
- **Stack**: Leaflet + OpenStreetMap (OSM) tiles.
- **Performance**: Pre-simplify GeoJSON paths, limit POI markers (max 8 per kind within 5km), limit red flags to 3km radius to prevent mobile crashes.
- **Data**: Ensure backend endpoints (`GET /api/checks/{intake_id}/map`) return rich metadata including source and confidence.
