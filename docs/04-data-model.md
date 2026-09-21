# 04 — Data Model (Postgres db `rumper`)

Local-first: `createdb rumper`. PostGIS deferred (lat/lng doubles suffice for the
prototype; point-in-polygon flood layers are a Phase 2 item). UUID PKs
(`gen_random_uuid()` via `pgcrypto`/`uuid` default in app). All timestamps UTC.

## intakes

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| full_name | text | |
| whatsapp | text | digits only; PII — never logged |
| property_name | text | perumahan / cluster name |
| maps_link | text nullable | listing or Google Maps link |
| address_text | text | what the user typed |
| lat, lng | double | geocoded property point |
| formatted_address | text | from Geocoding API |
| in_jabodetabek | boolean | SOP scope gate result |
| purpose | text | e.g. `tinggal_sendiri`, `keluarga` |
| buying_stage | text | e.g. `survey`, `nego`, `siap_dp` |
| dp_timeline | text | e.g. `lt_30_hari` |
| workplace_text | text | |
| workplace_lat, workplace_lng | double nullable | |
| transport_mode | text | `mobil` `motor` `krl` `transjakarta` `campuran` |
| concerns | jsonb | array of category keys + free text |
| consent_whatsapp, consent_privacy | boolean | required true |
| created_at | timestamptz | |

## research_jobs

| Column | Type | Notes |
|---|---|---|
| id | uuid pk · intake_id fk | one job per intake (prototype) |
| status | text | `pending` `running` `done` `failed` |
| error | text nullable | user-actionable on `failed` |
| categories_done | int | progress counter for the polling UI |
| trace_id | text nullable | LangSmith run id (ADR-011) |

Geo warehouse tables (`geo_features`, `point_cache`, `ingestion_runs`) are specified in
[10-geo-data-warehouse.md](10-geo-data-warehouse.md) §2.
| started_at, finished_at | timestamptz nullable | |

## findings

| Column | Type | Notes |
|---|---|---|
| id | uuid pk · job_id fk | |
| category | text | `banjir` `commute` `akses` `fasilitas` `lingkungan` |
| claim | text | the observation, Bahasa Indonesia |
| evidence | jsonb | `[{source_title, url, published_at?, accessed_at, kind}]` — kind: `grounded_search` `routes_api` `places_api` `geocoding` |
| confidence | text | `data_kuat` `data_sedang` `perlu_validasi` |
| limitation | text | why this may not apply to the exact house |
| validation_action | text | what to check on site / ask warga |
| is_red_flag | boolean | |
| is_critical | boolean | triggers override (doc 07 §4) |
| is_evidence_gap | boolean | claim = what's missing |

## category_scores

| Column | Type | Notes |
|---|---|---|
| id | uuid pk · job_id fk | unique (job_id, category) |
| category | text | five keys as above |
| score | int nullable | 0–100; null = evidence gap |
| proposed_score | int nullable | researcher proposal pre-clamp (audit) |
| confidence | text | category-level label |
| rationale | text | |

## reports

| Column | Type | Notes |
|---|---|---|
| id | uuid pk · job_id fk unique | |
| report_type | text | `mini_check_preliminary` |
| rls_score | numeric(5,2) nullable | null if <3 categories scored |
| band | text | `relatif_kuat` `layak_dengan_catatan` `hati_hati` `risiko_tinggi` |
| recommendation | text | STD-SCR-001 §8 enum (doc 07 §5) |
| summary | text | composed narrative (id-ID) |
| checklist | jsonb | `[{item, category, reason}]` |
| created_at | timestamptz | |

Findings/scores are kept (not only the report) so analysts can audit and recalibrate —
the AT-gate feedback loop from ARCHITECTURE.md §4.4.
