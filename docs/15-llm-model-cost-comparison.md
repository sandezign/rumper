# 15 — LLM Model Cost & Capability Comparison

> Written 2026-06-12, prompted by a ~Rp 100,000 (~US$6) Gemini API charge over 2 days
> (131 requests). Pricing below is from the official table at
> <https://ai.google.dev/gemini-api/docs/pricing> (paid tier, text, per 1M tokens),
> checked 2026-06-12. FX assumption: Rp 16,500 / US$1. **Re-verify prices before
> acting — Google changes them.**

## 1. Was the Rp 100k charge expected?

Mostly yes — and the surprise comes from a stale price table in our own code, not a
billing error.

### Observed usage (AI Studio console, 2 days)

| Model | Input tokens | Output tokens | Price (in / out per 1M) | Cost |
|---|---|---|---|---|
| gemini-3.5-flash | 110,000 | 336,000 | $1.50 / $9.00 | **$3.19** (~Rp 52,700) |
| gemini-3.1-flash-lite (2 line items: 32k+130k in, 20k+41k out) | 162,000 | 61,000 | $0.25 / $1.50 | **$0.13** (~Rp 2,200) |
| **Token subtotal** | | | | **≈ $3.32 (~Rp 54,800)** |

Notes on the gap to ~$6 (Rp 100k):

1. **Output dominates.** 336k output tokens on 3.5-flash at $9/M is 91 % of the token
   bill. Output includes *thinking tokens* — billed as output on all 2.5/3.x models.
   Our pipeline is output-heavy by design (15 grounded calls × ≤1,100 tokens, 3
   category drafts × ≤2,200, etc. — see §3).
2. **Grounding with Google Search is a separate SKU.** Every `llm.grounded()` call
   attaches the `google_search` tool. Gemini 3 models get 5,000 free grounded prompts
   per month, then **$14 / 1,000 search queries** (one prompt can fire several
   queries). Gemini 2.5 models get 1,500 free requests **per day**, then $35 / 1,000.
   If our key is billed without the free allowance (e.g. Vertex AI billing path),
   this SKU plausibly covers most of the remaining ~$2.7.
3. **VAT.** Google bills Indonesia with 11 % PPN, added on top of usage.
4. **Verify, don't guess:** Cloud Console → Billing → *Reports*, group by **SKU**.
   Grounded search shows up as its own line ("Grounding with Google Search"); that
   report settles exactly where the Rp 100k went.

### ⚠️ Our internal ledger under-reports cost ~4–5×

`backend/app/core/usage.py:104` seeds:

| Model (as seeded) | Seeded price | Actual price | Error |
|---|---|---|---|
| gemini-3.5-flash | $0.30 / $2.50 | $1.50 / $9.00 | 5× / 3.6× too low |
| gemini-3.1-flash-lite | $0.10 / $0.40 | $0.25 / $1.50 | 2.5× / 3.75× too low |

The seeded numbers are actually **gemini-2.5-flash** and **gemini-2.5-flash-lite**
prices pasted under 3.x names. Fix the defaults **and** update the existing
`model_prices` rows manually — `seed_model_prices()` uses `ON CONFLICT DO NOTHING`,
so changing the code alone never corrects rows already in the database. The ledger
also doesn't meter the grounding SKU at all (token-only).

## 2. Price comparison — same observed workload on each model

Re-pricing the heavy workload (the 3.5-flash bucket: 110k in / 336k out):

| Model | $/1M in | $/1M out | Cost for that workload | vs 3.5-flash | Free grounding allowance |
|---|---|---|---|---|---|
| gemini-3.5-flash *(prod default)* | 1.50 | 9.00 | **$3.19** (Rp 52,700) | — | 5,000 prompts/mo (shared, Gemini 3), then $14/1k queries |
| gemini-3.1-flash-lite *(current `.env`)* | 0.25 | 1.50 | **$0.53** (Rp 8,800) | −83 % | same Gemini 3 pool |
| gemini-2.5-flash | 0.30 | 2.50 | **$0.87** (Rp 14,400) | −73 % | 1,500 req/**day**, then $35/1k |
| gemini-2.5-flash-lite | 0.10 | 0.40 | **$0.15** (Rp 2,500) | −95 % | 1,500 req/day (shared with 2.5-flash) |

At prototype traffic (≈65 requests/day) the **2.5 family's 1,500 free grounded
requests per day means grounding is effectively free**, on top of the cheaper tokens.

## 3. What our pipeline actually asks of the model

Per Mini Check job (`research_graph.py`, docs/11), with `max_output_tokens` caps:

| Step | Call type | Calls | Output cap | Needs |
|---|---|---|---|---|
| plan | `structured()` | 1 | 700 | schema adherence |
| search | `grounded()` | ≤15 total | 1,100 each | Google Search grounding, Bahasa summarization, no invented sources |
| assess | `structured()` | 1–2 | 700 | schema + simple judgement |
| category draft | `structured()` | 3 | 2,200 (+256 thinking) | evidence→finding extraction, confidence labels |
| composer | `structured()` | 1 | 500 | Bahasa narrative tone (docs/07) |

Worst case ≈ 25k output + ~40k input tokens/job. Per-job token cost:

| Model | Cost / Mini Check (worst case) |
|---|---|
| gemini-3.5-flash | ~$0.26 (Rp 4,300) |
| gemini-2.5-flash | ~$0.07 (Rp 1,200) |
| gemini-3.1-flash-lite / 2.5-flash-lite | ~$0.05 / ~$0.01 |

Crucially, **no step needs frontier reasoning**. The score and recommendation are
pure code (`scoring.py`, CLAUDE.md rule 1); citations come from grounding metadata,
never model-written (two-step pattern, docs/06 §3); structured output is
schema-enforced with one retry. The model's job is search-note summarization,
extraction, and phrasing — exactly what Flash-class models are built for.

## 4. Capability fit: can 2.5-flash replace 3.x without quality loss?

| Requirement | 2.5-flash-lite | 2.5-flash | 3.1-flash-lite | 3.5-flash |
|---|---|---|---|---|
| `google_search` grounding tool | ✅ | ✅ | ✅ | ✅ |
| Structured output (Pydantic) | ✅ | ✅ | ✅ | ✅ |
| Thinking with budget control | ✅ | ✅ | ✅ | ✅ |
| Bahasa Indonesia fluency | good | good | good | best |
| Multi-evidence synthesis (category drafts) | adequate, weakest | good | good | best |
| Calm advisory tone (composer) | adequate | good | good | best |

Expected risk areas when stepping down to 2.5-flash: slightly blunter Bahasa phrasing
in the composer, and occasionally shallower category drafts when evidence conflicts.
Plan/search/assess steps are unlikely to show measurable differences — they already
run with `thinking_budget=0`.

### Validate empirically before committing (½ day)

1. Pick 3 known addresses (one flood-prone, one clean, one sparse-evidence).
2. Run the full pipeline once per model (`GEMINI_MODEL` env var; restart backend).
3. Compare per job: citation count & relevance, number of explicit evidence gaps,
   category scores vs expectation (scores should barely move — clamps are
   deterministic), red-flag detection, composer Bahasa quality, latency.
4. Acceptance: no missed red flag, no invented source, scores within ±5 of the
   3.5-flash run, composer text passes a native-speaker read.

## 5. Recommendation

1. **Switch the default to `gemini-2.5-flash`** (~73 % token-cost cut vs 3.5-flash
   plus the generous daily free grounding tier) and run the §4 validation. If
   composer/category quality holds, stay there. `.env` is already on
   3.1-flash-lite locally — also viable (−83 %), but 2.5-flash has the better
   grounding free tier at our volume.
2. **If quality drops anywhere, split by operation** instead of upgrading globally:
   2.5-flash-lite for plan/search/assess, 2.5-flash (or 3.5-flash) only for category
   drafts + composer. Composer is a single 500-token call — even on 3.5-flash that is
   < Rp 100/job. Requires a small change: `llm.py` currently reads one global
   `s.gemini_model`; add an optional `model=` override parameter.
3. **Fix `seed_model_prices()`** with the actual prices above, add rows for the 2.5
   models, and `UPDATE` the existing `model_prices` rows (seed won't overwrite).
4. **Meter grounding**: count `grounded()` calls in `usage_events` (the
   `kind="grounded_search"` evidence rows already hint at this) so the ledger
   reflects the search SKU, not just tokens.
5. Re-check the billing SKU report after one week on the new model to confirm the
   projection.
