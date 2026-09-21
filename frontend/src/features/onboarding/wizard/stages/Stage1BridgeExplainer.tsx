import { useState } from "react"
import { Sparkles, Check } from "lucide-react"
import commuteIcon from "@/assets/illustrations/onboarding/bridge/rumper-bridge-commute.svg"
import timeIcon from "@/assets/illustrations/onboarding/bridge/rumper-bridge-time.svg"
import floodIcon from "@/assets/illustrations/onboarding/bridge/rumper-bridge-flood.svg"
import budgetIcon from "@/assets/illustrations/onboarding/bridge/rumper-bridge-budget.svg"
import greenSpaceIcon from "@/assets/illustrations/onboarding/bridge/rumper-bridge-green-space.svg"
import homeIcon from "@/assets/illustrations/onboarding/bridge/rumper-bridge-home.svg"
import tradeoffIcon from "@/assets/illustrations/onboarding/bridge/rumper-bridge-tradeoff.svg"

interface Stage1BridgeExplainerProps {
  selectedFriction?: string
}

export default function Stage1BridgeExplainer({
  selectedFriction,
}: Stage1BridgeExplainerProps) {
  const [activeFactor, setActiveFactor] = useState<string | null>(null)

  // Dynamic tilt response on center card when hovering specific satellite
  const getCenterTiltClass = () => {
    switch (activeFactor) {
      case "commute":
        return "-translate-y-2 scale-105 rotate-0 shadow-2xl"
      case "time":
        return "translate-x-2 -translate-y-1.5 rotate-4 scale-105 shadow-2xl"
      case "flood":
        return "-translate-x-2 -translate-y-1.5 -rotate-5 scale-105 shadow-2xl"
      case "budget":
        return "-translate-x-1.5 translate-y-1.5 -rotate-4 scale-105 shadow-2xl"
      case "greenspace":
        return "translate-x-1.5 translate-y-1.5 rotate-3 scale-105 shadow-2xl"
      default:
        return "animate-scale-card"
    }
  }

  return (
    <div className="text-deep-teal max-w-xl mx-auto w-full flex flex-col items-center text-center">
      {/* Top Contextual Friction Bridge Pill */}
      {selectedFriction ? (
        <div className="inline-flex max-w-full items-center gap-2 px-4 py-2 bg-evidence-positive-bg rounded-full border border-evidence-positive/30 text-xs text-supporting-teal font-semibold mb-6 shadow-2xs transition-[transform,box-shadow] duration-200 hover:shadow-xs active:scale-[0.96]">
          <Sparkles size={14} className="text-rumper-green-dark shrink-0 animate-sparkle-spin" />
          <span className="min-w-0 max-w-md break-words">
            Nyambung kendalamu:{" "}
            <strong className="font-bold text-deep-teal">
              &ldquo;{selectedFriction}&rdquo;
            </strong>
          </span>
        </div>
      ) : (
        <div className="inline-flex max-w-full items-center gap-2 px-4 py-2 bg-evidence-positive-bg rounded-full border border-evidence-positive/30 text-xs text-supporting-teal font-semibold mb-6 shadow-2xs transition-[transform,box-shadow] duration-200 hover:shadow-xs active:scale-[0.96]">
          <Sparkles size={14} className="text-rumper-green-dark shrink-0 animate-sparkle-spin" />
          <span>Membantu mencari titik temu kompromi rumah pertamamu</span>
        </div>
      )}

      {/* Hero visual: one centered trade-off with five supporting signals */}
      <div className="relative w-full max-w-sm h-64 sm:h-72 flex items-center justify-center mb-6 select-none">
        <span className="sr-only">
          Lima faktor rumah pertama mengelilingi simbol pertimbangan, dengan
          tiga skenario siap dicoba.
        </span>
        <div className="absolute inset-8 bg-feature-mint/60 rounded-full blur-2xl pointer-events-none animate-pulse-glow" />

        {/* Orbit Radar Pulse Ripple */}
        <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-rumper-green/35 pointer-events-none animate-orbit-ripple" />

        {/* Orbit Dotted Ring */}
        <div
          className={`absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-dashed pointer-events-none animate-orbit-spin transition-colors duration-300 ${
            activeFactor ? "border-rumper-green-dark/60" : "border-quiet-ink/60"
          }`}
        />

        {/* Floating Orbital Icons with Magnetic Hover & Tooltips */}
        {/* Top: Commuter Train */}
        <div
          className="absolute -top-1 sm:top-1 left-1/2 -translate-x-1/2 group z-20"
          onMouseEnter={() => setActiveFactor("commute")}
          onMouseLeave={() => setActiveFactor(null)}
        >
          <button
            type="button"
            aria-label="Faktor Komuter KRL On-Time"
            className="w-11 h-11 rounded-full bg-feature-mint shadow-sm border border-soft-green flex items-center justify-center animate-orbit-pop animate-float-1 transition-[transform,background-color,border-color,box-shadow] duration-200 group-hover:scale-120 group-hover:bg-canvas-white group-hover:border-rumper-green-dark group-hover:shadow-md cursor-pointer active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-deep-teal focus-visible:outline-offset-2"
          >
            <img
              src={commuteIcon}
              alt=""
              aria-hidden="true"
              className="w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-110"
            />
          </button>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 transition-[transform,opacity] duration-200 ease-out pointer-events-none bg-deep-teal text-canvas-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap z-30">
            Komuter KRL On-Time
          </div>
        </div>

        {/* Top Right: Time Efficiency */}
        <div
          className="absolute top-8 right-6 sm:right-8 group z-20"
          onMouseEnter={() => setActiveFactor("time")}
          onMouseLeave={() => setActiveFactor(null)}
        >
          <button
            type="button"
            aria-label="Faktor Efisiensi Waktu Tempuh"
            className="w-10 h-10 rounded-full bg-feature-mint shadow-sm border border-soft-green flex items-center justify-center animate-orbit-pop animate-float-2 transition-[transform,background-color,border-color,box-shadow] duration-200 group-hover:scale-120 group-hover:bg-canvas-white group-hover:border-rumper-green-dark group-hover:shadow-md cursor-pointer active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-deep-teal focus-visible:outline-offset-2"
          >
            <img
              src={timeIcon}
              alt=""
              aria-hidden="true"
              className="w-6 h-6 object-contain transition-transform duration-200 group-hover:scale-110"
            />
          </button>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 transition-[transform,opacity] duration-200 ease-out pointer-events-none bg-deep-teal text-canvas-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap z-30">
            Efisiensi Waktu
          </div>
        </div>

        {/* Top Left: Rain / Flood */}
        <div
          className="absolute top-8 left-6 sm:left-8 group z-20"
          onMouseEnter={() => setActiveFactor("flood")}
          onMouseLeave={() => setActiveFactor(null)}
        >
          <button
            type="button"
            aria-label="Faktor Kesiapan Lingkungan & Bebas Banjir"
            className="w-10 h-10 rounded-full bg-feature-mint shadow-sm border border-soft-green flex items-center justify-center animate-orbit-pop animate-float-3 transition-[transform,background-color,border-color,box-shadow] duration-200 group-hover:scale-120 group-hover:bg-canvas-white group-hover:border-rumper-green-dark group-hover:shadow-md cursor-pointer active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-deep-teal focus-visible:outline-offset-2"
          >
            <img
              src={floodIcon}
              alt=""
              aria-hidden="true"
              className="w-6 h-6 object-contain transition-transform duration-200 group-hover:scale-110"
            />
          </button>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 transition-[transform,opacity] duration-200 ease-out pointer-events-none bg-deep-teal text-canvas-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap z-30">
            Bebas Banjir
          </div>
        </div>

        {/* Bottom Left: Wallet / Budget */}
        <div
          className="absolute bottom-16 left-4 sm:left-6 group z-20"
          onMouseEnter={() => setActiveFactor("budget")}
          onMouseLeave={() => setActiveFactor(null)}
        >
          <button
            type="button"
            aria-label="Faktor Cicilan Riil & Anggaran"
            className="w-10 h-10 rounded-full bg-feature-mint shadow-sm border border-soft-green flex items-center justify-center animate-orbit-pop animate-float-4 transition-[transform,background-color,border-color,box-shadow] duration-200 group-hover:scale-120 group-hover:bg-canvas-white group-hover:border-rumper-green-dark group-hover:shadow-md cursor-pointer active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-deep-teal focus-visible:outline-offset-2"
          >
            <img
              src={budgetIcon}
              alt=""
              aria-hidden="true"
              className="w-6 h-6 object-contain transition-transform duration-200 group-hover:scale-110"
            />
          </button>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-1 transition-[transform,opacity] duration-200 ease-out pointer-events-none bg-deep-teal text-canvas-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap z-30">
            Cicilan & Budget Riil
          </div>
        </div>

        {/* Bottom Right: Greenery / Space */}
        <div
          className="absolute bottom-16 right-4 sm:right-6 group z-20"
          onMouseEnter={() => setActiveFactor("greenspace")}
          onMouseLeave={() => setActiveFactor(null)}
        >
          <button
            type="button"
            aria-label="Faktor Ruang Terbuka Hijau & Luas Tanah"
            className="w-10 h-10 rounded-full bg-feature-mint shadow-sm border border-soft-green flex items-center justify-center animate-orbit-pop animate-float-5 transition-[transform,background-color,border-color,box-shadow] duration-200 group-hover:scale-120 group-hover:bg-canvas-white group-hover:border-rumper-green-dark group-hover:shadow-md cursor-pointer active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-deep-teal focus-visible:outline-offset-2"
          >
            <img
              src={greenSpaceIcon}
              alt=""
              aria-hidden="true"
              className="w-6 h-6 object-contain transition-transform duration-200 group-hover:scale-110"
            />
          </button>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-1 transition-[transform,opacity] duration-200 ease-out pointer-events-none bg-deep-teal text-canvas-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap z-30">
            Ruang Terbuka Hijau
          </div>
        </div>

        {/* Center Overlapping 3D Badges (Responsive Magnetic Link) */}
        <div className="relative flex items-center justify-center group cursor-pointer active:scale-[0.96] transition-transform duration-150">
          {/* Back Card: Property Pin Blueprint */}
          <div
            className={`absolute -right-5 -top-3 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-canvas-white border border-subtle-border shadow-md flex items-center justify-center animate-back-card transition-[transform,box-shadow] duration-300 ${
              activeFactor
                ? "translate-x-2 -translate-y-2 rotate-12 shadow-lg"
                : "group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12"
            }`}
          >
            <img
              src={homeIcon}
              alt="Rumah pertama"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {/* Front Card: Rumper Balance Symbol */}
          <div
            className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-supporting-teal shadow-lg flex items-center justify-center border-2 border-canvas-white transition-[transform,box-shadow] duration-300 ${getCenterTiltClass()} ${
              !activeFactor
                ? "group-hover:scale-108 group-hover:rotate-0 group-hover:shadow-2xl"
                : ""
            }`}
          >
            <img
              src={tradeoffIcon}
              alt="Pertimbangan trade-off"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain animate-scale-sway pointer-events-none"
            />
          </div>
        </div>

        {/* Bottom Floating Pill Status Card (Concentric rounded-3xl with inner rounded-2xl) */}
        <div className="absolute -bottom-2 z-20 bg-canvas-white/95 backdrop-blur-md px-4 py-2.5 rounded-3xl border border-subtle-border shadow-md flex items-center justify-between gap-4 w-72 sm:w-80 max-w-full animate-pill-float transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-soft-green active:scale-[0.96]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-feature-mint flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <img src={homeIcon} alt="" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-xs font-extrabold text-deep-teal tracking-tight">
              <span className="tabular-nums">3</span> Skenario Nyata
            </span>
          </div>

          <div className="min-h-6 px-2.5 py-0.5 rounded-full bg-feature-mint border border-soft-green text-rumper-green-dark flex items-center gap-1.5 animate-badge-shimmer">
            <span className="text-xs font-extrabold uppercase tracking-wide">
              Siap
            </span>
            <Check size={12} className="stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Typography: Title & Subtitle with text-balance and text-pretty */}
      <div className="space-y-2 mb-8 max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-teal tracking-tight leading-tight text-balance">
          Pilih rumah pertama emang penuh kompromi
        </h2>
        <p className="text-sm text-tertiary-ink leading-relaxed font-medium text-pretty">
          Sebelum lanjut ke filter budget & lokasi, yuk uji prioritas aslimu
          lewat simulasi trade-off harian di Jabodetabek:
        </p>
      </div>

      {/* Clean Checklist Items (Concentric rounded-2xl with active:scale-[0.96]) */}
      <div className="w-full max-w-lg flex flex-col gap-3.5 text-left mb-4">
        {/* Item 1 */}
        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-canvas-white border border-hairline shadow-2xs transition-[border-color,box-shadow,transform] duration-200 hover:border-soft-green hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group">
          <div
            aria-hidden="true"
            className="w-6 h-6 rounded-full bg-rumper-green-dark text-canvas-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs transition-transform duration-200 group-hover:scale-110"
          >
            <Check size={14} className="stroke-[3]" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-deep-teal group-hover:text-rumper-green-dark transition-colors duration-200">
              Waktu Komuter vs Luas Bangunan
            </h3>
            <p className="text-sm text-tertiary-ink leading-relaxed text-pretty">
              Pilih hemat energi di KRL (rumah kompak) atau punya kamar &
              halaman lebih luas.
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-canvas-white border border-hairline shadow-2xs transition-[border-color,box-shadow,transform] duration-200 hover:border-soft-green hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group">
          <div
            aria-hidden="true"
            className="w-6 h-6 rounded-full bg-rumper-green-dark text-canvas-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs transition-transform duration-200 group-hover:scale-110"
          >
            <Check size={14} className="stroke-[3]" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-deep-teal group-hover:text-rumper-green-dark transition-colors duration-200">
              Kesiapan Lingkungan & Bebas Banjir
            </h3>
            <p className="text-sm text-tertiary-ink leading-relaxed text-pretty">
              Bandingkan rasa tenang bebas genangan saat musim hujan vs
              kedekatan ke pusat kota.
            </p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-canvas-white border border-hairline shadow-2xs transition-[border-color,box-shadow,transform] duration-200 hover:border-soft-green hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group">
          <div
            aria-hidden="true"
            className="w-6 h-6 rounded-full bg-rumper-green-dark text-canvas-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs transition-transform duration-200 group-hover:scale-110"
          >
            <Check size={14} className="stroke-[3]" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-deep-teal group-hover:text-rumper-green-dark transition-colors duration-200">
              Cicilan Riil vs Biaya Operasional
            </h3>
            <p className="text-sm text-tertiary-ink leading-relaxed text-pretty">
              Hitung total pengeluaran bulanan (bensin, tol, KPR), bukan cuma
              harga brosur perumahan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
