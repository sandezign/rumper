import { MapPin, Sparkles, X } from "lucide-react";

interface RecalibrateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation modal when user clicks "Ubah Lokasi" in the top bar (Matches Image 3) */
export default function RecalibrateLocationModal({
  isOpen,
  onClose,
  onConfirm,
}: RecalibrateLocationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#001E2B]/70 backdrop-blur-md animate-fadeIn select-none flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90dvh] sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl border border-[#E1E5E8] shadow-2xl overflow-hidden flex flex-col animate-slideUp text-[#001E2B]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recalibrate-modal-title"
      >
        {/* Header with Dark Teal and Emerald Pin */}
        <div className="bg-[#001E2B] text-white p-5 pt-4 sm:pt-5 flex flex-col relative overflow-hidden shrink-0 border-b border-white/10">
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3 shrink-0 sm:hidden" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3 pr-2">
              <div className="size-10 rounded-2xl bg-[#003D4F] flex items-center justify-center text-[#00ED64] border border-[#00ED64]/30 shadow-xs shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3
                  id="recalibrate-modal-title"
                  className="text-base sm:text-lg font-black tracking-tight text-white leading-tight"
                >
                  Ubah Lokasi Pencarian?
                </h3>
                <p className="text-xs text-[#A8B3BC] mt-0.5 font-medium leading-normal">
                  Kalibrasi ulang preferensi hunian
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="text-[#A8B3BC] hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer relative z-10 shrink-0 -mr-2 -mt-1 active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <p className="text-[#475569] font-normal leading-relaxed text-xs sm:text-[13px]">
            Kamu akan kembali ke langkah penentuan preferensi untuk menyesuaikan kriteria hunian, titik kantor/aktivitas, atau rentang budget.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-start gap-2.5 text-xs text-[#166534] font-medium leading-relaxed">
            <Sparkles size={16} className="text-[#16A34A] shrink-0 mt-0.5" />
            <span>
              Peta rekomendasi wilayah akan dikalibrasi ulang otomatis setelah kamu selesai mengubah preferensi.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 pt-3 bg-white flex items-center justify-end gap-3 border-t border-[#F0F4F6] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-5 py-2.5 rounded-full border border-[#D7E1E5] text-xs font-bold text-[#5C6C7A] hover:text-[#001E2B] hover:bg-[#F4F7F6] transition-all cursor-pointer active:scale-95"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[42px] px-5 py-2.5 rounded-full bg-[#00ED64] hover:bg-[#00D95A] text-[#001E2B] font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <MapPin size={14} />
            <span>Ya, Ubah Lokasi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
