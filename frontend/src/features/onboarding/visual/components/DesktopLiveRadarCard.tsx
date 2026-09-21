import { Sparkles, MapPin, Train, ShieldCheck, Compass, ArrowRight } from "lucide-react";

interface DesktopLiveRadarCardProps {
  currentStage: number;
  commuteMinutes: number;
  selectedFriction: string | null;
  selectedPersona: string;
  selectedBudgetRange: string;
}

export default function DesktopLiveRadarCard({
  commuteMinutes,
  selectedFriction,
  selectedPersona,
  selectedBudgetRange,
}: DesktopLiveRadarCardProps) {
  const getEstimatedCorridors = () => {
    if (commuteMinutes <= 30) return 4;
    if (commuteMinutes <= 50) return 9;
    return 14;
  };

  const matchingCount = getEstimatedCorridors();

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-[32px] border border-[#E1E5E8] shadow-[0_20px_48px_rgba(0,30,43,0.08)] p-6 xl:p-8 flex flex-col justify-between h-full min-h-[480px]">
      {/* Top Meta Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F6]">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-[#001E2B] text-[#00ED64]">
              <Compass size={16} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#001E2B]">
              Radar Kurasi Wilayah
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#00684A] bg-[#E9F5EF] px-2.5 py-0.5 rounded-full border border-[#318266]/20 flex items-center gap-1">
            <Sparkles size={11} /> Real-time
          </span>
        </div>

        {/* Dynamic Matched Count Card */}
        <div className="p-4.5 rounded-2xl bg-[#001E2B] text-white flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7C8C9A]">
              Koridor Terfilter
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-black text-[#00ED64] tabular-nums">
                {matchingCount}
              </span>
              <span className="text-xs font-bold text-white/80">Kawasan Jabodetabek</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
            📍
          </div>
        </div>

        {/* Live Filter Tags Summary */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#7C8C9A]">
            Parameter Terkunci:
          </span>
          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded-xl bg-[#F4F7F8] border border-[#E1E5E8] flex items-center justify-between text-xs">
              <span className="font-medium text-[#5C6C7A] flex items-center gap-1.5">
                <Train size={13} className="text-[#00684A]" /> Toleransi Komuter
              </span>
              <span className="font-extrabold text-[#001E2B] tabular-nums">
                Maks ~{commuteMinutes} Menit
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F4F7F8] border border-[#E1E5E8] flex items-center justify-between text-xs">
              <span className="font-medium text-[#5C6C7A] flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#00684A]" /> Filter Utama
              </span>
              <span className="font-extrabold text-[#001E2B] truncate max-w-[140px]">
                {selectedFriction === "flood-access"
                  ? "Bebas Banjir & Akses"
                  : selectedFriction === "commute-gap"
                  ? "Komuter Cepat"
                  : "Standar Keselarasan"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F4F7F8] border border-[#E1E5E8] flex items-center justify-between text-xs">
              <span className="font-medium text-[#5C6C7A] flex items-center gap-1.5">
                <MapPin size={13} className="text-[#00684A]" /> Target Budget
              </span>
              <span className="font-extrabold text-[#001E2B] truncate max-w-[140px]">
                {selectedBudgetRange || "Rp 700 Jt – 1,2 M"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corridor Previews */}
      <div className="pt-4 border-t border-[#F0F4F6] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#5C6C7A]">
          <span>Contoh Koridor Sesuai ({selectedPersona === "family" ? "Keluarga" : "Aktif"}):</span>
          <span className="text-[#00684A] font-black">Top Matches</span>
        </div>
        <div className="space-y-1.5">
          {["Bintaro & Pondok Aren", "Serpong & BSD Fringe", "Margonda & Beji"].map((cName) => (
            <div
              key={cName}
              className="p-2.5 rounded-xl bg-white border border-[#E1E5E8] flex items-center justify-between text-xs font-bold text-[#001E2B] shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00ED64]" />
                <span>{cName}</span>
              </div>
              <ArrowRight size={12} className="text-[#7C8C9A]" />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#7C8C9A] font-medium text-center pt-2">
          Pilihanmu menyaring data InaRISK, Google Routes, dan OSM secara instan.
        </p>
      </div>
    </div>
  );
}
