// Shared risk/band/confidence presentation.
// RULE: brand-green (#00ed64) is NEVER used here — it is an action/identity color only,
// never "safe / low-risk / positive". Bands & scores use the semantic palette.
import type { Confidence } from "./api";

export type SemanticVariant = "neutral" | "outline" | "positive" | "warning" | "danger" | "unknown";

// Interpretation bands (STD-SCR-001) → semantic treatment. Color is always paired with
// the band_label text, so collapsing some bands to the same hue is safe.
export const BAND_BADGE: Record<string, SemanticVariant> = {
  relatif_kuat: "positive",
  layak_dengan_catatan: "neutral",
  hati_hati: "warning",
  risiko_tinggi: "danger",
};

// Hex values (for the Google-Maps Circle / score ring, which need a literal color).
// Drawn from the semantic token set in index.css — no brand-green.
export const BAND_HEX: Record<string, string> = {
  relatif_kuat: "#318266", // semantic-positive
  layak_dengan_catatan: "#003d4f", // brand-teal (neutral, professional)
  hati_hati: "#d79a2b", // semantic-warning
  risiko_tinggi: "#c95746", // semantic-danger
};

export const BAND_FALLBACK_HEX = "#5c6c7a"; // semantic-unknown

export function bandHex(band: string | null): string {
  return (band && BAND_HEX[band]) || BAND_FALLBACK_HEX;
}

// Category sub-score → semantic hex (mini bars). Higher = stronger; never brand-green.
export function scoreHex(s: number | null): string {
  if (s === null) return BAND_FALLBACK_HEX;
  if (s >= 80) return "#318266"; // positive
  if (s >= 65) return "#003d4f"; // teal
  if (s >= 50) return "#d79a2b"; // warning
  return "#c95746"; // danger
}

export const CONFIDENCE: Record<Confidence, { label: string; variant: SemanticVariant }> = {
  data_kuat: { label: "Data kuat", variant: "neutral" },
  data_sedang: { label: "Data sedang", variant: "outline" },
  perlu_validasi: { label: "Perlu validasi", variant: "warning" },
};

export const CAT_LABEL: Record<string, string> = {
  banjir: "Banjir",
  commute: "Commute",
  akses: "Akses",
  fasilitas: "Fasilitas",
  lingkungan: "Lingkungan",
};
