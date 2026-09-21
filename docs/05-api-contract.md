# 05 — API Contract (FE/BE source of truth)

Base URL: `http://localhost:8000` (local) · JSON `snake_case` · errors are
`{"detail": "<user-actionable message, id-ID>"}` with proper HTTP codes.
CORS: allow `http://localhost:3000` in dev.

## POST /api/intakes

Create an intake and start research. Returns immediately.

Request:

```json
{
  "full_name": "Sari",
  "whatsapp": "6281234567890",
  "property_name": "Cluster Mawar, Grand Wisata",
  "maps_link": "https://maps.app.goo.gl/...",
  "address_text": "Grand Wisata, Tambun Selatan, Bekasi",
  "purpose": "tinggal_keluarga",
  "buying_stage": "siap_dp",
  "dp_timeline": "lt_30_hari",
  "workplace_text": "SCBD, Jakarta Selatan",
  "transport_mode": "krl",
  "concerns": ["banjir", "commute"],
  "concern_notes": "Listing bilang bebas banjir",
  "consent_whatsapp": true,
  "consent_privacy": true
}
```

Required: `full_name`, `whatsapp`, `address_text`, `workplace_text`,
`transport_mode`, both consents `true`. Others optional.

`201` → `{"intake_id": "<uuid>", "status": "pending"}`
`422` → validation; `400` → geocoding failed ("Bagikan pin Google Maps…");
location outside Jabodetabek is **accepted** but flagged (`in_jabodetabek: false`)
and research proceeds best-effort with a scope warning in the report.

## GET /api/checks/{intake_id}

Poll for status and result.

`200` while running (server-owned loader progress — the FE renders these verbatim, no
client-side faking). `progress.step` is the 1–5 named loader step; `progress.pct` is the
0–100 bar; `progress.label` is a live id-ID status line. `categories_done` is kept for
back-compat (mirrors `progress.step`):

```json
{
  "status": "running",
  "categories_done": 3,
  "progress": {
    "step": 3,
    "total": 5,
    "pct": 42,
    "label": "Mencari & memperdalam bukti dari web (2/6)…"
  }
}
```

`200` when done:

```json
{
  "status": "done",
  "report": {
    "report_type": "mini_check_preliminary",
    "property": {"name": "...", "formatted_address": "...", "lat": -6.2, "lng": 107.0,
                  "in_jabodetabek": true},
    "rls_score": 68.5,
    "band": "layak_dengan_catatan",
    "band_label": "Layak dengan catatan",
    "recommendation": "verify_further",
    "recommendation_label": "Validasi lebih lanjut sebelum memutuskan",
    "summary": "…narasi id-ID…",
    "categories": [
      {
        "category": "banjir",
        "label": "Ketahanan Banjir",
        "weight": 0.30,
        "score": 60,
        "confidence": "data_sedang",
        "rationale": "…",
        "findings": [
          {
            "claim": "…",
            "evidence": [{"source_title": "…", "url": "…", "accessed_at": "2026-06-10",
                           "kind": "grounded_search"}],
            "confidence": "data_sedang",
            "limitation": "…",
            "validation_action": "…",
            "is_red_flag": false,
            "is_critical": false,
            "is_evidence_gap": false
          }
        ]
      }
    ],
    "red_flags": [ "…subset of findings with is_red_flag…" ],
    "evidence_gaps": [ "…subset with is_evidence_gap…" ],
    "checklist": [{"item": "…", "category": "banjir", "reason": "…"}],
    "disclaimer": "<fixed string, code-owned>",
    "created_at": "2026-06-10T12:00:00Z"
  }
}
```

`200` failed: `{"status": "failed", "error": "…id-ID actionable…"}`
`404` unknown id.

Recommendation enum ↔ label map (code-owned, doc 07 §5):
`proceed` · `proceed_with_caution` · `verify_further` · `avoid_until_resolved`.

### Evidence de-duplication (2026-08-30)

A grounded-search run cites the same articles from several findings, and the payload used to
embed the full evidence object every time — then embed whole findings a second time under
`red_flags`/`evidence_gaps`. Measured on a real Pamulang report: **250 KB**.

The report now carries a single `sources: [{id, source_title, url, kind, accessed_at,
published_at}]` table. Findings reference it by `evidence_ids: [int]`, and
`red_flags`/`evidence_gaps` are `{category, index}` **references** into
`categories[].findings[]` rather than copies. Same report: **78 KB (−69%)**; a smaller one
−37%. The saving scales with how much the search repeats sources.

Clients resolve with `resolveEvidence(report, finding)` / `resolveRef(report, ref)`
(`lib/api.ts`). The superseded V2/V3 analysis views read the old shape through
`inflateReport()`, which is deleted with them.

## GET /api/checks/{intake_id}/routes

Real street routes from the property to the nearest station and toll gate, for the map
workspace (docs/14 §3). One Google **Routes API** call per destination, so it is a separate
request from `/map` (which is warehouse-only) and is never on the report's critical path.

```json
{
  "station": {"polyline": "<encoded path>", "distance_km": 6.3, "duration_min": 19, "mode": "DRIVE"},
  "toll":    {"polyline": "<encoded path>", "distance_km": 12.7, "duration_min": 23, "mode": "DRIVE"}
}
```

Either key is `null` when there is no such feature nearby or the routing call fails; the
map then falls back to a **dashed** straight-line connector. `distance_km`/`duration_min`
here are live traffic-aware estimates at request time — they are *not* part of the reviewed
Mini Check, and the UI labels them as such next to the report's straight-line distance.

`404` unknown id / intake without coordinates.

## GET /api/areas  *(auth)*

Curated corridors scored against **this buyer's** anchor (docs/21). Query:
`anchor_lat` · `anchor_lng` (required) · `anchor_label` · `tolerance_min` (10–240, default 60)
· `dealbreakers` (comma-separated priority keys).

The anchor is a parameter because the Buyer Priority Profile still lives client-side
(GAP-01); when `GET /api/profile` lands the backend reads it and these become optional.

`200` → `{anchor: {label, lat, lng}, areas: [...], meta: {counts, commute_tolerance_min,
sources, geometry_note}}`. Each area carries `category` (`strong_fit` ·
`interesting_tradeoff` · `challenge_assumptions`) + `category_label`, `centroid`,
`commute {minutes, mode, distance_km, transfers, polyline, departure_window}` | null,
`elevation {elevation_m, relative_m, low_lying, method}` | null,
`flood {index, class, resolution_note}` | null, `transit[]`, `facilities{}`,
`fit_reasons[]`, `tradeoffs[]`, `unknowns[]`, `dealbreaker_conflicts[]`.

**No numeric fit score** — by design (PRD-12 §1.2). Category assignment is pure code;
the LLM writes only `fit_reasons`/`tradeoffs` prose and cannot change the category or
introduce a number (docs/21 §6). A corridor with no commute data is never `strong_fit`.

Commute is a Routes API `TRANSIT` estimate for the next Monday 07:00 WIB —
`departure_window` labels it; it is a typical peak figure, not live traffic.

## GET /api/places/autocomplete  *(auth)*

`?q=` (min 4 chars, else `[]`) → `[{description, place_id}]`, ≤5. Rate-limited 60/min.

Optional `near_lat` · `near_lng` · `radius_m` (default 12000) **hard-bound** the search to a
circle (`strictbounds`). The areas hub passes the chosen corridor's centroid so a buyer
evaluating Cibubur cannot pick a house in Serpong (docs/21 §9). Omit them for the unscoped
picker used by the wizard's anchor field and the ops intake.

## GET /api/places/geocode  *(auth)*

`?q=` (≥3 chars) → `{lat, lng, formatted_address}`. Area-tolerant (`geocode_smart`).
`404` when unmappable — callers must surface that, never fall back to a default centre.
Rate-limited 60/min.

## GET /api/health

`{"status": "ok", "db": true}`

### GET /api/checks/{intake_id}/route (2026-08-30)

Street route from the property to an **arbitrary** point — `dest_lat`, `dest_lng`,
`mode` (DRIVE default). Closes docs/18 GAP-07: `/routes` only ever covered the nearest
station and toll gate, so tapping a hospital or school could show nothing better than a
straight connector. Measured on a real report: 1.3 km straight-line vs **1.7 km / 4 min**
driving to the nearest hospital — the straight line understates the trip by ~30%.

One Routes API call, so it is fetched on tap rather than bundled into `/map`. On failure
every field is `null` and the client draws no path — never a synthesised one.

### Chat citations (2026-08-30)

`ChatTurnDraft.citations: list[str]` and the send/list responses now carry `citations`.

Closed vocabulary on purpose: the model may only name one of the five scored report
categories (`banjir`, `commute`, `akses`, `fasilitas`, `lingkungan`), and `chat_graph`
allowlists the result against `CATEGORIES` before it leaves the server. It therefore cannot
invent a source title or URL — the failure mode a free-text citation field invites, and one
CLAUDE.md global rule 2 forbids.

The revamp reference shows a source chip under each assistant reply. This is the honest form
our data supports: a chip that names a report section the buyer can open, rather than a
fabricated article. The reference's "Tambah ke checklist investigasi" button is **not**
implemented — persisting a buyer-authored checklist item needs an endpoint that does not
exist yet, and a button that silently does nothing is worse than its absence.
