import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Waves, CarFront, Building2, ChevronRight } from "lucide-react";
import TactileEmotionGrid from "./components/TactileEmotionGrid";
import RadialArcSlider from "./components/RadialArcSlider";
import PersonaStack from "./components/PersonaStack";
import BudgetTierTiles, { type BudgetTier } from "./components/BudgetTierTiles";
import OfficeLocations from "./components/OfficeLocations";
import TargetAreasAndSummary from "./components/TargetAreasAndSummary";
import { saveProfile, type BuyerPriorityProfile } from "@/lib/profile";
import locationEvidenceMap from "@/assets/illustrations/onboarding/rumper-location-evidence-map.svg";

interface VisualOnboardingShellProps {
  onComplete: () => void;
  onCancel?: () => void;
}

/* ─────────────────────────────────────────────────────────
 * ONBOARDING TRANSITION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after a step mounts.
 *
 *    0ms   new step surface enters, opacity 0 → 1, y 12 → 0
 *   45ms   eyebrow and question settle into place
 *  110ms   supporting context becomes fully legible
 *  170ms   interactive control rises and becomes available
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  prompt: 45,   // eyebrow and question settle
  context: 110, // supporting copy appears
  control: 170, // interactive control rises in
};

const STEP_SURFACE = {
  offsetY: 12,
  exitY: -8,
  spring: { type: "spring" as const, stiffness: 360, damping: 34, mass: 0.8 },
};

const STEP_PROMPT = {
  offsetY: 8,
  spring: { type: "spring" as const, stiffness: 420, damping: 35, mass: 0.75 },
};

const STEP_CONTROL = {
  offsetY: 14,
  spring: { type: "spring" as const, stiffness: 340, damping: 32, mass: 0.85 },
};

interface StagePromptProps {
  stageKey: number;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

function StagePrompt({ stageKey, eyebrow, title, description, children }: StagePromptProps) {
  const reduceMotion = useReducedMotion();
  const [revealStage, setRevealStage] = useState(0);

  useEffect(() => {
    setRevealStage(0);
    if (reduceMotion) {
      setRevealStage(3);
      return;
    }

    const timers = [
      window.setTimeout(() => setRevealStage(1), TIMING.prompt),
      window.setTimeout(() => setRevealStage(2), TIMING.context),
      window.setTimeout(() => setRevealStage(3), TIMING.control),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [stageKey, reduceMotion]);

  return (
    <>
      <div className="space-y-2 text-center" aria-live="polite">
        <motion.span
          initial={{ opacity: 0, y: reduceMotion ? 0 : STEP_PROMPT.offsetY }}
          animate={{ opacity: revealStage >= 1 ? 1 : 0, y: revealStage >= 1 ? 0 : STEP_PROMPT.offsetY }}
          transition={reduceMotion ? { duration: 0 } : STEP_PROMPT.spring}
          className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00684A] bg-[#E3FCEF] px-4 py-2 rounded-full inline-flex self-center"
        >
          {eyebrow}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: reduceMotion ? 0 : STEP_PROMPT.offsetY }}
          animate={{ opacity: revealStage >= 1 ? 1 : 0, y: revealStage >= 1 ? 0 : STEP_PROMPT.offsetY }}
          transition={reduceMotion ? { duration: 0 } : { ...STEP_PROMPT.spring, delay: 0.025 }}
          className="text-[28px] leading-[1.1] sm:text-[30px] font-black text-[#001E2B] tracking-[-0.035em] [text-wrap:balance]"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: reduceMotion ? 0 : STEP_PROMPT.offsetY }}
          animate={{ opacity: revealStage >= 2 ? 1 : 0, y: revealStage >= 2 ? 0 : STEP_PROMPT.offsetY }}
          transition={reduceMotion ? { duration: 0 } : STEP_PROMPT.spring}
          className="text-sm leading-relaxed text-[#5C6C7A] font-medium [text-wrap:balance]"
        >
          {description}
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : STEP_CONTROL.offsetY }}
        animate={{ opacity: revealStage >= 3 ? 1 : 0, y: revealStage >= 3 ? 0 : STEP_CONTROL.offsetY }}
        transition={reduceMotion ? { duration: 0 } : STEP_CONTROL.spring}
        className="pt-1"
      >
        {children}
      </motion.div>
    </>
  );
}

export default function VisualOnboardingShell({
  onComplete,
  onCancel,
}: VisualOnboardingShellProps) {
  const reduceMotion = useReducedMotion();
  // Stage 0: Welcome, 1: Friction, 2: Commute, 3: Persona, 4: Budget, 5: Synthesis
  const [stage, setStage] = useState(0);
  const totalJourneySteps = 6; // welcome + six interactive stages

  // Form State
  const [selectedFriction, setSelectedFriction] = useState<string | null>("flood-access");
  const [selectedFrictionLabel, setSelectedFrictionLabel] = useState<string>("Banjir & Akses Putus");
  const [commuteMinutes, setCommuteMinutes] = useState(45);
  const [selectedPersona, setSelectedPersona] = useState("couple");
  const [selectedWorkPattern, setSelectedWorkPattern] = useState("hybrid");
  const [selectedBudgetPreset, setSelectedBudgetPreset] = useState("700-1200");
  const [selectedBudgetLabel, setSelectedBudgetLabel] = useState("Rp 700 Jt – 1,2 Milyar");
  const [budgetRange, setBudgetRange] = useState({ min: 700, max: 1200 });
  const [primaryOffice, setPrimaryOffice] = useState("Sudirman / SCBD (Jaksel)");
  const [partnerOffice, setPartnerOffice] = useState("");
  const [targetAreas, setTargetAreas] = useState<string[]>(["Tangerang Selatan (Bintaro, BSD, Serpong)", "Bogor & Cibubur (Cibinong, Sentul, LRT)"]);

  const handleNext = () => {
    if (stage < 6) {
      setStage((s) => s + 1);
    } else {
      // Persist profile before finishing
      const profileToSave: BuyerPriorityProfile = {
        id: "profile-v2",
        schemaVersion: 1,
        status: "confirmed",
        updatedAt: new Date().toISOString(),
        householdType:
          selectedPersona === "family"
            ? "keluarga-muda"
            : selectedPersona === "couple"
            ? "pasangan"
            : "single",
        workPattern:
          selectedWorkPattern === "full-wfo"
            ? "wfo"
            : selectedWorkPattern === "remote"
            ? "remote"
            : "hybrid",
        anchors: [
          {
            type: "primary",
            label: primaryOffice || "Sudirman, Jakarta Pusat",
          },
          ...(partnerOffice ? [{ type: "secondary" as const, label: partnerOffice }] : [])
        ],
        budget: {
          minMillions: budgetRange.min,
          maxMillions: budgetRange.max,
        },
        preferredCorridors: targetAreas,
        priorities: [
          {
            key: "flood_safety",
            weight: selectedFriction === "flood-access" ? 5 : 4,
            dealbreaker: selectedFriction === "flood-access",
            confidence: "strong",
            reasons: [],
            confirmedByUser: true,
          },
          {
            key: "commute_reliability",
            weight: 4,
            dealbreaker: false,
            confidence: "strong",
            reasons: [],
            confirmedByUser: true,
          },
          {
            key: "budget_discipline",
            weight: 4,
            dealbreaker: false,
            confidence: "medium",
            reasons: [],
            confirmedByUser: true,
          },
        ],
        signals: {
          selectedFriction: selectedFriction ?? undefined,
          selectedFrictionLabel: selectedFrictionLabel ?? undefined,
          scenarioResponses: {},
        },
      };

      saveProfile(profileToSave);
      onComplete();
    }
  };

  const handleBack = () => {
    if (stage > 0) {
      setStage((s) => s - 1);
    }
  };

  const handleSelectBudget = (tier: BudgetTier) => {
    setSelectedBudgetPreset(tier.id);
    setSelectedBudgetLabel(tier.rangeText);
    setBudgetRange({ min: tier.minVal, max: tier.maxVal });
  };

  const welcomeEvidence = [
    { label: "Risiko banjir", icon: Waves, tone: "bg-[#E1F3FC] text-[#0878B8]" },
    { label: "Waktu perjalanan", icon: CarFront, tone: "bg-[#FFF4D8] text-[#B87800]" },
    { label: "Fasilitas sekitar", icon: Building2, tone: "bg-[#E3FCEF] text-[#00684A]" },
  ];

  const journeyStep = Math.min(stage + 1, totalJourneySteps);

  const handleHeaderBack = () => {
    if (stage === 0) onCancel?.();
    else handleBack();
  };

  return (
    <div className="min-h-screen bg-white text-[#001E2B] flex flex-col antialiased font-sans relative overflow-x-hidden">
      <header className="shrink-0 bg-white/96 backdrop-blur-md px-5 pt-5 pb-2 flex items-center gap-4 sticky top-0 z-50 max-w-md mx-auto w-full">
        <button
          type="button"
          onClick={handleHeaderBack}
          aria-label={stage === 0 ? "Kembali ke beranda" : "Kembali ke langkah sebelumnya"}
          className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center text-[#001E2B] hover:bg-[#F4F7F6] transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/20"
        >
          <ArrowLeft size={23} strokeWidth={2.4} />
        </button>
        <div className="flex-1 flex gap-1.5" aria-label={`Langkah ${journeyStep} dari ${totalJourneySteps}`}>
          {Array.from({ length: totalJourneySteps }).map((_, index) => (
            <motion.span
              key={index}
              initial={false}
              animate={{ opacity: index < journeyStep ? 1 : 0.55, scaleX: index < journeyStep ? 1 : 0.94 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 440, damping: 36 }}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${index < journeyStep ? "bg-[#00ED64]" : "bg-[#E2F1EA]"}`}
            />
          ))}
        </div>
        <div className="min-w-[46px] text-right text-xs font-bold tabular-nums text-[#5C6C7A]">
          {stage < 6 ? `${journeyStep}/${totalJourneySteps}` : "Siap"}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-4 max-w-md mx-auto w-full pb-28">
        {/* STAGE 0: WELCOME & VIBE SCREEN */}
        {stage === 0 && (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : STEP_SURFACE.offsetY }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : STEP_SURFACE.spring}
            className="max-w-md mx-auto w-full text-center flex flex-col items-center"
          >
            <div className="pt-4 sm:pt-6">
              <span className="inline-flex text-[11px] font-black uppercase tracking-[0.18em] text-[#00684A] bg-[#E3FCEF] px-4 py-2 rounded-full">
                Pahami lokasinya
              </span>
              <h1 className="mt-4 text-[30px] leading-[1.08] sm:text-4xl font-black text-[#001E2B] tracking-[-0.035em] [text-wrap:balance]">
                Mulai dari lokasi,<br />bukan janji iklan
              </h1>
            </div>

            <img
              src={locationEvidenceMap}
              alt="Peta bukti lokasi dengan rumah, area risiko banjir, rute perjalanan, dan fasilitas sekitar"
              className="mt-4 w-full max-w-[360px] h-auto"
            />

            <div className="w-full mt-2 text-left border-y border-[#E1E5E8] divide-y divide-[#E1E5E8]">
              {welcomeEvidence.map(({ label, icon: Icon, tone }) => (
                <div key={label} className="min-h-[60px] flex items-center gap-4 px-1">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
                    <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
                  </span>
                  <span className="flex-1 font-bold text-[15px] text-[#001E2B]">{label}</span>
                  <ChevronRight size={19} className="text-[#7C8C9A]" aria-hidden="true" />
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[#5C6C7A] font-medium">
              Berbasis data lokasi dan bukti yang tersedia
            </p>
          </motion.div>
        )}

        {/* STAGES 1 TO 4: RESPONSIVE INTERACTIVE STAGES */}
        <AnimatePresence mode="wait" initial={false}>
        {stage >= 1 && stage <= 6 && (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: reduceMotion ? 0 : STEP_SURFACE.offsetY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : STEP_SURFACE.exitY }}
            transition={reduceMotion ? { duration: 0 } : STEP_SURFACE.spring}
            className="flex flex-col w-full"
          >
            <div className="flex flex-col space-y-5 pt-4">
              <StagePrompt
                stageKey={stage}
                eyebrow={stage === 1 ? "Kendala Utama" : stage === 2 ? "Mobilitas Harian" : stage === 3 ? "Profil Penghuni" : stage === 4 ? "Alokasi Budget" : stage === 5 ? "Lokasi Kerja" : "Ringkasan Profil"}
                title={stage === 1 ? "Apa hal yang paling bikin kamu cemas?" : stage === 2 ? "Berapa menit toleransi komuter harianmu?" : stage === 3 ? "Siapa yang akan menempati rumah ini?" : stage === 4 ? "Berapa rentang budget yang disiapkan?" : stage === 5 ? "Lokasi Kantor & Tempat Kerjamu" : "Wilayah Incaran & Ringkasan Profilmu"}
                description={stage === 1 ? "Pilih satu kekhawatiran utama. Kamu masih bisa mengubahnya nanti." : stage === 2 ? "Tentukan batas perjalanan yang masih terasa masuk akal setiap hari." : stage === 3 ? "Kami memakai konteks ini untuk menimbang fasilitas yang relevan." : stage === 4 ? "Gunakan rentang yang nyaman—bukan batas maksimal yang harus dihabiskan." : stage === 5 ? "Pilih area kerja harianmu agar estimasi waktu komuter dan rute jam sibuk akurat." : "Pilih wilayah Jabodetabek yang lagi kamu lirik dan cek ringkasan preferensimu sebelum mulai riset."}
              >
                {stage === 1 && (
                  <TactileEmotionGrid
                    selectedId={selectedFriction}
                    onSelect={(id, label) => {
                      setSelectedFriction(id);
                      setSelectedFrictionLabel(label);
                    }}
                  />
                )}

                {stage === 2 && (
                  <RadialArcSlider
                    value={commuteMinutes}
                    onChange={setCommuteMinutes}
                  />
                )}

                {stage === 3 && (
                  <PersonaStack
                    selectedPersona={selectedPersona}
                    selectedWorkPattern={selectedWorkPattern}
                    onSelectPersona={setSelectedPersona}
                    onSelectWorkPattern={setSelectedWorkPattern}
                  />
                )}

                
                {stage === 4 && (
                  <BudgetTierTiles
                    selectedPreset={selectedBudgetPreset}
                    onSelectTier={handleSelectBudget}
                  />
                )}
                {stage === 5 && (
                  <OfficeLocations
                    primaryOffice={primaryOffice}
                    partnerOffice={partnerOffice}
                    onPrimaryChange={setPrimaryOffice}
                    onPartnerChange={setPartnerOffice}
                  />
                )}
                {stage === 6 && (
                  <TargetAreasAndSummary
                    selectedAreas={targetAreas}
                    onChangeAreas={setTargetAreas}
                    personaLabel={
                      selectedPersona === "family"
                        ? `Keluarga Muda · ${selectedWorkPattern === "full-wfo" ? "WFO" : selectedWorkPattern === "remote" ? "Remote" : "Hybrid"}`
                        : selectedPersona === "couple"
                        ? `Pasangan · ${selectedWorkPattern === "full-wfo" ? "WFO" : selectedWorkPattern === "remote" ? "Remote" : "Hybrid (2-3 Hari)"}`
                        : `Single · ${selectedWorkPattern === "full-wfo" ? "WFO" : selectedWorkPattern === "remote" ? "Remote" : "Hybrid"}`
                    }
                    budgetLabel={selectedBudgetLabel}
                    primaryOffice={primaryOffice}
                    partnerOffice={partnerOffice}
                  />
                )}

              </StagePrompt>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        </main>
      {stage === 0 && (
        <footer className="fixed inset-x-0 bottom-0 z-40 bg-white/96 backdrop-blur-md px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
          <motion.button
            type="button"
            onClick={handleNext}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            whileHover={reduceMotion ? undefined : { y: -1 }}
            transition={STEP_CONTROL.spring}
            className="min-h-14 w-full max-w-md mx-auto rounded-full bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] font-extrabold text-base transition-colors active:scale-[0.98] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/25"
          >
            Analisis lokasi saya
          </motion.button>
        </footer>
      )}

      {/* Bottom Sticky Action Bar */}
      {stage >= 1 && stage <= 6 && (
        <footer className="fixed inset-x-0 bottom-0 z-40 bg-white/96 backdrop-blur-md px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="min-h-14 px-5 rounded-full font-bold text-sm flex items-center gap-2 border border-[#D7E1E5] text-[#3D4F5B] bg-white hover:bg-[#F4F7F6] active:scale-[0.98] cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/20"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>

            <motion.button
              type="button"
              onClick={handleNext}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={STEP_CONTROL.spring}
              className="min-h-14 flex-1 rounded-full bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] font-extrabold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/25"
            >
              {stage === 6 ? "Simpan & Mulai Riset Lokasi" : "Lanjut"}
            </motion.button>
          </div>
        </footer>
      )}

      
    </div>
  );
}
