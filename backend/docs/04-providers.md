# 04 — Providers (all external IO)

Source: `app/providers/llm.py`, `gmaps.py`, `hazards.py`, `osm.py`.
Specs: docs/06 §3 (grounding), docs/08 (keys), docs/10 (warehouse/point lookups).

## 1. LLM gateway (`providers/llm.py`)

The **only** module that talks to Gemini (CLAUDE.md rule 4). Everything goes through
LangChain `ChatGoogleGenerativeAI` so LangSmith traces carry token usage and LangGraph
nodes show child LLM runs; the same `usage_metadata` feeds the usage ledger (doc 03).

- `_chat(temperature, max_output_tokens, thinking_budget)` — returns a cached model
  instance keyed by `(temperature, max_output_tokens, thinking_budget)`; temperature
  `None` falls back to `settings.llm_temperature`; `thinking_budget` (Gemini
  reasoning-token cap) is passed only when not `None`. Model name/key come from
  settings.
- `_meter(msg)` — reads `msg.usage_metadata` (`input_tokens`/`output_tokens`) and
  calls `record_llm_usage(settings.gemini_model, ...)` when present.

### `grounded(prompt, *, temperature=None, max_output_tokens=None, thinking_budget=None) -> (text, sources)`

Google-Search-grounded generation: invokes with
`tools=[genai_types.Tool(google_search=genai_types.GoogleSearch())]`.
Text: `resp.text()` if callable else `str(resp.content)`. Sources are extracted **only**
from `response_metadata.grounding_metadata.grounding_chunks[*].web` as
`{"title": web.title or web.uri, "url": web.uri}` — the model never writes URLs
(two-step grounding pattern: a later `structured` call cites sources by index and code
resolves them, doc 05 §2 extract).

### `structured(prompt, schema, *, ...) -> schema`

`model.with_structured_output(schema, include_raw=True)`. Loop of 2 attempts:
meter the `raw` message when present, return `parsed` when it is an instance of
`schema`, otherwise raise with the `parsing_error`; after the second failure raise
`RuntimeError("structured output failed: <last_err>")`.

## 2. Google Maps Platform (`providers/gmaps.py`)

Endpoints (must match the `rumper-maps-key` API restrictions, docs/08 §1):
- Geocoding (legacy JSON): `https://maps.googleapis.com/maps/api/geocode/json`
- Places NearbySearch (legacy): `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
- Routes v2: `https://routes.googleapis.com/directions/v2:computeRoutes`

Helpers:
- `haversine_km(lat1, lng1, lat2, lng2)` — great-circle km, R = 6371.
- `next_weekday_at_wib(weekday, hour)` — RFC3339 **UTC** timestamp of the next given
  weekday (Mon=0) at `hour`:00 WIB; always at least 1 day ahead (`days_ahead or 7`).
- `JABODETABEK_TOKENS = ("jakarta", "bogor", "depok", "tangerang", "bekasi")`.
- `_get_json(url, params, *, timeout=15)` — GET + parse JSON, **never raises**: an
  `httpx.HTTPError` (timeout/connect) or a non-JSON body (`ValueError` — Maps returns
  an HTML error page on billing-disabled / quota / 5xx) is logged and returns `None`.

**Resilience contract.** No GMP call raises into a request handler. `geocode`,
`geocode_smart`, `autocomplete`, `places_nearby`, and `compute_route` route every
transport/parse/shape error to `None`/`[]` (logged under `rumper.gmaps`). This is why a
bad upstream surfaces as the graceful "couldn't map" path (intake → HTTP 400, chat →
retry reply), **not** an unhandled 500. Corollary: if *every* address starts returning
400 "alamat tidak dapat dipetakan", suspect a Maps key/billing/quota/network problem and
check the `rumper.gmaps` warnings — it is no longer hidden behind a 500.

### `geocode(address) -> dict | None`

Params `{address, region: "id", language: "id", key}` (timeout 15 s). `None` unless
`status == "OK"` with results **and** the first result carries `geometry.location`
(a result without it — possible from the Text Search fallback — is treated as a miss,
not a `KeyError`). Uses the **first** result. Builds a `{type: long_name}` map from
`address_components` (missing `long_name`/`types` tolerated), then returns:
`lat`, `lng`, `formatted_address`,
`kelurahan` = `administrative_area_level_4` or `sublocality_level_1`,
`kecamatan` = `administrative_area_level_3`,
`kota` = `administrative_area_level_2` or `locality` or `""`,
`in_jabodetabek` = any token appears (case-insensitive) in `kota + " " +
formatted_address`.

### `compute_route(origin, dest, *, mode, departure_rfc3339=None) -> dict | None`

`mode ∈ {DRIVE, TWO_WHEELER, TRANSIT}`. Body: latLng waypoints + `travelMode`;
`routingPreference: TRAFFIC_AWARE` added for DRIVE/TWO_WHEELER; optional
`departureTime`. Headers: `X-Goog-Api-Key` and field mask
`routes.duration,routes.distanceMeters,routes.legs.steps.travelMode` (timeout 30 s).
`None` on non-200 or no routes. Returns:
- `duration_min` = round(seconds/60) — duration arrives as `"1234s"`, strip the `s`;
- `distance_km` = round(meters/1000, 1);
- `transfers` = max(0, count of steps with `travelMode == "TRANSIT"` − 1).

### `places_nearby(lat, lng, *, radius_m, place_type=None, keyword=None) -> list`

Params `{location: "lat,lng", radius, language: "id", key}` (+`type`/`keyword`).
First 10 results mapped to `{name, lat, lng, distance_km (haversine, 2dp), types}`,
sorted by distance. (Currently unused at request time — warehouse covers facilities —
kept for ad-hoc lookups.)

## 3. Hazard point lookups (`providers/hazards.py`)

Point lookups with a Postgres cache (`point_cache`, doc 02 §3). Cache key: kind +
lat/lng rounded to **4dp**. `_cache_get` honors an optional TTL; `_cache_put` upserts
(`ON CONFLICT ... DO UPDATE` value + `fetched_at`).

### `inarisk_flood(lat, lng) -> {"index": float, "class": str} | None`

TTL 90 days. Tries the InaRISK BNPB ArcGIS ImageServer **identify** endpoint on two
bases (`gis.bnpb.go.id/server/...` then `/arcgis/...`), `verify=False` (their TLS chain
is broken), timeout 20 s. Params: esriGeometryPoint JSON `{x: lng, y: lat,
wkid: 4326}`, `returnGeometry/returnCatalogItems: false`, `f: json`.
- `value` field `None|"NoData"|""` → cache `{}` and return `None` (a real "no hazard
  data here", cached);
- numeric → `{"index": round(v, 3), "class": "rendah" if v < 0.333 else "sedang" if
  v < 0.666 else "tinggi"}`;
- all bases failed → return `None` **without caching** (transient failure must retry
  next time).

### `elevation_profile(lat, lng) -> {"elevation_m", "relative_m", "low_lying"} | None`

Cache has no TTL (terrain doesn't change). Builds a 3×3 grid spaced `d = 0.0045°`
(~500 m) around the point, one Google Elevation API call with the 9 locations.
`relative_m` = center − mean(8 neighbors); `low_lying` = `relative_m <= -2.0`
(basin indicator). Failure → log + `None` (not cached).

### `point_hazards(lat, lng)` — gathers both concurrently → `{"flood": ..., "elevation": ...}`.

## 4. OSM Overpass batch client (`providers/osm.py`)

**Ingestion-time only** (doc 09 §1) — never called during a request. Mirrors:
`overpass-api.de` then `overpass.kumi.systems`. Jabodetabek bbox `(S, W, N, E) =
(-6.95, 106.30, -5.90, 107.40)`.

`QUERIES: dict[kind, overpass body]` — 13 dataset kinds:

| kind | overpass selectors (within bbox) |
|---|---|
| toll_gate | `node[barrier=toll_booth]`, `node[highway=motorway_junction]` |
| station | `node/way[railway=station]` |
| hospital / clinic / school / market / pharmacy | `nwr[amenity=...]` (`marketplace` for market) |
| supermarket | `nwr[shop=supermarket]` |
| sutet_tower | `way[power=line][voltage ~ ≥150kV regex]` (regex `^(1[5-9]\|[2-9])[0-9]{4}$\|^[1-9][0-9]{5,}$`) |
| landfill | `nwr[landuse=landfill]`, `nwr[amenity~waste_disposal\|waste_transfer_station]` |
| industrial | `way/relation[landuse=industrial]` |
| cemetery | `nwr[landuse=cemetery]`, `nwr[amenity=grave_yard]` |
| rail_point | `way[railway=rail][usage != industrial]` |

`fetch(kind)`:
- query = `[out:json][timeout:180];(<body>);<out>` where `<out>` is `out geom;` for
  geometry kinds (`sutet_tower`, `rail_point`) else `out center tags;`;
- POST form `data=<query>`, timeout 200 s, UA
  `rumper-ingest/0.1 (location research; <contact email>)`;
- per mirror, 2 attempts; on 429/504 sleep `15·(attempt+1)` s then retry; other
  failures move to the next mirror; all failed → `RuntimeError`.
- element mapping:
  - geometry kinds: sample way vertices every Nth point (`sutet_tower`: 2,
    `rail_point`: 10) into individual features; name falls back to the voltage tag;
    `meta={"voltage": ...}` for sutet;
  - POI kinds: coordinates from `el.lat/lon` (nodes) or `el.center` (ways/relations),
    skip otherwise; `meta` keeps whichever of `amenity|landuse|shop|railway|highway`
    tags exist.
- returns `[{name, lat, lng, osm_id, meta}]`.
