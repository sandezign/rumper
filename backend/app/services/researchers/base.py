"""Shared researcher helpers: brief rendering + evidence-gap fallback (docs/06)."""
from app.schemas.research import CategoryResult, Finding, ResearchBrief


def brief_block(brief: ResearchBrief) -> str:
    loc = brief.formatted_address or brief.address_text
    parts = [f"Lokasi kandidat: {brief.property_name or '-'} — {loc}"]
    if brief.kelurahan or brief.kecamatan:
        parts.append(f"Kelurahan/Kecamatan: {brief.kelurahan or '?'} / {brief.kecamatan or '?'} ({brief.kota or ''})")
    parts.append(f"Tempat kerja/aktivitas: {brief.workplace_text}; moda: {brief.transport_mode}")
    if brief.concerns:
        parts.append(f"Kekhawatiran utama pembeli: {', '.join(brief.concerns)}")
    if brief.concern_notes:
        parts.append(f"Catatan pembeli: {brief.concern_notes}")
    return "\n".join(parts)


def evidence_gap_result(category: str, what_is_missing: str, validation_action: str) -> CategoryResult:
    return CategoryResult(
        category=category,
        findings=[Finding(
            claim=what_is_missing,
            confidence="perlu_validasi",
            limitation="Tidak ada bukti yang dapat diverifikasi dari desk research.",
            validation_action=validation_action,
            is_evidence_gap=True,
        )],
        proposed_score=None,
        score_rationale="Evidence gap — tidak dinilai.",
        confidence="perlu_validasi",
    )
