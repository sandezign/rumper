import { useWizardState } from "@/features/onboarding/useWizardStore"
import DesktopSidebar from "./DesktopSidebar"
import MobileHeader from "./MobileHeader"
import MobileStickyFooter from "./MobileStickyFooter"
import Stage1FrictionDiscovery from "./stages/Stage1FrictionDiscovery"
import Stage1BridgeExplainer from "./stages/Stage1BridgeExplainer"
import Stage2ValueProof from "./stages/Stage2ValueProof"
import Stage3EmpathyStatement from "./stages/Stage3EmpathyStatement"
import Stage4Comparison from "./stages/Stage4Comparison"
import Step1HouseholdWork from "./steps/Step1HouseholdWork"
import Step2LocationAnchors from "./steps/Step2LocationAnchors"
import Step3BudgetRange from "./steps/Step3BudgetRange"
import Step4CorridorSummary from "./steps/Step4CorridorSummary"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"

interface ResponsiveWizardShellProps {
  onComplete?: () => void
  onCancel?: () => void
}

export default function ResponsiveWizardShell({
  onComplete,
  onCancel,
}: ResponsiveWizardShellProps) {
  const {
    flowStage,
    parameterStep,
    formData,
    updateFormData,
    toggleCorridor,
    nextStage,
    prevStage,
    skipToParameterSetup,
    goToFlowStage,
    goToParameterStep,
    confirmProfile,
  } = useWizardState()

  // Total display step calculation (1..9 total sub-steps for smooth progress)
  const currentTotalProgress = flowStage < 6 ? flowStage : 5 + parameterStep
  const totalDisplaySteps = 9

  const handleNext = () => {
    if (flowStage === 6 && parameterStep === 4) {
      confirmProfile() // persist as `confirmed` before handing off (PRD-11 FR-1107)
      onComplete?.()
    } else {
      nextStage()
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col md:flex-row antialiased font-sans text-[#001E2B]">
      {/* Desktop / Tablet Sidebar Container */}
      <div className="hidden md:block shrink-0 bg-[#001E2B] self-stretch">
        <DesktopSidebar
          flowStage={flowStage}
          parameterStep={parameterStep}
          onStepClick={(step) => goToParameterStep(step)}
          onStageClick={(stage) => goToFlowStage(stage)}
          onSkipToSetup={skipToParameterSetup}
        />
      </div>

      {/* Mobile Top Header */}
      <MobileHeader
        flowStage={flowStage}
        parameterStep={parameterStep}
        currentStep={currentTotalProgress}
        totalSteps={totalDisplaySteps}
        onBack={prevStage}
      />

      {/* Right Column Canvas & Full-Width Sticky Footer */}
      <div className="flex-1 flex flex-col min-h-screen relative justify-between">
        {/* Main Content Form Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full pb-28 md:pb-8">
          <div>
            {/* Top Canvas Bar for Desktop */}
            <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-[#D7E1E5]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#004F38] bg-[#DCEEE7] px-3.5 py-1 rounded-full border border-[#318266]/30 tabular-nums">
                  {flowStage === 1
                    ? "Langkah 1 · Kendala Utamamu"
                    : flowStage === 2
                      ? "Langkah 2 · Uji Prioritas Hunian"
                      : flowStage >= 3 && flowStage <= 5
                        ? `Langkah 2 · Uji 3 Skenario Nyata (${flowStage - 2}/3)`
                        : `Langkah 3 · Profiling & Budget (${parameterStep}/4)`}
                </span>
                <span className="text-xs font-semibold text-[#5C6C7A] tabular-nums">
                  {Math.round((currentTotalProgress / totalDisplaySteps) * 100)}
                  % Selesai
                </span>
              </div>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  aria-label="Tutup"
                  title="Tutup"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#5C6C7A] hover:text-[#001E2B] bg-white border border-[#D7E1E5] hover:bg-[#F4F7F6] transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Render 6 Psychological Flow Stages */}
            {flowStage === 1 && (
              <Stage1FrictionDiscovery
                onSelect={(id, label) => {
                  updateFormData({ selectedFriction: id, selectedFrictionLabel: label })
                }}
              />
            )}

            {flowStage === 2 && (
              <Stage1BridgeExplainer
                selectedFriction={formData.selectedFriction}
              />
            )}

            {flowStage === 3 && <Stage2ValueProof />}

            {flowStage === 4 && <Stage3EmpathyStatement />}

            {flowStage === 5 && <Stage4Comparison />}

            {/* Stage 6: Parameter Setup (Steps 1 to 4) */}
            {flowStage === 6 && (
              <>
                {parameterStep === 1 && (
                  <Step1HouseholdWork
                    householdType={formData.householdType}
                    workPattern={formData.workPattern}
                    onChange={updateFormData}
                  />
                )}

                {parameterStep === 2 && (
                  <Step2LocationAnchors
                    mainAnchor={formData.mainAnchor}
                    secondAnchor={formData.secondAnchor}
                    onChange={updateFormData}
                  />
                )}

                {parameterStep === 3 && (
                  <Step3BudgetRange
                    budgetPreset={formData.budgetPreset}
                    budgetMin={formData.budgetMin}
                    budgetMax={formData.budgetMax}
                    onChange={updateFormData}
                  />
                )}

                {parameterStep === 4 && (
                  <Step4CorridorSummary
                    formData={formData}
                    onToggleCorridor={toggleCorridor}
                  />
                )}
              </>
            )}
          </div>
        </main>

        {/* Full-Width Sticky Desktop Action Bar */}
        <div className="hidden md:block sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D7E1E5] py-3.5 px-6 md:px-8 lg:px-12 w-full shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={prevStage}
              disabled={flowStage === 1}
              className={`min-h-[46px] px-6 rounded-full font-bold text-sm flex items-center gap-2 border transition-all cursor-pointer ${
                flowStage === 1
                  ? "opacity-40 cursor-not-allowed border-[#E1E5E8] text-[#5C6C7A] bg-[#F4F7F6]"
                  : "border-[#D7E1E5] text-[#3D4F5B] bg-white hover:bg-[#F4F7F6] hover:border-[#C1CCD6] active:scale-95 shadow-xs"
              }`}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Kembali</span>
            </button>

            <div className="flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[46px] px-8 rounded-full font-bold text-sm flex items-center gap-2 bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] shadow-md transition-all active:scale-95 ring-4 ring-[#00ED64]/20 cursor-pointer"
              >
                {flowStage === 1 ? (
                  <>
                    <span>Lanjut ke Pengantar Skenario</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                ) : flowStage === 2 ? (
                  <>
                    <span>Mulai Coba (2 menit)</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                ) : flowStage >= 3 && flowStage <= 5 ? (
                  <>
                    <span>
                      {flowStage === 5
                        ? "Lanjut ke Detail Profil"
                        : "Skenario Berikutnya"}
                    </span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                ) : flowStage === 6 && parameterStep === 4 ? (
                  <>
                    <Check size={16} className="stroke-[3] text-[#001E2B]" aria-hidden="true" />
                    <span>Simpan & Mulai Riset Lokasi</span>
                  </>
                ) : (
                  <>
                    <span>Langkah Berikutnya</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>

              {flowStage === 2 && (
                <button
                  type="button"
                  onClick={skipToParameterSetup}
                  className="text-xs font-medium text-[#5C6C7A] hover:text-[#001E2B] transition-colors underline cursor-pointer pr-2"
                >
                  Lewati langsung ke pengaturan budget
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Footer */}
      <MobileStickyFooter
        flowStage={flowStage}
        parameterStep={parameterStep}
        onNext={handleNext}
        onSkip={skipToParameterSetup}
      />
    </div>
  )
}
