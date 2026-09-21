import { ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { bandHex } from "@/lib/risk";
import type { LegacyReport } from "@/lib/api";
import { RiskBadge, ValidationBadge } from "./badges";

/** Score-card (dashboard.html): risk ring (NEVER brand-green) + status + property + band +
 *  recommendation + a single primary action banner. Score stays subordinate to findings. */
export function ScoreCard({
  report,
  onPrimaryAction,
}: {
  report: LegacyReport;
  onPrimaryAction?: () => void;
}) {
  const score = report.rls_score;
  const hex = bandHex(report.band);
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score));

  const primaryAction =
    report.red_flags.find((f) => f.is_critical)?.validation_action ||
    report.checklist[0]?.item ||
    report.recommendation_label;

  return (
    <Card className="flex flex-col gap-lg p-2xl shadow-[var(--shadow-subtle)] sm:flex-row sm:items-start">
      {/* conic-gradient ring (dashboard.html) — risk-tinted, glows on hover; NOT brand-green */}
      <div
        role="img"
        aria-label={`Skor risiko ${score === null ? "belum tersedia" : Math.round(score) + " dari 100"}`}
        className="relative size-24 shrink-0 self-center rounded-full transition-shadow duration-200 hover:shadow-[0_0_0_4px_var(--score-glow)] sm:self-start"
        style={{
          background: `conic-gradient(${hex} 0% ${pct}%, #e8edef ${pct}% 100%)`,
          ["--score-glow" as string]: `${hex}33`,
        }}
      >
        <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-card">
          <span className="text-heading-3 font-bold leading-none tracking-tight text-foreground">
            {score === null ? "–" : Math.round(score)}
          </span>
          <span className="mt-0.5 text-micro text-text-tertiary">/100</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <ValidationBadge />
        <h1 className="mt-sm text-heading-4 text-foreground [overflow-wrap:anywhere]">
          {report.property.name || report.property.formatted_address || "Lokasi kandidat"}
        </h1>
        {report.property.name && report.property.formatted_address && (
          <p className="text-caption text-text-tertiary">{report.property.formatted_address}</p>
        )}

        <div className="mt-sm flex flex-wrap items-center gap-xs">
          <RiskBadge band={report.band} label={report.band_label} />
          <span className="text-caption text-text-tertiary">Skor ≠ rekomendasi</span>
        </div>

        <p className="mt-sm text-body-sm text-text-secondary">{report.recommendation_label}</p>

        {!report.property.in_jabodetabek && (
          <p className="mt-sm rounded-md bg-semantic-warning-bg px-sm py-xs text-caption text-semantic-warning-text">
            Lokasi di luar Jabodetabek — cakupan data terbatas, hasil indikatif.
          </p>
        )}

        {primaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-md flex w-full items-center justify-between gap-sm rounded-[10px] border border-[rgba(0,180,100,0.18)] bg-[#ddf8ea] px-md py-sm text-left transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex min-w-0 items-center gap-xs text-body-sm-medium text-[#1a6640]">
              <Clock className="size-4 shrink-0" aria-hidden />
              <span className="truncate">Langkah utama: {primaryAction}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-[#1a6640]" aria-hidden />
          </button>
        )}
      </div>
    </Card>
  );
}
