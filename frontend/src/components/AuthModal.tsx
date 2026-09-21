import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, MessageCircle, RefreshCw, ShieldCheck, X } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";
import type { User } from "@/lib/api";

/** Upfront authentication gate (PRD-13 §4 Module 1).
 *
 *  Google is the live path — the same OAuth token client the /login page uses, so there is
 *  one auth implementation, not two. WhatsApp OTP has no backend (no `POST /api/auth/otp`,
 *  no WhatsApp Business sender), so production shows it as not-yet-available rather than
 *  collecting a phone number that leads nowhere; the 6-digit step renders in dev only, as a
 *  design preview of the flow. */
export default function AuthModal({
  open, onClose, onLogin, dismissible = true,
}: {
  open: boolean;
  onClose?: () => void;
  onLogin: (user: User) => void;
  dismissible?: boolean;
}) {
  const [step, setStep] = useState<"choose" | "otp">("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(58);
  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const otpPreview = import.meta.env.DEV;

  useEffect(() => {
    if (step !== "otp") return;
    const id = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step === "otp") cells.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (!open || !dismissible || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  function setCell(i: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    setOtp((prev) => prev.map((d, idx) => (idx === i ? value.slice(-1) : d)));
    if (value && i < 5) cells.current[i + 1]?.focus();
  }

  function onCellKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) cells.current[i - 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    setOtp(Array.from({ length: 6 }, (_, i) => digits[i] ?? ""));
    cells.current[Math.min(digits.length, 5)]?.focus();
  }

  return (
    <div className="fixed inset-0 z-[3000] flex select-none items-center justify-center bg-[#001E2B]/60 p-4 backdrop-blur-md animate-fadeIn"
         onClick={() => dismissible && onClose?.()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Masuk ke akun Rumper"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-black/10 bg-[#F9FBFA] p-6 text-[#001E2B] shadow-2xl animate-slideUp md:p-8"
      >
        {dismissible && onClose && (
          <button type="button" onClick={onClose} aria-label="Tutup"
                  className="absolute right-5 top-5 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/5 text-[#5C6C7A] transition-all hover:bg-black/10 hover:text-[#001E2B] active:scale-95">
            <X size={18} />
          </button>
        )}

        {step === "choose" && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="mb-2 inline-block rounded-full border border-[#00ED64]/30 bg-[#00ED64]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#00684A]">
                Akun Rumper
              </span>
              <h2 className="text-xl font-black leading-tight tracking-tight text-[#001E2B] md:text-2xl">
                Simpan &amp; sinkronkan propertimu
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#5C6C7A]">
                Masuk untuk menyimpan kuota investigasi, skor risiko, dan checklist lapangan di
                akunmu — bukan cuma di browser ini.
              </p>
            </div>

            <GoogleSignInButton onLogin={onLogin} />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E5E5EA]" />
              <span className="text-[11px] font-semibold text-[#8E8E93]">atau WhatsApp OTP</span>
              <div className="h-px flex-1 bg-[#E5E5EA]" />
            </div>

            {otpPreview ? (
              <form className="space-y-3"
                    onSubmit={(e) => { e.preventDefault(); if (phone.length >= 8) { setStep("otp"); setCountdown(58); } }}>
                <div>
                  <label htmlFor="auth-phone" className="mb-1.5 block text-[11px] font-bold text-[#5C6C7A]">
                    Nomor WhatsApp
                  </label>
                  <div className="flex items-center overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#00684A]">
                    <span className="border-r border-[#E5E5EA] bg-[#F4F7F6] px-3.5 py-3 text-xs font-black text-[#5C6C7A]">
                      +62
                    </span>
                    <input id="auth-phone" type="tel" value={phone} placeholder="812 3456 7890"
                           onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                           className="w-full px-3.5 py-3 text-xs font-bold text-[#001E2B] focus:outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={phone.length < 8}
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#001E2B] text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#061E28] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
                  <span>Kirim kode OTP WhatsApp</span>
                  <ArrowRight size={15} className="text-[#00ED64]" />
                </button>
                <p className="text-center text-[10px] font-semibold text-amber-800">
                  Pratinjau desain — OTP WhatsApp belum terhubung ke backend
                </p>
              </form>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5EA] bg-white p-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#5C6C7A]">
                  <MessageCircle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#001E2B]">Masuk via WhatsApp OTP</p>
                  <p className="text-[11px] leading-relaxed text-[#5C6C7A]">
                    Belum tersedia. Untuk sekarang gunakan akun Google.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-2xl border border-[#E5E5EA] bg-white p-3 text-[11px] text-[#5C6C7A]">
              <ShieldCheck size={14} className="shrink-0 text-[#00684A]" />
              <span>
                Data lokasimu hanya dipakai untuk menyiapkan analisis risiko — tidak dibagikan ke
                penjual, agen, atau developer.
              </span>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full border border-[#00ED64]/30 bg-[#00ED64]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#00684A]">
                  Verifikasi 6 digit
                </span>
                <button type="button" onClick={() => setStep("choose")}
                        className="cursor-pointer text-xs font-bold text-[#00684A] hover:underline">
                  Ubah nomor
                </button>
              </div>
              <h2 className="text-xl font-black leading-tight tracking-tight text-[#001E2B] md:text-2xl">
                Masukkan kode OTP
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#5C6C7A]">
                Kode 6 digit dikirim via WhatsApp ke <strong>+62 {phone}</strong>
              </p>
            </div>

            <div className="my-4 flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { cells.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => setCell(i, e.target.value)}
                  onKeyDown={(e) => onCellKey(i, e)}
                  onPaste={onPaste}
                  className={`h-14 w-11 rounded-2xl border text-center font-mono text-lg font-black transition-all focus:outline-none focus:ring-2 focus:ring-[#00684A] ${
                    digit ? "border-[#001E2B] bg-white shadow-xs" : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
                  }`}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-[#D4A017]/30 bg-[#FFF9E6] p-3.5 text-[11px] leading-relaxed text-[#523A00]">
              Pratinjau desain. Backend OTP belum ada, jadi kode ini tidak diverifikasi ke mana pun
              dan tidak bisa memasukkanmu ke akun — gunakan tombol Google di langkah sebelumnya.
            </div>

            <div className="text-center">
              {countdown > 0 ? (
                <span className="text-xs font-medium text-[#8E8E93]">
                  Kirim ulang kode dalam <strong className="font-mono text-[#001E2B]">{countdown}s</strong>
                </span>
              ) : (
                <button type="button" onClick={() => setCountdown(58)}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#00684A] hover:underline">
                  <RefreshCw size={12} />
                  <span>Kirim ulang kode OTP</span>
                </button>
              )}
            </div>

            <button type="button" onClick={() => setStep("choose")}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#00684A] text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#00523A] active:scale-[0.98]">
              <Check size={15} />
              <span>Kembali ke pilihan masuk</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
