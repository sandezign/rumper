# 07 — Scoring & Confidence Engine (STD-SCR-001 in code)

Pure functions in `services/scoring.py`. No LLM. Reproducible (TF-2: same inputs →
same RLS).

## 1. Weights & formula

```python
WEIGHTS = {"banjir": 0.30, "commute": 0.25, "akses": 0.15,
           "fasilitas": 0.15, "lingkungan": 0.15}
```

`RLS = Σ score_c × weight_c`, rounded to 2 decimals.

**Evidence gaps:** a category with `score=None` is excluded and weights are
**renormalized** over scored categories; if fewer than 3 categories have scores,
`rls_score = None` and band = `risiko_tinggi` wording is replaced by "data belum cukup"
handling (recommendation forced to `verify_further`). Missing evidence is never
treated as neutral (universal prompt: "show missing evidence instead of treating it
as neutral") — every gap appears in `evidence_gaps` + checklist.

## 2. Bands (STD-SCR-001 §4)

| RLS | band | label |
|---:|---|---|
| 80–100 | `relatif_kuat` | Relatif kuat |
| 65–79.99 | `layak_dengan_catatan` | Layak dengan catatan |
| 50–64.99 | `hati_hati` | Hati-hati |
| <50 | `risiko_tinggi` | Risiko tinggi / perlu validasi kuat |

## 3. Deterministic category scoring & clamps

**commute (code-computed)** — peak driving/transit duration one-way:

| Peak duration | Score |
|---|---:|
| ≤ 45 min | 90 |
| 46–60 | 75 |
| 61–75 | 62 |
| 76–90 | 50 |
| 91–120 | 35 |
| > 120 | 20 |

−10 if peak/off-peak ratio > 1.8 (severe congestion); −5 per transit transfer above 2;
clamp 0–100. If user tolerance known and exceeded, cap at 55.

**fasilitas (code-computed)** — start 100; −25 no hospital/clinic ≤ 5 km; −15 no
pharmacy ≤ 3 km; −15 no market/supermarket ≤ 3 km; −15 no school ≤ 3 km (family
purpose only); −10 no station ≤ 8 km (transit commuter only); clamp 0–100.

**banjir / akses / lingkungan (LLM-proposed, code-clamped)** — v2 adds **spatial
baselines** (docs/10 §4): when the warehouse has data for the point, code computes a
deterministic baseline and the LLM proposal may only move it within a band.

Baselines (when the underlying fact is available):

| Category | Baseline rule |
|---|---|
| banjir | InaRISK class: rendah→80 · sedang→55 · tinggi→30; then −10 if `low_lying` (relative elevation ≤ −2 m); +5 if elevation ≥ 25 m and not low-lying |
| akses | start 70; toll ≤ 5 km +10, > 15 km −10; station ≤ 3 km +10 (transit users), > 8 km −5 |
| lingkungan | start 85; per red-flag feature: SUTET ≤ 250 m −40 (critical) · landfill ≤ 1.5 km −30 (critical if ≤ 1 km) · industrial ≤ 1 km −15 · rail ≤ 200 m −10 · cemetery ≤ 300 m −5 |

Clamping order:
1. If a baseline exists → score = clamp(proposal, baseline − 15, baseline + 15);
   missing proposal → score = baseline.
2. Then the v1 rubric clamps still apply:

| Condition (from findings) | Clamp |
|---|---|
| Any critical red flag in category | ≤ 24 (rubric: "sangat tidak mendukung") |
| Any non-critical red flag | ≤ 64 |
| Category confidence `perlu_validasi` (no baseline) | 40–75 (no false precision) |
| No findings and no baseline | score = None (evidence gap) |

`proposed_score` is stored for audit; clamped value is the score.

## 4. Red-flag override (STD-SCR-001 §7)

If any finding `is_critical`:

1. Recommendation floor: at least `verify_further` (never `proceed`/`proceed_with_caution`).
2. Band label may stay numeric, but UI must surface the red-flag panel above the score.
3. The finding's `validation_action` is mandatory in the checklist.

## 5. Recommendation rules (score and recommendation are separate layers)

```text
if critical red flag           → verify_further   (floor; may be avoid_until_resolved)
if rls is None (insufficient)  → verify_further
elif rls >= 80 and no red flags and no gaps in banjir/commute → proceed
elif rls >= 65                 → proceed_with_caution
elif rls >= 50                 → verify_further
else                           → avoid_until_resolved
```

Critical + (rls < 50 or ≥2 critical findings) escalates to `avoid_until_resolved`.

Labels (id-ID, code-owned): Lanjutkan dengan catatan standar · Lanjutkan dengan
catatan · Validasi lebih lanjut sebelum memutuskan · Tunda sampai risiko utama
terjawab.

## 6. Disclaimer (fixed string)

> Mini Check ini adalah opini kedua awal berdasarkan sinyal lokasi yang tersedia dan
> belum ditinjau analis. Ini bukan jaminan bahwa lokasi aman, bebas banjir, atau
> sesuai. Lakukan survei fisik dan validasi temuan material sebelum membayar booking
> fee atau DP.
