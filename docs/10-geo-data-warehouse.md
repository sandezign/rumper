# 10 — Geo Data Warehouse & Ingestion Jobs

Pre-collected location data (ARCHITECTURE.md §10 registry) so research queries hit **our own
Postgres**, not live APIs. Data is not realtime — ingestion runs as batch jobs
(weekly for OSM, on-demand caches for point lookups).

## 1. Datasets

| Dataset | Source | Method | Cadence | Table |
|---|---|---|---|---|
| Toll gates (pintu tol) | OSM Overpass | `barrier=toll_booth` + motorway junctions, Jabodetabek bbox | weekly | `geo_features` kind=`toll_gate` |
| KRL/rail stations | OSM Overpass | `railway=station` | weekly | kind=`station` |
| Hospitals / clinics | OSM Overpass | `amenity=hospital/clinic` | weekly | kind=`hospital`/`clinic` |
| Schools | OSM Overpass | `amenity=school` | weekly | kind=`school` |
| Markets / supermarkets | OSM Overpass | `amenity=marketplace`, `shop=supermarket` | weekly | kind=`market`/`supermarket` |
| Pharmacies | OSM Overpass | `amenity=pharmacy` | weekly | kind=`pharmacy` |
| **SUTET** (≥150 kV lines) | OSM Overpass | `power=line` voltage≥150000, vertices stored as tower points | weekly | kind=`sutet_tower` |
| **TPA / landfill** | OSM Overpass | `landuse=landfill`, `amenity=waste_disposal/waste_transfer_station` | weekly | kind=`landfill` |
| Industrial zones | OSM Overpass | `landuse=industrial` (centroid + bbox in meta) | weekly | kind=`industrial` |
| Cemeteries | OSM Overpass | `landuse=cemetery`, `amenity=grave_yard` | weekly | kind=`cemetery` |
| Railway lines (noise) | OSM Overpass | `railway=rail` vertices sampled | weekly | kind=`rail_point` |
| Flood hazard index | InaRISK BNPB ArcGIS REST | identify-at-point on `layer_bahaya_banjir` ImageServer | on-demand + 90-day cache | `point_cache` kind=`inarisk_flood` |
| Elevation (tinggi tanah) | Google Elevation API | 3×3 grid (500 m spacing) at point → absolute + relative profile | on-demand + permanent cache | `point_cache` kind=`elevation` |

Jabodetabek bbox: `(-6.95, 106.30, -5.90, 107.40)` (S, W, N, E).

## 2. Tables (additions to docs/04)

**geo_features** — unified POI/feature store:
`id uuid · kind text · name text · lat double · lng double · source text ("osm") ·
osm_id bigint nullable · meta jsonb · ingested_at timestamptz`.
Index: `(kind, lat, lng)`. Queries are bbox prefilter + haversine in SQL — Jabodetabek
scale (≤ ~100k rows) needs no PostGIS yet (revisit when polygons matter).

**point_cache** — memoized point lookups:
`id uuid · kind text · lat_r double · lng_r double (rounded 4dp ≈ 11 m) · value jsonb ·
fetched_at timestamptz`. Unique `(kind, lat_r, lng_r)`.

**ingestion_runs** — auditability:
`id uuid · dataset text · status text · feature_count int · error text nullable ·
started_at · finished_at`.

## 3. Ingestion jobs

CLI (local now, Cloud Run Job + Cloud Scheduler later — same module):

```bash
uv run python -m app.jobs.ingest_geo            # all datasets
uv run python -m app.jobs.ingest_geo toll_gate sutet_tower   # subset
```

Each dataset run: Overpass query (180 s timeout, retry once on 429/504) → delete+insert
that kind atomically → record `ingestion_runs`. Idempotent; safe to re-run.

## 4. SpatialFacts (what research consumes)

`services/spatial.py` builds, per intake point, one deterministic fact sheet:

- `flood_hazard`: InaRISK index 0–1 → class `rendah/sedang/tinggi` (thresholds 0.33/0.66)
- `elevation_m`, `relative_elevation_m` (center minus mean of 8 neighbors; ≤ −2 m ⇒
  `low_lying=true`), neighbor spacing 500 m
- `nearest_toll`: name + km; `nearest_station`: name + km
- `facilities`: nearest hospital/clinic/pharmacy/school/market/supermarket + km (from
  warehouse; **fallback to live Places API only if warehouse has no rows in 10 km**)
- `red_flag_features`: sutet_tower ≤ 250 m · landfill ≤ 1.5 km · industrial ≤ 1 km ·
  cemetery ≤ 300 m · rail_point ≤ 200 m, each with name + distance

Every SpatialFact carries its dataset + `ingested_at`/`fetched_at` so findings cite
data age honestly (confidence rules in docs/06 still apply).

## 5. Coordinate accuracy & provider reconciliation

The warehouse is **OSM-sourced** (§1) but the app renders on a **Google basemap** (docs/14,
ADR-017). Those are two different surveys of the same city, so our markers can land next to —
not on — the feature Google draws and labels. A buyer reads that as "Rumper's data is wrong",
which is expensive for a product whose whole value is trustworthy location evidence.

### 5.1 Root causes, in order of magnitude

1. **Overpass `out center` is the bounding-box centre, not the centroid.** For a hospital
   campus, a school complex, or a `landuse=industrial` estate, the bbox centre can sit
   hundreds of metres from the site, and for a concave (L-shaped) footprint it can fall
   *outside the polygon entirely*. This was the dominant error and is fixed in §5.2.
2. **Entrance vs. centroid semantics.** Google's label anchor for a large POI is usually near
   the entrance or the building it considers primary; a geometric centroid is the middle of
   the grounds. Residual disagreement of 20–80 m on big sites is expected and is *not* a bug
   in either dataset.
3. **Naming divergence.** `RS Premier Bintaro` (OSM) vs. Google's label for the same place.
   This breaks the evidence index that links a finding to a marker (frontend/docs/03 §7) even
   when the coordinate is right.
4. **Staleness.** OSM is ingested weekly; Google is continuous. Closed or moved POIs persist
   in our warehouse until the next run.

Not a cause: **datum**. Both are WGS84/EPSG:4326. There is no projection shift to correct —
do not go looking for one.

### 5.2 Tier 1 — fix the geometry at ingestion (free, implemented)

`providers/osm.py` now requests full geometry (`out geom`) for every area-shaped kind
(`_AREA_KINDS`) and computes a **true area-weighted centroid** (shoelace over the largest
outer ring; relations resolve their `members[].geometry` with `role=outer`). Fallback ladder,
most to least accurate: node → area centroid → vertex mean → Overpass bbox centre.

Only `toll_gate` stays on `out center` — it is node-only, so there is nothing to compute.

Every row now carries `meta.pos_source` ∈ `osm_node` · `osm_centroid` · `osm_vertex_mean` ·
`osm_bbox_center` · `google_place`. This is provenance, not decoration: it lets the map state
how a marker was placed (§5.5) and lets us measure what fraction of the warehouse is still on
a low-quality position.

**Measured against live Overpass data** (`hospital`, 680 features, 2026-08-30, compared to the
2026-06-11 warehouse rows without writing): 234 nodes untouched, 446 recomputed as centroids;
297 moved <1 m (**no regression** where the old value was already right), 14 moved >25 m, max
**189 m**. Named corrections include RSU Persahabatan (62 m) and RS Pusat Pertamina (58 m) —
i.e. exactly the large-campus case, and exactly the pins a buyer would have called wrong.

### 5.3 Why we do not source the warehouse from Google

Two independent blockers, either one sufficient.

**Licensing.** Google Maps Platform terms permit storing `place_id` **indefinitely**, and
caching latitude/longitude for at most **30 consecutive days**. Other Places content (names,
ratings, hours, photos) must not be pre-fetched, cached or stored. A permanent POI warehouse
built from Places is therefore not something we are licensed to hold — independent of budget.

**Cost.** Jabodetabek's bbox covers ~14,150 km². Nearby Search returns ≤20 results per page,
so full enumeration needs a fine grid: a 1 km grid is ~14,150 cells × ~10 kinds ≈ 141,500
requests for a *single* pass, at the $32/1,000 Pro-SKU floor ≈ **$4.5k per pass** before
pagination (realistically ~$9–14k). Even a coarse 2 km grid is ~$1.1k per pass. Against a
weekly cadence this is not a rounding error, it is the product's entire infrastructure budget.

And we would lose capability: SUTET lines, TPA/landfill, industrial land use and cemeteries —
the red-flag detection that is genuinely differentiating (ADR-012) — are OSM tags with no
Places equivalent.

### 5.4 Tier 2 — targeted Google reconciliation (proposed, bounded)

Refine **only what is actually rendered or cited**, never the whole warehouse.

When a feature is first surfaced for a check (nearest-per-kind for research, ≤8 per kind
within 5 km for the map), resolve it once against Google using the OSM name + a location bias
around the OSM coordinate, with the field mask restricted to **id and location only**:

- store `google_place_id` in `geo_features.meta` — **permanent**, ToS-allowed;
- store the refined lat/lng in `point_cache` under kind `google_place` with a **30-day TTL** —
  the ToS ceiling, enforced by the existing `_cache_get(ttl=…)` path;
- set `meta.pos_source = "google_place"` and keep the OSM coordinate alongside it, so a bad
  match can be detected and reverted;
- **reject the match** when the resolved point is >250 m from the OSM position or the name
  similarity is below threshold — a wrong match is worse than a slightly offset pin.

Cost envelope: ~15 features per first-time check in a new area, ≈ **$0.48** at the Pro floor;
repeat checks in the same area reuse the stored `place_id` at no cost. The 5,000 free Pro
calls/month cover roughly 300 first-time checks before any spend. Monthly re-resolution of
expired coordinates is a location-only field mask on ids we already hold.

> **Verify before enabling:** confirm which SKU tier a `places.id,places.location` field mask
> bills at on the current price list — Google prices each request at the highest tier present
> in the mask, and the floor quoted above is the Pro rate for Text/Nearby Search.

### 5.5 Rendering contract

`GET /api/checks/{id}/map` returns `pos_source` on every feature (docs/14). The map:

- renders `google_place` and `osm_node` markers normally;
- renders `osm_centroid` / `osm_vertex_mean` normally, but the inspector states the position
  is the centre of the site, not its entrance;
- treats `osm_bbox_center` as **low-precision**: the inspector says so, and the marker is not
  used to make a distance claim finer than ~100 m.

Distances in the report continue to be computed from the stored coordinate and are always
labelled as straight-line (docs/14 §3). Reconciliation improves where a pin is drawn; it does
not turn a warehouse distance into a routed one.

### 5.6 Sequencing

Tier 1 ships now and requires a **full re-ingestion** to take effect — positions only change
when rows are rewritten (`ingest_geo` is delete+insert per kind, so a plain re-run suffices).
Tier 2 lands with the doc 18 Wave 2 map work, behind a settings flag, and is measured by the
share of surfaced features whose `pos_source` is still `osm_*` after a check.

### 5.7 Sources

- [Google Maps Platform Service Specific Terms](https://cloud.google.com/maps-platform/terms/maps-service-terms) — caching/storage limits
- [Policies and attributions for Places API](https://developers.google.com/maps/documentation/places/web-service/policies) — `place_id` exempt from caching restrictions; other content may not be stored
- [Places API usage and billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) — SKU tiers priced by field mask; per-SKU free monthly caps
- [Overpass QL `out` statement](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#out) — `center` returns the bounding-box centre, not the centroid

## §6 — Boundaries & hazard on the weekly cadence (2026-08-30)

Kelurahan borders move on the order of *years*; InaRISK is a published regional model, not
a live feed. Fetching either per request bought nothing but latency and rate-limit exposure
on a free public service — so both now land in `geo_features` on the same weekly cadence as
the OSM datasets.

    make ingest-boundaries        # app/jobs/ingest_boundaries.py

`geo_features(kind="kelurahan")` — one row per corridor. `lat`/`lng` is the polygon's own
**shoelace centroid** (not the bbox centre, which drifts badly on kelurahan that follow a
river or a road). `meta` carries `rings`, the admin names, `area_ha`, `flood`, and
`sampled_at` — the point the hazard index was read at, kept so the reading stays traceable
and is never mistaken for a whole-polygon measurement.

Rings are simplified to ~160 vertices at ingest: the corridor map draws at z11 where 500
vertices is invisible detail. Measured: **108 KB → 47 KB** for the 8-corridor payload, shape
preserved. The workspace still fetches full precision (600) live for the single property it
shows, because an arbitrary property point cannot be pre-ingested.

### Consequence for the API

`GET /api/hazard/flood-areas` without `intake_id` now serves warehouse rows and makes **no
external calls**. It also means the areas map has polygons on a first visit — the earlier
version required a finished report, which is why it returned `{"areas": []}` for a user who
had not completed one.

Responses carry `freshness: "warehouse" | "live"` so the caller knows which path served it.
