import { useEffect } from "react";
import { ArrowRight, Bookmark, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { formatRp, tierOf, type PricingTierKey } from "@/lib/entitlements";

/** Zero-quota interception (PRD-13 §4 Module 4).
 *
 *  Shown when the buyer asks for another location with nothing left on the free trial. The
 *  point of the screen is reassurance first — the audits already run are not lost — and only
 *  then the two ways forward. */
export default function ZeroQuotaModal({
  open, onClose, onSelectTier, onOpenArchive, auditedCount,
}: {
  open: boolean;
  onClose: () => void;
  onSelectTier: (tier: PricingTierKey) => void;
  onOpenArchive?: () => void;
  auditedCount: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const single = tierOf("single");
  const bundle = tierOf("bundle");

  return (
    <div className="fixed inset-0 z-[2999] flex select-none items-center justify-center bg-[#001E2B]/50 p-4 backdrop-blur-md animate-fadeIn"
         onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Batas kuota gratis tercapai"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-black/10 bg-white/95 p-6 text-[#001E2B] shadow-[0_24px_60px_rgba(0,30,43,0.18)] backdrop-blur-2xl animate-slideUp sm:p-7"
      >
        <button type="button" onClick={onClose} aria-label="Tutup"
                className="absolute right-5 top-5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/5 text-[#5C6C7A] transition-all hover:bg-black/10 hover:text-[#001E2B] active:scale-90">
          <X size={16} />
        </button>

        <div className="mb-2.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-800">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
            Kuota gratis selesai ({auditedCount}/{auditedCount})
          </span>
        </div>

        <h3 className="mb-1.5 text-xl font-bold leading-tight tracking-tight text-[#001E2B] sm:text-2xl">
          Buka investigasi lokasi baru
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-[#5C6C7A] sm:text-sm">
          {auditedCount} properti yang sudah kamu investigasi tetap tersimpan di arsip. Pilih paket
          akses untuk mengevaluasi lokasi berikutnya:
        </p>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <button type="button" onClick={() => { onClose(); onSelectTier("single"); }}
                  className="group relative flex w-full cursor-pointer flex-col justify-between rounded-[22px] border border-[#E5E5EA] bg-[#F8F9FA] p-4 text-left shadow-xs transition-all duration-200 hover:bg-[#F2F4F5] active:scale-[0.97]">
            <div>
              <div className="flex size-10 items-center justify-center rounded-2xl border border-black/5 bg-white text-[#001E2B] shadow-xs transition-transform group-hover:scale-105">
                <Zap size={18} />
              </div>
              <h4 className="mt-3 text-sm font-bold text-[#001E2B] sm:text-base">Single Pass</h4>
              <p className="mt-0.5 text-xs text-[#5C6C7A]">Akses penuh 1 rumah</p>
            </div>
            <div className="mt-4 border-t border-black/5 pt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-base font-bold tabular-nums text-[#001E2B] sm:text-lg">
                  {formatRp(single.price)}
                </span>
                <span className="font-mono text-[10px] text-[#8E8E93] line-through">
                  {formatRp(single.originalPrice)}
                </span>
              </div>
              <div className="mt-2.5 w-full rounded-xl border border-black/5 bg-white px-2.5 py-1.5 text-center text-[11px] font-semibold text-[#001E2B] transition-colors group-hover:bg-[#E5E5EA]">
                Pilih 1 lokasi
              </div>
            </div>
          </button>

          <button type="button" onClick={() => { onClose(); onSelectTier("bundle"); }}
                  className="group relative flex w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[22px] border-2 border-[#001E2B] bg-white p-4 text-left shadow-[0_8px_24px_rgba(0,30,43,0.08)] transition-all duration-200 active:scale-[0.97]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#001E2B] text-[#00ED64] shadow-xs transition-transform group-hover:scale-105">
                  <Sparkles size={18} />
                </div>
                <span className="rounded-full border border-[#318266]/20 bg-[#E9F5EF] px-2 py-0.5 text-[10px] font-black uppercase text-[#00684A]">
                  Hemat 73%
                </span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-[#001E2B] sm:text-base">Shortlist Bundle</h4>
              <p className="mt-0.5 text-xs text-[#5C6C7A]">3 properti + komparasi</p>
            </div>
            <div className="mt-4 border-t border-black/5 pt-3">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-base font-bold tabular-nums text-[#001E2B] sm:text-lg">
                    {formatRp(bundle.price)}
                  </span>
                  <span className="font-mono text-[10px] text-[#8E8E93] line-through">
                    {formatRp(bundle.originalPrice)}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#00684A]">
                  {formatRp(Math.round(bundle.price / bundle.properties))}/rumah
                </span>
              </div>
              <div className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-[#001E2B] px-2.5 py-1.5 text-center text-[11px] font-bold text-[#00ED64] transition-colors group-hover:bg-[#003D4F]">
                <span>Pilih bundle</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-4 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5C6C7A]">
            <ShieldCheck size={14} className="shrink-0 text-[#00684A]" />
            <span>Arsip propertimu tetap bisa dibuka</span>
          </div>
          {onOpenArchive && (
            <button type="button" onClick={() => { onClose(); onOpenArchive(); }}
                    className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#00684A] transition-all hover:text-[#001E2B] hover:underline active:scale-95 sm:text-xs">
              <Bookmark size={12} />
              <span>Buka arsip ({auditedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
