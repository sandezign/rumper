import { GraduationCap, HelpCircle, Hospital, ShoppingBag, Train } from "lucide-react";
import { featureId, formatDistance, type FacilityGroup } from "@/features/analysis/evidence";

interface FacilitiesPanelV3Props {
  groups: FacilityGroup[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedEvidence: string | null;
  onSelectEvidence: (evidenceId: string | null) => void;
}

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  kesehatan: Hospital,
  pendidikan: GraduationCap,
  ritel: ShoppingBag,
  transportasi: Train,
};

/**
 * "Nearby Facilities" tab — the warehouse facility set (GET /api/checks/{id}/map) folded
 * into categories. Selecting a category filters the map's facility layer; selecting a row
 * inside it focuses that marker.
 */
export function FacilitiesPanelV3({
  groups,
  activeCategory,
  onSelectCategory,
  selectedEvidence,
  onSelectEvidence,
}: FacilitiesPanelV3Props) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-white p-md text-body-sm text-text-secondary">
        Data fasilitas untuk area ini belum tersedia di warehouse.
      </p>
    );
  }

  return (
    <div className="flex select-text flex-col gap-sm">
      <div className="flex items-start gap-xs rounded-xl border border-blue-100 bg-blue-50/50 p-sm text-blue-800">
        <HelpCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
        <p className="text-[11px] font-medium leading-relaxed">
          Fasilitas ini disediakan untuk referensi gaya hidup. Hanya fasilitas esensial yang memengaruhi skor kategori
          Fasilitas.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {groups.map((group) => {
          const Icon = GROUP_ICONS[group.key] ?? HelpCircle;
          const isSelected = activeCategory === group.key;

          return (
            <div key={group.key} className="flex flex-col border-t border-border/40 first:border-t-0">
              <button
                onClick={() => onSelectCategory(isSelected ? null : group.key)}
                className={`relative flex items-center justify-between p-md text-left outline-none transition-all duration-150 ${
                  isSelected ? "z-10 border-transparent bg-blue-50/30 ring-2 ring-blue-500/80" : "hover:bg-slate-50/50"
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex min-w-0 flex-1 items-center gap-xs">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-blue-200 bg-blue-100 text-blue-600"
                        : "border-border/40 bg-slate-50 text-text-secondary"
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </div>

                  <div className="ml-xxs min-w-0 flex-1">
                    <span
                      className={`block text-body-sm font-bold leading-tight ${
                        isSelected ? "text-blue-700" : "text-text-primary"
                      }`}
                    >
                      {group.label}
                    </span>
                    <span className="mt-xxs block truncate text-[11px] leading-normal text-text-tertiary">
                      {group.breakdown}
                    </span>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-body-xs font-bold ${
                    isSelected ? "bg-blue-600 text-white" : "border border-blue-100 bg-blue-50 text-blue-600"
                  }`}
                >
                  {group.count}
                </span>
              </button>

              {isSelected && (
                <ul className="flex flex-col border-t border-border/40 bg-slate-50/60 animate-in fade-in duration-200">
                  {group.items.map((f) => {
                    const id = featureId(f);
                    const active = selectedEvidence === id;
                    return (
                      <li key={id}>
                        <button
                          onClick={() => onSelectEvidence(active ? null : id)}
                          className={`flex w-full items-center justify-between gap-xs px-md py-2.5 text-left transition-colors hover:bg-white ${
                            active ? "bg-white" : ""
                          }`}
                        >
                          <span className="min-w-0 truncate text-body-xs font-semibold text-text-primary">
                            {f.name || f.kind}
                          </span>
                          <span className="shrink-0 text-[11px] font-medium text-text-tertiary">
                            {formatDistance(f.distance_km).replace("sekitar ", "")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
