import { Sparkles } from "lucide-react";
import type { CuratedArea } from "@/features/areas/data/mockCuratedAreas";
import CuratedAreaCard from "./CuratedAreaCard";

/** The "Daftar Area" tab: every curated corridor as a full card. */
export default function DaftarAksesibelView({
  areas, reports = {}, busyId, onToggleBookmark, onOpenDrawer, onEvaluateArea,
}: {
  areas: CuratedArea[];
  /** areaId → conversationId, so a corridor that already has an audit says so. */
  reports?: Record<string, string>;
  busyId?: string | null;
  onToggleBookmark: (id: string) => void;
  onOpenDrawer: (area: CuratedArea) => void;
  onEvaluateArea: (area: CuratedArea) => void;
}) {
  if (areas.length === 0) {
    return (
      <div className="space-y-3 rounded-3xl border border-[#E1E5E8] bg-white p-12 text-center text-[#5C6C7A] shadow-xs">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[#318266]/20 bg-[#E9F5EF] text-[#00684A]">
          <Sparkles size={24} />
        </div>
        <h3 className="text-base font-extrabold text-[#001E2B]">Tidak ada area dalam kategori ini</h3>
        <p className="mx-auto max-w-md text-xs text-[#5C6C7A]">
          Pilih filter kategori kesesuaian lain di atas untuk meninjau opsi wilayah Jabodetabek
          lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-12 animate-fadeIn md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {areas.map((area) => (
        <CuratedAreaCard
          key={area.id}
          area={area}
          variant="grid"
          reportReady={Boolean(reports[area.id])}
          busy={busyId === area.id}
          onToggleBookmark={onToggleBookmark}
          onOpenDrawer={onOpenDrawer}
          onEvaluate={onEvaluateArea}
        />
      ))}
    </div>
  );
}
