import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Check, Lock, ShieldCheck, X, Zap } from "lucide-react";
import {
  CHECKOUT_LIVE, CHECKOUT_PREVIEW, TIERS, formatRp, tierOf, type PricingTierKey,
} from "@/lib/entitlements";

/** Multi-tier access drawer (PRD-13 §4 Module 2) — opened from any locked step, the plan
 *  badge, the banner, or the account billing tab.
 *
 *  The three passes and their prices come from `lib/entitlements`, so this screen cannot
 *  drift from the checkout or the billing tab. `onProceed` hands the chosen tier to the
 *  checkout; it does not grant anything itself. */
export default function UpgradeDrawer({
  open, onClose, onProceed, propertyName, initialTier = "bundle",
}: {
  open: boolean;
  onClose: () => void;
  onProceed: (tier: PricingTierKey) => void;
  propertyName?: string;
  initialTier?: PricingTierKey;
}) {
  const [selected, setSelected] = useState<PricingTierKey>(initialTier);

  useEffect(() => setSelected(initialTier), [initialTier]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const active = tierOf(selected);
  const checkoutReachable = CHECKOUT_LIVE || CHECKOUT_PREVIEW;

  return (
    <div className="fixed inset-0 z-[1999] flex select-none items-end justify-end animate-fadeIn sm:items-center">
      <div className="fixed inset-0 bg-[#001E2B]/50 backdrop-blur-md transition-opacity duration-300"
           onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Pilih paket akses Rumper"
        className="fixed inset-x-0 bottom-0 z-[2000] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[32px] border-l border-black/5 bg-[#F9FBFA] shadow-2xl sm:bottom-0 sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[480px] sm:rounded-l-[32px] sm:rounded-t-none"
      >
        <header className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[#001E2B] px-6 pb-5 pt-3 text-white">
          <div className="flex justify-center pb-3 pt-1 sm:hidden" aria-hidden="true">
            <div className="h-1.5 w-12 rounded-full bg-white/30" />
          </div>
          {/* ambient glow */}
          <div className="pointer-events-none absolute right-0 top-0 size-48 rounded-full bg-[#00ED64]/10 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#00ED64]/30 bg-[#00ED64]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#00ED64]">
                  <Zap size={11} className="fill-current" /> Paket Akses
                </span>
                {propertyName && (
                  <span className="max-w-[220px] truncate text-[11px] font-medium text-[#A8B3BC]">
                    {propertyName}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black leading-tight tracking-tight text-white md:text-2xl">
                Buka Analisis &amp; Due Diligence
              </h2>
            </div>

            <button type="button" onClick={onClose} aria-label="Tutup modal upgrade"
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7C8C9A]">
              Pilihan paket akses
            </span>
            <span className="text-[11px] font-medium text-[#5C6C7A]">
              Sekali bayar • Tanpa langganan
            </span>
          </div>

          <div className="space-y-3">
            {TIERS.map((tier) => {
              const isSelected = selected === tier.key;
              return (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => setSelected(tier.key)}
                  aria-pressed={isSelected}
                  className={`relative w-full select-none rounded-[20px] border p-3.5 text-left transition-all duration-200 sm:p-4 cursor-pointer ${
                    isSelected
                      ? "border-[#001E2B] bg-white shadow-[0_8px_24px_rgba(0,30,43,0.08)] ring-2 ring-[#001E2B]/10"
                      : "border-[#E5E5EA] bg-white/90 hover:border-[#CBD5E1] hover:bg-white active:scale-[0.985]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-all ${
                      isSelected ? "bg-[#001E2B] text-[#00ED64]" : "border-2 border-[#CBD5E1] bg-white"
                    }`}>
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-extrabold tracking-tight text-[#001E2B]">
                          {tier.title}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5 pl-1">
                          <span className="text-sm font-black leading-none tracking-tight text-[#001E2B] sm:text-base">
                            {formatRp(tier.price)}
                          </span>
                          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-black uppercase leading-none ${
                            tier.accent === "green"
                              ? "border-[#318266]/25 bg-[#E9F5EF] text-[#00684A]"
                              : "border-slate-300 bg-slate-100 text-[#334155]"
                          }`}>
                            {tier.discountTag}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-medium text-[#5C6C7A] sm:text-xs">
                          {tier.deliverableLine}
                        </p>
                        <span className="shrink-0 pl-1 text-[11px] text-[#8E8E93] line-through">
                          {formatRp(tier.originalPrice)}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="mt-3.5 space-y-2 border-t border-[#E5E5EA] pt-3.5 animate-fadeIn">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-[#7C8C9A]">
                            Fitur yang kamu buka:
                          </span>
                          <ul className="space-y-1.5">
                            {tier.features.map((feature) => (
                              <li key={feature}
                                  className="flex items-start gap-2 text-xs font-medium leading-relaxed text-[#1C1C1E]">
                                <BadgeCheck size={15} className="mt-0.5 shrink-0 text-[#00684A]" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 px-2 pt-2 text-center text-xs text-[#636366]">
            <ShieldCheck size={14} className="shrink-0 text-[#34C759]" />
            <span>Data spasial deterministik terverifikasi BNPB, BIG &amp; Dishub</span>
          </div>
        </div>

        <footer className="shrink-0 space-y-2 border-t border-[#E5E5EA] bg-white/95 p-4 backdrop-blur-md sm:p-5">
          <button
            type="button"
            onClick={() => { onClose(); onProceed(selected); }}
            className="group flex min-h-[50px] w-full cursor-pointer items-center justify-between rounded-full border border-white/10 bg-[#001E2B] px-6 py-3 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-[#061E28] active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <span>{checkoutReachable ? "Lanjutkan Pembayaran" : "Beri tahu saya saat tersedia"}</span>
              <ArrowRight size={16} className="text-[#00ED64] transition-transform group-hover:translate-x-1" />
            </span>
            <span className="text-base font-black tracking-tight text-[#00ED64]">
              {formatRp(active.price)}
            </span>
          </button>

          {/* Honest by construction: until a provider is wired (docs/18 GAP-12) we say so
              here rather than implying a payment the app cannot take. */}
          <p className="flex items-center justify-center gap-1 text-center text-[10px] text-[#8E8E93]">
            <Lock size={11} className="text-slate-400" aria-hidden="true" />
            <span>
              {CHECKOUT_LIVE
                ? "Pembayaran instan via Midtrans (QRIS, BCA, Mandiri, BRI, BNI)"
                : "Pembayaran belum dibuka — kuota gratismu tidak berkurang"}
            </span>
          </p>
        </footer>
      </aside>
    </div>
  );
}
