import { useEffect, useState } from "react";
import {
  Building2, Check, ChevronRight, Clock, Copy, QrCode, ShieldCheck, Sparkles, Wallet, X,
} from "lucide-react";
import {
  CHECKOUT_PREVIEW, formatRp, grantPreviewPass, tierOf, type PricingTierKey,
} from "@/lib/entitlements";

/** In-app payment gateway (PRD-13 §4 Module 3 — Midtrans Snap).
 *
 *  Two states, and which one renders is not a runtime preference:
 *
 *  - **Production** — no payment provider is wired (docs/18 GAP-12). The modal shows what
 *    the pass costs and says plainly that checkout is not open, then records interest. It
 *    deliberately does *not* render a QR code or a virtual-account number: a buyer could
 *    try to pay one, and the money would go nowhere.
 *  - **Dev** — the full Snap surface, so the checkout can be designed and reviewed before
 *    Wave 4. Banner-marked as a preview, and "payment" grants a session-only entitlement
 *    through `grantPreviewPass`, which is itself a no-op in production. */
export default function InAppCheckoutModal({
  open, onClose, onPaid, onInterest, tier = "bundle", propertyName,
}: {
  open: boolean;
  onClose: () => void;
  onPaid: (tier: PricingTierKey) => void;
  onInterest?: (tier: PricingTierKey) => void;
  tier?: PricingTierKey;
  propertyName?: string;
}) {
  const [tab, setTab] = useState<PaymentTab>("qris");
  const [bank, setBank] = useState<BankKey>("bca");
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [noted, setNoted] = useState(false);

  const t = tierOf(tier);

  useEffect(() => {
    if (!open) return;
    setNoted(false);
    if (!CHECKOUT_PREVIEW) return; // no hold to count down when there is nothing to pay
    setSecondsLeft(EXPIRY_SECONDS);
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function copyVa() {
    void navigator.clipboard?.writeText(VA_ACCOUNTS[bank].number.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /** Dev preview only — grants the session pass and hands control back to the workspace. */
  function completePreview() {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setPaid(true);
      setTimeout(() => {
        setPaid(false);
        grantPreviewPass(tier);
        onPaid(tier);
        onClose();
      }, 1400);
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-[3000] flex select-none items-end justify-center bg-[#001E2B]/60 backdrop-blur-md animate-fadeIn sm:items-center sm:p-4"
         onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout paket akses Rumper"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[32px] border border-black/10 bg-[#F9FBFA] text-[#001E2B] shadow-[0_-12px_40px_rgba(0,30,43,0.2)] animate-slideUp sm:max-h-[88vh] sm:rounded-[32px] sm:shadow-[0_24px_60px_rgba(0,30,43,0.18)]"
      >
        {paid && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#001E2B] p-8 text-center text-white animate-fadeIn">
            <div className="mb-4 flex size-16 animate-bounce items-center justify-center rounded-full border-2 border-[#00ED64] bg-[#00ED64]/20 text-[#00ED64]">
              <Check size={32} className="stroke-[3]" />
            </div>
            <span className="mb-1 text-xs font-black uppercase tracking-wider text-[#00ED64]">
              Pratinjau: pembayaran terverifikasi
            </span>
            <h3 className="mb-2 text-2xl font-black tracking-tight text-white">
              Analisis lengkap terbuka
            </h3>
            <p className="max-w-sm text-xs leading-relaxed text-[#A8B3BC]">
              Tahap 2–5 aktif untuk sesi ini{propertyName ? ` di ${propertyName}` : ""}. Membuka workspace…
            </p>
          </div>
        )}

        <header className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[#001E2B] px-5 pb-5 pt-3 text-white sm:p-6">
          <div className="mx-auto mb-3 h-1.5 w-10 shrink-0 rounded-full bg-white/25 sm:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 size-48 rounded-full bg-[#00ED64]/10 blur-3xl" />

          <div className="relative z-10 mb-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#00ED64]/30 bg-[#00ED64]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#00ED64]">
                  Midtrans Snap
                </span>
                {CHECKOUT_PREVIEW && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 font-mono text-xs tabular-nums text-[#A8B3BC]">
                    <Clock size={11} className="text-[#00ED64]" /> {mmss(secondsLeft)}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
                {t.title}
              </h2>
              {propertyName && (
                <p className="max-w-xs truncate text-xs text-[#A8B3BC]">Target: {propertyName}</p>
              )}
            </div>

            <button type="button" onClick={onClose} aria-label="Tutup checkout"
                    className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90 sm:size-10">
              <X size={18} />
            </button>
          </div>

          <div className="relative z-10 flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-xs font-medium text-[#A8B3BC]">Total pembayaran:</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-[#00ED64]">
                {formatRp(t.price)}
              </span>
              <span className="font-mono text-xs tabular-nums text-white/40 line-through">
                {formatRp(t.originalPrice)}
              </span>
            </div>
          </div>
        </header>

        {!CHECKOUT_PREVIEW ? (
          /* ── Production: no provider, so no QR and no VA number ──────────────────── */
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              {noted && (
                <div className="flex items-start gap-2 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4 animate-fadeIn">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#00684A]" />
                  <p className="text-xs leading-relaxed text-[#00523A]">
                    <strong className="font-bold">Minatmu tercatat.</strong> Kami hubungi lewat email
                    akunmu begitu {t.title} bisa dibeli. Kuota gratismu tidak berkurang.
                  </p>
                </div>
              )}

              <div className="rounded-[22px] border border-[#D4A017]/30 bg-[#FFF9E6] p-4">
                <p className="text-sm font-bold text-[#523A00]">Pembayaran belum dibuka</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#523A00]">
                  Checkout Midtrans (QRIS &amp; virtual account) sedang disiapkan. Kami tidak
                  menampilkan kode QR atau nomor VA sebelum pembayaran benar-benar aktif, supaya
                  tidak ada transfer yang tidak sampai.
                </p>
              </div>

              <div className="space-y-2 rounded-[22px] border border-[#E5E5EA] bg-white p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7C8C9A]">
                  Yang akan terbuka
                </span>
                <p className="text-xs font-semibold text-[#001E2B]">{t.subtitle}</p>
                <ul className="space-y-1.5 pt-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs leading-relaxed text-[#3A3A3C]">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#00684A]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="px-1 text-[11px] leading-relaxed text-[#5C6C7A]">
                Tekan tombol di bawah dan kami hubungi begitu paket ini bisa dibeli. Kuota gratismu
                tidak berkurang.
              </p>
            </div>

            <footer className="shrink-0 border-t border-[#E5E5EA] bg-white/95 p-4 backdrop-blur-xl sm:p-5"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              <button
                type="button"
                disabled={noted}
                onClick={() => { onInterest?.(tier); setNoted(true); }}
                className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#00ED64] px-7 text-sm font-bold text-[#001E2B] shadow-md transition-transform active:scale-[0.96] disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500"
              >
                {noted ? <Check size={15} /> : <Sparkles size={15} />}
                <span>{noted ? "Minatmu sudah tercatat" : "Beri tahu saya saat tersedia"}</span>
              </button>
            </footer>
          </>
        ) : (
          /* ── Dev: the Snap design preview ────────────────────────────────────────── */
          <>
            <div className="shrink-0 border-b border-[#E5E5EA] bg-amber-50 px-4 py-2 text-center text-[11px] font-bold text-amber-900">
              Pratinjau desain — pembayaran belum aktif, tidak ada uang yang berpindah
            </div>

            <div className="shrink-0 border-b border-[#E5E5EA] bg-white p-3">
              <div className="flex select-none gap-1 rounded-2xl bg-[#EBECEF] p-1">
                {TABS.map(({ key, label, Icon }) => (
                  <button key={key} type="button" onClick={() => setTab(key)}
                          className={`flex min-h-[40px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 active:scale-[0.96] ${
                            tab === key ? "bg-white text-[#001E2B] shadow-xs" : "text-[#5C6C7A] hover:text-[#001E2B]"
                          }`}>
                    <Icon size={15} className={tab === key ? "text-[#00684A]" : ""} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {tab === "qris" && (
                <div className="flex flex-col items-center space-y-4 text-center animate-fadeIn">
                  <div className="flex w-full max-w-[320px] flex-col items-center rounded-[24px] border border-[#E5E5EA] bg-white p-5 shadow-xs">
                    <div className="mb-3 flex w-full items-center justify-between border-b border-[#E5E5EA] pb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold tracking-tighter text-[#DC2626]">QRIS</span>
                        <span className="text-[9px] font-semibold text-[#5C6C7A]">GPN</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#8E8E93]">Contoh</span>
                    </div>
                    <div className="relative flex size-48 items-center justify-center overflow-hidden rounded-2xl bg-[#001E2B] p-3 shadow-inner">
                      <svg viewBox="0 0 100 100" className="size-full fill-current text-white" aria-hidden="true">
                        <rect x="0" y="0" width="30" height="30" fill="white" />
                        <rect x="5" y="5" width="20" height="20" fill="#001E2B" />
                        <rect x="10" y="10" width="10" height="10" fill="white" />
                        <rect x="70" y="0" width="30" height="30" fill="white" />
                        <rect x="75" y="5" width="20" height="20" fill="#001E2B" />
                        <rect x="80" y="10" width="10" height="10" fill="white" />
                        <rect x="0" y="70" width="30" height="30" fill="white" />
                        <rect x="5" y="75" width="20" height="20" fill="#001E2B" />
                        <rect x="10" y="80" width="10" height="10" fill="white" />
                        <rect x="35" y="10" width="10" height="10" fill="white" />
                        <rect x="50" y="10" width="10" height="10" fill="white" />
                        <rect x="35" y="25" width="25" height="10" fill="white" />
                        <rect x="35" y="45" width="30" height="10" fill="white" />
                        <rect x="10" y="45" width="15" height="10" fill="white" />
                        <rect x="75" y="45" width="15" height="10" fill="white" />
                        <rect x="45" y="65" width="15" height="15" fill="white" />
                        <rect x="70" y="70" width="20" height="20" fill="white" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-md bg-[#00ED64] px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter text-[#001E2B] shadow-xs">
                          Rumper
                        </div>
                      </div>
                    </div>
                    <span className="mt-2.5 font-mono text-[10px] tabular-nums text-[#8E8E93]">
                      Placeholder — bukan kode QRIS yang bisa dipindai
                    </span>
                  </div>
                  <div className="max-w-sm space-y-1 text-xs text-[#5C6C7A]">
                    <p className="font-bold text-[#1C1C1E]">Rencana dukungan aplikasi pembayaran:</p>
                    <p className="text-[11px] text-[#8E8E93]">
                      BCA Mobile, Mandiri Livin, GoPay, OVO, ShopeePay, Dana, LinkAja
                    </p>
                  </div>
                </div>
              )}

              {tab === "va" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(VA_ACCOUNTS) as BankKey[]).map((b) => (
                      <button key={b} type="button" onClick={() => setBank(b)}
                              className={`min-h-[42px] cursor-pointer rounded-2xl border px-1 py-2 text-xs font-bold uppercase transition-all duration-150 active:scale-[0.96] ${
                                bank === b
                                  ? "border-[#001E2B] bg-[#001E2B] text-[#00ED64] shadow-xs"
                                  : "border-[#E5E5EA] bg-white text-[#5C6C7A] hover:bg-[#F4F7F6]"
                              }`}>
                        {b}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 rounded-[22px] border border-[#E5E5EA] bg-white p-4 shadow-xs">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#7C8C9A]">
                      {VA_ACCOUNTS[bank].label}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-lg font-bold tabular-nums tracking-wider text-[#001E2B] md:text-xl">
                        {VA_ACCOUNTS[bank].number}
                      </span>
                      <button type="button" onClick={copyVa}
                              className="flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full bg-[#00684A] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all duration-150 hover:bg-[#00523A] active:scale-95">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? "Tersalin!" : "Salin"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-semibold text-amber-800">
                      Nomor contoh. Jangan transfer ke nomor ini.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-[22px] border border-[#E5E5EA] bg-white p-4 text-xs text-[#5C6C7A]">
                    <p className="font-bold text-[#1C1C1E]">Cara pembayaran (saat aktif):</p>
                    <ol className="list-inside list-decimal space-y-1.5 text-[11px] leading-relaxed text-[#3A3A3C]">
                      <li>Buka mobile banking &amp; pilih menu <strong>Transfer Virtual Account</strong>.</li>
                      <li>Masukkan nomor VA di atas &amp; verifikasi nominal {formatRp(t.price)}.</li>
                      <li>Selesaikan pembayaran; laporan terbuka otomatis.</li>
                    </ol>
                  </div>
                </div>
              )}

              {tab === "ewallet" && (
                <div className="space-y-3 animate-fadeIn">
                  {EWALLETS.map((w) => (
                    <button key={w.name} type="button" onClick={completePreview}
                            className="flex min-h-[56px] w-full cursor-pointer items-center justify-between rounded-[22px] border border-[#E5E5EA] bg-white p-4 shadow-xs transition-all duration-150 hover:bg-[#F9FBFA] active:scale-[0.97]">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl text-xs font-bold"
                             style={{ backgroundColor: `${w.color}1A`, color: w.color }}>
                          {w.short}
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-[#1C1C1E]">{w.name}</span>
                          <span className="text-xs text-[#8E8E93]">{w.hint}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#8E8E93]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-[#E5E5EA] bg-white/95 p-4 backdrop-blur-xl sm:flex-row sm:p-5"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
                <ShieldCheck size={14} className="text-[#34C759]" />
                <span>Enkripsi 256-bit SSL saat pembayaran aktif</span>
              </div>
              <button type="button" disabled={busy} onClick={completePreview}
                      className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#00684A] px-7 py-3 text-xs font-bold text-white shadow-md transition-transform duration-100 hover:bg-[#00523A] active:scale-[0.96] disabled:opacity-60 sm:w-auto sm:text-sm">
                <Sparkles size={15} className="text-[#00ED64]" />
                <span>{busy ? "Memverifikasi…" : "Simulasikan pembayaran berhasil"}</span>
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

// ── Static preview data ─────────────────────────────────────────────────────────────────

type PaymentTab = "qris" | "va" | "ewallet";
type BankKey = "bca" | "mandiri" | "bri" | "bni";

const EXPIRY_SECONDS = 879; // 14:39, the Snap default hold

const TABS = [
  { key: "qris" as const, label: "QRIS", Icon: QrCode },
  { key: "va" as const, label: "Virtual Account", Icon: Building2 },
  { key: "ewallet" as const, label: "E-Wallet", Icon: Wallet },
];

/** Obviously-fake numbers: the preview must not resemble a payable account. */
const VA_ACCOUNTS: Record<BankKey, { label: string; number: string }> = {
  bca: { label: "BCA Virtual Account (contoh)", number: "0000 0000 0000 0000" },
  mandiri: { label: "Mandiri Virtual Account (contoh)", number: "0000 0000 0000 0000" },
  bri: { label: "BRI Virtual Account (contoh)", number: "0000 0000 0000 0000" },
  bni: { label: "BNI Virtual Account (contoh)", number: "0000 0000 0000 0000" },
};

const EWALLETS = [
  { name: "GoPay Deeplink", short: "GoPay", hint: "Buka aplikasi Gojek otomatis", color: "#00AED6" },
  { name: "ShopeePay Direct", short: "Shopee", hint: "Pembayaran instan via Shopee", color: "#EE4D2D" },
];

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

