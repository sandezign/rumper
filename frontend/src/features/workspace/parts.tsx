import { ChevronRight, Lock, Layers, ShieldCheck } from "lucide-react";
import type { Category, Confidence, Report } from "@/lib/api";
import { AskAiButton } from "./stages";

export type StepId = "ringkasan" | "faktor-risiko" | "perjalanan" | "checklist" | "fasilitas";
export const STEPS: { id: StepId; label: string }[] = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "faktor-risiko", label: "Faktor risiko" },
  { id: "perjalanan", label: "Perjalanan" },
  { id: "checklist", label: "Checklist" },
  { id: "fasilitas", label: "Fasilitas" },
];

const CONF_LABEL: Record<Confidence, string> = {
  data_kuat: "Data kuat",
  data_sedang: "Data sedang",
  perlu_validasi: "Perlu validasi",
};

/** Tone by evidence strength, not by how good the location is (CLAUDE.md rule 2). */
function confChip(c: Confidence) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold leading-none whitespace-nowrap shrink-0 shadow-2xs border";
  return c === "data_kuat"
    ? `${base} bg-emerald-50 text-emerald-900 border-emerald-200/90`
    : `${base} bg-amber-50 text-amber-900 border-amber-200/90`;
}

const FACTOR_TINT: Record<string, { bg: string; bar: string }> = {
  banjir: { bg: "bg-rose-100/80", bar: "bg-rose-500" },
  commute: { bg: "bg-amber-100/80", bar: "bg-amber-500" },
  akses: { bg: "bg-sky-100/80", bar: "bg-sky-500" },
  fasilitas: { bg: "bg-emerald-100/80", bar: "bg-emerald-500" },
  lingkungan: { bg: "bg-violet-100/80", bar: "bg-violet-500" },
};

export function StepTabs({ active, unlocked, onSelect, onLocked }: {
  active: StepId; unlocked: boolean; onSelect: (s: StepId) => void; onLocked?: () => void;
}) {
  return (
    <div role="tablist" aria-label="Navigasi Tahap Laporan"
         className="flex items-center gap-1.5 overflow-x-auto scrollbar-none" style={{ flexWrap: "nowrap" }}>
      {STEPS.map((s) => {
        const on = s.id === active;
        const locked = s.id !== "ringkasan" && !unlocked;
        return (
          <button
            key={s.id}
            id={`tab-${s.id}`}
            role="tab"
            aria-selected={on}
            aria-disabled={locked}
            onClick={() => (locked ? onLocked?.() : onSelect(s.id))}
            className={`flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition-all duration-150 active:scale-[0.96] shrink-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2B38] ${
              on ? "font-bold shadow-2xs" : "font-semibold hover:bg-white/80"
            }`}
            style={on
              ? { backgroundColor: "#0F2B38", color: "#fff", border: "1.5px solid #0F2B38" }
              : locked
                ? { border: "1px dashed #B9C8D2", backgroundColor: "#F8FAFC", color: "#475569" }
                : { border: "1px solid #C1CCD6", backgroundColor: "#fff", color: "#3D4F5B" }}
          >
            {locked && <Lock size={12} className="text-slate-500" />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export function RingkasanCard({ report, onAsk }: {
  report: Report; onAsk?: (prompt: string, topic?: string) => void;
}) {
  const sourceCount = report.sources.length; // deduplicated server-side (docs/05)
  const score = report.rls_score ?? 0;
  const C = 2 * Math.PI * 30;
  // Evidence strength = the weakest confidence across scored categories. A report is only
  // as strong as its softest input; averaging would flatter it.
  const weakest: Confidence = report.categories.some((c) => c.confidence === "perlu_validasi")
    ? "perlu_validasi"
    : report.categories.some((c) => c.confidence === "data_sedang")
      ? "data_sedang" : "data_kuat";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:gap-5 sm:rounded-3xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#0d262b] px-2 py-0.5 text-[10px] font-semibold leading-none text-white shadow-2xs sm:text-[11px]">
            <Layers size={12} className="text-emerald-400" />TAHAP 01
          </span>
          <h2 className="text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-xl">
            Ringkasan &amp; Indeks Risiko Lokasi
          </h2>
        </div>
        {onAsk && <AskAiButton step="ringkasan" onAsk={onAsk} />}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-xs sm:p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
            Indeks Keselarasan Lokasi (Mini Check)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold leading-none tabular-nums tracking-tight text-[#0F2B38] sm:text-4xl">
              {report.rls_score == null ? "—" : Math.round(score)}
            </span>
            <span className="text-xs font-bold tabular-nums text-slate-400 sm:text-sm">/100</span>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[10px] font-bold leading-none text-amber-900 shadow-2xs sm:text-xs">
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
            {report.band_label}
          </span>
        </div>
        <div className="relative flex size-16 shrink-0 items-center justify-center sm:size-20">
          <svg width="68" height="68" viewBox="0 0 72 72" aria-hidden="true">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#E2E8F0" strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="#0F2B38" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={C}
                    strokeDashoffset={C * (1 - score / 100)}
                    transform="rotate(-90 36 36)" className="transition-all duration-500 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="flex size-7 items-center justify-center rounded-full bg-[#0F2B38] text-white shadow-2xs sm:size-8">
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">{report.summary}</p>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-bold leading-none text-slate-700 sm:text-xs">
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-slate-400" />
            Kekuatan Bukti: {CONF_LABEL[weakest]}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-slate-600">
            Disintesis dari <strong className="font-bold tabular-nums text-[#0F2B38]">{sourceCount}</strong> sumber
          </span>
        </div>
        <p className="rounded-xl border border-slate-200/60 bg-slate-50 p-2.5 text-[11px] leading-normal text-slate-500">
          💡 <strong>Tips Rumper:</strong> {report.disclaimer}
        </p>
      </div>
    </div>
  );
}

export function FactorList({ categories, onSelect }: {
  categories: Category[]; onSelect: (c: string) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs sm:rounded-3xl">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/50 px-4 py-4 sm:px-5">
        <h3 className="text-sm font-bold text-slate-900">Ringkasan 5 Faktor Risiko Lokasi</h3>
        <span className="text-xs font-semibold tabular-nums text-slate-500">
          {categories.length} faktor dipantau
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {categories.map((c) => {
          const tint = FACTOR_TINT[c.category] ?? FACTOR_TINT.akses;
          const red = c.findings.some((f) => f.is_red_flag || f.is_critical);
          const evidence = c.findings.filter((f) => !f.is_evidence_gap).length;
          const gaps = c.findings.filter((f) => f.is_evidence_gap).length;
          return (
            <button key={c.category} type="button" onClick={() => onSelect(c.category)}
                    className="group flex min-h-[54px] w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-all duration-150 hover:bg-slate-50/80 active:scale-[0.98] sm:gap-4 sm:px-5 cursor-pointer">
              <div className="flex min-w-0 flex-1 shrink-0 items-center gap-2.5 sm:w-52 sm:flex-none">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full shadow-2xs sm:size-9 ${tint.bg}`} />
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="whitespace-nowrap text-sm font-bold text-slate-900">{c.label}</span>
                  {red && (
                    <span className="shrink-0 rounded-full border border-red-200/90 bg-red-50 px-2 py-0.5 text-[10px] font-semibold leading-none text-red-900 shadow-2xs">
                      Risiko utama
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden w-28 shrink-0 sm:block md:w-36 lg:w-44">
                <div className="h-2 w-full overflow-hidden rounded-full border border-slate-200/60 bg-slate-100 p-[1px]"
                     role="progressbar" aria-valuenow={c.score ?? 0} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`h-full rounded-full shadow-2xs transition-all duration-500 ease-out ${tint.bar}`}
                       style={{ width: `${c.score ?? 0}%` }} />
                </div>
              </div>
              <div className="ml-auto shrink-0 text-right tabular-nums sm:ml-0">
                <span className="whitespace-nowrap text-xs font-bold">
                  <span className="text-sm font-extrabold text-[#0F2B38]">{c.score ?? "—"}</span>
                  <span className="text-[11px] font-semibold text-slate-400">/100</span>
                </span>
              </div>
              <div className="hidden w-40 shrink-0 pr-1 text-right xl:block">
                <span className="block truncate text-xs font-medium text-slate-500">
                  {c.score == null ? "Data belum cukup" : `${evidence} bukti · ${gaps} gap`}
                </span>
              </div>
              <div className="flex min-w-[90px] shrink-0 items-center justify-end gap-1.5 sm:min-w-[110px]">
                <span className={confChip(c.confidence)}>
                  <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-current opacity-60" />
                  {CONF_LABEL[c.confidence]}
                </span>
                <ChevronRight size={14} className="shrink-0 text-slate-600 opacity-40 transition-opacity group-hover:opacity-80" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
