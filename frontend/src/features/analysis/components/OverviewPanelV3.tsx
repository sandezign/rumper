import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LegacyReport } from "@/lib/api";
import { bandHex, scoreHex } from "@/lib/risk";
import type { EvidenceIndex } from "@/features/analysis/evidence";

interface OverviewPanelV3Props {
  report: LegacyReport;
  index: EvidenceIndex;
  onCheckEvidence: () => void;
  /** Selects an evidence item (shared id with its map marker). */
  onSelectFinding: (evidenceId: string) => void;
}

const SUMMARY_PREVIEW = 195;

export function OverviewPanelV3({ report, index, onCheckEvidence, onSelectFinding }: OverviewPanelV3Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const score = report.rls_score;
  const hex = bandHex(report.band);
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score));

  // Critical red flags first — a high total score must never bury them (STD-SCR-001 §7).
  const priorityFindings = useMemo(() => {
    const rank = (item: { isCritical: boolean; isRedFlag: boolean }) =>
      item.isCritical ? 0 : item.isRedFlag ? 1 : 2;
    return [...index.items].sort((a, b) => rank(a) - rank(b)).slice(0, 2);
  }, [index.items]);

  const summary = report.summary || "";
  const needsTruncation = summary.length > SUMMARY_PREVIEW;

  return (
    <div className="flex select-text flex-col gap-md">
      {/* Scorecard */}
      <div className="flex flex-col gap-md rounded-2xl border border-border bg-white p-lg shadow-sm">
        <div className="flex items-start justify-between gap-md">
          <div className="min-w-0 flex-1">
            <h2 className="text-heading-4 font-bold text-text-primary">
              {report.property.name || "Lokasi kandidat"}
            </h2>
            <p className="mt-xxs max-w-xs truncate text-body-xs leading-relaxed text-text-secondary">
              {report.property.formatted_address || "Alamat belum tersedia"}
            </p>
          </div>

          <div
            role="img"
            aria-label={`Skor kelayakan ${score !== null ? Math.round(score) : "belum tersedia"} dari 100`}
            className="relative flex size-16 shrink-0 items-center justify-center rounded-full shadow-sm"
            style={{ background: `conic-gradient(${hex} 0% ${pct}%, #e8edef ${pct}% 100%)` }}
          >
            <div className="absolute inset-[6px] flex flex-col items-center justify-center rounded-full bg-white">
              <span className="text-body-medium-bold font-bold leading-none text-text-primary">
                {score !== null ? Math.round(score) : "–"}
              </span>
              <span className="text-[9px] font-medium text-text-tertiary">/100</span>
            </div>
          </div>
        </div>

        <div className="mt-xxs flex flex-col gap-sm border-t border-border/40 pt-md">
          {report.categories.map((cat) => {
            const val = cat.score;
            return (
              <div key={cat.category} className="flex items-center justify-between text-body-sm font-medium">
                <span className="text-xs text-text-secondary">{cat.label}</span>
                <div className="relative mx-md h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${val ?? 0}%`, backgroundColor: scoreHex(val) }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-text-primary">{val ?? "–"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer — always shown (CLAUDE.md rule 6) */}
      <div className="flex items-start gap-xs rounded-xl border border-[#fef3c7] bg-[#fffbeb] p-sm text-[#b45309]">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#fecaca] bg-[#fef2f2] font-sans text-body-xs-bold font-bold text-[#ef4444]">
          !
        </span>
        <p className="text-[12px] font-medium leading-relaxed">
          {report.disclaimer || "Analisis ini disusun otomatis berdasarkan agregasi data sekunder."}
        </p>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mt-xs flex flex-col gap-xxs">
          <h3 className="text-body-sm-bold font-bold text-text-primary">Overview</h3>
          <div className="rounded-xl border border-border bg-white p-md shadow-sm">
            <p className="text-body-sm leading-relaxed text-text-secondary">
              {isExpanded || !needsTruncation ? summary : `${summary.slice(0, SUMMARY_PREVIEW)}…`}
            </p>
            {needsTruncation && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-xs inline-flex items-center gap-xxs text-caption-bold font-bold text-text-primary transition-colors hover:text-brand-teal"
              >
                {isExpanded ? (
                  <>
                    <span>Sembunyikan</span>
                    <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    <span>Selengkapnya</span>
                    <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Priority findings */}
      {priorityFindings.length > 0 && (
        <section className="mt-xs flex flex-col gap-xs">
          <div className="flex items-center gap-sm">
            <h3 className="text-body-sm-bold font-bold text-text-primary">TEMUAN PRIORITAS</h3>
            <span className="rounded-full border border-border bg-slate-100 px-2 py-0.5 text-micro font-bold text-slate-600">
              {priorityFindings.length}
            </span>
          </div>

          <div className="flex flex-col gap-sm">
            {priorityFindings.map((f) => {
              const isRed = f.isCritical;
              const badgeBg = isRed
                ? "bg-red-50 text-red-700 border-red-200/50"
                : "bg-amber-50 text-amber-700 border-amber-200/50";
              const badgeDot = isRed ? "bg-red-500" : "bg-amber-500";
              const badgeLabel = isRed ? "Risiko tinggi" : f.isRedFlag ? "Perlu perhatian" : "Temuan utama";

              return (
                <button
                  key={f.id}
                  onClick={() => onSelectFinding(f.id)}
                  className="group flex flex-col gap-xs rounded-xl border border-border bg-white p-md text-left shadow-sm transition-all duration-150 hover:border-brand-teal"
                >
                  <span
                    className={`inline-flex items-center gap-xs rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}
                  >
                    <span className={`size-1.5 rounded-full ${badgeDot}`} />
                    {badgeLabel}
                  </span>
                  <h4 className="mt-xxs text-body-sm-bold font-bold text-text-primary transition-colors group-hover:text-brand-teal">
                    {f.categoryLabel}
                  </h4>
                  <p className="text-body-xs leading-relaxed text-text-secondary">{f.claim}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Field-survey checklist — straight from the report */}
      {report.checklist.length > 0 && (
        <section className="mt-xs flex flex-col gap-xs">
          <h3 className="text-body-sm-bold font-bold text-text-primary">CHECKLIST SURVEI LAPANGAN</h3>
          <div className="flex flex-col gap-sm rounded-xl border border-border bg-white p-md shadow-sm">
            {report.checklist.map((c, idx) => (
              <div key={idx} className="flex items-start gap-sm text-body-xs leading-relaxed text-text-secondary">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-mono text-[10px] font-bold text-slate-500">
                  {idx + 1}
                </span>
                <span className="mt-0.5 flex-1">
                  <span className="font-semibold text-text-primary">{c.item}</span>
                  {c.reason ? <span className="block text-text-tertiary">{c.reason}</span> : null}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={onCheckEvidence}
        className="mt-sm min-h-[48px] w-full cursor-pointer rounded-full bg-[#00ed64] py-md text-center text-body-sm-medium font-bold text-[#001e2b] shadow-md transition-all duration-150 hover:scale-[1.01] hover:bg-[#00d659] hover:shadow-lg active:scale-[0.99]"
      >
        Check Evidence Risk
      </button>
    </div>
  );
}
