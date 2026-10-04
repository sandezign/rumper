import {
  Clock,
  ShieldCheck,
  Users,
  MapPin,
  DollarSign,
  Compass,
  Check,
  Sparkles,
  ArrowRight,
  Target,
} from "lucide-react"

interface DesktopSidebarProps {
  flowStage: number
  parameterStep: number
  onStepClick: (step: number) => void
  onStageClick?: (stage: number) => void
  onSkipToSetup?: () => void
}

const PARAMETER_STEPS = [
  {
    step: 1,
    title: "Profil & Pola Kerja",
    subtitle: "Rumah tangga & WFO/WFH",
    icon: Users,
  },
  {
    step: 2,
    title: "Titik Aktivitas Rutin",
    subtitle: "Lokasi kantor & mobilitas",
    icon: MapPin,
  },
  {
    step: 3,
    title: "Batas Anggaran & KPR",
    subtitle: "Rentang harga realistis",
    icon: DollarSign,
  },
  {
    step: 4,
    title: "Koridor Wilayah Incaran",
    subtitle: "Area fokus & ringkasan",
    icon: Compass,
  },
]

const SCENARIO_NAMES = [
  "Transit Cepat vs Luas Tanah",
  "Ketahanan Banjir Alami vs Desain Estetik",
  "Lingkungan Established vs Cluster Hening",
]

export default function DesktopSidebar({
  flowStage,
  parameterStep,
  onStepClick,
  onStageClick,
  onSkipToSetup,
}: DesktopSidebarProps) {
  const isScenarioStage = flowStage >= 3 && flowStage <= 5
  const scenarioIndex = isScenarioStage ? flowStage - 3 : 0

  // Phase status helpers
  const isPhase1Active = flowStage === 1
  const isPhase1Done = flowStage > 1

  const isPhase2Active = flowStage >= 2 && flowStage <= 5
  const isPhase2Done = flowStage > 5

  const isPhase3Active = flowStage === 6

  return (
    <aside className="w-80 md:w-72 lg:w-80 xl:w-96 bg-[#001E2B] text-white p-6 md:p-8 flex flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div className="flex flex-col gap-6">
        {/* Dynamic Badge */}
        <div>
          {flowStage === 1 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#003D4F] text-[#00ED64] border border-[#003D4F]">
              <Clock size={14} className="shrink-0 text-[#00ED64]" />
              <span>⚡ Setup Cepat (~90 dtk)</span>
            </div>
          )}
          {flowStage === 2 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#003D4F] text-[#00ED64] border border-[#003D4F]">
              <Sparkles size={14} className="shrink-0 text-[#00ED64]" />
              <span>Langkah 2 · Pengantar Simulasi</span>
            </div>
          )}
          {isScenarioStage && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#003D4F] text-[#00ED64] border border-[#003D4F]">
              <Sparkles size={14} className="shrink-0 text-[#00ED64]" />
              <span>Langkah 2 · Skenario {scenarioIndex + 1} dari 3</span>
            </div>
          )}
          {isPhase3Active && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#003D4F] text-[#00ED64] border border-[#003D4F]">
              <Clock size={14} className="shrink-0 text-[#00ED64]" />
              <span>Langkah 3 · Profil {parameterStep} dari 4</span>
            </div>
          )}
        </div>

        {/* Main Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {isPhase1Active && "Tentukan Batasan & Profilmu"}
            {isPhase2Active && "Pilih Prioritas Hunianmu"}
            {isPhase3Active && "Lengkapi Detail Profilmu"}
          </h1>
          <p className="text-xs lg:text-sm text-[#A8B3BC] leading-relaxed">
            {isPhase1Active &&
              "Petakan risiko banjir dan waktu komuter riil sebelum kamu survei ke lokasi."}
            {isPhase2Active &&
              "Bandingkan 3 situasi nyata buat nentuin apa yang paling penting buat kamu."}
            {isPhase3Active &&
              "Isi anggaran, titik gravitasi rutin, dan koridor hunian incaranmu."}
          </p>
        </div>

        {/* Context Callout Box */}
        {flowStage === 2 ? (
          <div className="bg-[#003D4F]/60 rounded-2xl p-4 border border-[#003D4F] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#00ED64] font-bold">
              <span>Pengantar Simulasi</span>
              <span className="text-[11px] text-[#A8B3BC] font-medium">
                Uji Trade-off
              </span>
            </div>
            <p className="text-xs font-semibold text-white">
              Pahami kompromi nyata di Jabodetabek sebelum simulasi 3 skenario.
            </p>
            {onSkipToSetup && (
              <button
                type="button"
                onClick={onSkipToSetup}
                className="w-full mt-2 pt-2 border-t border-[#002B38] text-[11px] font-bold text-[#A8B3BC] hover:text-[#00ED64] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Lewati ke Detail Profil</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        ) : isScenarioStage ? (
          <div className="bg-[#003D4F]/60 rounded-2xl p-4 border border-[#003D4F] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#00ED64] font-bold">
              <span>Skenario {scenarioIndex + 1} dari 3</span>
              <span className="text-[11px] text-[#A8B3BC] font-medium">
                Uji Trade-off
              </span>
            </div>
            <p className="text-xs font-semibold text-white">
              {SCENARIO_NAMES[scenarioIndex]}
            </p>
            {onSkipToSetup && (
              <button
                type="button"
                onClick={onSkipToSetup}
                className="w-full mt-2 pt-2 border-t border-[#002B38] text-[11px] font-bold text-[#A8B3BC] hover:text-[#00ED64] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Lewati ke Detail Profil</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#003D4F]/60 rounded-2xl p-4 border border-[#003D4F] flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#001E2B] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={14} className="text-[#00ED64]" />
            </div>
            <p className="text-xs text-[#E1E5E8] leading-snug font-medium">
              Tenang, kami cuma minta konteks aktivitas harianmu, tanpa data
              pribadi sensitif.
            </p>
          </div>
        )}

        {/* 3-Phase Stepper Timeline */}
        <div className="mt-2 flex flex-col gap-0 relative">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#7C8C9A] mb-3">
            Alur Onboarding (3 Langkah):
          </div>

          {/* Phase 1: Kendala Pencarian */}
          <div className="flex items-start gap-3.5 relative pb-5">
            <div
              className={`absolute left-[17px] top-9 bottom-0 w-[2px] transition-colors duration-300 ${
                isPhase1Done ? "bg-[#00ED64]" : "bg-[#003D4F]"
              }`}
            />
            <button
              type="button"
              onClick={() => onStageClick && onStageClick(1)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                isPhase1Active
                  ? "bg-[#00ED64] text-[#001E2B] ring-4 ring-[#00ED64]/20 shadow-lg scale-105 font-bold cursor-default"
                  : isPhase1Done
                    ? "bg-[#00ED64] text-[#001E2B] cursor-pointer"
                    : "bg-[#003D4F]/70 text-[#7C8C9A] border border-[#003D4F]"
              }`}
            >
              {isPhase1Done ? (
                <Check size={16} className="stroke-[3]" />
              ) : (
                <Target size={16} />
              )}
            </button>
            <div
              onClick={() => isPhase1Done && onStageClick && onStageClick(1)}
              className={`pt-1 flex flex-col ${
                isPhase1Done ? "cursor-pointer" : ""
              }`}
            >
              <span
                className={`text-xs font-bold transition-colors ${
                  isPhase1Active
                    ? "text-white"
                    : isPhase1Done
                      ? "text-[#E1E5E8]"
                      : "text-[#A8B3BC]"
                }`}
              >
                1. Kendala Utamamu
              </span>
              <span className="text-[11px] text-[#7C8C9A] font-medium">
                {isPhase1Done ? "Kendala tercatat" : "Kekhawatiran utamamu"}
              </span>
            </div>
          </div>

          {/* Phase 2: Uji Prioritas (3 Skenario) */}
          <div className="flex items-start gap-3.5 relative pb-5">
            <div
              className={`absolute left-[17px] top-9 bottom-0 w-[2px] transition-colors duration-300 ${
                isPhase2Done ? "bg-[#00ED64]" : "bg-[#003D4F]"
              }`}
            />
            <button
              type="button"
              onClick={() => onStageClick && isPhase1Done && onStageClick(flowStage === 2 ? 2 : 3)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                isPhase2Active
                  ? "bg-[#00ED64] text-[#001E2B] ring-4 ring-[#00ED64]/20 shadow-lg scale-105 font-bold"
                  : isPhase2Done
                    ? "bg-[#00ED64] text-[#001E2B] cursor-pointer"
                    : "bg-[#003D4F]/70 text-[#7C8C9A] border border-[#003D4F]"
              }`}
            >
              {isPhase2Done ? (
                <Check size={16} className="stroke-[3]" />
              ) : (
                <Sparkles size={16} />
              )}
            </button>
            <div className="pt-1 flex flex-col">
              <span
                className={`text-xs font-bold transition-colors ${
                  isPhase2Active
                    ? "text-white"
                    : isPhase2Done
                      ? "text-[#E1E5E8]"
                      : "text-[#A8B3BC]"
                }`}
              >
                2. Uji Prioritas Hunian
              </span>
              <span className="text-[11px] text-[#7C8C9A] font-medium">
                {flowStage === 2
                  ? "Pengantar simulasi"
                  : isScenarioStage
                    ? `Skenario ${scenarioIndex + 1} dari 3`
                    : isPhase2Done
                      ? "3 skenario selesai"
                      : "Uji kompromi & trade-off"}
              </span>

              {/* Sub-indicator pills for Phase 2 when on scenario stages */}
              {isScenarioStage && (
                <div className="flex items-center gap-1.5 mt-2">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onStageClick && onStageClick(idx + 3)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        scenarioIndex === idx
                          ? "w-6 bg-[#00ED64]"
                          : scenarioIndex > idx
                            ? "w-3 bg-[#00ED64]/60"
                            : "w-3 bg-[#003D4F]"
                      }`}
                      title={`Skenario ${idx + 1}: ${SCENARIO_NAMES[idx]}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Phase 3: Detail Profil & Budget */}
          <div className="flex items-start gap-3.5 relative">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                isPhase3Active
                  ? "bg-[#00ED64] text-[#001E2B] ring-4 ring-[#00ED64]/20 shadow-lg scale-105 font-bold"
                  : "bg-[#003D4F]/70 text-[#7C8C9A] border border-[#003D4F]"
              }`}
            >
              <Users size={16} />
            </div>
            <div className="pt-1 flex flex-col flex-1">
              <span
                className={`text-xs font-bold transition-colors ${
                  isPhase3Active ? "text-white" : "text-[#A8B3BC]"
                }`}
              >
                3. Profiling & Budget
              </span>
              <span className="text-[11px] text-[#7C8C9A] font-medium">
                {isPhase3Active
                  ? `Profil ${parameterStep} dari 4`
                  : "Kunci mobilitas & budget"}
              </span>

              {/* Nested Parameter Steps shown when in Phase 3 */}
              {isPhase3Active && (
                <div className="mt-3 pl-1 space-y-2.5 border-l-2 border-[#003D4F] ml-1">
                  {PARAMETER_STEPS.map((item) => {
                    const stepNum = item.step
                    const isParamCompleted = stepNum < parameterStep
                    const isParamActive = stepNum === parameterStep

                    return (
                      <button
                        key={item.step}
                        type="button"
                        onClick={() => onStepClick(stepNum)}
                        className={`w-full text-left pl-3 flex items-center justify-between text-xs py-0.5 transition-colors cursor-pointer ${
                          isParamActive
                            ? "text-white font-bold"
                            : isParamCompleted
                              ? "text-[#00ED64] font-medium"
                              : "text-[#7C8C9A] hover:text-[#A8B3BC]"
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {isParamCompleted && (
                          <Check size={12} className="shrink-0 stroke-[3]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright / small note */}
      <div className="pt-6 border-t border-[#003D4F] text-[11px] text-[#7C8C9A]">
        © 2026 Rumper · Penasihat Risiko Lokasi Independen
      </div>
    </aside>
  )
}
