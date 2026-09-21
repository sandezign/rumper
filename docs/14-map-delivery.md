# 14 — Map workspace (rich data delivery)

Text-only reports bore users. The map shows the warehouse + research data visually — the UVP
made visible: generic chatbots cannot draw your flood class, SUTET towers, and toll access on
a map; we can, from our own data.

In the three-region workspace (docs/16) the map is the **right map workspace region** — a
persistent panel that appears alongside the analysis once research completes, not a
transient slide-in. In the shipped V3 workspace it is the **dominant** region: `55vw` by
default (never below 50% unless the user drags the divider), resizable between 320px and
70vw, and it yields width to the assistant column before the analysis column does. On mobile
it becomes a full-screen sheet toggled from the analysis/rail. The payload, rendering, and
markers below are unchanged; add a **linked-evidence bar** beneath the map ("Terhubung ke
temuan …") that ties a selected finding/marker to the same evidence in the analysis region.

## 1. Endpoint — `GET /api/checks/{intake_id}/map`

```json
{
  "property": {"name", "formatted_address", "lat", "lng"},
  "rls": {"score", "band", "band_label", "recommendation_label"},
  "flood": {"index", "class"},
  "elevation": {"elevation_m", "relative_m", "low_lying"},
  "nearest_toll": {"name", "lat", "lng", "distance_km"},
  "nearest_station": {"name", "lat", "lng", "distance_km"},
  "facilities": [{"kind", "name", "lat", "lng", "distance_km", "ingested_at", "pos_source"}],
  "red_flags": [{"kind", "label", "name", "lat", "lng", "distance_km", "critical", "ingested_at", "pos_source"}],
  "category_scores": {"banjir": 60, "commute": 20, ...}
}
```

Built from `spatial.py` map-mode (wider limits than research: up to 8 facilities/kind
within 5 km; red-flag features within 3 km). Auth required; intake must belong to a
conversation of the user (or be unowned ops-form intake → 404 in workspace).

## 2. Rendering (Google Maps JS via `@vis.gl/react-google-maps`)

The app uses **Google Maps only** — one provider for the map, Places autocomplete and
Street View thumbnails (`VITE_GOOGLE_MAPS_KEY`, browser key, referrer-restricted). The
Leaflet/OSM-tile experiment was removed with the V3 port; markers are DOM overlays
(`OverlayView`) so they can be styled with the design tokens.

| Layer | Visual |
|---|---|
| Property | Pin + pulse; popup = RLS + band + recommendation |
| Risk halo | 600 m circle around property tinted by band (green/teal/amber/red, 25% opacity) |
| Flood context | If class sedang/tinggi: blue-striped 1 km circle + "InaRISK: kelas X" badge |
| Facilities | DOM markers with lucide icons: hospital · clinic · pharmacy · school · market/supermarket · station · toll |
| Red flags | Red markers: sutet · landfill · industrial · cemetery · rail; critical = larger + red ring |
| Legend | Floating card: band color, icon glossary, data age note |
| Header strip | Score chip + band + per-category mini-bars above the map |

**Position provenance (`pos_source`).** The warehouse is OSM-sourced while the basemap is
Google (ADR-017), so every feature states how its coordinate was placed:
`osm_node` · `osm_centroid` · `osm_vertex_mean` · `osm_bbox_center` · `osm_legacy` ·
`google_place` (docs/10 §5). `osm_centroid` marks the centre of a site, not its entrance —
the inspector says so. `osm_bbox_center` and `osm_legacy` are **low-precision**: the inspector
states it and the marker never carries a distance claim finer than ~100 m. This is the same
honesty rule as confidence badges, applied to geometry instead of evidence.

**Confidence-Based Rendering:** markers render by the confidence of the *finding* they carry — the warehouse rows themselves have no `confidence_level`. The FE evidence index links a finding to a feature by name (frontend/docs/03 §7); `data_kuat` = solid outline, `data_sedang` = amber outline, `perlu_validasi` = dashed amber. Features no finding mentions render neutral and their inspector shows only warehouse fields (name, distance, ingest date) — never an invented claim.

**Evidence Cards:** selecting a feature opens the inspector (right-edge overlay on desktop, full sheet on mobile): Street View, claim, distance, source citations + dates, confidence badge, limitation, and the validation step to do on site.

## 3. Interaction

- **Tab Menu Layers:** Floating tab menu, centred over the canvas (Ringkasan, Risiko, Perjalanan, Fasilitas, Tol & akses), each tab labelled with its feature count. Toggling swaps the visible dataset; a tab with no data is dimmed and states why. **Ringkasan is the composite default** (survey radius + flood context + nearest facility per kind + station + toll + red flags) so the map reflects the result before any interaction.
- **Real routes:** Perjalanan and Tol & akses draw the **actual street route** (Google Routes API via `GET /api/checks/{id}/routes`, casing + line like a navigation app) with its driving distance and duration. This matters: a toll gate 1.87 km away in a straight line can be 12.7 km / 23 min by road. When routing is unavailable the map falls back to a **dashed** straight-line connector, so the two are never confused. The routed figures are live estimates and are always shown *beside* — never instead of — the report's straight-line distance.
- **Panel Toggle:** From the chat ("Lihat peta" button on the report-ready message); close collapses back to centered chat.
- **Two-Way Sync:** Hovering over a finding chip in the chat automatically switches the map to the relevant tab and pans/pulses the marker.
- **Mobile:** Panel becomes a full-screen sheet over the chat.
