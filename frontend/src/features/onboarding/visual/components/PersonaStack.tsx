import { Check, UserRound, HeartHandshake, UsersRound, Building2, Laptop, House, type LucideIcon } from "lucide-react";

export interface PersonaOption {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  focus: string;
}

export const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: "single",
    icon: UserRound,
    title: "Single Professional",
    subtitle: "Tinggal sendiri / mandiri",
    focus: "Dekat stasiun & kafe/lifestyle",
  },
  {
    id: "couple",
    icon: HeartHandshake,
    title: "Pasangan Muda",
    subtitle: "Rencana jangka menengah",
    focus: "Akses tol/KRL & efisiensi kerja",
  },
  {
    id: "family",
    icon: UsersRound,
    title: "Keluarga & Anak",
    subtitle: "Mengutamakan stabilitas",
    focus: "Dekat sekolah favorit & RS",
  },
];

export const WORK_PATTERNS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "full-wfo", label: "WFO", icon: Building2 },
  { id: "hybrid", label: "Hybrid", icon: Laptop },
  { id: "remote", label: "Remote", icon: House },
];

interface PersonaStackProps {
  selectedPersona: string;
  selectedWorkPattern: string;
  onSelectPersona: (id: string) => void;
  onSelectWorkPattern: (id: string) => void;
}

export default function PersonaStack({
  selectedPersona,
  selectedWorkPattern,
  onSelectPersona,
  onSelectWorkPattern,
}: PersonaStackProps) {
  return (
    <div className="flex flex-col gap-5 w-full mx-auto select-none">
      {/* 3D Persona Cards */}
      <div className="grid grid-cols-1 gap-2.5">
        {PERSONA_OPTIONS.map((item) => {
          const isSelected = selectedPersona === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPersona(item.id)}
              className={`min-h-[88px] p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center gap-3 relative focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/20 ${
                isSelected
                  ? "bg-[#F4FFF8] border-[#00684A] shadow-[0_8px_20px_rgba(0,30,43,0.08)] ring-2 ring-[#00ED64]/20"
                  : "bg-white hover:bg-[#F9FBFA] border-[#E1E5E8] hover:border-[#A8B8C6]"
              }`}
            >
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#00ED64] text-[#001E2B] flex items-center justify-center">
                  <Check size={12} className="stroke-[3]" />
                </span>
              )}
              <div className="w-11 h-11 shrink-0 rounded-xl bg-[#F4F7F6] text-[#003D4F] flex items-center justify-center">
                <Icon size={22} strokeWidth={2.1} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-extrabold text-[#001E2B]">{item.title}</h4>
                <p className="text-[11px] text-[#5C6C7A] font-medium mt-0.5">{item.subtitle}</p>
                <p className="text-[10px] font-bold text-[#00684A] mt-1">{item.focus}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Work Pattern Chips */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-[#5C6C7A] block">
          Pola Mobilitas Kerja:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {WORK_PATTERNS.map((wp) => {
            const isSelected = selectedWorkPattern === wp.id;
            const Icon = wp.icon;
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => onSelectWorkPattern(wp.id)}
                className={`min-h-[44px] px-3 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "bg-[#001E2B] text-white border-[#001E2B] shadow-2xs"
                    : "bg-white text-[#3D4F5B] border-[#D7E1E5] hover:bg-[#F4F7F6]"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{wp.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
