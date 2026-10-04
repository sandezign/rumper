import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Factory,
  HelpCircle,
  Hospital,
  Milestone,
  Pill,
  School,
  ShoppingCart,
  Skull,
  Stethoscope,
  Store,
  Train,
  Trash2,
  Waves,
  Zap,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { CONFIDENCE } from "@/lib/risk";
import { formatDistance, type EvidenceIndex, type EvidenceItem } from "@/features/analysis/evidence";

interface EvidencePanelV3Props {
  index: EvidenceIndex;
  activeLayers: string[];
  onToggleLayer: (key: string) => void;
  selectedEvidence: string | null;
  onSelectEvidence: (evidenceId: string | null) => void;
}

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  hospital: Hospital,
  clinic: Stethoscope,
  pharmacy: Pill,
  school: School,
  market: Store,
  supermarket: ShoppingCart,
  station: Train,
  toll_gate: Milestone,
  sutet_tower: Zap,
  landfill: Trash2,
  industrial: Factory,
  cemetery: Skull,
  rail_point: Train,
};

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  banjir: Waves,
  commute: Train,
  akses: Milestone,
  fasilitas: Store,
  lingkungan: Factory,
  gap: HelpCircle,
};

const CONFIDENCE_BADGE: Record<string, string> = {
  data_kuat: "bg-emerald-50 text-emerald-800 border-emerald-200/50",
  data_sedang: "bg-amber-50 text-amber-800 border-amber-200/50",
  perlu_validasi: "bg-rose-50 text-rose-700 border-rose-200/50",
};

function iconFor(item: EvidenceItem) {
  return KIND_ICON[item.kind] ?? CATEGORY_ICON[item.category] ?? HelpCircle;
}

/** Right-hand chip: what kind of finding this is, at a glance. */
function statusBadge(item: EvidenceItem): { label: string; className: string } {
  if (item.isCritical) return { label: "Kritis", className: "bg-red-50 text-red-700 border-red-200/50" };
  if (item.isEvidenceGap) return { label: "Gap data", className: "bg-zinc-100 text-zinc-700 border-zinc-200/60" };
  if (item.isRedFlag) return { label: "Red flag", className: "bg-amber-50 text-amber-700 border-amber-200/50" };
  return { label: item.categoryLabel, className: "bg-slate-50 text-slate-700 border-slate-200/60" };
}

/**
 * "Evidence Risk" tab — one row per researcher finding, straight from the report payload.
 * Every row carries its evidence, limitation and validation step (CLAUDE.md rule 2); rows
 * anchored to a warehouse feature share an id with their map marker, so selecting either
 * side highlights the other.
 */
export function EvidencePanelV3({
  index,
  activeLayers,
  onToggleLayer,
  selectedEvidence,
  onSelectEvidence,
}: EvidencePanelV3Props) {
  const items = index.items;
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(() =>
    items.length > 0 ? { [items[0].id]: true } : {},
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showSourceInfo, setShowSourceInfo] = useState<Record<string, boolean>>({});
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!selectedEvidence) return;
    if (!items.some((i) => i.id === selectedEvidence)) return;
    setExpandedRows((prev) => ({ ...prev, [selectedEvidence]: true }));
    const t = window.setTimeout(() => {
      rowRefs.current[selectedEvidence]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [selectedEvidence, items]);

  const toggleRow = (id: string) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-white p-md text-body-sm text-text-secondary">
        Belum ada temuan riset untuk lokasi ini.
      </p>
    );
  }

  return (
    <div className="flex select-text flex-col gap-sm pb-16 font-sans">
      <p className="px-xs text-body-xs leading-relaxed text-text-secondary">
        Aktifkan layer peta lewat sakelar. Klik baris untuk detail temuan.
      </p>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {items.map((item) => {
          const isOpen = !!expandedRows[item.id];
          const Icon = iconFor(item);
          const isToggled = activeLayers.includes(item.layerKey);
          const isChecked = !!checkedItems[item.id];
          const isShowingSource = !!showSourceInfo[item.id];
          const isSelected = selectedEvidence === item.id;
          const badge = statusBadge(item);
          const confidence = CONFIDENCE[item.confidence];

          return (
            <div
              key={item.id}
              ref={(el) => {
                rowRefs.current[item.id] = el;
              }}
              className="flex flex-col border-t border-border/40 first:border-t-0"
            >
              <div
                role="button"
                aria-expanded={isOpen}
                onClick={() => {
                  toggleRow(item.id);
                  onSelectEvidence(isSelected && isOpen ? null : item.id);
                }}
                className={`flex cursor-pointer items-center justify-between p-md transition-colors hover:bg-slate-50/70 ${
                  isSelected ? "bg-brand-teal-light/20" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-xs pr-2">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isOpen || isSelected
                        ? "border border-[#001e2b] bg-[#001e2b] text-white shadow-xs"
                        : "border border-border/50 bg-slate-50 text-brand-teal-deep"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-bold text-text-primary">{item.title}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {item.distanceKm !== null && (
                    <span className="hidden whitespace-nowrap rounded-md border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 sm:inline">
                      {formatDistance(item.distanceKm).replace("sekitar ", "")}
                    </span>
                  )}

                  <span
                    className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.className}`}
                  >
                    {badge.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="hidden font-sans text-[10px] text-text-tertiary sm:inline">Tampilkan di peta</span>
                    <Switch
                      checked={isToggled}
                      onCheckedChange={() => onToggleLayer(item.layerKey)}
                      aria-label={`Tampilkan di peta: ${item.title}`}
                      title={isToggled ? "Matikan layer di peta" : "Aktifkan layer di peta"}
                    />
                  </div>

                  <button
                    onClick={() => {
                      toggleRow(item.id);
                      onSelectEvidence(isSelected && isOpen ? null : item.id);
                    }}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-slate-100"
                    aria-label={isOpen ? "Sembunyikan detail" : "Tampilkan detail"}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="flex flex-col gap-md border-t border-border/40 bg-slate-50/50 px-lg py-md animate-in fade-in duration-200">
                  <div className="flex select-text flex-col gap-xs">
                    <h4 className="text-body-sm font-bold leading-snug text-text-primary">{item.claim}</h4>
                    {item.limitation && (
                      <p className="mt-0.5 text-body-xs font-medium leading-relaxed text-text-secondary">
                        {item.limitation}
                      </p>
                    )}

                    {item.evidence.length > 0 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSourceInfo((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                          }}
                          className="mt-1 inline-flex w-fit cursor-pointer items-center gap-1 text-caption-bold font-bold text-indigo-600 transition-colors hover:text-indigo-800"
                        >
                          <span>{isShowingSource ? "Sembunyikan detail sumber" : "Lihat detail sumber data"}</span>
                          <ArrowRight
                            className={`size-3.5 transition-transform duration-200 ${isShowingSource ? "rotate-90" : ""}`}
                          />
                        </button>

                        {isShowingSource && (
                          <div className="mt-2 flex flex-col gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-caption shadow-xs animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-950">
                                Informasi sumber data
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                  CONFIDENCE_BADGE[item.confidence] ?? CONFIDENCE_BADGE.perlu_validasi
                                }`}
                              >
                                {confidence?.label ?? "Perlu validasi"}
                              </span>
                            </div>
                            {item.evidence.map((ev, idx) => (
                              <p key={idx} className="text-body-xs font-semibold text-text-primary">
                                <span className="font-normal text-text-secondary">Sumber: </span>
                                {ev.url ? (
                                  <a
                                    href={ev.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-brand-teal hover:underline"
                                  >
                                    {ev.source_title} ↗
                                  </a>
                                ) : (
                                  ev.source_title
                                )}
                                {ev.accessed_at ? (
                                  <span className="font-normal text-text-tertiary"> · diakses {ev.accessed_at}</span>
                                ) : null}
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {item.validationAction && (
                      <div className="langkah-validasi-box mt-md flex flex-col gap-1.5 rounded-xl border border-border/60 bg-white p-3 shadow-xs">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-teal-deep">
                          Langkah validasi
                        </span>
                        <button
                          onClick={() => setCheckedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                          className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-slate-50/80"
                        >
                          <span
                            className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-all ${
                              isChecked ? "border-brand-teal-mid bg-brand-teal-mid text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && (
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                <path
                                  d="M3 8l4 4 6-6"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`font-sans text-body-xs font-semibold leading-relaxed ${
                              isChecked ? "text-slate-400 line-through decoration-slate-300" : "text-text-primary"
                            }`}
                          >
                            {item.validationAction}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
