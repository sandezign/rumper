import { Check, Sparkles } from "lucide-react";

export interface BudgetTier {
  id: string;
  label: string;
  rangeText: string;
  minVal: number;
  maxVal: number;
  kprEst: string;
  popular?: boolean;
}

export const BUDGET_TIERS: BudgetTier[] = [
  {
    id: "under-700",
    label: "Terjangkau / Starter",
    rangeText: "< Rp 700 Juta",
    minVal: 400,
    maxVal: 700,
    kprEst: "Est. KPR ~Rp 3,5 – 5,0 Jt / bln",
  },
  {
    id: "700-1200",
    label: "Paling Populer di Jabodetabek",
    rangeText: "Rp 700 Jt – 1,2 Milyar",
    minVal: 700,
    maxVal: 1200,
    kprEst: "Est. KPR ~Rp 5,5 – 9,5 Jt / bln",
    popular: true,
  },
  {
    id: "1200-2000",
    label: "Menengah Mapan",
    rangeText: "Rp 1,2 M – 2,0 Milyar",
    minVal: 1200,
    maxVal: 2000,
    kprEst: "Est. KPR ~Rp 9,5 – 15,0 Jt / bln",
  },
  {
    id: "above-2000",
    label: "Premium / Spacious",
    rangeText: "> Rp 2,0 Milyar",
    minVal: 2000,
    maxVal: 3500,
    kprEst: "Est. KPR > Rp 15 Jt / bln",
  },
];

interface BudgetTierTilesProps {
  selectedPreset: string;
  onSelectTier: (tier: BudgetTier) => void;
}

export default function BudgetTierTiles({
  selectedPreset,
  onSelectTier,
}: BudgetTierTilesProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full mx-auto select-none">
      {BUDGET_TIERS.map((tier) => {
        const isSelected = selectedPreset === tier.id;
        return (
          <button
            key={tier.id}
            type="button"
            onClick={() => onSelectTier(tier)}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-between relative focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/20 ${
              isSelected
                ? "bg-[#F4FFF8] border-[#00684A] shadow-[0_8px_20px_rgba(0,30,43,0.08)] ring-2 ring-[#00ED64]/20"
                : "bg-white hover:bg-[#F9FBFA] border-[#E1E5E8] hover:border-[#A8B8C6]"
            }`}
          >
            <div className="space-y-1 min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-[#001E2B] tracking-tight">
                  {tier.rangeText}
                </span>
                {tier.popular && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-[#001E2B] text-[#00ED64] px-2 py-0.5 rounded-full">
                    <Sparkles size={10} /> Rekomendasi
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5C6C7A] font-semibold">{tier.label}</p>
              <span className="text-[11px] font-bold text-[#00684A] bg-[#E9F5EF] px-2 py-0.5 rounded-md inline-block">
                {tier.kprEst}
              </span>
            </div>

            <div
              className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-[#00ED64] text-[#001E2B] scale-100"
                  : "border-2 border-[#D7E1E5] bg-transparent opacity-40"
              }`}
            >
              {isSelected && <Check size={16} className="stroke-[3]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
