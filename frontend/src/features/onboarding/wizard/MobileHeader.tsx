import { ArrowLeft } from "lucide-react"

interface MobileHeaderProps {
  flowStage: number
  parameterStep: number
  currentStep: number
  totalSteps?: number
  onBack: () => void
}

export default function MobileHeader({
  flowStage,
  parameterStep,
  currentStep,
  totalSteps = 9,
  onBack,
}: MobileHeaderProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)

  const getStageLabel = () => {
    if (flowStage === 1) return "Langkah 1 · Kendala"
    if (flowStage === 2) return "Langkah 2 · Pengantar"
    if (flowStage >= 3 && flowStage <= 5)
      return `Langkah 2 · Skenario ${flowStage - 2}/3`
    return `Langkah 3 · Profil ${parameterStep}/4`
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#D7E1E5] px-4 py-3 flex flex-col gap-2 shadow-xs md:hidden">
      <div className="flex items-center justify-between">
        {/* Circular Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={flowStage === 1}
          aria-label="Kembali"
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
            flowStage === 1
              ? "opacity-40 cursor-not-allowed border-[#E1E5E8] bg-[#F4F7F6] text-[#7C8C9A]"
              : "border-[#D7E1E5] bg-white text-[#3D4F5B] hover:bg-[#F4F7F6] active:scale-95"
          }`}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Step Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#004F38] bg-[#DCEEE7] px-3 py-1 rounded-full border border-[#318266]/30">
            {getStageLabel()}
          </span>
          <span className="text-xs font-semibold text-[#5C6C7A]">
            {percentage}% Selesai
          </span>
        </div>
      </div>

      {/* Thin animated progress track */}
      <div className="w-full h-1.5 bg-[#E1E5E8] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#00ED64] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </header>
  )
}
