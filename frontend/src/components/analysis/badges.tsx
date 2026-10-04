import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BAND_BADGE, CONFIDENCE } from "@/lib/risk";
import type { Confidence, LegacyFinding } from "@/lib/api";

/** Risk severity from the interpretation band — color + visible label + dot. */
export function RiskBadge({ band, label }: { band: string | null; label: string }) {
  const variant = (band && BAND_BADGE[band]) || "unknown";
  return (
    <Badge variant={variant} role="status">
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {label}
    </Badge>
  );
}

/** Per-finding severity (critical → high, red flag → caution, else → supporting). */
export function SeverityBadge({ finding }: { finding: LegacyFinding }) {
  const { variant, label } = finding.is_critical
    ? ({ variant: "danger", label: "Risiko tinggi" } as const)
    : finding.is_red_flag
      ? ({ variant: "warning", label: "Perlu perhatian" } as const)
      : ({ variant: "positive", label: "Cukup baik" } as const);
  return (
    <Badge variant={variant} role="status">
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {label}
    </Badge>
  );
}

/** Evidence strength (NOT location safety). Always color + text. */
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const c = CONFIDENCE[confidence];
  return (
    <Badge variant={c.variant} title="Tingkat kekuatan bukti, bukan jaminan keamanan lokasi">
      {c.label}
    </Badge>
  );
}

/** Review state — preliminary, AI-generated, not yet analyst-reviewed. */
export function ValidationBadge() {
  return (
    <Badge variant="warning" className="gap-xxs">
      <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
      Hasil awal · belum ditinjau analis
    </Badge>
  );
}
