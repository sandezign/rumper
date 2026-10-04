import { useState, useEffect } from "react"
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Database,
} from "lucide-react"

interface LocationDataLoadingScreenProps {
  onComplete: () => void
  userFriction?: string
}

const SCANNING_STEPS = [
  {
    progressThreshold: 25,
    title: "Narik data batas wilayah & peta spasial resmi",
    source: "Badan Informasi Geospasial (BIG)",
    icon: MapPin,
  },
  {
    progressThreshold: 60,
    title: "Nyisir kontur elevasi tanah & riwayat genangan 10 tahun",
    source: "BNPB & Kementerian PUPR",
    icon: ShieldCheck,
  },
  {
    progressThreshold: 85,
    title: "Ngitung estimasi rute komuter riil jam sibuk pagi/sore",
    source: "Kementerian Perhubungan & KAI Commuter",
    icon: Database,
  },
  {
    progressThreshold: 100,
    title:
      "Ngeracik rekomendasi koridor Jabodetabek biar kamu gak beli kucing dalam karung",
    source: "Rumper Evidence Engine",
    icon: Sparkles,
  },
]

export default function LocationDataLoadingScreen({
  onComplete,
  userFriction,
}: LocationDataLoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 400)
          return 100
        }
        // Smooth non-linear increment
        const increment = prev < 30 ? 4 : prev < 70 ? 3 : 5
        return Math.min(100, prev + increment)
      })
    }, 85)

    return () => clearInterval(interval)
  }, [onComplete])

  // Determine current active step
  const currentStep =
    SCANNING_STEPS.find((s) => progress <= s.progressThreshold) ||
    SCANNING_STEPS[SCANNING_STEPS.length - 1]
  const StepIcon = currentStep.icon

  return (
    <div className="fixed inset-0 z-50 bg-[#001E2B] text-white flex flex-col items-center justify-between p-6 md:p-12 animate-fadeIn overflow-hidden">
      {/* Background Decorative Rings & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full bg-[#00ED64]/5 blur-[120px] animate-pulse" />
        <div className="absolute w-[360px] h-[360px] rounded-full border border-[#00ED64]/10 animate-ping opacity-30" />
        <div className="absolute w-[540px] h-[540px] rounded-full border border-[#003D4F]/40" />
        <div className="absolute w-[720px] h-[720px] rounded-full border border-[#003D4F]/20" />
      </div>

      {/* Top Header Tag */}
      <div className="relative z-10 text-center space-y-1 mt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#003D4F] text-[#00ED64] border border-[#00ED64]/30 shadow-xs">
          <Sparkles size={14} className="text-[#00ED64]" />
          <span>Sintesis & Kalibrasi Data Spasial</span>
        </div>
        {userFriction && (
          <p className="text-xs text-[#A8B3BC] font-medium pt-1 max-w-md mx-auto line-clamp-1">
            Fokus kendala: &ldquo;{userFriction}&rdquo;
          </p>
        )}
      </div>

      {/* Center Radar Scanner Graphic */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        {/* Animated Radar Outer Box */}
        <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-full border-2 border-[#00ED64]/30 flex items-center justify-center bg-[#002B38]/80 backdrop-blur-md shadow-2xl">
          {/* Rotating Scanner Needle */}
          <div
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#00ED64] animate-spin"
            style={{ animationDuration: "2s" }}
          />

          {/* Concentric Inner Circles */}
          <div className="w-32 h-32 rounded-full border border-[#00ED64]/20 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-[#00ED64]/40 flex items-center justify-center bg-[#00ED64]/10">
              <StepIcon size={32} className="text-[#00ED64] animate-pulse" />
            </div>
          </div>

          {/* 4 Coordinate Ping Dots */}
          <div className="absolute top-4 right-8 w-2.5 h-2.5 rounded-full bg-[#00ED64] shadow-sm animate-ping" />
          <div className="absolute bottom-6 left-8 w-2 h-2 rounded-full bg-[#00ED64] shadow-sm animate-pulse" />
          <div className="absolute top-1/2 left-3 w-2 h-2 rounded-full bg-[#00ED64]/70" />
        </div>

        {/* Progress Percentage */}
        <div className="mt-8 text-center space-y-3 max-w-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {progress}%
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-72 md:w-96 h-2 bg-[#003D4F] rounded-full overflow-hidden mx-auto p-0.5 border border-[#003D4F]">
            <div
              className="h-full bg-gradient-to-r from-[#00B545] to-[#00ED64] rounded-full transition-all duration-150 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Step Label & Source Badge */}
          <div className="pt-3 space-y-1.5 min-h-[70px]">
            <p className="text-sm md:text-base font-bold text-white leading-snug">
              {currentStep.title}...
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#A8B3BC] bg-[#003D4F]/50 px-3 py-1 rounded-full border border-[#003D4F]">
              <span className="text-[10px] uppercase font-bold text-[#00ED64]">
                Sumber:
              </span>
              <span>{currentStep.source}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-4 border-t border-[#003D4F]/50 text-xs text-[#7C8C9A]">
        <span>Memverifikasi Koridor Wilayah Jabodetabek</span>
        <button
          type="button"
          onClick={onComplete}
          className="font-bold text-[#A8B3BC] hover:text-[#00ED64] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Lewati</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
