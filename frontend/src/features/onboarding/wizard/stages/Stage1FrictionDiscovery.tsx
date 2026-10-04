import { useState } from "react"
import { Check } from "lucide-react"
import mascotRumper from "@/assets/mascott-rumper.webp"
import floodIcon from "@/assets/illustrations/onboarding/rumper-icon-flood.svg"
import commuteIcon from "@/assets/illustrations/onboarding/rumper-icon-commute.svg"
import compareIcon from "@/assets/illustrations/onboarding/rumper-icon-compare.svg"
import facilitiesIcon from "@/assets/illustrations/onboarding/rumper-icon-facilities.svg"
import researchIcon from "@/assets/illustrations/onboarding/rumper-icon-research.svg"
import budgetIcon from "@/assets/illustrations/onboarding/rumper-icon-budget.svg"
import otherIcon from "@/assets/illustrations/onboarding/rumper-icon-other.svg"

interface Stage1Props {
  onSelect: (id: string, label: string) => void
}

const FRICTION_OPTIONS = [
  {
    id: "flood-access",
    label: "Khawatir risiko banjir musiman & jalan akses tergenang saat musim hujan",
    icon: floodIcon,
  },
  {
    id: "commute-discrepancy",
    label: "Waktu perjalanan komuter meleset jauh dari klaim manis brosur penjualan",
    icon: commuteIcon,
  },
  {
    id: "tradeoff-confusion",
    label: "Pusing menimbang kompromi lokasi di antara puluhan opsi rumah",
    icon: compareIcon,
  },
  {
    id: "essential-facilities",
    label: "Khawatir air tanah keruh, minimarket jauh, & RS susah dijangkau",
    icon: facilitiesIcon,
  },
  {
    id: "research-overload",
    label:
      "Kelelahan riset: harus buka puluhan tab peta, berita banjir, & grup warga",
    icon: researchIcon,
  },
  {
    id: "budget-kpr",
    label:
      "Khawatir cicilan KPR dan biaya tak terduga menguras tabungan keluarga",
    icon: budgetIcon,
  },
  {
    id: "something-else",
    label: "Ada pertimbangan atau kekhawatiran spesifik lainnya",
    icon: otherIcon,
  },
]

export default function Stage1FrictionDiscovery({ onSelect }: Stage1Props) {
  const [selectedId, setSelectedId] = useState<string>("flood-access")

  const handleSelect = (id: string, label: string) => {
    setSelectedId(id)
    // the id is the mapping key; the label is copy and will change
    onSelect(id, label)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_clamp(4.5rem,18vw,6rem)] items-start gap-x-3 sm:grid-cols-[minmax(0,1fr)_7rem] sm:gap-x-5 md:grid-cols-[minmax(0,1fr)_9rem] lg:grid-cols-[minmax(0,1fr)_10rem] lg:gap-x-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-deep-teal md:text-3xl">
              Apa hal yang paling bikin kamu cemas pas cari rumah?
            </h2>
            <p className="text-sm md:text-base text-tertiary-ink mt-1">
              Pilih kendala utamamu biar Rumper bisa fokus nyaring risiko yang
              paling relevan buat kamu.
            </p>
          </div>
          <img
            src={mascotRumper}
            alt=""
            aria-hidden="true"
            className="h-auto w-full justify-self-end object-contain"
          />
        </div>
      </div>

      {/* Selectable List Options */}
      <fieldset className="space-y-3">
        <legend className="sr-only">Kendala utama saat mencari rumah</legend>
        {FRICTION_OPTIONS.map((opt) => {
          const isSelected = selectedId === opt.id

          return (
            <label
              key={opt.id}
              className={`group relative w-full p-4 md:p-4.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between min-h-[72px] select-none text-left has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep-teal ${
                isSelected
                  ? "border-deep-teal bg-canvas-white shadow-sm ring-2 ring-deep-teal/5 text-deep-teal -translate-y-0.5"
                  : "border-subtle-border bg-canvas-white text-secondary-ink hover:border-strong-border hover:bg-reading-surface hover:-translate-y-0.5"
              }`}
            >
              <input
                type="radio"
                name="friction"
                value={opt.id}
                checked={isSelected}
                onChange={() => handleSelect(opt.id, opt.label)}
                className="sr-only"
              />
              <div className="flex items-center gap-3.5 pr-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isSelected ? "bg-soft-green scale-105" : "bg-feature-mint group-hover:scale-105"
                  }`}
                >
                  <img
                    src={opt.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-8 w-8 object-contain transition-transform duration-200"
                  />
                </div>
                <span className="text-sm font-semibold leading-snug">
                  {opt.label}
                </span>
              </div>

              {isSelected && (
                <div
                  aria-hidden="true"
                  className="w-6 h-6 rounded-full bg-rumper-green text-deep-teal flex items-center justify-center shrink-0 shadow-xs animate-check-pop"
                >
                  <Check size={14} className="stroke-[3]" />
                </div>
              )}
            </label>
          )
        })}
      </fieldset>
    </div>
  )
}
