import { Check, Waves, Timer, Scale, Hospital, type LucideIcon } from "lucide-react";

export interface FrictionItem {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tag: string;
}

export const FRICTION_OPTIONS: FrictionItem[] = [
  {
    id: "flood-access",
    icon: Waves,
    title: "Banjir & Akses Putus",
    subtitle: "Takut jalanan tergenang saat puncak musim hujan",
    tag: "Risiko Tinggi",
  },
  {
    id: "commute-gap",
    icon: Timer,
    title: "Macet & Waktu Habis",
    subtitle: "Komuter riil meleset jauh dari brosur marketing",
    tag: "Mobilitas Harian",
  },
  {
    id: "tradeoff-fatigue",
    icon: Scale,
    title: "Pusing Banding Opsi",
    subtitle: "Bingung kompromi lokasi di antara puluhan rumah",
    tag: "Keputusan Kritis",
  },
  {
    id: "facility-blindspot",
    icon: Hospital,
    title: "Fasilitas Kejauhan",
    subtitle: "Khawatir RS darurat, sekolah, & minimarket susah dijangkau",
    tag: "Kenyamanan Hidup",
  },
];

interface TactileEmotionGridProps {
  selectedId: string | null;
  onSelect: (id: string, label: string) => void;
}

export default function TactileEmotionGrid({
  selectedId,
  onSelect,
}: TactileEmotionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full mx-auto">
      {FRICTION_OPTIONS.map((item) => {
        const isSelected = selectedId === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id, item.title)}
            className={`group relative min-h-[184px] p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-[0.98] flex flex-col justify-between select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/20 ${
              isSelected
                ? "bg-[#F4FFF8] border-[#00684A] shadow-[0_8px_20px_rgba(0,30,43,0.08)] ring-2 ring-[#00ED64]/20"
                : "bg-white hover:bg-[#F9FBFA] border-[#E1E5E8] hover:border-[#A8B8C6]"
            }`}
          >
            {/* Top Row: 3D Emoji Icon & Selection Badge */}
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4F7F6] text-[#003D4F] group-hover:bg-[#E3FCEF] transition-colors flex items-center justify-center">
                <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-[#00ED64] text-[#001E2B] scale-100"
                    : "border-2 border-[#D7E1E5] bg-transparent opacity-40 group-hover:opacity-80"
                }`}
              >
                {isSelected && <Check size={14} className="stroke-[3]" />}
              </div>
            </div>

            {/* Bottom Row: Title, Subtitle, & Category Tag */}
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#00684A] bg-[#E3FCEF] px-2 py-1 rounded-full inline-block">
                {item.tag}
              </span>
              <h3 className="text-sm font-extrabold text-[#001E2B] leading-snug mt-1">
                {item.title}
              </h3>
              <p className="text-[11px] text-[#5C6C7A] font-medium leading-[1.45] mt-1 [text-wrap:pretty]">
                {item.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
