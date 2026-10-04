# 19 — Area boundaries & flood mapping (research + decision)

> **Status:** Research + proposed decision · 2026-08-29 · needs product sign-off
> **Answers:** GAP-03, GAP-05, GAP-17 in [doc 18](18-ux-revamp-adoption-analysis.md)
> **Triggers:** ADR-013 ("switch to PostGIS when we ingest true flood polygons")

---

## 1. The requirement

Two surfaces in the revamp need *area* geometry, which the product has never had:

1. **Workspace map** — PRD-00 §8 specifies a red flood polygon on Ringkasan/Faktor Risiko,
   an orange liquefaction polygon, and an info bar reading *"Flood Zone Evidence • BNPB 2024
   • 95 m from property"*. In the prototype this is `FLOOD_POLYGON`, seven hardcoded
   coordinates in `MapPanel.tsx:45`.
2. **Curated Areas hub** — PRD-12 needs an *area* to be a real object with a location, an
   extent, aggregate facts, and membership (this property is inside that area).

Today the backend has neither. `spatial.py` produces **point** facts: an InaRISK hazard index
sampled at one lat/lng, a 3×3 elevation grid, and haversine distances to the nearest
`geo_features` row. `GET /api/checks/{id}/map` returns `flood: {index, class}` — a number and
a class for one dot on the earth. There is no geometry to draw and no boundary to test
membership against.

The stated blocker is that flood data we can obtain does not resolve to RT/RW. **That is
true, and it is also the wrong target.** The rest of this document explains why, and what to
build instead.

---

## 2. Administrative granularity: what actually exists

Indonesia's hierarchy, with the OSM `admin_level` conventions used for Indonesia:

| Level | Unit | OSM `admin_level` | Typical count in Jabodetabek |
|---|---|---|---|
| 1 | Provinsi | 4 | 3 (DKI, Jabar, Banten) |
| 2 | Kota / Kabupaten | 5 | ~13 |
| 3 | Kecamatan | 6 | ~180 |
| 4 | Kelurahan / Desa | 7 | ~1,800 |
| 5 | **RW** (Rukun Warga) | *not an admin boundary* | ~20,000+ |
| 6 | **RT** (Rukun Tetangga) | *not an admin boundary* | ~90,000+ |

RT and RW are **not administrative territories**. They are neighbourhood associations —
social/organisational units under a kelurahan. They have no legally delineated boundary in
the national one-map framework, which is precisely why no national dataset publishes RT/RW
polygons. The closest national analogue is BPS's **SLS** (*Satuan Lingkungan Setempat*), the
census enumeration unit maintained in **Wilkerstat**, which does correspond to RT/RW in
practice — but it is a statistical work frame, updated per census cycle, and not published as
a bulk open polygon download.

The one real exception is **DKI Jakarta**, where RT/RW boundaries were digitised during the
2016–2018 HOT Indonesia mapping programme and are published as geopackage/shapefile. That
coverage stops at the provincial border: Bogor, Depok, Tangerang and Bekasi — where most of
Rumper's buyers are actually looking — have no equivalent.

### What Google gives us

Confirmed against the Google Maps Platform data-driven-styling coverage table: for
Indonesia (`ID`), boundary coverage is **Country · Administrative Area Level 1 · Administrative
Area Level 2 — and nothing else.** Postal Code, Locality and School District are all
uncovered. Admin Area 2 is *kota/kabupaten*. So Google's boundary product stops **two levels
above kelurahan** and four above RW.

The area coordinates observed for named neighbourhoods like *Haji Nawi* or *Kemayoran* come
from a different mechanism: the Geocoding API's `geometry.viewport` / `geometry.bounds` —
an axis-aligned **rectangle**, not a boundary. It is a camera hint for framing a map. It is
not a polygon, it has no legal meaning, it overlaps its neighbours, and it must never be
rendered as "this is the flood-affected area". Using a viewport rectangle as a hazard extent
would be a fabricated claim under CLAUDE.md rule 2.

---

## 3. Source survey

| # | Source | What it gives | Granularity | Access | Verdict |
|---|---|---|---|---|---|
| S1 | **BIG geoservices** — `BATASWILAYAH/Administrasi_AR_KelDesa_10K` (MapServer) | Official kelurahan/desa boundary polygons, 1:10,000, EPSG:4326 | Kelurahan | ArcGIS REST `query` → GeoJSON | **Adopt** — this is the boundary layer |
| S2 | **InaRISK BNPB** — `inarisk/layer_bahaya_banjir` (ImageServer) | Flood hazard index raster 0–1 | Raster grid | ArcGIS REST `identify` (already in use) + `exportImage` | **Adopt** — already our hazard source; add raster overlay |
| S3 | **BPS Wilkerstat / SLS** (`sig.bps.go.id`) | Census enumeration units ≈ RT/RW | RT/RW-equivalent | No bulk open download | Watch — no ingestion path today |
| S4 | **DKI Jakarta RT/RW boundaries** (HOT OSM 2016–2018, Jakarta open data, gpkg) | RT and RW polygons | RT/RW | Download | Jakarta only — **not** Jabodetabek |
| S5 | **Open Data Jakarta** — *Daerah Rawan Banjir DKI Jakarta* | Flood-prone areas, attributes down to RW | RW (tabular) | Download / data.go.id | Jakarta only; join key is text, not geometry |
| S6 | **BPBD DKI geoportal** (`gis.bpbd.jakarta.go.id`) | Flood maps from observed 2013–2015 events | Kelurahan/RW | Web GIS | Jakarta only; historical events — good *evidence*, not coverage |
| S7 | **Pantau Banjir Jakarta** (`pantaubanjir.jakarta.go.id`) | **Live RT-level inundation**, water height, status | RT | Web UI; no documented public API | Jakarta only; strongest RT signal that exists — investigate feed |
| S8 | **Google Flood Forecasting API** (Flood Hub) | AI riverine forecasts + inundation maps, 150+ countries | Riverine reach | Waitlist / pilot, API key + GCP project | Evaluate — **riverine only** (see §4) |
| S9 | **OSM** `boundary=administrative` `admin_level=7` | Kelurahan/desa polygons (BPS-derived import) | Kelurahan | Overpass — already our ingestion path | Fallback / cross-check for S1 |
| S10 | **Google Elevation API** | Elevation, already used for the 3×3 relative profile | Point | In use | Keep — best *local* flood proxy we have |
| S11 | **ATR/BPN Zona Nilai Tanah** (`bhumi.atrbpn.go.id`) | Land-value zones as polygons | Zone | Web portal | Only relevant to GAP-13 (price), not hazard |

> **Verification still owed.** S1's public query endpoint, S2's `exportImage` parameters and
> S7's feed format were not exercised from this machine (outbound calls to those hosts were
> blocked). S2 is known-good from production — `providers/hazards.py` already calls its
> `/identify` successfully. Before Wave A, run a spike that pulls one kelurahan polygon from
> S1 and one PNG tile from S2 from a Cloud Run egress IP, and record the response shapes.

---

## 4. Why chasing RT/RW is the wrong target

Four independent reasons, any one of which is sufficient.

**4.1 The hazard data has no such resolution.** InaRISK's flood hazard index is a national
raster derived from regional-scale modelling to BNPB Perka 2/2012 methodology. Resampling a
regional raster onto RT polygons does not create RT-level knowledge; it creates
RT-level *confidence theatre*. The output would look far more precise than the input, which
is exactly the failure mode CLAUDE.md rule 2 exists to prevent.

**4.2 The boundary data does not exist outside Jakarta.** Even granting perfect hazard data,
there is no Jabodetabek-wide RT/RW polygon set to attach it to (§2). A feature that works in
Kemayoran and silently degrades in Cibubur is worse than one that is honest everywhere.

**4.3 Jakarta's dominant flood mode is not riverine.** Much of the flooding that matters to a
buyer is pluvial and drainage-failure flooding — local ponding from rain the drainage cannot
carry, plus tidal/rob effects in the north. Google's Flood Forecasting API models **riverine**
flooding along river reaches. It is genuinely useful for the Ciliwung/Cisadane/Bekasi
corridors and worth piloting, but it will not answer "does this cluster's street flood in
February".

**4.4 The buyer's real question is answered at the property, not the RT.** "Is *this house*
at risk" is a point question, and we already answer it better than an RT polygon would: the
InaRISK index at the point, the relative elevation of that point versus its 500 m
neighbourhood (`low_lying` when ≤ −2 m), and evidence found in grounded search. The map's job
is to make that point answer *legible in context* — not to colour in an administrative unit.

---

## 5. Decision

Adopt a **three-layer model**. Each layer is honest about its own resolution, and the UI
never blends them.

### Layer 1 — Administrative context: kelurahan polygons (S1)

Ingest kelurahan/desa boundaries for the Jabodetabek bbox from BIG (S1), cross-checked
against OSM `admin_level=7` (S9). This is the finest **official, nationally consistent,
Jabodetabek-complete** boundary that exists. It becomes:

- the **identity and extent of an "area"** for the Curated Areas hub (GAP-03) — one or more
  kelurahan grouped into a named corridor, so "Bintaro & Pondok Aren" is a real set of
  polygons rather than a hand-typed centroid;
- the unit for **area aggregates** (GAP-05): commute from a representative point, elevation
  statistics, facility counts within the polygon;
- the join key for kelurahan/RW-level tabular data such as S5/S6 in Jakarta.

### Layer 2 — Hazard surface: InaRISK raster overlay (S2)

Do **not** vectorise the hazard raster into fake polygons. Render it as what it is: a
semi-transparent raster overlay via ArcGIS `exportImage`, proxied and cached by our backend,
with a legend that names the source, the class thresholds (0.33 / 0.66, unchanged from
`hazards.py`) and the data vintage. The map then shows a true hazard *surface*, the property
pin sits on it, and no boundary is implied that the data cannot support.

This replaces `FLOOD_POLYGON` with something real, and it is the smallest change that
unblocks the revamp's map design.

### Layer 3 — Property-local truth: the point facts we already have

Unchanged: InaRISK index at the point, elevation and relative elevation, distance to the
nearest hazard/red-flag features, and grounded-search findings. This remains the only layer
allowed to drive the score. Layers 1 and 2 are **context and rendering**; they do not feed
`scoring.py`.

### On liquefaction

PRD-00 §8 asks for a liquefaction polygon. We ingest no liquefaction dataset. InaRISK does
publish other hazard layers on the same ArcGIS server, so the *mechanism* generalises — but
until a specific layer is chosen, verified, and its methodology understood, the liquefaction
overlay renders as **absent with a stated reason**, not as a mock polygon. Mock rule 4,
doc 18 §8.

### On RT-level data, later

S7 (Pantau Banjir, live RT-level inundation) is the only genuine RT signal in existence for
Jakarta. If a stable feed can be obtained, the right use is **historical evidence, not
coverage**: "RT ini tercatat tergenang N kali sejak 2020" as a cited finding with a source
and date, in the flood category — never as a map polygon and never as a score input outside
DKI, because it would systematically disadvantage Bodetabek locations that simply have no
reporting system. Track it as a research item, not a Wave A dependency.

---

## 6. Data model additions

Proposed additions to `docs/04` / `docs/10`. Requires **PostGIS**, which is the trigger
condition ADR-013 already named.

```
geo_areas
  id            uuid pk
  kind          text        -- 'kelurahan' | 'kecamatan' | 'corridor'
  code          text        -- BPS/Kemendagri wilayah code, unique per kind
  name          text
  parent_code   text        -- kecamatan code for a kelurahan
  geom          geometry(MultiPolygon, 4326)   -- GiST indexed
  centroid      geometry(Point, 4326)
  source        text        -- 'big_rbi_10k' | 'osm'
  source_scale  text        -- '1:10000'
  ingested_at   timestamptz

geo_area_members            -- corridor ⇄ kelurahan grouping (Curated Areas)
  corridor_id   uuid fk geo_areas
  area_id       uuid fk geo_areas
  primary key (corridor_id, area_id)

geo_area_facts              -- precomputed aggregates, recomputed per ingestion run
  area_id       uuid fk geo_areas
  fact_kind     text        -- 'elevation' | 'flood_index' | 'facility_counts' | 'commute'
  value         jsonb
  method        text        -- how it was aggregated; rendered in the UI
  computed_at   timestamptz
```

`ingestion_runs` (already in `docs/10`) covers the new datasets unchanged. `geo_features`
stays as-is — points remain points.

Aggregation methods must be recorded and shown, because an area-level number is always a
summary of a distribution. Minimum: for elevation, report median and the 10th percentile
across a sample grid inside the polygon, not a single centroid reading — the centroid of a
kelurahan can easily be 20 m above its lowest street.

---

## 7. API additions

Contract-tier proposals for `docs/05`; nothing implemented until accepted.

```
GET /api/areas/{area_id}/geometry
    → {"type":"Feature","geometry":{...},"properties":{"code","name","kind",
        "source","source_scale","ingested_at"}}

GET /api/hazard/tiles/{layer}/{z}/{x}/{y}.png      # proxied+cached InaRISK exportImage
    layer ∈ {flood}                                # liquefaction when a dataset is chosen
    → image/png, Cache-Control public, long max-age

GET /api/hazard/legend/{layer}
    → {"layer","source","source_url","classes":[{"label","min","max","color"}],
       "vintage","method_note","resolution_note"}
```

`GET /api/checks/{id}/map` gains a `context` block naming the containing kelurahan and the
hazard layer to render, so the FE never has to guess:

```json
"context": {
  "kelurahan": {"code": "3175031003", "name": "Kemayoran", "area_id": "…"},
  "hazard_layers": ["flood"],
  "flood": {"index": 0.42, "class": "sedang", "source": "InaRISK BNPB",
            "resolution_note": "indeks regional — bukan pengukuran per-RT"}
}
```

The `resolution_note` is part of the contract, not decoration. It is the field the UI uses to
keep its promise in §8.

---

## 8. UI honesty rules

Binding on every surface that renders Layer 1 or 2.

1. **Never say "RT Anda"** or imply per-RT/per-RW precision from InaRISK. The hazard class is
   a regional index; say so, in the legend and in the info bar.
2. **The info bar states the source and the vintage** — PRD-00's own mock copy ("BNPB 2024")
   already does this; keep it and make it dynamic from the legend endpoint.
3. **A kelurahan polygon is an administrative boundary, never a hazard boundary.** Render the
   two in visually distinct treatments (boundary = thin neutral outline; hazard = raster
   fill). They must never share a colour ramp.
4. **Absent layers state why.** "Data likuefaksi belum tersedia untuk area ini" — never an
   empty map that reads as "no risk". This is PRD-11's own principle 3 (*unknown is a valid
   result*) and CLAUDE.md rule 2.
5. **Area-level numbers carry their aggregation method** ("median elevasi 8 kelurahan"), so a
   buyer can tell a summary from a measurement.

---

## 9. Phasing

**Wave A — unblock the map (small).** Verification spike (§3 note). Proxy + cache InaRISK
`exportImage` behind `/api/hazard/tiles`. Add `legend`. Replace `FLOOD_POLYGON` with the real
overlay. Add `context.kelurahan` to `/map`. No PostGIS required yet if the kelurahan lookup is
done via a point-in-polygon query against a small ingested set — but adding PostGIS here is
cheaper than retrofitting it later.

**Wave B — areas as entities.** Enable PostGIS. Ingest S1 kelurahan polygons for the
Jabodetabek bbox with the existing `ingest_geo` job pattern. Build `geo_areas`,
`geo_area_members`, `geo_area_facts`. Define the 8 corridors as kelurahan groupings. This is
what unblocks doc 18's Wave 3.

**Wave C — evaluate and extend.** Pilot the Google Flood Forecasting API for riverine
corridors (S8). Investigate the Pantau Banjir feed (S7) as historical evidence. Choose and
verify a liquefaction layer. Each lands as a cited finding first, and only becomes a map
layer once its resolution and vintage are documented.

---

## 10. Proposed ADRs (for `docs/02`)

**ADR-014 — Kelurahan is the finest administrative unit Rumper will model.**
RT/RW polygons do not exist as national data, the hazard rasters have no such resolution, and
the only RT-level coverage (DKI) would systematically disadvantage Bodetabek. Kelurahan
(BIG 1:10,000, S1) is official, nationally consistent, and Jabodetabek-complete. Property-
level questions are answered at the point, not by the polygon.

**ADR-015 — Hazard renders as a raster surface, never as a synthesised polygon.**
We proxy InaRISK's ImageServer rather than vectorising it. Vectorising a regional raster would
manufacture apparent precision the source does not have, violating the evidence-and-confidence
rule. Boundary geometry and hazard geometry are separate layers with separate visual
treatments.

**ADR-016 — Enable PostGIS (executes the condition in ADR-013).**
ADR-013 deferred PostGIS until "true flood polygons or real point-in-polygon work". Ingesting
kelurahan boundaries and testing property membership is exactly that. `geo_features` keeps its
lat/lng + haversine path unchanged; PostGIS is added for `geo_areas` only.

---

## Sources

- [Google boundaries coverage — Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/dds-boundaries/coverage) (Indonesia: Country, Admin Area 1, Admin Area 2 only)
- [BIG geoservices — `Administrasi_AR_KelDesa_10K` MapServer](https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_KelDesa_10K/MapServer)
- [inaRISK BNPB](https://inarisk.bnpb.go.id/) · [metodologi](https://inarisk.bnpb.go.id/metodologi) · [INDEKS_BAHAYA_BANJIR ImageServer](https://gis.bnpb.go.id/server/rest/services/inarisk/INDEKS_BAHAYA_BANJIR/ImageServer)
- [Sistem Informasi Geospasial BPS (Wilkerstat/SLS)](https://sig.bps.go.id/) · [sistem pengkodean](https://sig.bps.go.id/home/sistempengkodean)
- [Open Data Jakarta — Daerah Rawan Banjir DKI Jakarta](https://data.jakarta.go.id/dataset/daerahrawanbanjirdkijakarta) · [data.go.id mirror](https://data.go.id/dataset/dataset/data-daerah-rawan-banjir-dki-jakarta)
- [BPBD DKI Jakarta geoportal — peta rawan banjir 2013–2015](http://gis.bpbd.jakarta.go.id/documents/56)
- [Pantau Banjir Jakarta](https://pantaubanjir.jakarta.go.id/) · [peta informasi banjir](https://pantaubanjir.jakarta.go.id/peta-informasi-banjir)
- [Google Flood Forecasting API](https://developers.google.com/flood-forecasting) · [API FAQ](https://support.google.com/flood-hub/answer/16364606?hl=en)
- [OSM — Import/Catalogue/Indonesia/VillageBoundaries](https://wiki.openstreetmap.org/wiki/Import/Catalogue/Indonesia/VillageBoundaries) · [Indonesian Tagging Guidelines](https://wiki.openstreetmap.org/wiki/Indonesian_Tagging_Guidelines)
- [OSM Indonesia — DKI Jakarta RT/RW mapping programme 2016–2018](https://openstreetmap.or.id/dki-jakarta/)
- [ATR/BPN Bhumi — Zona Nilai Tanah](https://bhumi.atrbpn.go.id/) (context for doc 18 §7.3)

## Wave A — shipped 2026-08-30

**The polygon is real.** `providers/big.py` queries BIG's RBI
`Administrasi_AR_KelDesa_10K` (ArcGIS, open, no key) for the kelurahan containing a point.
Verified against three corridors from a live curation run:

| point | kelurahan | vertices | area | ring |
|---|---|---:|---:|---|
| Pamulang | Pamulang Barat | 435 | 439.1 ha | closed |
| Cibubur | Harjamukti | 497 | 597.1 ha | closed |
| Bintaro | Sawah Baru | 362 | 317.0 ha | closed |

~14–20 KB per ring at 5 dp. Ramer–Douglas–Peucker thins anything over 600 vertices
(invisible at report-map zoom); cached 180 days in `point_cache`, since administrative
boundaries move on the order of years and the service is free and public.

**InaRISK is still down** — `gis.bnpb.go.id` returns HTTP 500 on both the `/server` and
`/arcgis` paths, so the raster tile overlay (Wave B) remains blocked. The point `identify`
readings we already cache are unaffected.

### Endpoint

`GET /api/hazard/flood-areas[?intake_id=…]` — kelurahan boundary + InaRISK point index for
this user's analysed locations. Ownership runs through `Conversation.user_id` (intakes carry
no owner column). Only locations **with a finished report** are returned: a corridor nobody
analysed has no property point to sample, so there is nothing honest to draw.

- **Areas hub** calls it unfiltered → every analysed location's boundary at once.
- **Workspace** calls it with `intake_id` → only the location on screen.

### What the colour means

Outline/fill are keyed to the InaRISK class: `tinggi` red, `sedang` amber, `rendah` green,
**unmeasured grey — never green**. "No reading" is not "safe".

The polygon is an *administrative boundary*; the index is *regional*, sampled at the
property point. Attaching one to the other is defensible precisely because InaRISK is
already an area-level product — but it is never a measured flood extent, and the payload
carries that sentence so every caller renders the same caveat. ADR-015 stands: no
synthesised blobs.

### Still open

- Wave B: InaRISK raster tile proxy (blocked on BNPB uptime).
- The "Banjir" pill on the areas map is inert until the first report exists, with a tooltip
  saying why rather than an enabled toggle that draws nothing.

## Correction: boundary ≠ flood extent (2026-08-30)

The first cut filled the kelurahan polygon solid red at 18% opacity. That was wrong, and it
was caught in review with the right reasoning: *"if an area is 500 ha, maybe only 3–5% of
it floods."*

A kelurahan runs 300–600 ha (measured: Harjamukti 597.1, Pamulang Barat 439.1, Sawah Baru
317.0). A filled red polygon over that area asserts a **flooded extent of 597 ha**. We have
no such data and cannot get it from our sources:

- InaRISK publishes a regional hazard **index**, sampled at a point. No geometry, no depth,
  no extent.
- BIG publishes an **administrative border**. It says nothing about water.

Joining the two produces a *boundary with an index attached*, never an extent. Claiming
otherwise is exactly the alarmist failure mode docs/06 §4 forbids — and it would inflate
the perceived risk of every location by an order of magnitude.

### How it renders now

- **Dashed outline, fill at 0.06** — reads as a boundary, not a filled area. Solid edges
  read as surveyed lines; dashes read as approximate, which is the honest signal.
- **The label names it**: "Batas kelurahan X · bahaya sedang" with the subtitle "Garis
  putus-putus = batas wilayah (439.1 ha), bukan luas genangan".
- `area_ha` is presented as the *kelurahan's* area, never as a flooded area.
- One colour (`#E12626`) for the whole layer: hue means "this is the flood layer", not a
  per-polygon verdict. An amber or green fill would read as a judgement on the entire
  kelurahan, which a single point index cannot support.

### What a real extent would need

1. InaRISK raster sampled on a **grid inside** the kelurahan, contoured to the high-hazard
   cells — that yields a defensible sub-kelurahan extent. Blocked: `gis.bnpb.go.id` returns
   HTTP 500 on both service paths.
2. Historic inundation polygons (BPBD/Pusdatin) where published — patchy coverage.

Until one of those lands, the boundary outline plus a point index is the most the evidence
supports, and the UI must not imply more.
