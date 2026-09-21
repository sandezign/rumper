import { useState } from "react";
import { ArrowRight, Bookmark, Check, Clock, ImageIcon, MapPin, Mountain, Scale } from "lucide-react";
import type { CuratedArea } from "@/features/areas/data/mockCuratedAreas";
import { streetViewThumb } from "@/features/areas/streetview";

const NOT_AVAILABLE = "Belum tersedia";
const has = (v: string | undefined) => Boolean(v) && v !== NOT_AVAILABLE;

const DOT: Record<CuratedArea["category"], string> = {
  "strong-fit": "bg-[#34C759]",
  "interesting-tradeoff": "bg-[#FF9F0A]",
  "challenge-assumptions": "bg-[#64748B]",
};

const SHORT_LABEL: Record<CuratedArea["category"], string> = {
  "strong-fit": "Sesuai",
  "interesting-tradeoff": "Moderate",
  "challenge-assumptions": "Alternatif",
};

/** Curated architectural photographs matching the design mockups as authentic fallback */
export const FALLBACK_AREA_IMAGES: Record<string, string> = {
  "area-bintaro": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "area-serpong": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "area-sawangan": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "area-margonda": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "area-pamulang": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  "area-cibubur": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  "area-bekasi": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
  "area-cikarang": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
};

/** One curated corridor, in two shapes: `grid` for the list view and `carousel` for the
 *  peek cards docked over the map. */
export default function CuratedAreaCard({
  area, isSelected = false, variant = "grid", reportReady = false, busy = false,
  onSelect, onToggleBookmark, onOpenDrawer, onEvaluate,
}: {
  area: CuratedArea;
  isSelected?: boolean;
  variant?: "grid" | "carousel";
  /** An audit already exists for this corridor — the CTA opens it instead of spending quota. */
  reportReady?: boolean;
  busy?: boolean;
  onSelect?: () => void;
  onToggleBookmark: (id: string) => void;
  onOpenDrawer: (area: CuratedArea) => void;
  onEvaluate: (area: CuratedArea) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const svPhoto = streetViewThumb(area.latLng, variant === "carousel" ? "square" : "banner");
  const photo = svPhoto || FALLBACK_AREA_IMAGES[area.id] || null;
  const hasElevation = has(area.elevationDpl);
  const hasCommute = has(area.commuteTime);
  const hasPrice = area.priceMax > 0 && has(area.priceRange);
  const ctaLabel = busy ? "Menyiapkan…" : reportReady ? "Buka Laporan" : "Evaluasi Rumah";

  const bookmarkLabel = area.isShortlisted
    ? `Hapus ${area.name} dari shortlist`
    : `Simpan ${area.name} ke shortlist`;

  const photoEl = (rounded: string) => (
    <div className={`relative overflow-hidden bg-[#0F2B38] ${rounded}`}>
      {photo && !failed ? (
        <img
          src={photo}
          alt={`Citra kawasan ${area.name}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-[#0F2B38] text-[#8E8E93]">
          <ImageIcon size={variant === "carousel" ? 22 : 28} className="text-[#34C759]" />
          {variant === "grid" && (
            <span className="text-[11px] font-semibold text-white/80">Citra kawasan</span>
          )}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />
    </div>
  );

  // ── carousel: docked peek card over the map ───────────────────────────────────────────
  if (variant === "carousel") {
    return (
      <div
        onClick={onSelect}
        className={`group flex w-[88vw] max-w-[390px] shrink-0 snap-center cursor-pointer select-none flex-row items-center gap-3.5 rounded-[24px] border p-3 transition-all duration-200 sm:max-w-[420px] sm:p-3.5 ${
          isSelected
            ? "scale-100 border-[#001E2B] bg-white/98 shadow-[0_12px_32px_rgba(0,30,43,0.18)] ring-2 ring-[#001E2B]/10 backdrop-blur-2xl"
            : "scale-[0.985] border-[#E5E5EA] bg-white/94 opacity-95 shadow-[0_4px_18px_rgba(0,0,0,0.06)] backdrop-blur-xl hover:border-[#C7C7CC] hover:opacity-100 active:scale-[0.97]"
        }`}
      >
        <div className="relative size-[90px] shrink-0 sm:size-[98px]">
          {photoEl("size-full rounded-[18px] shadow-xs")}
          <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-1.5 py-0.5 backdrop-blur-md">
            <span className={`size-1.5 shrink-0 rounded-full ${DOT[area.category]}`} />
            <span className="max-w-[50px] truncate text-[9px] font-semibold text-white/90">
              {SHORT_LABEL[area.category]}
            </span>
          </div>
          {hasElevation && (
            <div className="pointer-events-none absolute inset-x-2 bottom-1.5 text-center">
              <span className="rounded-full border border-white/10 bg-black/40 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white/90 backdrop-blur-xs">
                {area.elevationDpl}
              </span>
            </div>
          )}
        </div>

        <div className="flex h-[90px] min-w-0 flex-1 flex-col justify-between py-0.5 sm:h-[98px]">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <h3 title={area.name}
                  className="truncate text-sm font-bold leading-tight tracking-tight text-[#1C1C1E] sm:text-base">
                {area.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-[#8E8E93]">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{area.region}</span>
              </p>
            </div>
            <button type="button" aria-label={bookmarkLabel} title={area.isShortlisted ? "Tersimpan" : "Simpan"}
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(area.id); }}
                    className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-150 active:scale-90 ${
                      area.isShortlisted ? "bg-[#001E2B] text-[#00ED64]" : "bg-[#F2F2F7] text-[#636366] hover:bg-[#E5E5EA]"
                    }`}>
              <Bookmark size={12} className={area.isShortlisted ? "fill-[#00ED64]" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {hasCommute && (
              <span className="flex shrink-0 items-center gap-1 text-[11px] text-[#636366]">
                <Clock size={11} className="text-[#8E8E93]" />
                <span className="font-medium">{area.commuteTime}</span>
              </span>
            )}
            {reportReady && (
              <span className="rounded bg-[#001E2B] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#00ED64]">
                Laporan siap
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button type="button" onClick={(e) => { e.stopPropagation(); onOpenDrawer(area); }}
                    className="min-h-[28px] cursor-pointer whitespace-nowrap rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[11px] font-semibold text-[#1C1C1E] transition-all duration-150 hover:bg-[#E5E5EA] active:scale-95">
              Detail
            </button>
            <button type="button" disabled={busy} onClick={(e) => { e.stopPropagation(); onEvaluate(area); }}
                    className="flex min-h-[28px] flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#001E2B] px-3 py-1 text-[11px] font-bold text-white shadow-2xs transition-all duration-150 hover:bg-[#0F2B38] active:scale-95 disabled:opacity-60">
              <span>{busy ? "Menyiapkan…" : reportReady ? "Buka" : "Evaluasi"}</span>
              <ArrowRight size={11} className="shrink-0 text-[#00ED64]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── grid: the full card in the list view (matches Image 1) ────────────────────────────
  return (
    <div
      onClick={onSelect}
      className={`group flex select-none flex-col justify-between space-y-3.5 rounded-[26px] border bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_28px_rgba(0,30,43,0.08)] active:scale-[0.99] sm:p-5 ${
        isSelected
          ? "border-[#001E2B] bg-[#FCFDFD] shadow-[0_8px_24px_rgba(0,30,43,0.12)] ring-2 ring-[#001E2B]/10"
          : "border-[#E5E5EA] hover:border-[#CBD5E1]"
      }`}
    >
      <div className="space-y-3">
        {/* Photo Banner with Glassmorphic Overlays */}
        <div className="relative h-[155px] w-full sm:h-[170px]">
          {photoEl("size-full rounded-[20px] shadow-inner")}

          {/* Top Overlays */}
          <div className="pointer-events-auto absolute inset-x-2.5 top-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10.5px] font-bold text-white shadow-xs backdrop-blur-md">
              <span className={`size-1.5 shrink-0 rounded-full shadow-xs ${DOT[area.category]}`} />
              <span className="truncate tracking-tight">{area.categoryLabel}</span>
            </span>

            <button type="button" aria-label={bookmarkLabel}
                    title={area.isShortlisted ? "Tersimpan di shortlist" : "Simpan area ke shortlist"}
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(area.id); }}
                    className={`flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-all duration-150 active:scale-90 ${
                      area.isShortlisted
                        ? "border-white bg-white text-[#001E2B] shadow-md"
                        : "border-white/25 bg-black/40 text-white/90 shadow-xs hover:border-white hover:bg-white hover:text-[#001E2B]"
                    }`}>
              <Bookmark size={14} className={area.isShortlisted ? "fill-[#001E2B]" : ""} />
            </button>
          </div>

          {/* Bottom Overlays */}
          <div className="pointer-events-none absolute inset-x-3 bottom-2.5 flex items-center justify-between text-white">
            <span className="flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-white drop-shadow-sm">
              <MapPin size={12} className="shrink-0 text-[#00ED64]" />
              <span className="truncate">{area.region}</span>
            </span>
            {hasElevation && (
              <span className="shrink-0 rounded-full border border-white/20 bg-black/45 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white/95 backdrop-blur-md">
                {area.elevationDpl}
              </span>
            )}
          </div>
        </div>

        {/* Title & Report Ready Tag */}
        <div className="flex items-start justify-between gap-2 pt-0.5">
          <h3 title={area.name}
              className="text-base font-black leading-snug tracking-tight text-[#1C1C1E] [text-wrap:balance] sm:text-lg">
            {area.name}
          </h3>
          {reportReady && (
            <span className="mt-1 shrink-0 rounded bg-[#001E2B] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#00ED64]">
              Laporan siap
            </span>
          )}
        </div>

        {/* Price and Commuter/Elevation Container */}
        <div className="space-y-2 rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          {hasPrice ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-black tabular-nums tracking-tight text-[#1C1C1E] sm:text-lg">
                {area.priceRange}
              </span>
              <span className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10.5px] font-bold text-[#64748B] shadow-2xs">
                Estimasi
              </span>
            </div>
          ) : (
            <p className="text-[11px] font-medium text-[#8E8E93]">
              Rentang harga belum tersedia — Rumper tidak memakai data listing fiktif.
            </p>
          )}

          <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-xs text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="shrink-0 text-[#94A3B8]" />
              <span className="font-bold tabular-nums text-[#1E293B]">
                {hasCommute ? area.commuteTime : "—"}
              </span>
              <span className="text-[11px] text-[#64748B]">ke Sudirman</span>
            </span>

            <span className="h-3 w-px bg-[#CBD5E1]" />

            <span className="flex items-center gap-1.5">
              <Mountain size={12} className="shrink-0 text-[#00684A]" />
              <span className="font-bold tabular-nums text-[#1E293B]">
                {hasElevation ? area.elevationDpl : "—"}
              </span>
              <span className={`text-[11px] font-semibold ${
                area.elevationScore === "Aman" ? "text-[#00684A]" : "text-[#B45309]"
              }`}>
                ({area.elevationScore})
              </span>
            </span>
          </div>
        </div>

        {/* Kelebihan & Pertimbangan Boxes */}
        <div className="space-y-2 text-xs">
          {has(area.cocokReason) && (
            <div className="rounded-[16px] border border-[#DCFCE7] bg-[#F0FDF4] p-3 text-[#166534]">
              <div className="mb-1 flex items-center gap-1.5 font-bold text-[#15803D]">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-2xs">
                  <Check size={10} className="stroke-[3]" />
                </span>
                <span className="text-[11.5px]">Kelebihan:</span>
              </div>
              <p className="pl-[1.375rem] text-[11.5px] font-normal leading-relaxed text-[#14532D] [text-wrap:pretty]">
                {area.cocokReason}
              </p>
            </div>
          )}

          {has(area.tradeoffReason) && (
            <div className="rounded-[16px] border border-[#FEF3C7] bg-[#FFFBEB] p-3 text-[#92400E]">
              <div className="mb-1 flex items-center gap-1.5 font-bold text-[#B45309]">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-white shadow-2xs">
                  <Scale size={10} className="stroke-[2.5]" />
                </span>
                <span className="text-[11.5px]">Pertimbangan:</span>
              </div>
              <p className="pl-[1.375rem] text-[11.5px] font-normal leading-relaxed text-[#78350F] [text-wrap:pretty]">
                {area.tradeoffReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#F1F5F9] pt-3">
        <button type="button" onClick={(e) => { e.stopPropagation(); onOpenDrawer(area); }}
                className="min-h-[42px] cursor-pointer whitespace-nowrap rounded-full bg-[#F1F5F9] px-4 py-2 text-xs font-bold text-[#334155] transition-all duration-150 hover:bg-[#E2E8F0] active:scale-95">
          Detail Area
        </button>
        <button type="button" disabled={busy} onClick={(e) => { e.stopPropagation(); onEvaluate(area); }}
                className="flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#001E2B] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-[#0F2B38] active:scale-95 disabled:opacity-60">
          <span>{ctaLabel}</span>
          <ArrowRight size={13} className="shrink-0 text-[#00ED64]" />
        </button>
      </div>
    </div>
  );
}
