import { ArrowRight, Check } from "lucide-react"

interface MobileStickyFooterProps {
  flowStage: number
  parameterStep: number
  onNext: () => void
  onSkip?: () => void
  isSubmitting?: boolean
}

export default function MobileStickyFooter({
  flowStage,
  parameterStep,
  onNext,
  onSkip,
  isSubmitting = false,
}: MobileStickyFooterProps) {
  const isFinalStep = flowStage === 6 && parameterStep === 4

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#D7E1E5] p-4 pb-safe shadow-lg md:hidden">
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="w-full h-14 rounded-full font-bold text-base flex items-center justify-center gap-2 bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] shadow-md transition-all active:scale-[0.98] ring-4 ring-[#00ED64]/20 cursor-pointer"
      >
        {isFinalStep ? (
          <>
            <Check size={20} className="stroke-[2.5] text-[#001E2B]" />
            <span>Simpan & Mulai Riset Lokasi</span>
          </>
        ) : flowStage === 1 ? (
          <>
            <span>Lanjut ke Pengantar Skenario</span>
            <ArrowRight size={20} className="text-[#001E2B]" />
          </>
        ) : flowStage === 2 ? (
          <>
            <span>Mulai Coba (2 menit)</span>
            <ArrowRight size={20} className="text-[#001E2B]" />
          </>
        ) : flowStage >= 3 && flowStage <= 5 ? (
          <>
            <span>
              {flowStage === 5
                ? "Lanjut ke Detail Profil"
                : "Skenario Berikutnya"}
            </span>
            <ArrowRight size={20} className="text-[#001E2B]" />
          </>
        ) : (
          <>
            <span>Langkah Berikutnya</span>
            <ArrowRight size={20} className="text-[#001E2B]" />
          </>
        )}
      </button>

      {flowStage === 2 && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-2.5 text-xs font-semibold text-[#7C8C9A] hover:text-[#001E2B] transition-colors underline text-center w-full py-1 cursor-pointer"
        >
          Lewati langsung ke pengaturan budget
        </button>
      )}
    </div>
  )
}
