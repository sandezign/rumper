import { DollarSign, Sliders } from "lucide-react"

interface Step3Props {
  budgetPreset: string
  budgetMin: number
  budgetMax: number
  onChange: (fields: {
    budgetPreset?: string
    budgetMin?: number
    budgetMax?: number
  }) => void
}

const PRESETS = [
  { id: "under-500", label: "< Rp 500 Jt", min: 300, max: 500 },
  { id: "500-800", label: "Rp 500 Jt – 800 Jt", min: 500, max: 800 },
  { id: "800-1200", label: "Rp 800 Jt – 1,2 M", min: 800, max: 1200 },
  { id: "1200-1800", label: "Rp 1,2 M – 1,8 M", min: 1200, max: 1800 },
  { id: "above-1800", label: "> Rp 1,8 M", min: 1800, max: 3000 },
]

export default function Step3BudgetRange({
  budgetPreset,
  budgetMin,
  budgetMax,
  onChange,
}: Step3Props) {
  const formatRupiah = (valInMillions: number) => {
    if (valInMillions >= 1000) {
      return `Rp ${(valInMillions / 1000).toFixed(1).replace(".0", "")} Miliar`
    }
    return `Rp ${valInMillions} Juta`
  }

  const handleSelectPreset = (preset: typeof PRESETS[number]) => {
    onChange({
      budgetPreset: preset.id,
      budgetMin: preset.min,
      budgetMax: preset.max,
    })
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#00684A] mb-2 flex items-center gap-1.5">
          <span>Langkah 03</span>
          <span className="text-[#A8B3BC]">/</span>
          <span>Batas Budget</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#001E2B] tracking-tight">
          Batas Anggaran & Cicilan KPR
        </h2>
        <p className="text-sm md:text-base text-[#5C6C7A] mt-1">
          Tentukan rentang harga yang realistis agar beban cicilan bulanan tetap aman bagi keuanganmu.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-5 md:p-8 border border-[#D7E1E5] shadow-sm space-y-6">
        {/* Preset Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6C7A]">
              <DollarSign size={15} className="text-[#001E2B]" />
              <span>Pilihan Rentang Anggaran:</span>
            </label>
            <span className="text-xs font-extrabold text-[#004F38] bg-[#DCEEE7] px-3 py-1 rounded-full border border-[#318266]/30">
              {formatRupiah(budgetMin)} — {formatRupiah(budgetMax)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {PRESETS.map((p) => {
              const isSelected = budgetPreset === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`min-h-[48px] px-3 py-2.5 rounded-2xl border text-xs md:text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] ${
                    isSelected
                      ? "border-[#001E2B] bg-white text-[#001E2B] shadow-sm ring-2 ring-[#001E2B]/10"
                      : "border-[#D7E1E5] bg-white text-[#3D4F5B] hover:border-[#C1CCD6] hover:bg-[#F9FBFA]"
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        <hr className="border-[#E1E5E8]" />

        {/* Flexible Range Sliders */}
        <div className="bg-[#F4F7F6] rounded-2xl p-4 md:p-6 border border-[#D7E1E5] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D4F5B]">
              <Sliders size={15} className="text-[#5C6C7A]" />
              <span>Kustomisasi Anggaran Fleksibel</span>
            </div>
            <span className="text-xs text-[#7C8C9A] font-medium hidden sm:inline">
              Geser untuk batas spesifik
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#5C6C7A] mb-1.5">
                <span>Batas Minimum:</span>
                <span className="text-[#001E2B] font-extrabold">
                  {formatRupiah(budgetMin)}
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={Math.min(budgetMax - 100, 3000)}
                step={50}
                value={budgetMin}
                onChange={(e) =>
                  onChange({
                    budgetMin: Number(e.target.value),
                    budgetPreset: "custom",
                  })
                }
                className="w-full accent-[#001E2B] cursor-pointer h-2 bg-[#E1E5E8] rounded-lg touch-action-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#5C6C7A] mb-1.5">
                <span>Batas Maksimum:</span>
                <span className="text-[#001E2B] font-extrabold">
                  {formatRupiah(budgetMax)}
                </span>
              </div>
              <input
                type="range"
                min={Math.max(budgetMin + 100, 400)}
                max={4000}
                step={50}
                value={budgetMax}
                onChange={(e) =>
                  onChange({
                    budgetMax: Number(e.target.value),
                    budgetPreset: "custom",
                  })
                }
                className="w-full accent-[#001E2B] cursor-pointer h-2 bg-[#E1E5E8] rounded-lg touch-action-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
