"""Advisor topics: the closed set of subjects the assistant drawer can be scoped to.

The drawer opens on a topic, and every opener and suggested question below is derived from
the report this conversation is bound to — never generated. That keeps the entry points
cheap (no LLM call to open a drawer) and, more importantly, truthful: a suggestion that says
"6 bukti" says it because the report holds six findings for that category.

Topics map onto STD-SCR-001 categories where one exists, plus two cross-cutting ones
(ringkasan, checklist) that read the report as a whole.
"""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.research import CategoryScore, Finding, Report, ResearchJob
from app.schemas.research import CATEGORY_LABELS
from app.services.scoring import BAND_LABELS

# id -> (label, category it scopes to or None for whole-report)
TOPICS: list[tuple[str, str, str | None]] = [
    ("ringkasan", "Ringkasan", None),
    ("banjir", "Banjir & Elevasi", "banjir"),
    ("commute", "Komuter & Rute", "commute"),
    ("akses", "Akses & Jalan", "akses"),
    ("fasilitas", "Fasilitas Sekitar", "fasilitas"),
    ("lingkungan", "Lingkungan & Red Flag", "lingkungan"),
    # Advisory topics: these two carry no spatial layer of their own. Rumper has no BPN
    # integration and no price source (ADR-010), so they answer "what should I verify / how
    # do I use this report when negotiating" rather than asserting legal or market facts.
    ("legalitas", "Legalitas & BPN", None),
    ("harga", "Tawar Harga", None),
    ("checklist", "Checklist Fisik", None),
]

TOPIC_IDS = {t[0] for t in TOPICS}

#: Appended to the turn prompt so the model answers within the topic the buyer opened.
FOCUS_INSTRUCTION = {
    "ringkasan": "Fokus pada skor total, band, dan faktor yang paling menekan skor.",
    "banjir": "Fokus pada ketahanan banjir: elevasi, riwayat genangan, drainase, jarak badan air.",
    "commute": "Fokus pada waktu tempuh, moda, dan keandalan komuter harian.",
    "akses": "Fokus pada akses fisik: lebar jalan, kondisi perkerasan, jalur masuk.",
    "fasilitas": "Fokus pada fasilitas harian di sekitar lokasi dan jaraknya.",
    "lingkungan": "Fokus pada kualitas lingkungan dan red flag di sekitar lokasi.",
    "legalitas": (
        "Fokus pada langkah verifikasi legalitas yang harus dilakukan pembeli sendiri "
        "(cek sertifikat di BPN, kesesuaian IMB/PBG, status sengketa). Rumper tidak punya "
        "akses data BPN, jadi jangan pernah menyatakan status legal properti ini — "
        "jelaskan cara memeriksanya."
    ),
    "harga": (
        "Fokus pada cara memakai temuan laporan sebagai dasar negosiasi. Rumper tidak punya "
        "data harga pasar atau listing, jadi jangan menyebut angka harga atau menilai "
        "kewajaran harga — bahas leverage dari red flag dan celah data yang ada."
    ),
    "checklist": "Fokus pada apa yang harus diverifikasi sendiri saat survei fisik.",
}


def _fallback_suggestions(topic: str) -> list[str]:
    return {
        "ringkasan": ["Apa risiko utama lokasi ini?", "Kenapa skornya segitu?"],
        "banjir": ["Bagaimana riwayat banjir di sini?", "Apa yang harus dicek soal drainase?"],
        "commute": ["Berapa lama komuter ke kantor?", "Moda apa yang paling andal?"],
        "akses": ["Bagaimana kondisi jalan masuk?", "Apa yang harus dicek soal akses?"],
        "fasilitas": ["Fasilitas apa yang terdekat?", "Apakah cukup untuk keluarga?"],
        "lingkungan": ["Ada red flag di sekitar?", "Apa dampaknya buat harga?"],
        "legalitas": ["Apa yang harus dicek di BPN?", "Bagaimana memastikan IMB sesuai bangunan?"],
        "harga": ["Temuan mana yang bisa jadi dasar nego?", "Apa yang wajar saya minta ke penjual?"],
        "checklist": ["Apa yang wajib dicek saat survei?", "Pertanyaan apa untuk warga sekitar?"],
    }.get(topic, ["Apa risiko utama lokasi ini?"])


async def manifest(db: AsyncSession, intake_id: uuid.UUID | None) -> dict:
    """Property context + per-topic openers, all read off the finished report.

    With no finished report the topics still render — the buyer can ask anything — but the
    openers say so instead of describing findings that do not exist.
    """
    report = None
    scores: list[CategoryScore] = []
    findings: list[Finding] = []
    if intake_id:
        job = (await db.execute(select(ResearchJob).where(
            ResearchJob.intake_id == intake_id))).scalar_one_or_none()
        if job is not None and job.status == "done":
            report = (await db.execute(select(Report).where(
                Report.job_id == job.id))).scalar_one_or_none()
            scores = list((await db.execute(select(CategoryScore).where(
                CategoryScore.job_id == job.id))).scalars().all())
            findings = list((await db.execute(select(Finding).where(
                Finding.job_id == job.id))).scalars().all())

    by_category: dict[str, list[Finding]] = {}
    for f in findings:
        by_category.setdefault(f.category, []).append(f)
    score_of = {s.category: s.score for s in scores}

    topics = []
    for topic_id, label, category in TOPICS:
        if report is None:
            opener = ("Analisis lokasi ini belum selesai, jadi aku belum punya bukti untuk "
                      "dibahas. Tanya apa pun — akan kujawab sejauh datanya ada.")
        elif topic_id == "ringkasan":
            opener = (f"Skor lokasi ini {report.rls_score}/100 "
                      f"({BAND_LABELS.get(report.band or '', 'data belum cukup')}). "
                      f"{report.summary}")
        elif topic_id == "legalitas":
            opener = ("Rumper tidak punya akses data BPN, jadi aku tidak bisa memastikan status "
                      "sertifikat lokasi ini. Yang bisa kubantu: menyusun langkah verifikasi "
                      "legalitas yang harus kamu lakukan sendiri sebelum DP.")
        elif topic_id == "harga":
            red = [f for f in findings if f.is_red_flag or f.is_critical]
            gaps = [f for f in findings if f.is_evidence_gap]
            opener = (f"Rumper tidak memakai data harga pasar, jadi aku tidak menilai mahal "
                      f"atau murah. Yang bisa kupakai: {len(red)} red flag dan {len(gaps)} celah "
                      f"data di laporan ini sebagai bahan tawar-menawar.")
        elif topic_id == "checklist":
            n = len(report.checklist or [])
            opener = (f"Ada {n} poin yang perlu kamu verifikasi sendiri di lapangan sebelum "
                      "bayar booking fee atau DP." if n else
                      "Belum ada checklist lapangan yang tersusun untuk lokasi ini.")
        else:
            items = by_category.get(category or "", [])
            evidence = [f for f in items if not f.is_evidence_gap]
            gaps = [f for f in items if f.is_evidence_gap]
            red = [f for f in items if f.is_red_flag or f.is_critical]
            sc = score_of.get(category or "")
            head = (f"{CATEGORY_LABELS.get(category or '', label)}: "
                    f"skor {sc}/100." if sc is not None else
                    f"{CATEGORY_LABELS.get(category or '', label)}: skor belum tersedia.")
            detail = f" {len(evidence)} bukti, {len(gaps)} celah data."
            warn = f" {len(red)} red flag perlu perhatian." if red else ""
            opener = head + detail + warn

        # Suggestions come from the report's own validation actions where it has them, so a
        # chip asks about something the engine actually flagged.
        actions = [f.validation_action for f in by_category.get(category or "", [])
                   if f.validation_action][:2] if category else []
        if topic_id == "checklist" and report is not None:
            actions = [i["item"] for i in (report.checklist or [])][:2]
        suggestions = actions or _fallback_suggestions(topic_id)

        topics.append({
            "id": topic_id,
            "label": label,
            "category": category,
            "opener": opener,
            "suggestions": [s[:120] for s in suggestions],
        })

    # Property identity and score are already on the report the workspace loaded; repeating
    # them here would be a second source of truth for the same two fields.
    return {"topics": topics}
