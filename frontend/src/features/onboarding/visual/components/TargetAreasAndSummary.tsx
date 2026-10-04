import { Check, CheckCircle2, Search, MapPin, ChevronDown } from "lucide-react";

export const TARGET_AREAS = [
  "Tangerang Selatan (Bintaro, BSD, Serpong)",
  "Depok (Margonda, Sawangan, GDC)",
  "Bekasi (Barat, Summarecon, Timur)",
  "Bogor & Cibubur (Cibinong, Sentul, LRT)",
  "Jakarta Timur / Perbatasan",
  "Jakarta Barat / Tangerang Kota"
];

interface TargetAreasAndSummaryProps {
  selectedAreas: string[];
  onChangeAreas: (areas: string[]) => void;
  personaLabel: string;
  budgetLabel: string;
  primaryOffice: string;
  partnerOffice: string;
}

export default function TargetAreasAndSummary({
  selectedAreas,
  onChangeAreas,
  personaLabel,
  budgetLabel,
  primaryOffice,
  partnerOffice
}: TargetAreasAndSummaryProps) {
  
  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      onChangeAreas(selectedAreas.filter(a => a !== area));
    } else {
      onChangeAreas([...selectedAreas, area]);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-[#E1E5E8] rounded-[24px] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={14} className="text-[#5C6C7A]" />
          <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#5C6C7A]">
            PILIH WILAYAH INCARAN (BISA LEBIH DARI SATU):
          </span>
        </div>

        <div className="space-y-3">
          {TARGET_AREAS.map(area => {
            const isSelected = selectedAreas.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`w-full text-left px-4 h-14 rounded-xl border flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'border-[#001E2B] bg-white' 
                    : 'border-[#E1E5E8] bg-white hover:border-[#D7E1E5]'
                }`}
              >
                <span className={`text-[13px] sm:text-[14px] font-bold ${isSelected ? 'text-[#001E2B]' : 'text-[#3D4F5B]'}`}>
                  {area}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  isSelected 
                    ? 'bg-[#00ED64] border-[#00ED64]' 
                    : 'bg-[#F9FBFA] border-[#D7E1E5]'
                }`}>
                  {isSelected && <Check size={14} className="text-[#001E2B]" />}
                </div>
              </button>
            );
          })}

          <button className="w-full text-left px-4 h-14 rounded-xl border border-[#E1E5E8] bg-white flex items-center justify-between text-[#7D8C9A]">
            <div className="flex items-center gap-3">
              <Search size={16} />
              <span className="text-[14px] font-medium">Lokasi lainnya</span>
            </div>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      <div className="bg-[#001E2B] rounded-[24px] p-5 sm:p-6 text-white space-y-5 shadow-lg">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#00ED64]" />
            <h3 className="text-[16px] font-bold text-white">Ringkasan Profil Pencarianmu</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#00ED64] bg-[#00ED64]/10 px-2 py-1 rounded">
            PROFIL TERCATAT
          </span>
        </div>

        <div className="space-y-4 text-[13px]">
          <div>
            <div className="text-[#7D8C9A] mb-1 font-medium">Rumah Tangga & Pola Kerja:</div>
            <div className="font-bold text-white">{personaLabel}</div>
          </div>
          <div>
            <div className="text-[#7D8C9A] mb-1 font-medium">Rentang Budget:</div>
            <div className="font-bold text-[#00ED64]">{budgetLabel}</div>
          </div>
          <div>
            <div className="text-[#7D8C9A] mb-1 font-medium">Lokasi Kantor Utama:</div>
            <div className="font-bold text-white">{primaryOffice || "-"}</div>
          </div>
          <div>
            <div className="text-[#7D8C9A] mb-1 font-medium">Lokasi Kantor Pasangan / Lainnya:</div>
            <div className="font-bold text-white">{partnerOffice || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
