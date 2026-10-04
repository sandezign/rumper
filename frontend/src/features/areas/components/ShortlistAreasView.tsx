import {
  Bookmark,
  Trash2,
  Scale,
  ArrowRight,
  MapPin,
  CheckSquare,
  Square,
  Clock,
  Coins,
  Mountain,
} from "lucide-react"
import type { CuratedArea } from "@/features/areas/data/mockCuratedAreas"

interface ShortlistAreasViewProps {
  shortlistedAreas: CuratedArea[]
  selectedForComparison: string[]
  onToggleComparison: (id: string) => void
  onRemoveFromShortlist: (id: string) => void
  onOpenDrawer: (area: CuratedArea) => void
  onEvaluateArea: (area: CuratedArea) => void
  onOpenComparisonModal: () => void
  onBackToMap: () => void
}

export default function ShortlistAreasView({
  shortlistedAreas,
  selectedForComparison,
  onToggleComparison,
  onRemoveFromShortlist,
  onOpenDrawer,
  onEvaluateArea,
  onOpenComparisonModal,
  onBackToMap,
}: ShortlistAreasViewProps) {
  const strongFitCount = shortlistedAreas.filter(
    (a) => a.category === "strong-fit",
  ).length
  const tradeoffCount = shortlistedAreas.filter(
    (a) => a.category === "interesting-tradeoff",
  ).length

  if (shortlistedAreas.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#E1E5E8] text-[#5C6C7A] space-y-4 max-w-lg mx-auto shadow-xs animate-fadeIn">
        <div className="w-14 h-14 rounded-3xl bg-[#F4F7F8] text-[#7C8C9A] flex items-center justify-center mx-auto border border-[#E1E5E8]">
          <Bookmark size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-[#001E2B] tracking-tight">
            Daftar Pilihanmu Masih Kosong
          </h3>
          <p className="text-xs text-[#5C6C7A] leading-relaxed">
            Simpan koridor incaranmu dari peta atau daftar kartu dengan klik
            ikon bookmark biar gampang bandingin trade-off nyatanya.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToMap}
          className="px-6 py-2.5 rounded-full bg-[#001E2B] text-white text-xs font-bold hover:bg-[#003D4F] transition-all shadow-sm cursor-pointer"
        >
          Eksplorasi Peta 8 Koridor
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-28 select-none">
      {/* Top Summary Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E5E8] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-black text-[#001E2B] tracking-tight">
            Daftar Area Pilihanmu (Shortlist)
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold bg-[#F4F7F8] px-3.5 py-1.5 rounded-full border border-[#E1E5E8]">
            <span className="text-[#00684A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00B545]" />
              {strongFitCount} Kesesuaian Kuat
            </span>
            <span className="text-[#A8B3BC]">•</span>
            <span className="text-[#B37400] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
              {tradeoffCount} Kompromi Menarik
            </span>
          </div>
        </div>
        <p className="text-xs text-[#5C6C7A] leading-relaxed">
          Koleksi area yang kamu simpan buat bandingin kompromi nyata, rencanain
          survei lapangan, atau mulai cek unit rumah incaranmu.
        </p>
      </div>

      {/* Shortlist Items Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {shortlistedAreas.map((area) => {
          const isSelected = selectedForComparison.includes(area.id)
          const isStrongFit = area.category === "strong-fit"
          const isTradeoff = area.category === "interesting-tradeoff"
          const dotColor = isStrongFit
            ? "bg-[#00B545]"
            : isTradeoff
              ? "bg-[#D4A017]"
              : "bg-[#D9383A]"

          return (
            <div
              key={area.id}
              className={`bg-white rounded-3xl p-6 border-2 transition-all duration-200 shadow-xs space-y-4 ${
                isSelected
                  ? "border-[#001E2B] ring-2 ring-[#001E2B]/5 shadow-md bg-[#FBFDFC]"
                  : "border-[#E1E5E8] hover:border-[#A8B8C6]"
              }`}
            >
              {/* Row 1: Category Tag + Top Actions (Compare, Trash, Detail) */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      isStrongFit
                        ? "bg-[#DCEEE7] text-[#004F38] border-[#318266]/30"
                        : isTradeoff
                          ? "bg-[#FFF3D6] text-[#6E4E00] border-[#D4A017]/30"
                          : "bg-[#FFE2E0] text-[#7A1D1A] border-[#D9383A]/30"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
                    />
                    <span>{area.categoryLabel}</span>
                  </span>
                  <span className="text-xs text-[#5C6C7A] font-semibold hidden sm:inline-flex items-center gap-1">
                    <MapPin size={12} className="text-[#7C8C9A]" />
                    {area.region}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Compare Toggle Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleComparison(area.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#001E2B] text-white border-[#001E2B] shadow-xs"
                        : "bg-[#F4F7F8] text-[#5C6C7A] border-[#E1E5E8] hover:bg-[#EAEFEF]"
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare size={13} className="text-[#00ED64]" />
                    ) : (
                      <Square size={13} />
                    )}
                    <span>Bandingkan</span>
                  </button>

                  {/* Remove from Shortlist */}
                  <button
                    type="button"
                    onClick={() => onRemoveFromShortlist(area.id)}
                    title="Hapus dari Shortlist"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#7C8C9A] hover:text-[#D9383A] hover:bg-[#FFE2E0]/50 border border-[#E1E5E8] transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Title & Narrative */}
              <div>
                <h3 className="text-lg md:text-xl font-black text-[#001E2B] tracking-tight">
                  {area.name}
                </h3>
                <p className="text-xs text-[#5C6C7A] mt-1 leading-relaxed">
                  {area.summaryNarrative}
                </p>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F4F7F8] p-2.5 rounded-2xl border border-[#E1E5E8]">
                  <span className="text-[10px] font-bold text-[#7C8C9A] uppercase tracking-wider flex items-center justify-center gap-1">
                    <Clock size={11} />
                    Komuter
                  </span>
                  <span className="text-xs md:text-sm font-black text-[#001E2B] mt-0.5 block">
                    {area.commuteTime}
                  </span>
                </div>
                <div className="bg-[#F4F7F8] p-2.5 rounded-2xl border border-[#E1E5E8]">
                  <span className="text-[10px] font-bold text-[#7C8C9A] uppercase tracking-wider flex items-center justify-center gap-1">
                    <Coins size={11} />
                    Kisaran Harga
                  </span>
                  <span className="text-xs md:text-sm font-black text-[#001E2B] mt-0.5 block truncate">
                    {area.priceRange}
                  </span>
                </div>
                <div className="bg-[#F4F7F8] p-2.5 rounded-2xl border border-[#E1E5E8]">
                  <span className="text-[10px] font-bold text-[#7C8C9A] uppercase tracking-wider flex items-center justify-center gap-1">
                    <Mountain size={11} />
                    Elevasi
                  </span>
                  <span className="text-xs md:text-sm font-black text-[#00684A] mt-0.5 block">
                    {area.elevationDpl}
                  </span>
                </div>
              </div>

              {/* Trade-off Callout */}
              <div className="p-3.5 rounded-2xl bg-[#FFF9E6] border border-[#D4A017]/30 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#6E4E00] mb-0.5">
                  <Scale size={13} className="text-[#B37400]" />
                  <span>Kompromi Nyata:</span>
                </div>
                <p className="text-[#523A00] font-medium leading-relaxed pl-4">
                  {area.tradeoffReason}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#F0F4F6]">
                <button
                  type="button"
                  onClick={() => onOpenDrawer(area)}
                  className="px-4 py-2.5 rounded-full border border-[#D7E1E5] text-xs font-bold text-[#5C6C7A] hover:text-[#001E2B] hover:bg-[#F4F7F6] transition-all cursor-pointer"
                >
                  Detail Koridor
                </button>

                <button
                  type="button"
                  onClick={() => onEvaluateArea(area)}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <span>Evaluasi Rumah Ini</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating Bottom Comparison Dock (When 2+ items selected) */}
      {selectedForComparison.length >= 2 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 sm:left-auto z-40 bg-[#001E2B] text-white p-4 rounded-3xl shadow-2xl border border-white/20 flex items-center gap-4 animate-slideUp">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00ED64] text-[#001E2B] flex items-center justify-center font-black text-xs">
              {selectedForComparison.length}
            </div>
            <span className="text-xs font-bold">Area Siap Dibandingkan</span>
          </div>

          <button
            type="button"
            onClick={onOpenComparisonModal}
            className="px-5 py-2.5 rounded-full bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Scale size={14} />
            <span>Buka Matriks Perbandingan</span>
          </button>
        </div>
      )}
    </div>
  )
}
