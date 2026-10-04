# 06 — Agent Pipeline (researchers, prompts, guardrails)

> **v2 note:** orchestration moved to the LangGraph deep-research workflow
> ([11-deep-research-graph.md](11-deep-research-graph.md)). This doc remains normative
> for the **schemas, prompts-guardrails (§3), confidence rules (§4), and budgets (§5)**
> that the graph nodes reuse.

Automates SOP-RSCH-001 Step 2 (desk research, five categories) + Step 3 inputs.
Every researcher returns the same structured output (`schemas/research.py`):

```python
class Evidence(BaseModel):
    source_title: str
    url: str | None
    published_at: str | None
    accessed_at: str          # today, set by code
    kind: Literal["grounded_search", "routes_api", "places_api", "geocoding"]

class Finding(BaseModel):
    claim: str                # id-ID
    evidence: list[Evidence]
    confidence: Literal["data_kuat", "data_sedang", "perlu_validasi"]
    limitation: str
    validation_action: str
    is_red_flag: bool = False
    is_critical: bool = False
    is_evidence_gap: bool = False

class CategoryResult(BaseModel):
    category: str
    findings: list[Finding]
    proposed_score: int | None   # 0–100; None = evidence gap
    score_rationale: str
    confidence: Literal["data_kuat", "data_sedang", "perlu_validasi"]
```

## 1. Research brief (input to all researchers)

Built by the orchestrator from the intake: property point + formatted address,
kelurahan/kecamatan (from geocoding components), workplace point, transport mode,
concerns, purpose/stage/timeline. The brief is facts only — no instructions.

## 2. The five researchers

### banjir — FloodResearcher (LLM, grounded)
Gemini + Google Search grounding. Query themes (id-ID): banjir/genangan history for the
kelurahan & perumahan, proximity to rivers/kali, news since ~2020, "bebas banjir" claim
strength. Output findings **only from grounded sources**; the model must propose
`perlu_validasi` when evidence is area-level, not house-level (SOP elephant #2: unit of
analysis). Proposes a score per rubric anchors.

### commute — CommuteResearcher (deterministic)
Routes API `computeRoutes`, traffic-aware: next Tuesday 07:00 WIB departure,
home → workplace, mode from intake (`mobil`/`motor` → DRIVE & TWO_WHEELER;
`krl`/`transjakarta`/`campuran` → TRANSIT + DRIVE comparison). Also off-peak baseline.
Score from duration bands (doc 07 §3 table) — **code computes the score**; findings
record durations, distance, transfer count; confidence `data_kuat` (live API), with the
fixed limitation that travel time varies by day/incident.

### akses — AccessResearcher (LLM, grounded; honest low feasibility)
Grounded search on road access, single-access complaints, gang sempit, banjir akses,
news about the perumahan's roads. ARCHITECTURE.md rates this Low–Medium feasibility:
default confidence ceiling is `data_sedang`; if no grounded evidence found, return an
**evidence gap** with Street View check as the validation action. Proposed score
clamped to 40–75 when confidence is `perlu_validasi` (no false precision).

### fasilitas — AmenityResearcher (deterministic)
Places Nearby Search around the property: hospital/clinic (5 km), pharmacy (3 km),
school (3 km, only if purpose suggests family), supermarket/market (3 km),
train station (8 km when transit mode). Score from coverage table (doc 07 §3);
findings list nearest named places with distances; confidence `data_kuat` for
existence, fixed limitation: "keberadaan ≠ kualitas".

### lingkungan — RedFlagResearcher (hybrid)
(a) Places keyword searches within ~1.5 km: TPA/TPS, pabrik/kawasan industri, SPBU,
pemakaman, rel kereta; (b) grounded search: SUTET, kebisingan, polusi, keamanan, demo
warga, konflik lahan for the area. Each hit = finding with distance; criticality rules:
TPA < 1 km or SUTET overhead or repeated material flooding of access = `is_critical`.
Proposes score; code enforces override regardless of total (doc 07 §4).

## 3. LLM guardrails (apply to flood/access/red-flag prompts)

- System prompt states: analyst assistant, id-ID output, **never invent sources**; every
  claim must map to a grounded citation or be marked evidence gap; confidence per
  STD-SCR-001 §6 definitions (quoted verbatim in the prompt); no recommendation wording
  (that is the engine's job); no certainty language ("pasti aman", "dijamin").
- Structured output via `providers/llm.py` `structured(CategoryResult)`; one retry on
  parse error; citations injected from grounding metadata by code (the model returns
  claim↔citation indices, code resolves URLs — model never fabricates URLs).

## 4. Confidence assignment rules (code-enforced floor/ceiling)

| Condition | Enforcement |
|---|---|
| Finding has 0 evidence items | `is_evidence_gap = true`, confidence `perlu_validasi` |
| Only social/forum sources | ceiling `perlu_validasi` (ARCHITECTURE §4.4) |
| Source older than ~3 years | ceiling `data_sedang` |
| Live API result (routes/places) | `data_kuat` allowed |
| Area-level (not point-level) evidence | ceiling `data_sedang` |

## 5. Stop rules & budgets (pre-mortem tiger #6)

Per researcher: max 1 grounded LLM call + bounded API calls; hard timeout 75 s; on
timeout/error → evidence-gap result (never blocks the job). Whole pipeline target
< 3 min. Token/temperature: temperature 0.2, researchers; 0.4, composer narrative.

## 6. Composer

Input: research brief + all findings + engine outputs (scores, band, recommendation,
checklist). Gemini structured call returns `{summary: str}` only — 4–6 sentences id-ID,
calm tone, must mention top concern + top strength + next action, **no facts absent
from the input**. Checklist itself is assembled by code: every `perlu_validasi`/gap/red
flag finding contributes its `validation_action` (AT-3 gate: 100% coverage).
