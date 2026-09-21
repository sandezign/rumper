import { useEffect } from "react";
import { ArrowRight, CircleCheck, Lock, Map, MapPin, OctagonAlert, TriangleAlert, X } from "lucide-react";
import type { Convo } from "@/lib/api";
import { LOCATION_LIMIT } from "@/lib/entitlements";

/** Title/subtitle from what the audit actually holds: the conversation title is the address
 *  the buyer entered, `property_name` the resolved place. Show both only when they differ. */
function labelsOf(c: Convo): { title: string; subtitle: string | null } {
  const name = c.property_name?.trim();
  if (name && name !== c.title) return { title: name, subtitle: c.title };
  return { title: c.title, subtitle: null };
}

/** Status chip per property. Derived from the audit's own band — never invented:
 *  a location with no finished report shows "Investigasi", which is what it is. */
function statusOf(c: Convo): { label: string; tone: "ok" | "warn" | "stop" } {
  const band = c.band ?? null;
  if (band === "relatif_kuat") return { label: "Lanjutkan", tone: "ok" };
  if (band === "risiko_tinggi") return { label: "Tunda", tone: "stop" };
  return { label: "Investigasi", tone: "warn" };
}

const TONE = {
  ok: { cls: "bg-emerald-50 text-emerald-800 border-emerald-200/90", Icon: CircleCheck, icon: "text-emerald-600" },
  warn: { cls: "bg-amber-50 text-amber-900 border-amber-200/90", Icon: TriangleAlert, icon: "text-amber-600" },
  stop: { cls: "bg-red-50 text-red-900 border-red-200/90", Icon: OctagonAlert, icon: "text-rose-600" },
} as const;

function StatusChip({ c }: { c: Convo }) {
  const { label, tone } = statusOf(c);
  const { cls, Icon, icon } = TONE[tone];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-black uppercase leading-none shadow-2xs sm:text-[10px] ${cls}`}>
      <Icon size={11} className={`shrink-0 ${icon}`} />
      {label}
    </span>
  );
}

/** The audit's own RLS score, or an em dash while research is still running. */
function ScoreBadge({ score }: { score: number | null | undefined }) {
  const cls =
    score == null ? "bg-slate-100 text-slate-400 border-slate-200"
    : score >= 80 ? "bg-emerald-100 text-[#00684A] border-emerald-200"
    : score >= 65 ? "bg-amber-100 text-amber-900 border-amber-200"
    : "bg-rose-100 text-rose-800 border-rose-200";
  return (
    <div className={`flex size-9 shrink-0 items-center justify-center rounded-2xl border font-mono text-xs font-black sm:size-10 sm:text-sm ${cls}`}>
      {score ?? "—"}
    </div>
  );
}

/** "Pilih Properti Aktif" — the location switcher as a modal rather than a dropdown, so the
 *  quota state, each property's score and its verdict are all visible at the moment of
 *  choosing (PRD-14). Adding a location routes back through curation rather than a free-text
 *  field: an audit needs a real place, not a name someone typed. */
export default function PropertySwitcherModal({
  open, items, activeId, limit = LOCATION_LIMIT, onClose, onSelect, onUpgrade, onExploreAreas,
}: {
  open: boolean;
  items: Convo[];
  activeId?: string;
  limit?: number;
  onClose: () => void;
  onSelect: (id: string) => void;
  /** Quota is full — show the zero-quota interception, not the generic drawer. */
  onUpgrade: () => void;
  onExploreAreas?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const active = items.find((c) => c.id === activeId);
  const rest = items.filter((c) => c.id !== activeId);
  const used = items.length;
  const full = used >= limit;

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs animate-fadeIn sm:items-center sm:p-4"
         role="dialog" aria-modal="true" aria-labelledby="switcher-title">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slideUp sm:max-h-[85vh] sm:rounded-3xl">
        <div className="mx-auto mb-1 mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 sm:hidden" />
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col gap-1 pr-2">
            <h2 id="switcher-title" className="text-base font-bold leading-tight text-slate-900 sm:text-lg">
              Pilih properti aktif
            </h2>
            <div className="mt-0.5 flex items-center gap-2">
              <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none shadow-2xs sm:text-xs ${
                full ? "border-red-200/90 bg-red-50 text-red-900"
                     : "border-emerald-200/90 bg-emerald-50 text-emerald-800"}`}>
                {full
                  ? `Kuota lokasi penuh (${used}/${limit})`
                  : `${limit - used} dari ${limit} kuota lokasi tersisa`}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 sm:size-9">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-4 sm:gap-6 sm:p-6">
          {active && (
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                Sedang aktif
              </h3>
              <div className="flex flex-col justify-between gap-3 rounded-[22px] border-2 border-[#001E2B] bg-white p-3.5 shadow-md ring-2 ring-[#001E2B]/10 sm:flex-row sm:items-center sm:p-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <ScoreBadge score={active.rls_score} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-xs font-extrabold leading-snug text-[#001E2B] sm:text-sm">
                        {labelsOf(active).title}
                      </h4>
                      <StatusChip c={active} />
                      <span className="rounded-full bg-[#001E2B] px-2 py-0.5 text-[9px] font-black uppercase text-[#00ED64]">
                        Aktif di workspace
                      </span>
                    </div>
                    {labelsOf(active).subtitle && (
                      <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#5C6C7A] sm:text-xs">
                        <MapPin size={11} className="shrink-0 text-[#00684A]" />
                        <span className="truncate">{labelsOf(active).subtitle}</span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 self-end rounded-full bg-[#001E2B] px-3.5 py-1.5 text-xs font-bold text-[#00ED64] sm:self-center">
                  <span>Sedang dibuka</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                Properti tersimpan ({rest.length})
              </h3>
              <div className="flex flex-col gap-2.5">
                {rest.map((c) => (
                  <button key={c.id} type="button" onClick={() => { onClose(); onSelect(c.id); }}
                          className="group flex cursor-pointer flex-col justify-between gap-3 rounded-[22px] border border-[#E5E5EA] bg-white p-3.5 text-left transition-all duration-150 hover:border-[#CBD5E1] hover:bg-slate-50/70 active:scale-[0.99] sm:flex-row sm:items-center sm:p-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <ScoreBadge score={c.rls_score} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-xs font-extrabold leading-snug text-[#001E2B] group-hover:text-[#00684A] sm:text-sm">
                            {labelsOf(c).title}
                          </h4>
                          <StatusChip c={c} />
                        </div>
                        {labelsOf(c).subtitle && (
                          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#5C6C7A] sm:text-xs">
                            <MapPin size={11} className="shrink-0 text-[#00684A]" />
                            <span className="truncate">{labelsOf(c).subtitle}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="flex min-h-[36px] shrink-0 items-center gap-1.5 self-end rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-[#001E2B] transition-all group-hover:bg-[#001E2B] group-hover:text-[#00ED64] sm:self-center">
                      <span>Buka di workspace</span>
                      <ArrowRight size={13} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
              Belum ada properti yang dianalisis. Pilih koridor di peta wilayah untuk mulai.
            </p>
          )}

          <div className="flex flex-col gap-2 pb-2 pt-1 sm:pb-0">
            {!full && onExploreAreas && (
              <button type="button" onClick={() => { onClose(); onExploreAreas(); }}
                      className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 transition-all hover:bg-emerald-100/80 active:scale-[0.98] sm:text-sm">
                <Map size={16} className="shrink-0 text-emerald-700" aria-hidden="true" />
                <span>Tambah lokasi dari peta wilayah</span>
              </button>
            )}

            {full && (
              <button type="button" onClick={() => { onClose(); onUpgrade(); }}
                      className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3.5 text-xs font-bold text-amber-900 transition-all hover:bg-amber-100 active:scale-[0.98] sm:text-sm">
                <Lock size={16} className="shrink-0 text-amber-700" />
                <span>Kuota lokasi penuh ({used}/{limit}). Lihat paket akses</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
