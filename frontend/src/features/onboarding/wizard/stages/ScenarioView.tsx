import { useState } from "react"
import {
  HelpCircle,
  Check,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  RotateCcw,
} from "lucide-react"
import type { ScenarioChoice } from "@/features/onboarding/useWizardStore"
import MobileSwipeDeck from "./MobileSwipeDeck"

export interface ScenarioMetric {
  label: string
  value: string
  subValue?: string
}

export interface ScenarioHouseOption {
  key: "A" | "B"
  badgeLabel: string
  title: string
  corridor: string
  price: string
  imageUrl?: string
  imageTag?: string
  metrics: ScenarioMetric[]
  akses: string
  fasilitas: string
  kompromiNyata: string
}

export interface ScenarioData {
  id: string
  stepNumber: number // e.g. 1
  totalScenarios: number // e.g. 3
  weatherTag: string
  weatherIcon: React.ElementType
  title: string
  narrative: string
  whyItMatters: string
  optionA: ScenarioHouseOption
  optionB: ScenarioHouseOption
  feedbackMap: Record<ScenarioChoice, string>
}

interface ScenarioViewProps {
  data: ScenarioData
  selectedChoice?: ScenarioChoice
  selectedFriction?: string
  onSelectChoice: (choice: ScenarioChoice) => void
  onClearChoice?: () => void
  onSkip?: () => void
}

export default function ScenarioView({
  data,
  selectedChoice,
  selectedFriction,
  onSelectChoice,
  onClearChoice,
  onSkip,
}: ScenarioViewProps) {
  const [showWhyModal, setShowWhyModal] = useState(false)
  const WeatherIcon = data.weatherIcon

  return (
    <div className="text-[#001E2B]">
      {/* Mobile Swipe Deck View (< md) */}
      <div className="block md:hidden">
        <MobileSwipeDeck
          data={data}
          selectedChoice={selectedChoice}
          selectedFriction={selectedFriction}
          onSelectChoice={onSelectChoice}
          onClearChoice={onClearChoice}
          onSkip={onSkip}
        />
      </div>

      {/* Desktop 2-Column Comparison View (>= md) */}
      <div className="hidden md:block space-y-6 animate-fadeIn">
        {/* Contextual Bridge Banner if selectedFriction is present */}
        {selectedFriction && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#DCEEE7]/70 rounded-2xl border border-[#318266]/30 text-xs text-[#004F38] font-medium shadow-2xs">
            <Sparkles size={15} className="text-[#00684A] shrink-0" />
            <span>
              <strong>Nyambung sama kendala yang kamu pilih:</strong> &ldquo;
              {selectedFriction}&rdquo;
            </span>
          </div>
        )}

        {/* Situation Narrative Card - Scaled & Balanced Typography */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#D7E1E5] shadow-xs space-y-3.5 relative">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Weather Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F4F7F6] text-[#001E2B] border border-[#D7E1E5]">
              <WeatherIcon size={14} className="text-[#00684A]" aria-hidden="true" />
              <span>{data.weatherTag}</span>
            </div>

            {/* Why it matters button */}
            <button
              type="button"
              id="desktop-why-it-matters-toggle"
              aria-expanded={showWhyModal}
              aria-controls="desktop-why-it-matters-content"
              onClick={() => setShowWhyModal(!showWhyModal)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6C7A] hover:text-[#00684A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00684A] rounded-md px-1.5 py-0.5 transition-colors cursor-pointer"
            >
              <HelpCircle size={14} aria-hidden="true" />
              <span>Kenapa ini penting?</span>
            </button>
          </div>

          {/* Narrative Title & Story */}
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#001E2B] tracking-tight">
              {data.title}
            </h2>
            <p className="text-xs md:text-sm text-[#3D4F5B] leading-relaxed font-medium">
              &ldquo;{data.narrative}&rdquo;
            </p>
            <p className="text-xs text-[#5C6C7A] font-medium pt-0.5">
              Bayangkan kamu lagi ngalamin situasi ini sehari-hari bareng
              keluarga.
            </p>
          </div>

          {/* Expandable Why It Matters Drawer */}
          {showWhyModal && (
            <div
              id="desktop-why-it-matters-content"
              role="region"
              aria-labelledby="desktop-why-it-matters-toggle"
              className="p-3.5 rounded-2xl bg-[#E9F5EF] border border-[#318266]/30 text-xs text-[#004F38] font-medium space-y-1 animate-fadeIn"
            >
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#00684A]" aria-hidden="true" />
                <span>Realita Lapangan Jabodetabek:</span>
              </div>
              <p className="leading-relaxed">{data.whyItMatters}</p>
            </div>
          )}
        </div>

        {/* Trade-off Principle Banner */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#F4F7F6] rounded-2xl border border-[#D7E1E5] text-xs font-medium text-[#3D4F5B]">
          <Info size={15} className="text-[#00684A] shrink-0" aria-hidden="true" />
          <span>
            <strong>Tips Rumper:</strong> Gak ada pilihan yang mutlak salah.
            Pilih opsi yang paling masuk akal buat rutinitas dan kenyamanan
            hidupmu.
          </span>
        </div>

        {/* Comparison Cards Grid (2 Column Desktop, Stacked Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* House Option A */}
          <div
            role="button"
            tabIndex={0}
            aria-pressed={selectedChoice === "A"}
            aria-label={`Pilih ${data.optionA.title}, harga ${data.optionA.price}`}
            onClick={() => onSelectChoice("A")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelectChoice("A")
              }
            }}
            className={`bg-white rounded-3xl p-5 md:p-6 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] focus-visible:ring-offset-2 ${
              selectedChoice === "A"
                ? "border-[#001E2B] shadow-md bg-[#F9FBFA]"
                : "border-[#D7E1E5] hover:border-[#A8B8C6] shadow-xs hover:shadow-md"
            }`}
          >
            {/* Header & Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                    selectedChoice === "A"
                      ? "bg-[#001E2B] text-white"
                      : "bg-[#F4F7F6] border border-[#D7E1E5] text-[#001E2B]"
                  }`}
                >
                  A
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C6C7A]">
                  PILIHAN A
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#001E2B] bg-[#F4F7F6] px-3 py-1 rounded-full border border-[#D7E1E5] tabular-nums">
                {data.optionA.price}
              </span>
            </div>

            {/* Title & Corridor */}
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-[#001E2B] leading-snug">
                {data.optionA.title}
              </h3>
              <p className="text-xs text-[#5C6C7A] font-medium mt-0.5">
                {data.optionA.corridor}
              </p>
            </div>

            {/* Relevant Context Image Photo */}
            {data.optionA.imageUrl && (
              <div className="w-full h-32 md:h-36 rounded-2xl overflow-hidden relative border border-[#D7E1E5] shadow-xs group bg-[#001E2B]">
                <img
                  src={data.optionA.imageUrl}
                  alt={data.optionA.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                {data.optionA.imageTag && (
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 truncate">
                      {data.optionA.imageTag}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 4 Metric Boxes Grid - Differentiating Core Conflict vs Secondary Specs */}
            <div className="grid grid-cols-2 gap-2.5">
              {data.optionA.metrics.map((m, idx) => {
                const isPrimary = idx < 2
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-2.5 border transition-colors ${
                      isPrimary
                        ? "bg-[#EBF5F0]/70 border-[#318266]/35"
                        : "bg-[#F4F7F6] border-[#E1E5E8]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isPrimary ? "text-[#004F38]" : "text-[#5C6C7A]"
                        }`}
                      >
                        {m.label}
                      </span>
                      {isPrimary && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#DCEEE7] text-[#004F38]">
                          Kunci
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-0.5 tabular-nums font-extrabold ${
                        isPrimary
                          ? "text-sm md:text-base text-[#004F38]"
                          : "text-xs md:text-sm text-[#001E2B]"
                      }`}
                    >
                      {m.value}
                    </div>
                    {m.subValue && (
                      <div className="text-[10px] text-[#5C6C7A] font-medium truncate mt-0.5">
                        {m.subValue}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bullets */}
            <div className="text-xs text-[#3D4F5B] space-y-1.5 pt-1">
              <p>
                <strong>Akses:</strong> {data.optionA.akses}
              </p>
              <p>
                <strong>Fasilitas:</strong> {data.optionA.fasilitas}
              </p>
            </div>

            {/* Real Compromise Box */}
            <div className="bg-[#FFF8E0] border border-[#D79A2B]/40 rounded-2xl p-3 text-xs text-[#001E2B]">
              <span className="font-bold text-[#8A5B00] block mb-0.5">
                Kompromi Nyata:
              </span>
              <span className="font-medium text-[#5A4000]">
                {data.optionA.kompromiNyata}
              </span>
            </div>

            {/* Primary Selection Target Indicator */}
            {selectedChoice === "A" ? (
              <div className="flex items-center gap-2 text-xs font-bold text-white bg-[#001E2B] py-2.5 px-4 rounded-2xl justify-center shadow-xs animate-fadeIn">
                <Check size={16} className="stroke-[3] text-[#00ED64]" aria-hidden="true" />
                <span>Pilihanmu · Rumah A Terpilih</span>
              </div>
            ) : (
              <div className="w-full text-center text-xs font-bold text-[#001E2B] bg-[#F4F7F6] hover:bg-[#EAEFEA] border border-[#D7E1E5] hover:border-[#001E2B]/40 py-2.5 px-4 rounded-2xl transition-colors">
                Pilih Rumah A
              </div>
            )}
          </div>

          {/* House Option B */}
          <div
            role="button"
            tabIndex={0}
            aria-pressed={selectedChoice === "B"}
            aria-label={`Pilih ${data.optionB.title}, harga ${data.optionB.price}`}
            onClick={() => onSelectChoice("B")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelectChoice("B")
              }
            }}
            className={`bg-white rounded-3xl p-5 md:p-6 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] focus-visible:ring-offset-2 ${
              selectedChoice === "B"
                ? "border-[#001E2B] shadow-lg ring-4 ring-[#001E2B]/5 bg-[#F9FBFA]"
                : "border-[#D7E1E5] hover:border-[#001E2B]/40 shadow-xs hover:shadow-md"
            }`}
          >
            {/* Header & Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                    selectedChoice === "B"
                      ? "bg-[#001E2B] text-white"
                      : "bg-[#F4F7F6] border border-[#D7E1E5] text-[#001E2B]"
                  }`}
                >
                  B
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C6C7A]">
                  PILIHAN B
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#001E2B] bg-[#F4F7F6] px-3 py-1 rounded-full border border-[#D7E1E5] tabular-nums">
                {data.optionB.price}
              </span>
            </div>

            {/* Title & Corridor */}
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-[#001E2B] leading-snug">
                {data.optionB.title}
              </h3>
              <p className="text-xs text-[#5C6C7A] font-medium mt-0.5">
                {data.optionB.corridor}
              </p>
            </div>

            {/* Relevant Context Image Photo */}
            {data.optionB.imageUrl && (
              <div className="w-full h-32 md:h-36 rounded-2xl overflow-hidden relative border border-[#D7E1E5] shadow-xs group bg-[#001E2B]">
                <img
                  src={data.optionB.imageUrl}
                  alt={data.optionB.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                {data.optionB.imageTag && (
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 truncate">
                      {data.optionB.imageTag}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 4 Metric Boxes Grid - Differentiating Core Conflict vs Secondary Specs */}
            <div className="grid grid-cols-2 gap-2.5">
              {data.optionB.metrics.map((m, idx) => {
                const isPrimary = idx < 2
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-2.5 border transition-colors ${
                      isPrimary
                        ? "bg-[#EBF5F0]/70 border-[#318266]/35"
                        : "bg-[#F4F7F6] border-[#E1E5E8]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isPrimary ? "text-[#004F38]" : "text-[#5C6C7A]"
                        }`}
                      >
                        {m.label}
                      </span>
                      {isPrimary && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#DCEEE7] text-[#004F38]">
                          Kunci
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-0.5 tabular-nums font-extrabold ${
                        isPrimary
                          ? "text-sm md:text-base text-[#004F38]"
                          : "text-xs md:text-sm text-[#001E2B]"
                      }`}
                    >
                      {m.value}
                    </div>
                    {m.subValue && (
                      <div className="text-[10px] text-[#5C6C7A] font-medium truncate mt-0.5">
                        {m.subValue}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bullets */}
            <div className="text-xs text-[#3D4F5B] space-y-1.5 pt-1">
              <p>
                <strong>Akses:</strong> {data.optionB.akses}
              </p>
              <p>
                <strong>Fasilitas:</strong> {data.optionB.fasilitas}
              </p>
            </div>

            {/* Real Compromise Box */}
            <div className="bg-[#FFF8E0] border border-[#D79A2B]/40 rounded-2xl p-3 text-xs text-[#001E2B]">
              <span className="font-bold text-[#8A5B00] block mb-0.5">
                Kompromi Nyata:
              </span>
              <span className="font-medium text-[#5A4000]">
                {data.optionB.kompromiNyata}
              </span>
            </div>

            {/* Primary Selection Target Indicator */}
            {selectedChoice === "B" ? (
              <div className="flex items-center gap-2 text-xs font-bold text-white bg-[#001E2B] py-2.5 px-4 rounded-2xl justify-center shadow-xs animate-fadeIn">
                <Check size={16} className="stroke-[3] text-[#00ED64]" aria-hidden="true" />
                <span>Pilihanmu · Rumah B Terpilih</span>
              </div>
            ) : (
              <div className="w-full text-center text-xs font-bold text-[#001E2B] bg-[#F4F7F6] hover:bg-[#EAEFEA] border border-[#D7E1E5] hover:border-[#001E2B]/40 py-2.5 px-4 rounded-2xl transition-colors">
                Pilih Rumah B
              </div>
            )}
          </div>
        </div>

        {/* Alternative Non-Binary Choices Toolbar (Simplified to 2 options) */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#D7E1E5] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5C6C7A]">
              Atau pertimbangkan opsi alternatif di luar kedua rumah di atas:
            </h3>
          </div>

          {/* 2-Column Alternative Choices Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch"
            role="group"
            aria-label="Pilihan Alternatif"
          >
            {/* Option 1: Kompromi Moderat */}
            <button
              type="button"
              onClick={() => onSelectChoice("neither")}
              aria-pressed={selectedChoice === "neither"}
              className={`min-h-[52px] px-4 py-3 rounded-2xl text-xs md:text-sm font-bold border transition-all cursor-pointer flex items-center gap-3 select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] focus-visible:ring-offset-2 ${
                selectedChoice === "neither"
                  ? "border-2 border-[#001E2B] bg-[#001E2B]/5 text-[#001E2B] ring-2 ring-[#001E2B]/10 shadow-xs"
                  : "border border-[#D7E1E5] bg-white text-[#3D4F5B] hover:border-[#001E2B]/40 hover:bg-[#F4F7F6]"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                selectedChoice === "neither" ? "bg-[#001E2B] text-white" : "bg-[#F4F7F6] text-[#5C6C7A]"
              }`}>
                <XCircle size={18} aria-hidden="true" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-xs md:text-sm text-[#001E2B]">
                  Kompromi Moderat
                </span>
                <span className="block text-[11px] font-normal text-[#5C6C7A]">
                  Mau jalan tengah seimbang di antara keduanya
                </span>
              </div>
            </button>

            {/* Option 2: Batasan Mutlak (Dealbreaker) */}
            <button
              type="button"
              onClick={() => onSelectChoice("reject")}
              aria-pressed={selectedChoice === "reject"}
              className={`min-h-[52px] px-4 py-3 rounded-2xl text-xs md:text-sm font-bold border transition-all cursor-pointer flex items-center gap-3 select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C95746] focus-visible:ring-offset-2 ${
                selectedChoice === "reject"
                  ? "border-2 border-[#C95746] bg-[#FFF5F5] text-[#C95746] ring-2 ring-[#C95746]/10 shadow-xs"
                  : "border border-[#F4DED9] bg-white text-[#A8382B] hover:border-[#C95746] hover:bg-[#FFF5F5]"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                selectedChoice === "reject" ? "bg-[#C95746] text-white" : "bg-[#FFF5F5] text-[#C95746]"
              }`}>
                <AlertTriangle size={18} aria-hidden="true" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-xs md:text-sm text-[#A8382B]">
                  Batasan Mutlak (Dealbreaker)
                </span>
                <span className="block text-[11px] font-normal text-[#7A3E35]">
                  Coret & filter perumahan yang melanggar faktor ini
                </span>
              </div>
            </button>
          </div>

          {/* Dynamic Outline Feedback Banner */}
          {selectedChoice && data.feedbackMap[selectedChoice] && (
            <div
              role="status"
              aria-live="polite"
              className="pt-2 flex items-center justify-between gap-3 text-xs font-semibold text-[#004F38] bg-[#E9F5EF] px-4 py-2.5 rounded-xl border border-[#318266]/30 animate-fadeIn"
            >
              <div className="flex items-center gap-2">
                <Check
                  size={14}
                  className="stroke-[3] text-[#00684A] shrink-0"
                  aria-hidden="true"
                />
                <span>{data.feedbackMap[selectedChoice]}</span>
              </div>
              {onClearChoice && (
                <button
                  type="button"
                  onClick={onClearChoice}
                  className="text-[#5C6C7A] hover:text-[#001E2B] flex items-center gap-1 font-bold text-xs underline shrink-0 cursor-pointer transition-colors"
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  <span>Ubah Pilihan</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
