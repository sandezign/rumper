import { useEffect, useMemo, useState } from "react";
import {
  Building2, Car, ChevronDown, CircleAlert, ClipboardCheck, Clock, CloudRain, Eye, EyeOff,
  ExternalLink, FileText, Layers, Lock, MapPin, Navigation, Route, ShieldCheck,
  SlidersHorizontal, Train,
  TreePine, TriangleAlert, X,
} from "lucide-react";
import { getRoutes, resolveEvidence, resolveRef,
         type Category, type Finding, type MapData, type MapFeature, type MapRoutes,
         type Report, type Source } from "@/lib/api";
import { CONFIDENCE } from "@/lib/risk";
import type { StepId } from "./parts";
import { groupOf, type FacilityGroup } from "./facilityGroups";

/** Tahap 02–05 of the location workspace (PRD-00 §7).
 *
 *  Every figure here is read off the report the deterministic engine produced or the map
 *  payload the geo warehouse returned. Where the backend has nothing — checklist progress
 *  has no server-side store (docs/18 GAP-09), peak-hour traffic notes have no source — the
 *  section says so instead of filling the gap with something plausible. */

const TAHAP: Record<StepId, { n: string; title: string; lead?: string; Icon: typeof Layers }> = {
  ringkasan: { n: "01", title: "Ringkasan & Indeks Risiko Lokasi", Icon: Layers },
  "faktor-risiko": {
    n: "02", title: "Faktor Risiko & Evidensi", Icon: Layers,
    lead: "Tinjau bukti spasial & kesenjangan data per faktor risiko, biar kamu punya pegangan fakta saat survei.",
  },
  perjalanan: {
    n: "03", title: "Mobilitas & Waktu Tempuh", Icon: Car,
    lead: "Rute dan waktu tempuh terukur ke titik akses terdekat, dari Routes API.",
  },
  checklist: {
    n: "04", title: "Contekan Investigasi Lapangan", Icon: ClipboardCheck,
    lead: "Hal-hal yang wajib kamu cek sendiri sebelum bayar booking fee atau DP.",
  },
  fasilitas: {
    n: "05", title: "Fasilitas Terdekat & POI", Icon: MapPin,
    lead: "Fasilitas harian dalam radius ±3 km, dari warehouse OSM.",
  },
};

/** Per-stage "Tanya AI" affordance. The assistant already runs on this report's own
 *  conversation, so the button simply opens it with the stage's question pre-filled — the
 *  buyer sends it (or edits it) rather than having a question fired on their behalf. */
const ASK: Record<StepId, { label: string; prompt: string; cls: string; dot: string }> = {
  ringkasan: {
    label: "Tanya AI tentang skor", cls: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    dot: "bg-[#00A65A]", prompt: "Jelaskan kenapa skor lokasi ini segitu, dan faktor mana yang paling menariknya turun?",
  },
  "faktor-risiko": {
    label: "Tanya AI risiko", cls: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
    dot: "bg-rose-600", prompt: "Dari semua faktor risiko di laporan ini, mana yang paling perlu saya khawatirkan dan kenapa?",
  },
  perjalanan: {
    label: "Tanya AI rute", cls: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    dot: "bg-[#00A65A]", prompt: "Bagaimana realistisnya komuter harian dari lokasi ini, dan apa yang harus saya uji sendiri?",
  },
  checklist: {
    label: "Tanya AI ide survei", cls: "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100",
    dot: "bg-purple-600", prompt: "Apa lagi yang sebaiknya saya tanyakan ke warga atau satpam saat survei lokasi ini?",
  },
  fasilitas: {
    label: "Tanya AI fasilitas", cls: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    dot: "bg-[#00A65A]", prompt: "Apakah fasilitas harian di sekitar lokasi ini memadai untuk keluarga?",
  },
};

/** Which advisor topic each stage belongs to (`app/services/advisor.py::TOPICS`). */
const STEP_TOPIC: Record<StepId, string> = {
  ringkasan: "ringkasan",
  "faktor-risiko": "banjir",
  perjalanan: "commute",
  checklist: "checklist",
  fasilitas: "fasilitas",
};

export function AskAiButton({ step, onAsk }: {
  step: StepId; onAsk: (prompt: string, topic?: string) => void;
}) {
  const a = ASK[step];
  return (
    <button type="button" onClick={() => onAsk(a.prompt, STEP_TOPIC[step])}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs transition-colors ${a.cls}`}>
      <span className={`size-1.5 animate-pulse rounded-full ${a.dot}`} />
      {a.label}
    </button>
  );
}

export function StageHeader({ step, right, onAsk }: {
  step: StepId; right?: React.ReactNode; onAsk?: (prompt: string, topic?: string) => void;
}) {
  const t = TAHAP[step];
  const Icon = t.Icon;
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#0d262b] px-2 py-0.5 text-[10px] font-semibold leading-none text-white shadow-2xs sm:text-[11px]">
          <Icon size={12} className="text-emerald-400" />TAHAP {t.n}
        </span>
        <h2 className="text-lg font-bold leading-snug tracking-tight text-slate-900 [text-wrap:balance] sm:text-xl">
          {t.title}
        </h2>
        {t.lead && (
          <p className="text-xs leading-relaxed text-slate-600 [text-wrap:pretty] sm:text-sm">{t.lead}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {right}
        {onAsk && <AskAiButton step={step} onAsk={onAsk} />}
      </div>
    </div>
  );
}

const card = "flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:gap-5 sm:rounded-3xl sm:p-7";

/** A stage the current plan does not open. Keeps the Tahap structure visible — the buyer can
 *  see what exists and what it costs — without rendering data they have not unlocked. */
export function LockedStage({ step, onUpgrade }: { step: StepId; onUpgrade: () => void }) {
  const t = TAHAP[step];
  return (
    <div className={card}>
      <StageHeader step={step} />
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200">
            <Lock size={15} className="text-slate-600" />
          </span>
          <p className="text-sm font-semibold text-slate-700">
            Tahap {t.n} terbuka dengan paket akses
          </p>
        </div>
        <button type="button" onClick={onUpgrade}
                className="min-h-[44px] shrink-0 cursor-pointer rounded-full border border-[#00ED64] bg-[#E3FCEF] px-4 py-2 text-xs font-semibold text-[#00684A] transition-colors hover:bg-emerald-100">
          Buka
        </button>
      </div>
    </div>
  );
}

// ── Tahap 02: risk factors & evidence ───────────────────────────────────────────────────

/** Category chrome, keyed on the report's own category ids (STD-SCR-001). A category the
 *  engine adds later falls back to the neutral treatment rather than vanishing. */
const CATEGORY_STYLE: Record<string, { tint: string; ink: string; Icon: typeof Layers }> = {
  banjir: { tint: "#FEE2E2", ink: "#DC2626", Icon: CloudRain },
  commute: { tint: "#FEF3C7", ink: "#D97706", Icon: Train },
  akses: { tint: "#E0F2FE", ink: "#0284C7", Icon: Route },
  fasilitas: { tint: "#DCFCE7", ink: "#16A34A", Icon: Building2 },
  lingkungan: { tint: "#F1F5F9", ink: "#64748B", Icon: TreePine },
};
const CATEGORY_FALLBACK = { tint: "#F1F5F9", ink: "#64748B", Icon: Layers };
const categoryStyle = (id: string) => CATEGORY_STYLE[id] ?? CATEGORY_FALLBACK;

function ConfidenceChip({ c }: { c: Category["confidence"] }) {
  return (
    <span className="shrink-0 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
      {CONFIDENCE[c].label}
    </span>
  );
}

/** All sources behind one finding, each opening its own page. A web-search finding can carry
 *  thirty citations; listing them inline buried the claim under a wall of domains. */
function SourceListModal({ sources, onClose }: { sources: Source[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[2500] flex items-end justify-center bg-[#001E2B]/50 p-0 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-4"
         onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Sumber bukti"
           onClick={(e) => e.stopPropagation()}
           className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slideUp sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900">Sumber bukti</h3>
            <p className="mt-0.5 text-xs text-[#5C6C7A]">
              {sources.length} sumber dipakai untuk temuan ini
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
            <X size={16} />
          </button>
        </div>
        <div className="custom-scrollbar divide-y divide-slate-100 overflow-y-auto">
          {sources.map((src) => {
            const body = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-[#001E2B]">
                    {src.source_title}
                  </span>
                  {src.url && (
                    <span className="mt-0.5 block truncate text-[11px] text-[#7C8C9A]">{src.url}</span>
                  )}
                </span>
                {src.url && <ExternalLink size={14} className="shrink-0 text-[#00684A]" />}
              </>
            );
            return src.url ? (
              <a key={src.id} href={src.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                {body}
              </a>
            ) : (
              <div key={src.id} className="flex items-center gap-3 px-5 py-3">{body}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SOURCE_PREVIEW = 3;

function EvidenceCard({ report, finding }: { report: Report; finding: Finding }) {
  const sources = resolveEvidence(report, finding);
  const [allSources, setAllSources] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-[1.125rem]">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full shadow-2xs sm:size-10 ${
          finding.is_critical || finding.is_red_flag ? "bg-red-100" : "bg-indigo-100"
        }`}>
          <FileText size={18} className={finding.is_critical || finding.is_red_flag ? "text-red-600" : "text-indigo-600"} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-xs font-bold leading-snug text-slate-900 sm:text-sm">{finding.claim}</h5>
            <ConfidenceChip c={finding.confidence} />
          </div>
          {finding.limitation && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 [text-wrap:pretty] sm:text-sm">
              {finding.limitation}
            </p>
          )}
        </div>
      </div>
      {sources.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 pl-12 text-xs font-medium text-slate-500 sm:pl-[3.25rem]">
          {sources.slice(0, SOURCE_PREVIEW).map((src) => (
            <span key={src.id} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 sm:text-[11px]">
              {src.source_title}
            </span>
          ))}
          {sources.length > SOURCE_PREVIEW && (
            <button type="button" onClick={() => setAllSources(true)}
                    className="cursor-pointer rounded-md border border-[#318266]/25 bg-[#E9F5EF] px-2 py-0.5 text-[10px] font-bold text-[#00684A] transition-colors hover:bg-emerald-100 sm:text-[11px]">
              +{sources.length - SOURCE_PREVIEW} sumber lain
            </button>
          )}
        </div>
      )}

      {allSources && <SourceListModal sources={sources} onClose={() => setAllSources(false)} />}
    </div>
  );
}

export function Tahap02Evidence({ report, active, onSelectCategory, onAsk }: {
  report: Report;
  active: string;
  onSelectCategory: (category: string) => void;
  onAsk?: (prompt: string, topic?: string) => void;
}) {
  const category = report.categories.find((c) => c.category === active) ?? report.categories[0];
  if (!category) return null;

  const evidence = category.findings.filter((f) => !f.is_evidence_gap);
  const gaps = category.findings.filter((f) => f.is_evidence_gap);
  const isRed = category.findings.some((f) => f.is_red_flag || f.is_critical);

  return (
    <div className={card}>
      <StageHeader step="faktor-risiko" onAsk={onAsk} />

      <div className="-mb-1 w-full overflow-x-auto pb-1" role="tablist"
           aria-label="Kategori faktor risiko" style={{ scrollbarWidth: "none" }}>
        <div className="flex min-w-max items-center gap-2.5 px-0.5">
          {report.categories.map((c) => {
            const on = c.category === category.category;
            const count = c.findings.filter((f) => !f.is_evidence_gap).length;
            const st = categoryStyle(c.category);
            const CatIcon = st.Icon;
            const red = c.findings.some((f) => f.is_red_flag || f.is_critical);
            return (
              <button key={c.category} role="tab" aria-selected={on}
                      onClick={() => onSelectCategory(c.category)}
                      className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-2xl px-3.5 py-2.5 transition-all duration-150 active:scale-[0.97] ${
                        on ? "border-2 border-[#0F2B38] bg-white shadow-2xs"
                           : "border border-slate-200/90 bg-slate-50/80 hover:border-slate-300 hover:bg-white"
                      }`}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full shadow-2xs"
                      style={{ backgroundColor: st.tint }}>
                  <CatIcon size={15} style={{ color: st.ink }} />
                </span>
                <span className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">{c.label}</span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className={`text-xs font-bold tabular-nums ${red ? "text-red-600" : "text-slate-700"}`}>
                      {c.score ?? "—"}{c.score != null && "/100"}
                    </span>
                    <span className="text-[11px] font-normal tabular-nums text-slate-500">{count} bukti</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-0.5 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold text-slate-900 sm:text-lg">{category.label}</h3>
        {isRed && (
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Risiko utama
          </span>
        )}
      </div>

      {category.rationale && (
        <p className="-mt-2 text-xs leading-relaxed text-slate-600 [text-wrap:pretty] sm:text-sm">
          {category.rationale}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <FileText size={16} className="text-slate-800" />
            <h4 className="text-xs font-bold text-slate-900 sm:text-sm">
              Bukti terdaftar (<span className="tabular-nums">{evidence.length}</span>)
            </h4>
          </div>
          <div className="flex flex-col gap-3">
            {evidence.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                Belum ada bukti yang terkumpul untuk faktor ini.
              </p>
            )}
            {evidence.map((f, i) => <EvidenceCard key={i} report={report} finding={f} />)}
          </div>
        </div>

        {gaps.length > 0 && (
          <div className="mt-2">
            <div className="mb-2.5 flex items-center gap-2">
              <CircleAlert size={16} className="text-amber-600" />
              <h4 className="text-xs font-bold text-amber-950 sm:text-sm">
                Catatan evidence gap (<span className="tabular-nums">{gaps.length}</span>)
              </h4>
            </div>
            <div className="flex flex-col gap-3">
              {gaps.map((f, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-[1.125rem]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="text-xs font-bold leading-snug text-slate-900 sm:text-sm">{f.claim}</h5>
                    <ConfidenceChip c={f.confidence} />
                  </div>
                  {f.validation_action && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 [text-wrap:pretty] sm:text-sm">
                      {f.validation_action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tahap 03: mobility ──────────────────────────────────────────────────────────────────

const MODE_LABEL: Record<string, string> = {
  TRANSIT: "Transit", DRIVE: "Mobil", WALK: "Jalan kaki", BICYCLE: "Sepeda", TWO_WHEELER: "Motor",
};

export function Tahap03Perjalanan({ intakeId, map, onAsk }: {
  intakeId?: string; map: MapData | null; onAsk?: (prompt: string, topic?: string) => void;
}) {
  const [routes, setRoutes] = useState<MapRoutes | null>(null);
  const [state, setState] = useState<"loading" | "done" | "failed">("loading");
  const [openLeg, setOpenLeg] = useState<"station" | "toll">("station");

  useEffect(() => {
    if (!intakeId) { setState("failed"); return; }
    let alive = true;
    getRoutes(intakeId)
      .then((r) => { if (alive) { setRoutes(r); setState("done"); } })
      .catch(() => { if (alive) setState("failed"); });
    return () => { alive = false; };
  }, [intakeId]);

  const options = ([
    { key: "station" as const, mode: "Transit", Icon: Train,
      leg: routes?.station ?? null, target: map?.nearest_station ?? null },
    { key: "toll" as const, mode: "Mobil / taksi", Icon: Car,
      leg: routes?.toll ?? null, target: map?.nearest_toll ?? null },
  ]).filter((o) => o.target);

  // "Tercepat" / "Terlama" are computed from the durations we actually measured — not
  // asserted from a table. With one option there is nothing to rank, so no badge shows.
  const timed = options.filter((o) => o.leg).map((o) => o.leg!.duration_min);
  const fastest = timed.length > 1 ? Math.min(...timed) : null;
  const slowest = timed.length > 1 ? Math.max(...timed) : null;

  const active = options.find((o) => o.key === openLeg) ?? options[0];

  return (
    <div className={card}>
      <StageHeader step="perjalanan" onAsk={onAsk} />

      {state === "loading" && (
        <p className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">Menghitung rute…</p>
      )}

      {state !== "loading" && options.length === 0 && (
        <p className="rounded-2xl border border-[#D4A017]/30 bg-[#FFF9E6] p-4 text-xs leading-relaxed text-[#523A00]">
          Titik akses transit belum terdeteksi di sekitar lokasi ini, jadi belum ada rute yang bisa
          dihitung. Verifikasi langsung saat survei.
        </p>
      )}

      {options.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
          {options.map(({ key, mode, Icon, leg, target }) => {
            const on = active?.key === key;
            const badge =
              leg && fastest !== null && leg.duration_min === fastest
                ? { text: "Tercepat", cls: "border-emerald-200/90 bg-emerald-50 text-emerald-800" }
                : leg && slowest !== null && leg.duration_min === slowest
                  ? { text: "Terlama", cls: "border-amber-200/90 bg-amber-50 text-amber-900" }
                  : null;
            return (
              <button key={key} type="button" onClick={() => setOpenLeg(key)}
                      className={`flex cursor-pointer flex-col justify-between gap-3 rounded-2xl p-4 text-left transition-all duration-150 active:scale-[0.98] ${
                        on ? "border-2 border-[#0F2B38] bg-white shadow-2xs"
                           : "border border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white"
                      }`}>
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Icon size={13} className="text-slate-400" />{mode}
                    </span>
                    {badge && (
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none shadow-2xs sm:text-[11px] ${badge.cls}`}>
                        {badge.text}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold leading-snug text-slate-900 sm:text-base">{target!.name}</h4>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {target!.distance_km} km garis lurus{leg && ` · ${leg.distance_km} km via jalan`}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1 text-base font-extrabold tabular-nums text-slate-900 sm:text-lg">
                    <Clock size={15} className="text-slate-400" />
                    {leg ? `${Math.round(leg.duration_min)} min` : "—"}
                  </span>
                  {!leg && (
                    <span className="shrink-0 rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold leading-none text-slate-600">
                      Rute belum terhitung
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {active?.leg && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <span className="flex items-center gap-2">
              <Navigation size={16} className="text-[#0F2B38]" />
              <h4 className="text-sm font-bold text-slate-900">Detail rute: {active.target!.name}</h4>
            </span>
            <span className="text-xs font-semibold tabular-nums text-slate-500">
              Total estimasi ~{Math.round(active.leg.duration_min)} min
            </span>
          </div>
          {/* Numbered legs, as the reference lays them out. The Routes API returns one
              measured leg per destination rather than a full itinerary, so this is one row —
              a real one — instead of the mock's invented "Angkot K05 · 15 min" chain. */}
          <div className="flex flex-col divide-y divide-slate-200/60">
            {[
              {
                n: 1,
                mode: MODE_LABEL[active.leg.mode] ?? active.leg.mode,
                path: `Properti → ${active.target!.name}`,
                value: `${Math.round(active.leg.duration_min)} min`,
              },
              {
                n: 2,
                mode: "Jarak via jalan",
                path: `${active.leg.distance_km} km terukur, bukan garis lurus`,
                value: `${active.leg.distance_km} km`,
              },
            ].map((leg) => (
              <div key={leg.n} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold tabular-nums text-slate-700">
                    {leg.n}
                  </span>
                  <span className="shrink-0 font-bold text-slate-900">{leg.mode}</span>
                  <span className="hidden text-slate-400 sm:inline">•</span>
                  <span className="truncate text-slate-600">{leg.path}</span>
                </div>
                <span className="shrink-0 rounded-md border border-slate-200/80 bg-white px-2 py-0.5 font-bold tabular-nums text-slate-900">
                  {leg.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No GTFS headway feed and no peak-hour traffic source (docs/18 GAP-07/GAP-08), so the
          reference design's "macet jam sibuk" annotations have nothing behind them here. */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-200/90 bg-[#fffdf5] p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <h5 className="text-xs font-bold tracking-wide text-slate-900">
              Rekomendasi verifikasi lapangan rute perjalanan
            </h5>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 [text-wrap:pretty]">
              Angka di atas adalah estimasi rute dasar, bukan kondisi jam sibuk — jadwal KRL dan
              kepadatan lalu lintas belum terhubung ke sumber resmi. Lakukan uji coba perjalanan
              sendiri pada hari kerja 07:00–08:30 WIB sebelum memutuskan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tahap 04: field checklist ───────────────────────────────────────────────────────────

export function Tahap04Checklist({ report, onAsk }: {
  report: Report; onAsk?: (prompt: string, topic?: string) => void;
}) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<string | null>(null);
  const [hideDone, setHideDone] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(report.checklist.map((c) => c.category))),
    [report.checklist],
  );
  const labelOf = (key: string) =>
    report.categories.find((c) => c.category === key)?.label ?? key;

  /** Priority is not in the contract (docs/18 GAP-20). Rather than invent a level per item,
   *  it is derived from something the report does assert: an item belonging to a category
   *  that carries a red flag is the one to do first. */
  const urgent = useMemo(
    () => new Set(report.categories
      .filter((c) => c.findings.some((f) => f.is_red_flag || f.is_critical))
      .map((c) => c.category)),
    [report.categories],
  );

  const items = report.checklist
    .map((item, i) => ({ ...item, i }))
    .filter((item) => !filter || item.category === filter)
    .filter((item) => !hideDone || !done.has(item.i));

  const total = report.checklist.length;
  const pct = total === 0 ? 0 : Math.round((done.size / total) * 100);
  const C = 2 * Math.PI * 20;

  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs sm:rounded-3xl">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 sm:p-5">
        <StageHeader step="checklist" onAsk={onAsk} />

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold leading-none tabular-nums text-slate-900 sm:text-3xl">
              {done.size}
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-400 sm:text-base">/ {total}</span>
            <span className="ml-1 text-xs font-semibold text-slate-700">terverifikasi</span>
          </div>
          <div className="relative flex size-12 shrink-0 items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 50 50" className="-rotate-90" aria-hidden="true">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
              <circle cx="25" cy="25" r="20" fill="none" stroke="#0F2B38" strokeWidth="4.5"
                      strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
                      className="transition-all duration-500 ease-out" />
            </svg>
            <span className="absolute text-[11px] font-bold tabular-nums text-[#0F2B38]">{pct}%</span>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full border border-slate-200/60 bg-slate-100 p-px"
             role="progressbar" aria-valuenow={done.size} aria-valuemin={0} aria-valuemax={total}>
          <div className="h-full rounded-full bg-sky-500 shadow-2xs transition-all duration-500 ease-out"
               style={{ width: `${pct}%` }} />
        </div>

        {/* Ticks live in component state only: there is no checklist store server-side
            (docs/18 GAP-09), and claiming a survey is saved when it is not would be worse
            than saying it isn't. */}
        <p className="rounded-xl border border-slate-200/60 bg-slate-50 p-2.5 text-[11px] leading-normal text-slate-500">
          Centangmu belum tersimpan di akun — penyimpanan progres checklist menyusul. Ekspor
          ringkasan PDF kalau mau bawa daftar ini ke lapangan.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 border-b border-slate-100 bg-slate-50/80 p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <SlidersHorizontal size={13} className="text-slate-500" />
            Filter faktor risiko:
          </span>
          <button type="button" onClick={() => setHideDone((v) => !v)} aria-pressed={hideDone}
                  className={`flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-150 active:scale-[0.96] ${
                    hideDone ? "border-[#0F2B38] bg-[#0F2B38] text-white"
                             : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}>
            {hideDone ? <EyeOff size={13} className="shrink-0" /> : <Eye size={13} className="shrink-0 text-slate-500" />}
            <span>{hideDone ? "Tampilkan semua" : "Sembunyikan selesai"}</span>
          </button>
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-0.5 overflow-x-auto rounded-xl bg-slate-200/60 p-0.5"
               role="tablist" aria-label="Filter kategori checklist" style={{ scrollbarWidth: "none" }}>
            {[null, ...categories].map((c) => {
              const on = filter === c;
              return (
                <button key={c ?? "all"} type="button" role="tab" aria-selected={on}
                        onClick={() => setFilter(c)}
                        className={`min-h-[28px] shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 active:scale-[0.96] ${
                          on ? "bg-white font-bold text-slate-900 shadow-xs"
                             : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                        }`}>
                  {c === null ? "Semua kategori" : labelOf(c)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {items.length === 0 && (
          <p className="p-5 text-xs text-slate-600">
            {hideDone && done.size > 0
              ? "Semua item di filter ini sudah kamu centang."
              : "Belum ada item checklist untuk kategori ini."}
          </p>
        )}
        {items.map((item) => {
          const on = done.has(item.i);
          const st = categoryStyle(item.category);
          const CatIcon = st.Icon;
          const high = urgent.has(item.category);
          return (
            <div key={item.i} role="button" tabIndex={0}
                 onClick={() => toggle(item.i)}
                 onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(item.i); } }}
                 className="group flex min-h-[44px] cursor-pointer items-start gap-3 p-3.5 transition-all duration-150 hover:bg-slate-50/50 active:scale-[0.98] sm:p-4">
              <span className="flex min-h-[24px] min-w-[24px] shrink-0 items-center justify-center pt-0.5">
                <span role="checkbox" aria-checked={on} aria-label={item.item}
                      className={`flex size-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                        on ? "border-[#0F2B38] bg-[#0F2B38]" : "border-slate-300 bg-white group-hover:border-slate-400"
                      }`}>
                  {on && <ClipboardCheck size={11} className="text-white" />}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold transition-all duration-150 [text-wrap:pretty] sm:text-sm ${
                  on ? "text-slate-400 line-through" : "text-slate-900"
                }`}>
                  {item.item}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none shadow-2xs sm:text-[11px]"
                        style={{ backgroundColor: `${st.tint}`, color: st.ink, borderColor: `${st.ink}33` }}>
                    <CatIcon size={11} className="shrink-0" />
                    {labelOf(item.category)}
                  </span>
                  {/* Derived, not declared — see `urgent` above. */}
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none shadow-2xs sm:text-[11px] ${
                    high ? "border-red-200/90 bg-red-50 text-red-900"
                         : "border-slate-200/80 bg-slate-100 text-slate-700"
                  }`}>
                    {high ? "Prioritas tinggi" : "Rutin"}
                  </span>
                </div>
                {item.reason && (
                  <p className="mt-2 w-full rounded-lg border border-amber-200/60 bg-amber-50/70 px-3 py-1.5 text-xs leading-relaxed text-amber-900 [text-wrap:pretty]">
                    <strong className="font-bold">Kenapa penting: </strong>
                    <span className="text-amber-900/90">{item.reason}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tahap 05: facilities ────────────────────────────────────────────────────────────────

function proximity(km: number): { label: string; cls: string } {
  if (km <= 0.5) return { label: "Sangat dekat", cls: "border-emerald-200/90 bg-emerald-50 text-emerald-800" };
  if (km <= 1.5) return { label: "Dekat", cls: "border-emerald-200/90 bg-emerald-50 text-emerald-800" };
  if (km <= 3) return { label: "Cukup jauh", cls: "border-amber-200/90 bg-amber-50 text-amber-900" };
  return { label: "Jauh", cls: "border-slate-200/90 bg-slate-50 text-slate-700" };
}

export function Tahap05Fasilitas({
  map, openGroup, visibleGroups, onOpenGroup, onToggleGroup, onAsk,
}: {
  map: MapData | null;
  /** Group whose detail rows are expanded — also the one the map is framing. */
  openGroup: string | null;
  visibleGroups: Set<string>;
  onOpenGroup: (id: string | null) => void;
  onToggleGroup: (id: string) => void;
  onAsk?: (prompt: string, topic?: string) => void;
}) {
  const groups = useMemo(() => {
    const all: MapFeature[] = [
      ...(map?.facilities ?? []),
      ...(map?.nearest_station ? [map.nearest_station] : []),
      ...(map?.nearest_toll ? [map.nearest_toll] : []),
    ];
    const bucket = new Map<string, { group: FacilityGroup; items: MapFeature[] }>();
    for (const f of all) {
      const g = groupOf(f.kind);
      const entry = bucket.get(g.id) ?? { group: g, items: [] };
      entry.items.push(f);
      bucket.set(g.id, entry);
    }
    return [...bucket.values()]
      .map((e) => ({ ...e, items: [...e.items].sort((a, b) => a.distance_km - b.distance_km) }))
      .sort((a, b) => a.items[0].distance_km - b.items[0].distance_km);
  }, [map]);

  const activeLayers = groups.filter((g) => visibleGroups.has(g.group.id)).length;

  return (
    <div className={card}>
      <StageHeader
        step="fasilitas"
        onAsk={onAsk}
        right={
          <span className="shrink-0 self-start rounded-full border border-sky-200/90 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-sky-900 shadow-2xs sm:text-xs">
            {activeLayers} layer aktif
          </span>
        }
      />

      {groups.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          Belum ada fasilitas yang terdeteksi dalam radius pencarian untuk lokasi ini.
        </p>
      ) : (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {groups.map(({ group, items }) => {
            const expanded = openGroup === group.id;
            const shown = visibleGroups.has(group.id);
            const near = proximity(items[0].distance_km);
            return (
              <div key={group.id} className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div className="flex min-h-[52px] w-full items-center justify-between px-3.5 py-3 sm:px-4">
                  <button type="button" onClick={() => onOpenGroup(expanded ? null : group.id)}
                          aria-expanded={expanded}
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl p-1 text-left transition-all duration-150 hover:bg-slate-50/70 active:scale-[0.98] sm:gap-3 sm:p-1.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-2xs"
                          style={{ background: group.tint, borderColor: group.border }}>
                      <MapPin size={16} style={{ color: group.ink }} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="truncate text-xs font-bold leading-snug text-slate-900 sm:text-sm">
                          {group.label}
                        </span>
                        <span className="shrink-0 rounded-full border border-sky-200/90 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold leading-none tabular-nums text-sky-900 shadow-2xs">
                          {items.length}
                        </span>
                      </span>
                      <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1 text-xs">
                        <span className={`shrink-0 whitespace-nowrap rounded-full border px-1.5 py-0 text-[10px] font-bold leading-none shadow-2xs sm:text-xs ${near.cls}`}>
                          {near.label}
                        </span>
                        <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                          · terdekat{" "}
                          <strong className="whitespace-nowrap font-semibold tabular-nums text-slate-600">
                            {items[0].distance_km.toFixed(2)} km
                          </strong>
                        </span>
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-2 pl-2 sm:gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:inline-block">
                        Peta
                      </span>
                      <button type="button" role="switch" aria-checked={shown}
                              aria-label={`${shown ? "Sembunyikan" : "Tampilkan"} ${group.label} di peta`}
                              onClick={() => onToggleGroup(group.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out active:scale-[0.96] ${
                                shown ? "bg-[#0F2B38]" : "bg-slate-300"
                              }`}>
                        <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          shown ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                    <button type="button" onClick={() => onOpenGroup(expanded ? null : group.id)}
                            aria-label={expanded ? "Sembunyikan detail" : "Tampilkan detail"}
                            className="flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 transition-transform duration-200 hover:bg-slate-100">
                      <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="flex w-full flex-col border-t border-slate-100 bg-slate-50/70 px-4 pb-3">
                    {items.map((f, i) => (
                      <div key={`${f.name}-${i}`}
                           className="flex min-h-[36px] w-full items-center justify-between border-b border-slate-200/50 py-2.5 last:border-b-0">
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="size-1.5 shrink-0 rounded-full" style={{ background: group.ink }} />
                          <span className="truncate text-xs font-medium text-slate-800 sm:text-sm">{f.name}</span>
                        </span>
                        <span className="ml-3 shrink-0 whitespace-nowrap rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600">
                          {f.distance_km.toFixed(2)} km
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Red flags surfaced above the fold, so a critical finding is never buried behind a tab
 *  (STD-SCR-001 §7 exposure rule). */
export function RedFlagStrip({ report, onOpen }: { report: Report; onOpen: () => void }) {
  const flags = report.red_flags.map((r) => resolveRef(report, r)).filter((f) => f !== null);
  if (flags.length === 0) return null;
  return (
    <button type="button" onClick={onOpen}
            className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-red-200/90 bg-red-50/80 p-4 text-left transition-colors hover:bg-red-50">
      <TriangleAlert size={18} className="mt-0.5 shrink-0 text-rose-600" />
      <span className="min-w-0">
        <span className="block text-xs font-bold text-rose-900 sm:text-sm">
          {flags.length} red flag terdeteksi
        </span>
        <span className="mt-0.5 block truncate text-xs text-rose-900/80">{flags[0].claim}</span>
      </span>
      <Navigation size={14} className="ml-auto mt-1 shrink-0 rotate-45 text-rose-500" />
    </button>
  );
}
