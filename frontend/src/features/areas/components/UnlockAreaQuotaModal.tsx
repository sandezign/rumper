import { ShieldCheck, X, Check, ArrowRight, MapPin } from "lucide-react"
import type { CuratedArea } from "@/features/areas/data/mockCuratedAreas"

interface UnlockAreaQuotaModalProps {
  isOpen: boolean
  area: CuratedArea | null
  remainingQuota?: number
  totalQuota?: number
  onClose: () => void
  onConfirm: (area: CuratedArea) => void
}

export default function UnlockAreaQuotaModal({
  isOpen,
  area,
  remainingQuota = 3,
  totalQuota = 5,
  onClose,
  onConfirm,
}: UnlockAreaQuotaModalProps) {
  if (!isOpen || !area) return null

  // The hub intercepts a zero balance with the paywall before this modal opens, so the count
  // shown here is always the real one — never a floor invented to keep the flow moving.
  const quotaAfterUse = Math.max(0, remainingQuota - 1)

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#001E2B]/70 backdrop-blur-md animate-fadeIn select-none flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4"
      onClick={onClose}
    >
      {/* Responsive Bottom Sheet Drawer Container */}
      <div
        className="w-full max-h-[90dvh] md:max-w-lg bg-white rounded-t-[28px] md:rounded-3xl border border-[#E1E5E8] shadow-2xl overflow-hidden flex flex-col animate-slideUp text-[#001E2B]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-quota-title"
      >
        {/* Drawer Top Header with Emerald Accent & Grab Handle */}
        <div className="bg-[#001E2B] text-white p-5 pt-3 md:pt-5 flex flex-col relative overflow-hidden shrink-0 border-b border-white/10">
          {/* Mobile Bottom Sheet Grab Handle */}
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3 shrink-0 md:hidden" />

          {/* Subtle background glow circle */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-10 h-10 rounded-2xl bg-[#003D4F] flex items-center justify-center text-[#00ED64] border border-[#00ED64]/30 shadow-xs shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3
                  id="unlock-quota-title"
                  className="text-base sm:text-lg font-black tracking-tight text-white leading-tight"
                >
                  Buka Mini Check Rumah Ini?
                </h3>
                <p className="text-xs text-[#A8B3BC] mt-0.5 font-medium leading-normal">
                  Rumper bakal ngebuka riset mendalam 5 tahap lokasi ini di
                  Workspace.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal kuota"
              className="text-[#A8B3BC] hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer relative z-10 shrink-0 -mr-2 -mt-1 active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {/* Selected Area Summary Card */}
          <div className="bg-[#F4F7F8] rounded-2xl p-4 border border-[#E1E5E8] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  area.category === "strong-fit"
                    ? "bg-[#DCEEE7] text-[#004F38] border-[#318266]/30"
                    : area.category === "interesting-tradeoff"
                      ? "bg-[#FFF3D6] text-[#6E4E00] border-[#D4A017]/30"
                      : "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]"
                }`}
              >
                {area.categoryLabel}
              </span>
              <span className="text-xs text-[#5C6C7A] font-semibold flex items-center gap-1 shrink-0">
                <MapPin size={12} className="text-[#7C8C9A]" />
                {area.region}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-[#001E2B] leading-tight">
                {area.name}
              </h4>
            </div>

            {/* Quick 3 Metrics Pill Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E1E5E8] text-center">
              <div className="bg-white rounded-xl p-2 border border-[#E1E5E8] shadow-2xs">
                <div className="text-[10px] font-bold text-[#7C8C9A] uppercase tracking-wider truncate">
                  Komuter
                </div>
                <div className="text-xs font-black text-[#001E2B] mt-0.5 truncate">
                  {area.commuteTime}
                </div>
              </div>
              <div className="bg-white rounded-xl p-2 border border-[#E1E5E8] shadow-2xs">
                <div className="text-[10px] font-bold text-[#7C8C9A] uppercase tracking-wider truncate">
                  Elevasi
                </div>
                <div className="text-xs font-black text-[#00684A] mt-0.5 truncate">
                  {area.elevationDpl}
                </div>
              </div>
              <div className="bg-white rounded-xl p-2 border border-[#E1E5E8] shadow-2xs">
                <div className="text-[10px] font-bold text-[#7C8C9A] uppercase tracking-wider truncate">
                  Kisaran Harga
                </div>
                <div className="text-xs font-black text-[#001E2B] mt-0.5 truncate">
                  {area.priceRange}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Value Deliverables Unlocked */}
          <div className="space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-[#5C6C7A] block">
              Laporan Investigasi yang Bakal Kamu Buka:
            </span>
            <div className="space-y-2 text-xs font-semibold text-[#3D4F5B]">
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#DCEEE7] text-[#00684A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="leading-snug">
                  Analisis 5 Tahap Faktor Risiko Spasial & Elevasi Kontur (BIG & BNPB)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#DCEEE7] text-[#00684A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="leading-snug">
                  Simulasi Waktu Tempuh Jam Sibuk Pagi vs Sore (KRL & Tol)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#DCEEE7] text-[#00684A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="leading-snug">
                  12 Parameter Kritis Checklist Survei Lapangan & Pertanyaan Developer
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#DCEEE7] text-[#00684A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="leading-snug">
                  Verifikasi Fasilitas Esensial (RS, Sekolah, Pasar radius 1–3 km)
                </span>
              </div>
            </div>
          </div>

          {/* Quota Deduction Preview Indicator */}
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs font-semibold">
              <span className="text-[#5C6C7A]">Status Kuota Evaluasi:</span>
              <div className="flex items-center gap-1.5 font-bold shrink-0">
                <span className="text-[#001E2B]">
                  {remainingQuota} Kuota Tersisa
                </span>
                <ArrowRight size={12} className="text-[#7C8C9A]" />
                <span className="text-[#00684A]">
                  {quotaAfterUse} dari {totalQuota}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#7C8C9A] leading-normal text-center">
              Laporan evaluasi tersimpan permanen di akun kamu dan dapat diakses kembali kapan pun tanpa kuota ulang.
            </p>
          </div>
        </div>

        {/* Sticky Drawer Action Footer */}
        <div className="p-4 sm:p-5 pt-3 bg-white flex items-center justify-between gap-3 border-t border-[#F0F4F6] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-full border border-[#D7E1E5] text-xs font-bold text-[#5C6C7A] hover:text-[#001E2B] hover:bg-[#F4F7F6] transition-all cursor-pointer active:scale-95 shrink-0"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => onConfirm(area)}
            className="min-h-[44px] flex-1 px-4 sm:px-6 py-2.5 rounded-full bg-[#00ED64] hover:bg-[#00D95A] text-[#001E2B] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Gunakan 1 Kuota & Lanjutkan</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
