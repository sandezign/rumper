import {
  X,
  MapPin,
  Train,
  Building2,
  Check,
  ArrowRight,
  Hospital,
  GraduationCap,
  Store,
  Compass,
  Scale,
  Clock,
  Coins,
  Mountain,
} from "lucide-react"
import type { CuratedArea } from "@/features/areas/data/mockCuratedAreas"
import { FALLBACK_AREA_IMAGES } from "./CuratedAreaCard"
import { streetViewThumb } from "../streetview"

interface AreaDetailDrawerProps {
  isOpen: boolean
  area: CuratedArea | null
  onClose: () => void
  onSelectForEvaluation: (area: CuratedArea) => void
}

export default function AreaDetailDrawer({
  isOpen,
  area,
  onClose,
  onSelectForEvaluation,
}: AreaDetailDrawerProps) {
  if (!isOpen || !area) return null

  const svPhoto = streetViewThumb(area.latLng, "banner")
  const heroPhoto = svPhoto || FALLBACK_AREA_IMAGES[area.id] || null

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#001E2B]/60 backdrop-blur-sm animate-fadeIn select-none flex flex-col justify-end md:justify-center md:items-end p-0 md:p-6"
      onClick={onClose}
    >
      {/* Responsive Bottom Sheet Container (Mobile: Slides up from bottom | Desktop: Right side / floating drawer) */}
      <div
        className="w-full max-h-[88dvh] md:max-h-[92dvh] md:w-[480px] bg-white rounded-t-[28px] md:rounded-3xl border border-[#E1E5E8] shadow-2xl flex flex-col justify-between text-[#001E2B] animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="area-detail-title"
      >
        {/* Drawer Header (Deep Teal with Emerald Glow & Mobile Bottom Sheet Handle) */}
        <div className="p-5 pt-3 md:pt-5 bg-[#001E2B] text-white flex flex-col relative overflow-hidden shrink-0 border-b border-white/10">
          {/* Mobile Bottom Sheet Grab Handle */}
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3 shrink-0 md:hidden" />

          <div className="flex items-start justify-between">
            {/* Subtle background glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00ED64]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-1.5 pr-4 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    area.category === "strong-fit"
                      ? "bg-[#003D4F] text-[#00ED64] border-[#00ED64]/30"
                      : area.category === "interesting-tradeoff"
                        ? "bg-[#FFF3D6] text-[#6E4E00] border-[#D4A017]/30"
                        : "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]"
                  }`}
                >
                  {area.categoryLabel}
                </span>
                <span className="text-xs text-[#A8B3BC] font-semibold flex items-center gap-1">
                  <MapPin size={12} className="text-[#00ED64]" />
                  {area.region}
                </span>
              </div>
              <h2
                id="area-detail-title"
                className="text-xl font-black tracking-tight text-white leading-tight"
              >
                {area.name}
              </h2>
              <p className="text-xs text-[#A8B3BC] leading-relaxed line-clamp-2 sm:line-clamp-none">
                {area.summaryNarrative}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail area"
              className="text-[#A8B3BC] hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer relative z-10 shrink-0 -mr-2 -mt-1 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {/* Hero Image Banner (Matches Image 4) */}
          {heroPhoto && (
            <div className="relative h-[170px] sm:h-[190px] w-full overflow-hidden rounded-2xl bg-[#0F2B38] shadow-inner">
              <img
                src={heroPhoto}
                alt={`Kawasan ${area.name}`}
                className="size-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-white">
                <span className="flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white/95 border border-white/20">
                  <MapPin size={12} className="text-[#00ED64]" />
                  {area.region}
                </span>
                <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white/95 border border-white/20">
                  Citra Centroid Terverifikasi
                </span>
              </div>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-center gap-1">
                <Clock size={11} className="text-[#94A3B8]" />
                Komuter
              </span>
              <span className="text-xs sm:text-sm font-black text-[#1E293B] mt-0.5 block truncate">
                {area.commuteTime}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">
                ke Sudirman
              </span>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-center gap-1">
                <Mountain size={11} className="text-[#00684A]" />
                Elevasi
              </span>
              <span className="text-xs sm:text-sm font-black text-[#00684A] mt-0.5 block truncate">
                {area.elevationDpl}
              </span>
              <span className="text-[10px] text-[#00684A] font-bold">
                {area.elevationScore}
              </span>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-center gap-1">
                <Coins size={11} className="text-[#94A3B8]" />
                Kisaran Harga
              </span>
              <span className="text-xs sm:text-sm font-black text-[#1E293B] mt-0.5 block truncate">
                {area.priceRange}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium truncate">
                Tipe 2 Lantai
              </span>
            </div>
          </div>

          {/* Callout Boxes: Kelebihan & Pertimbangan (Matches Image 4) */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803D]">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-2xs">
                  <Check size={10} className="stroke-[3]" />
                </span>
                <span>Kelebihan:</span>
              </div>
              <p className="text-xs text-[#14532D] leading-relaxed font-normal pl-5">
                {area.cocokReason}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FEF3C7] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309]">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-white shadow-2xs">
                  <Scale size={10} className="stroke-[2.5]" />
                </span>
                <span>Pertimbangan:</span>
              </div>
              <p className="text-xs text-[#78350F] leading-relaxed font-normal pl-5">
                {area.tradeoffReason}
              </p>
            </div>
          </div>

          {/* 1. Akses Transit & Mobilitas */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#001E2B]">
              <Train size={15} className="text-[#00684A] shrink-0" />
              <span>1. Mobilitas & Akses Transit Riil</span>
            </div>
            <div className="space-y-2">
              {area.transitOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#F4F7F8] border border-[#E1E5E8] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#001E2B] block truncate">
                      {opt.label}
                    </span>
                    <span className="text-[#5C6C7A] text-[11px] font-medium block truncate">
                      {opt.interval}
                    </span>
                  </div>
                  <span className="font-bold text-[#00684A] bg-white px-2.5 py-1 rounded-lg border border-[#E1E5E8] shadow-2xs shrink-0 whitespace-nowrap">
                    {opt.distance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Fasilitas Esensial Radius 1–3 km */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#001E2B]">
              <Building2 size={15} className="text-[#00684A] shrink-0" />
              <span>2. Fasilitas Esensial Sekitar</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#F4F7F8] border border-[#E1E5E8] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5C6C7A]">
                  <Hospital size={12} className="text-[#DC2626] shrink-0" />
                  <span>Rumah Sakit:</span>
                </div>
                <span className="font-bold text-[#001E2B] block leading-tight truncate">
                  {area.essentialFacilities.hospital}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F4F7F8] border border-[#E1E5E8] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5C6C7A]">
                  <GraduationCap
                    size={12}
                    className="text-[#7C3AED] shrink-0"
                  />
                  <span>Pendidikan:</span>
                </div>
                <span className="font-bold text-[#001E2B] block leading-tight truncate">
                  {area.essentialFacilities.school}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F4F7F8] border border-[#E1E5E8] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5C6C7A]">
                  <Store size={12} className="text-[#0891B2] shrink-0" />
                  <span>Belanja / Pasar:</span>
                </div>
                <span className="font-bold text-[#001E2B] block leading-tight truncate">
                  {area.essentialFacilities.market}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F4F7F8] border border-[#E1E5E8] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5C6C7A]">
                  <Compass size={12} className="text-[#16A34A] shrink-0" />
                  <span>Jarak Stasiun:</span>
                </div>
                <span className="font-bold text-[#00684A] block leading-tight truncate">
                  {area.essentialFacilities.transitKm}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Sheet Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E1E5E8] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-full border border-[#D7E1E5] text-xs font-bold text-[#5C6C7A] hover:text-[#001E2B] hover:bg-[#F4F7F6] transition-all cursor-pointer active:scale-95 shrink-0"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onSelectForEvaluation(area)
            }}
            className="min-h-[44px] flex-1 py-2.5 px-4 sm:px-6 rounded-full bg-[#00ED64] hover:bg-[#00D95A] text-[#001E2B] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Evaluasi Rumah di Area Ini</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
