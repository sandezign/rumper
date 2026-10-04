"""Mini Check PDF (docs/14): compact, brandable report for download/sharing.

reportlab platypus only — no system deps. Layout mirrors the Mini Check structure:
header + score band, summary, per-category findings with confidence + sources,
red flags, checklist, disclaimer.
"""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.schemas.research import CATEGORY_LABELS
from app.services.scoring import BAND_LABELS, DISCLAIMER, RECOMMENDATION_LABELS, WEIGHTS

NAVY = colors.HexColor("#16243d")
TEAL = colors.HexColor("#0d9488")
AMBER = colors.HexColor("#d97706")
RED = colors.HexColor("#dc2626")
GREEN = colors.HexColor("#16a34a")
MUTED = colors.HexColor("#64748b")

_BAND_COLOR = {"relatif_kuat": GREEN, "layak_dengan_catatan": TEAL,
               "hati_hati": AMBER, "risiko_tinggi": RED}
_CONF_LABEL = {"data_kuat": "Data kuat", "data_sedang": "Data sedang",
               "perlu_validasi": "Perlu validasi"}

_BASE = ParagraphStyle("base", fontName="Helvetica", fontSize=9, leading=12.5, textColor=NAVY)
_H1 = ParagraphStyle("h1", parent=_BASE, fontName="Helvetica-Bold", fontSize=16, leading=20)
_H2 = ParagraphStyle("h2", parent=_BASE, fontName="Helvetica-Bold", fontSize=11, leading=14, spaceBefore=10)
_SMALL = ParagraphStyle("small", parent=_BASE, fontSize=7.5, leading=10, textColor=MUTED)


def _esc(s: str) -> str:
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_pdf(intake, report, scores: dict, findings_by_cat: dict) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=16 * mm, bottomMargin=16 * mm,
        title=f"Rumper Mini Check — {intake.property_name or intake.address_text}",
    )
    band_color = _BAND_COLOR.get(report.band or "", MUTED)
    score_txt = f"{round(float(report.rls_score))}" if report.rls_score is not None else "–"

    story = [
        Paragraph('<font color="#0d9488"><b>RUMPER</b></font> · Mini Check — belum ditinjau analis', _SMALL),
        Spacer(1, 4),
        Paragraph(_esc(intake.property_name or "Lokasi kandidat"), _H1),
        Paragraph(_esc(intake.formatted_address or intake.address_text), _SMALL),
        Spacer(1, 8),
    ]

    head = Table(
        [[Paragraph(f'<font size="22" color="white"><b>{score_txt}</b></font>', _BASE),
          Paragraph(
              f'<b>{_esc(BAND_LABELS.get(report.band or "", "Data belum cukup"))}</b><br/>'
              f'{_esc(RECOMMENDATION_LABELS[report.recommendation])}', _BASE)]],
        colWidths=[24 * mm, None], rowHeights=[16 * mm],
    )
    head.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), band_color),
        ("ALIGN", (0, 0), (0, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (1, 0), (1, 0), 10),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#e2e8f0")),
    ]))
    story.append(head)

    if report.summary:
        story += [Paragraph("Ringkasan", _H2), Paragraph(_esc(report.summary), _BASE)]

    story.append(Paragraph("Skor per kategori", _H2))
    rows = [["Kategori", "Bobot", "Skor", "Confidence"]]
    for cat in CATEGORY_LABELS:
        s = scores.get(cat)
        rows.append([
            CATEGORY_LABELS[cat], f"{int(WEIGHTS[cat] * 100)}%",
            str(s.score) if s and s.score is not None else "–",
            _CONF_LABEL.get(s.confidence, "-") if s else "-",
        ])
    t = Table(rows, colWidths=[70 * mm, 18 * mm, 16 * mm, None])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR", (0, 0), (-1, -1), NAVY),
        ("LINEBELOW", (0, 0), (-1, 0), 0.75, NAVY),
        ("LINEBELOW", (0, 1), (-1, -1), 0.25, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(t)

    for cat, label in CATEGORY_LABELS.items():
        cat_findings = findings_by_cat.get(cat, [])
        if not cat_findings:
            continue
        story.append(Paragraph(label, _H2))
        for f in cat_findings:
            tag = ' <font color="#dc2626"><b>[RED FLAG]</b></font>' if f.is_red_flag else (
                ' <font color="#d97706"><b>[GAP]</b></font>' if f.is_evidence_gap else "")
            story.append(Paragraph(f"• {_esc(f.claim)}{tag}", _BASE))
            srcs = ", ".join(e.get("source_title", "") for e in (f.evidence or [])[:3])
            meta = f"{_CONF_LABEL.get(f.confidence, '')}" + (f" · Sumber: {_esc(srcs)}" if srcs else "")
            story.append(Paragraph(meta, _SMALL))
            if f.validation_action:
                story.append(Paragraph(f"Validasi: {_esc(f.validation_action)}", _SMALL))
            story.append(Spacer(1, 3))

    if report.checklist:
        story.append(Paragraph("Checklist survei lapangan", _H2))
        for item in report.checklist:
            story.append(Paragraph(f"☐ {_esc(item.get('item', ''))}", _BASE))

    story += [
        Spacer(1, 10),
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")),
        Spacer(1, 4),
        Paragraph(_esc(DISCLAIMER), _SMALL),
        Paragraph(f"Dibuat {report.created_at:%d %b %Y %H:%M} UTC · rumper.id", _SMALL),
    ]
    doc.build(story)
    return buf.getvalue()
