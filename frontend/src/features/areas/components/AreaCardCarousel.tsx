import { useCallback, useEffect, useRef } from "react";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import type { CuratedArea, FitCategory } from "@/features/areas/data/mockCuratedAreas";
import CuratedAreaCard from "./CuratedAreaCard";

export type CarouselFilter = "all" | FitCategory | "shortlisted";

const CHIPS: { key: CarouselFilter; label: string; dot?: string }[] = [
  { key: "all", label: "Semua" },
  { key: "strong-fit", label: "Paling Sesuai", dot: "#34C759" },
  { key: "interesting-tradeoff", label: "Moderate", dot: "#FF9F0A" },
  { key: "challenge-assumptions", label: "Alternatif", dot: "#FF453A" },
  { key: "shortlisted", label: "Area Tersimpan" },
];

/** Filter chips + horizontally-snapping peek cards, docked over the map.
 *
 *  Two-way bound to the map selection: picking a pin scrolls the matching card into view,
 *  and settling the scroll selects the corridor under the centre. That is the whole point of
 *  the pattern — on a phone the map has no room for an inspector panel, so the card *is* the
 *  inspector. */
export default function AreaCardCarousel({
  areas, selectedAreaId, filter, counts, reports = {}, busyId,
  onSelectArea, onFilterChange, onToggleBookmark, onOpenDrawer, onEvaluate,
}: {
  areas: CuratedArea[];
  selectedAreaId: string | null;
  filter: CarouselFilter;
  counts: Record<CarouselFilter, number>;
  reports?: Record<string, string>;
  busyId?: string | null;
  onSelectArea: (id: string) => void;
  onFilterChange: (f: CarouselFilter) => void;
  onToggleBookmark: (id: string) => void;
  onOpenDrawer: (area: CuratedArea) => void;
  onEvaluate: (area: CuratedArea) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cards = useRef<Map<string, HTMLDivElement>>(new Map());
  const programmatic = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const centre = useCallback((id: string) => {
    const el = cards.current.get(id);
    if (!el) return;
    programmatic.current = true;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => { programmatic.current = false; }, 500);
  }, []);

  // The map owns selection too, so a pin tap has to bring its card into view.
  useEffect(() => {
    if (!selectedAreaId || programmatic.current) return;
    centre(selectedAreaId);
  }, [selectedAreaId, centre]);

  useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);

  const onScroll = useCallback(() => {
    if (programmatic.current) return;
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const mid = track.getBoundingClientRect().left + track.offsetWidth / 2;
      let closest = "";
      let best = Infinity;
      cards.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(mid - (r.left + r.width / 2));
        if (d < best) { best = d; closest = id; }
      });
      if (closest && closest !== selectedAreaId) onSelectArea(closest);
    }, 100);
  }, [selectedAreaId, onSelectArea]);

  const step = (dir: -1 | 1) => {
    if (areas.length === 0) return;
    const i = Math.max(0, areas.findIndex((a) => a.id === selectedAreaId));
    const next = areas[(i + dir + areas.length) % areas.length];
    if (!next) return;
    onSelectArea(next.id);
    centre(next.id);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end pb-2 sm:pb-4">
      <div className="pointer-events-auto mb-2 px-4">
        <div className="scrollbar-none flex touch-pan-x items-center gap-1.5 overflow-x-auto scroll-smooth pb-1">
          {CHIPS.map(({ key, label, dot }) => {
            const on = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilterChange(on && key !== "all" ? "all" : key)}
                aria-pressed={on}
                className={`flex min-h-[34px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold backdrop-blur-xl transition-all duration-150 active:scale-[0.96] ${
                  on ? "bg-[#001E2B] font-bold text-white shadow-sm"
                     : "border border-black/10 bg-white/85 text-[#1C1C1E] shadow-xs hover:bg-white"
                }`}
              >
                {dot && <span className="size-2 rounded-full" style={{ background: dot }} />}
                {key === "shortlisted" && (
                  <Bookmark size={12} className={on ? "fill-[#00ED64] text-[#00ED64]" : "fill-[#34C759] text-[#34C759]"} />
                )}
                <span>{label} (<span className="tabular-nums">{counts[key] ?? 0}</span>)</span>
              </button>
            );
          })}
        </div>
      </div>

      {areas.length > 0 ? (
        <div className="relative w-full overflow-hidden">
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="scrollbar-none pointer-events-auto flex touch-pan-x snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-smooth px-[7vw] pb-2 sm:px-[12vw]"
            style={{ scrollPaddingLeft: "7vw", scrollPaddingRight: "7vw" }}
          >
            {areas.map((area) => (
              <div key={area.id} className="shrink-0"
                   ref={(el) => { if (el) cards.current.set(area.id, el); else cards.current.delete(area.id); }}>
                <CuratedAreaCard
                  area={area}
                  variant="carousel"
                  isSelected={area.id === selectedAreaId}
                  reportReady={Boolean(reports[area.id])}
                  busy={busyId === area.id}
                  onSelect={() => { if (area.id !== selectedAreaId) { onSelectArea(area.id); centre(area.id); } }}
                  onToggleBookmark={onToggleBookmark}
                  onOpenDrawer={onOpenDrawer}
                  onEvaluate={onEvaluate}
                />
              </div>
            ))}
          </div>

          {areas.length > 1 && (
            <div className="pointer-events-none absolute inset-x-2 inset-y-0 hidden items-center justify-between sm:flex">
              {([[-1, ChevronLeft, "Wilayah sebelumnya"], [1, ChevronRight, "Wilayah selanjutnya"]] as const).map(
                ([dir, Icon, title]) => (
                  <button key={title} type="button" title={title} aria-label={title} onClick={() => step(dir)}
                          className="pointer-events-auto flex size-9 cursor-pointer items-center justify-center rounded-full border border-[#E1E5E8] bg-white/90 text-[#001E2B] shadow-md backdrop-blur-md transition-colors transition-transform hover:bg-white active:scale-[0.96]">
                    <Icon size={16} />
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="pointer-events-auto mx-4 rounded-2xl border border-[#E1E5E8] bg-white/95 p-4 text-center text-xs text-[#5C6C7A] shadow-lg backdrop-blur-md">
          Tidak ada wilayah yang cocok dengan filter.
        </div>
      )}
    </div>
  );
}
