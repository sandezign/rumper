"""Mini Check narrative composer — Gemini phrases the structured fact sheet; no new facts."""
from app.core.config import get_settings
from app.core.usage import set_operation
from app.prompts import render
from app.providers import llm
from app.schemas.research import CATEGORY_LABELS, CategoryResult, ResearchBrief, SummaryDraft
from app.services.scoring import BAND_LABELS, RECOMMENDATION_LABELS, EngineOutput



async def compose_summary(
    brief: ResearchBrief, results: list[CategoryResult], engine: EngineOutput,
) -> str:
    facts_lines = []
    for r in results:
        label = CATEGORY_LABELS[r.category]
        for f in r.findings[:4]:
            tag = "RED FLAG" if f.is_red_flag else ("GAP" if f.is_evidence_gap else "temuan")
            facts_lines.append(f"- [{label}/{tag}/{f.confidence}] {f.claim}")
    context = (
        f"tujuan {brief.purpose or '-'}; moda {brief.transport_mode}; "
        f"kekhawatiran: {', '.join(brief.concerns) or '-'}"
    )
    prompt = render(
        "compose_summary",
        context=context,
        band=BAND_LABELS.get(engine.band or "", "data belum cukup"),
        rec=RECOMMENDATION_LABELS[engine.recommendation],
        facts="\n".join(facts_lines),
    )
    set_operation("compose")
    for _ in range(2):  # retry once (doc 01 §3)
        try:
            draft = await llm.structured(prompt, SummaryDraft,
                                         temperature=get_settings().composer_temperature,
                                         max_output_tokens=500, thinking_budget=0)
            if draft.summary.strip():
                return draft.summary.strip()
        except Exception:
            continue
    return ""  # structured fields are sufficient to render (doc 01 §3)
