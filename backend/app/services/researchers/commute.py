"""commute — CommuteResearcher (deterministic; Routes API, code computes the score)."""
from datetime import date

from app.providers import gmaps
from app.schemas.research import CategoryResult, Evidence, Finding, ResearchBrief
from app.services.researchers.base import evidence_gap_result

_LIMITATION = "Waktu tempuh bervariasi menurut hari, cuaca, dan insiden lalu lintas."
VALIDATION = (
    "Uji rute pada hari kerja di jam berangkat yang sebenarnya, pulang-pergi, "
    "sebelum memutuskan."
)


def score_from_duration(peak_min: int, *, peak_ratio: float, transfers: int) -> int:
    if peak_min <= 45:
        s = 90
    elif peak_min <= 60:
        s = 75
    elif peak_min <= 75:
        s = 62
    elif peak_min <= 90:
        s = 50
    elif peak_min <= 120:
        s = 35
    else:
        s = 20
    if peak_ratio > 1.8:
        s -= 10
    s -= 5 * max(0, transfers - 2)
    return max(0, min(100, s))


async def run(brief: ResearchBrief) -> CategoryResult:
    if None in (brief.lat, brief.lng, brief.workplace_lat, brief.workplace_lng):
        return evidence_gap_result(
            "commute",
            "Titik tempat kerja belum dapat dipetakan, commute belum bisa dihitung.",
            "Kirim pin Google Maps tempat kerja, lalu uji rute pada jam sibuk.",
        )
    origin = (brief.lat, brief.lng)
    dest = (brief.workplace_lat, brief.workplace_lng)
    peak_ts = gmaps.next_weekday_at_wib(1, 7)  # Tuesday 07:00 WIB
    off_ts = gmaps.next_weekday_at_wib(1, 13)  # Tuesday 13:00 WIB baseline

    if brief.transport_mode in ("krl", "transjakarta", "campuran"):
        primary_mode, mode_label = "TRANSIT", "transportasi umum"
    elif brief.transport_mode == "motor":
        primary_mode, mode_label = "TWO_WHEELER", "motor"
    else:
        primary_mode, mode_label = "DRIVE", "mobil"

    peak = await gmaps.compute_route(origin, dest, mode=primary_mode, departure_rfc3339=peak_ts)
    if peak is None and primary_mode == "TWO_WHEELER":
        primary_mode, mode_label = "DRIVE", "mobil (estimasi; rute motor tidak tersedia)"
        peak = await gmaps.compute_route(origin, dest, mode=primary_mode, departure_rfc3339=peak_ts)
    if peak is None:
        return evidence_gap_result(
            "commute",
            "Rute ke tempat kerja tidak dapat dihitung dari API rute.",
            VALIDATION,
        )
    off = await gmaps.compute_route(origin, dest, mode=primary_mode, departure_rfc3339=off_ts) or peak
    alt = None
    if primary_mode == "TRANSIT":
        alt = await gmaps.compute_route(origin, dest, mode="DRIVE", departure_rfc3339=peak_ts)

    ratio = peak["duration_min"] / max(1, off["duration_min"])
    score = score_from_duration(peak["duration_min"], peak_ratio=ratio, transfers=peak.get("transfers", 0))

    today = date.today().isoformat()
    ev = [Evidence(source_title="Google Routes API (traffic-aware, Selasa 07:00 WIB)",
                   accessed_at=today, kind="routes_api")]
    findings = [Finding(
        claim=(
            f"Perjalanan {mode_label} ke tempat kerja diperkirakan ~{peak['duration_min']} menit "
            f"pada jam sibuk (Selasa 07:00) dan ~{off['duration_min']} menit di luar jam sibuk, "
            f"jarak ~{peak['distance_km']} km"
            + (f", ~{peak['transfers']} kali transit" if primary_mode == "TRANSIT" else "")
            + "."
        ),
        evidence=ev, confidence="data_kuat",
        limitation=_LIMITATION, validation_action=VALIDATION,
    )]
    if alt:
        findings.append(Finding(
            claim=f"Sebagai pembanding, berkendara mobil pada jam yang sama ~{alt['duration_min']} menit.",
            evidence=ev, confidence="data_kuat",
            limitation=_LIMITATION, validation_action=VALIDATION,
        ))
    if peak["duration_min"] > 90:
        findings.append(Finding(
            claim=f"Durasi jam sibuk {peak['duration_min']} menit sekali jalan tergolong berat untuk rutinitas harian.",
            evidence=ev, confidence="data_kuat",
            limitation=_LIMITATION, validation_action=VALIDATION,
            is_red_flag=True,
        ))
    return CategoryResult(
        category="commute", findings=findings,
        proposed_score=score,
        score_rationale=f"Skor dihitung deterministik dari durasi jam sibuk {peak['duration_min']} menit "
                        f"(rasio sibuk/normal {ratio:.1f}).",
        confidence="data_kuat",
    )
