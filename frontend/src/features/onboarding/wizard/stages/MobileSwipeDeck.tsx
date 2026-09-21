import { useState, useRef, useEffect } from "react"
import {
  Check,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronRight,
  HandMetal,
} from "lucide-react"
import type { ScenarioChoice } from "@/features/onboarding/useWizardStore"
import type { ScenarioData, ScenarioHouseOption } from "./ScenarioView"

interface MobileSwipeDeckProps {
  data: ScenarioData
  selectedChoice?: ScenarioChoice
  selectedFriction?: string
  onSelectChoice: (choice: ScenarioChoice) => void
  onSkip?: () => void
}

export default function MobileSwipeDeck({
  data,
  selectedChoice,
  selectedFriction,
  onSelectChoice,
  onSkip,
}: MobileSwipeDeckProps) {
  const [activeTab, setActiveTab] = useState<"A" | "B">("A")
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false)
  const [swipeHintVisible, setSwipeHintVisible] = useState<boolean>(true)

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const WeatherIcon = data.weatherIcon

  // Hide swipe hint after first interaction
  useEffect(() => {
    if (selectedChoice || isDragging) {
      setSwipeHintVisible(false)
    }
  }, [selectedChoice, isDragging])

  // Current active house option & background option
  const activeHouse: ScenarioHouseOption =
    activeTab === "A" ? data.optionA : data.optionB
  const backgroundHouse: ScenarioHouseOption =
    activeTab === "A" ? data.optionB : data.optionA

  // Touch / Pointer Event Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true)
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    dragStartRef.current = { x: clientX, y: clientY }
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    const deltaX = clientX - dragStartRef.current.x
    const deltaY = clientY - dragStartRef.current.y

    // Dampen vertical movement slightly to prioritize horizontal swipe
    setDragOffset({ x: deltaX, y: deltaY * 0.6 })
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const SWIPE_THRESHOLD = 75
    const VERTICAL_THRESHOLD = 90

    if (dragOffset.x < -SWIPE_THRESHOLD) {
      // Swiped Left -> Choose House A
      onSelectChoice("A")
      setActiveTab("A")
    } else if (dragOffset.x > SWIPE_THRESHOLD) {
      // Swiped Right -> Choose House B
      onSelectChoice("B")
      setActiveTab("B")
    } else if (dragOffset.y > VERTICAL_THRESHOLD) {
      // Swiped Down -> Moderate Compromise
      onSelectChoice("neither")
    }

    // Elastic snap-back to center
    setDragOffset({ x: 0, y: 0 })
  }

  // Calculate dynamic rotation and stamp opacity
  const rotation = Math.max(-14, Math.min(14, dragOffset.x / 18))
  const stampOpacityA = Math.max(0, Math.min(1, -dragOffset.x / 60))
  const stampOpacityB = Math.max(0, Math.min(1, dragOffset.x / 60))
  const stampOpacityDown = Math.max(0, Math.min(1, dragOffset.y / 70))

  return (
    <div className="space-y-4 text-[#001E2B] select-none">
      {/* Mobile Top Header: Eyebrow & Skip */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold uppercase tracking-wider text-[#00684A] flex items-center gap-1.5 tabular-nums">
          <span>
            Skenario 0{data.stepNumber} dari 0{data.totalScenarios}
          </span>
          <span className="text-[#A8B3BC]">/</span>
          <span className="text-[#5C6C7A]">Uji Prioritas</span>
        </div>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-bold text-[#5C6C7A] hover:text-[#001E2B] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Lewati</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Contextual Bridge Banner */}
      {selectedFriction && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#DCEEE7]/70 rounded-xl border border-[#318266]/30 text-[11px] text-[#004F38] font-medium">
          <Sparkles size={13} className="text-[#00684A] shrink-0" />
          <span className="line-clamp-1">
            <strong>Konteksmu:</strong> &ldquo;{selectedFriction}&rdquo;
          </span>
        </div>
      )}

      {/* Compact Situation Story Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#D7E1E5] shadow-xs space-y-2 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F7F6] text-[#001E2B] border border-[#D7E1E5]">
            <WeatherIcon size={12} className="text-[#00684A]" aria-hidden="true" />
            <span>{data.weatherTag}</span>
          </div>

          <button
            type="button"
            id="mobile-why-it-matters-toggle"
            aria-expanded={showWhyModal}
            aria-controls="mobile-why-it-matters-content"
            onClick={() => setShowWhyModal(!showWhyModal)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C6C7A] hover:text-[#00684A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00684A] rounded-md px-1 py-0.5 cursor-pointer transition-colors"
          >
            <HelpCircle size={13} aria-hidden="true" />
            <span>Kenapa penting?</span>
          </button>
        </div>

        <div>
          <h2 className="text-base font-extrabold text-[#001E2B] leading-snug">
            {data.title}
          </h2>
          <p className="text-xs text-[#3D4F5B] leading-relaxed mt-0.5">
            &ldquo;{data.narrative}&rdquo;
          </p>
        </div>

        {/* Why it matters modal */}
        {showWhyModal && (
          <div
            id="mobile-why-it-matters-content"
            role="region"
            aria-labelledby="mobile-why-it-matters-toggle"
            className="p-3 rounded-xl bg-[#E9F5EF] border border-[#318266]/30 text-xs text-[#004F38] font-medium space-y-1 animate-fadeIn"
          >
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#00684A]" aria-hidden="true" />
              <span>Realita Jabodetabek:</span>
            </div>
            <p className="text-[11px] leading-relaxed">{data.whyItMatters}</p>
          </div>
        )}
      </div>

      {/* Segmented Peek Tab Switcher */}
      <div className="flex items-center justify-center">
        <div
          role="tablist"
          aria-label="Pilihan Perbandingan Rumah"
          className="bg-[#E9F0EC] p-1 rounded-2xl border border-[#D7E1E5] inline-flex items-center gap-1 shadow-inner"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "A"}
            aria-controls="mobile-card-deck"
            onClick={() => {
              setActiveTab("A")
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] ${
              activeTab === "A"
                ? "bg-[#001E2B] text-white shadow-xs"
                : "text-[#5C6C7A] hover:text-[#001E2B]"
            }`}
          >
            Pilihan A: {data.optionA.title.split(" ")[0]}{" "}
            {data.optionA.title.split(" ")[1] || ""}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "B"}
            aria-controls="mobile-card-deck"
            onClick={() => {
              setActiveTab("B")
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] ${
              activeTab === "B"
                ? "bg-[#001E2B] text-white shadow-xs"
                : "text-[#5C6C7A] hover:text-[#001E2B]"
            }`}
          >
            Pilihan B: {data.optionB.title.split(" ")[0]}{" "}
            {data.optionB.title.split(" ")[1] || ""}
          </button>
        </div>
      </div>

      {/* Swipe Gesture Interactive Card Deck Container */}
      <div className="relative min-h-[380px] flex items-center justify-center pt-2">
        {/* Background Peeking Card */}
        <div
          className="absolute inset-x-2 top-4 bottom-0 bg-[#F4F7F6] rounded-3xl border border-[#D7E1E5] p-5 shadow-xs transition-transform duration-300 pointer-events-none opacity-80"
          style={{
            transform: "scale(0.95) translateY(12px)",
          }}
        >
          <div className="flex justify-between items-center opacity-60">
            <span className="text-xs font-bold uppercase text-[#5C6C7A]">
              {backgroundHouse.badgeLabel}
            </span>
            <span className="text-xs font-extrabold text-[#001E2B]">
              {backgroundHouse.price}
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#5C6C7A] mt-2 truncate">
            {backgroundHouse.title}
          </h3>
        </div>

        {/* Foreground Interactive Card (Draggable / Swipable) */}
        <div
          id="mobile-card-deck"
          role="tabpanel"
          aria-label={`Detail ${activeHouse.title}`}
          ref={cardRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className="w-full bg-white rounded-3xl p-5 border border-[#D7E1E5] relative z-10 cursor-grab active:cursor-grabbing transition-shadow shadow-md"
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`,
            transition: isDragging
              ? "none"
              : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            touchAction: "pan-y",
          }}
        >
          {/* Dynamic Drag Stamp Overlay: Swipe Left -> Stamp A */}
          {stampOpacityA > 0.05 && (
            <div
              className="absolute top-4 left-4 z-30 bg-[#001E2B] text-[#00ED64] border-2 border-[#00ED64] px-3.5 py-1.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg rotate-[-8deg] flex items-center gap-1.5 pointer-events-none"
              style={{ opacity: stampOpacityA }}
            >
              <Check size={16} className="stroke-[3]" aria-hidden="true" />
              <span>PILIH RUMAH A</span>
            </div>
          )}

          {/* Dynamic Drag Stamp Overlay: Swipe Right -> Stamp B */}
          {stampOpacityB > 0.05 && (
            <div
              className="absolute top-4 right-4 z-30 bg-[#001E2B] text-[#00ED64] border-2 border-[#00ED64] px-3.5 py-1.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg rotate-[8deg] flex items-center gap-1.5 pointer-events-none"
              style={{ opacity: stampOpacityB }}
            >
              <Check size={16} className="stroke-[3]" aria-hidden="true" />
              <span>PILIH RUMAH B</span>
            </div>
          )}

          {/* Dynamic Drag Stamp Overlay: Swipe Down -> Stamp Moderat */}
          {stampOpacityDown > 0.1 && (
            <div
              className="absolute bottom-6 inset-x-8 z-30 bg-[#001E2B] text-white border-2 border-[#D7E1E5] py-2 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 pointer-events-none"
              style={{ opacity: stampOpacityDown }}
            >
              <XCircle size={15} aria-hidden="true" />
              <span>KOMPROMI MODERAT</span>
            </div>
          )}

          {/* Header & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center ${
                  selectedChoice === activeHouse.key
                    ? "bg-[#001E2B] text-white"
                    : "bg-[#F4F7F6] border border-[#D7E1E5] text-[#001E2B]"
                }`}
              >
                {activeHouse.key}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C6C7A]">
                {activeHouse.badgeLabel}
              </span>
            </div>
            <span className="text-xs font-extrabold text-[#001E2B] bg-[#F4F7F6] px-3 py-1 rounded-full border border-[#D7E1E5] tabular-nums">
              {activeHouse.price}
            </span>
          </div>

          {/* Title & Corridor */}
          <div className="mt-3">
            <h3 className="text-base font-extrabold text-[#001E2B] leading-snug">
              {activeHouse.title}
            </h3>
            <p className="text-xs text-[#5C6C7A] font-medium mt-0.5">
              {activeHouse.corridor}
            </p>
          </div>

          {/* Context Image Banner */}
          {activeHouse.imageUrl && (
            <div className="w-full h-28 rounded-2xl overflow-hidden relative border border-[#D7E1E5] shadow-xs my-2.5 bg-[#001E2B]">
              <img
                src={activeHouse.imageUrl}
                alt={activeHouse.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              {activeHouse.imageTag && (
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 truncate">
                    {activeHouse.imageTag}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 4 Metric Boxes Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {activeHouse.metrics.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#F4F7F6] rounded-xl p-2 border border-[#E1E5E8]"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C6C7A]">
                  {m.label}
                </div>
                <div className="text-xs font-extrabold text-[#001E2B] mt-0.5 tabular-nums">
                  {m.value}
                </div>
                {m.subValue && (
                  <div className="text-[10px] text-[#5C6C7A] font-medium truncate">
                    {m.subValue}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Compact Bullets */}
          <div className="text-xs text-[#3D4F5B] space-y-1 mt-3">
            <p>
              <strong>Akses:</strong> {activeHouse.akses}
            </p>
            <p>
              <strong>Fasilitas:</strong> {activeHouse.fasilitas}
            </p>
          </div>

          {/* Real Compromise Box */}
          <div className="bg-[#FFF8E0] border border-[#D79A2B]/40 rounded-xl p-2.5 text-xs text-[#001E2B] mt-3">
            <span className="font-bold text-[#8A5B00] block text-[11px] mb-0.5">
              Kompromi Nyata:
            </span>
            <span className="font-medium text-[#5A4000] text-xs">
              {activeHouse.kompromiNyata}
            </span>
          </div>

          {/* Active Choice Confirmation Badge */}
          {selectedChoice === activeHouse.key && (
            <div className="mt-3 py-1.5 px-3 rounded-full bg-[#001E2B] text-white text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
              <Check size={14} className="stroke-[3] text-[#00ED64]" aria-hidden="true" />
              <span>Pilihanmu ({activeHouse.badgeLabel} Terpilih)</span>
            </div>
          )}
        </div>
      </div>

      {/* Swipe Hint Animation */}
      {swipeHintVisible && !selectedChoice && (
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#5C6C7A] animate-pulse">
          <HandMetal size={14} className="text-[#00684A]" aria-hidden="true" />
          <span>Geser kiri untuk Rumah A, geser kanan untuk Rumah B</span>
        </div>
      )}

      {/* Floating Action Bar (One-Thumb Ergonomics for Mobile) */}
      <div className="bg-white rounded-2xl p-3 border border-[#D7E1E5] shadow-sm space-y-2">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C6C7A] text-center">
          Atau Tap Langsung dengan Satu Jempol:
        </div>

        <div className="grid grid-cols-2 min-[380px]:grid-cols-4 gap-2" role="group" aria-label="Pilihan Kompromi Cepat">
          {/* Pilih Rumah A */}
          <button
            type="button"
            onClick={() => {
              onSelectChoice("A")
              setActiveTab("A")
            }}
            aria-pressed={selectedChoice === "A"}
            className={`min-h-[46px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center min-[380px]:flex-col justify-center gap-1.5 min-[380px]:gap-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] select-none ${
              selectedChoice === "A"
                ? "border-2 border-[#001E2B] bg-[#001E2B]/5 text-[#001E2B] ring-2 ring-[#001E2B]/10 shadow-xs"
                : "border-[#D7E1E5] bg-white text-[#001E2B] hover:bg-[#F4F7F6]"
            }`}
          >
            <Check
              size={14}
              aria-hidden="true"
              className={
                selectedChoice === "A"
                  ? "text-[#00684A] stroke-[3]"
                  : "text-[#5C6C7A]"
              }
            />
            <span className="truncate text-[11px]">Rumah A</span>
          </button>

          {/* Pilih Rumah B */}
          <button
            type="button"
            onClick={() => {
              onSelectChoice("B")
              setActiveTab("B")
            }}
            aria-pressed={selectedChoice === "B"}
            className={`min-h-[46px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center min-[380px]:flex-col justify-center gap-1.5 min-[380px]:gap-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] select-none ${
              selectedChoice === "B"
                ? "border-2 border-[#001E2B] bg-[#001E2B]/5 text-[#001E2B] ring-2 ring-[#001E2B]/10 shadow-xs"
                : "border-[#D7E1E5] bg-white text-[#001E2B] hover:bg-[#F4F7F6]"
            }`}
          >
            <Check
              size={14}
              aria-hidden="true"
              className={
                selectedChoice === "B"
                  ? "text-[#00684A] stroke-[3]"
                  : "text-[#5C6C7A]"
              }
            />
            <span className="truncate text-[11px]">Rumah B</span>
          </button>

          {/* Kompromi Moderat */}
          <button
            type="button"
            onClick={() => onSelectChoice("neither")}
            aria-pressed={selectedChoice === "neither"}
            className={`min-h-[46px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center min-[380px]:flex-col justify-center gap-1.5 min-[380px]:gap-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] select-none ${
              selectedChoice === "neither"
                ? "border-2 border-[#001E2B] bg-[#001E2B]/5 text-[#001E2B] ring-2 ring-[#001E2B]/10 shadow-xs"
                : "border-[#D7E1E5] bg-white text-[#5C6C7A] hover:bg-[#F4F7F6]"
            }`}
          >
            <XCircle
              size={14}
              aria-hidden="true"
              className={
                selectedChoice === "neither"
                  ? "text-[#001E2B]"
                  : "text-[#5C6C7A]"
              }
            />
            <span className="truncate text-[11px]">Moderat</span>
          </button>

          {/* Hard No */}
          <button
            type="button"
            onClick={() => onSelectChoice("reject")}
            aria-pressed={selectedChoice === "reject"}
            className={`min-h-[46px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center min-[380px]:flex-col justify-center gap-1.5 min-[380px]:gap-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C95746] select-none ${
              selectedChoice === "reject"
                ? "border-2 border-[#C95746] bg-[#FFF5F5] text-[#C95746] ring-2 ring-[#C95746]/10 shadow-xs"
                : "border-[#F4DED9] bg-white text-[#C95746] hover:bg-[#FFF5F5]"
            }`}
          >
            <AlertTriangle size={14} aria-hidden="true" />
            <span className="truncate text-[11px]">Hard No</span>
          </button>
        </div>

        {/* Undo Action if choice made */}
        {selectedChoice && (
          <div role="status" aria-live="polite" className="flex items-center justify-between pt-1 border-t border-[#E1E5E8] text-[11px]">
            <span className="font-semibold text-[#00684A] truncate">
              {data.feedbackMap[selectedChoice]}
            </span>
            <button
              type="button"
              onClick={() => onSelectChoice("neither")}
              className="text-[#5C6C7A] hover:text-[#001E2B] flex items-center gap-1 font-bold shrink-0 ml-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001E2B] rounded-md px-1"
            >
              <RotateCcw size={11} aria-hidden="true" />
              <span>Ubah</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
