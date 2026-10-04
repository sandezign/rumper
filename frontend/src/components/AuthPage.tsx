import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronRight, Home, Lock } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";
import logoMark from "@/assets/landing/logo-mark.svg";
import KineticGrid from "@/components/ui/kinetic-grid";
import type { User } from "@/lib/api";
import "./AuthCardStack.css";

const CARDS_DATA = [
  {
    id: 0,
    name: "Grand Galaxy City",
    location: "Bekasi Selatan",
    status: "Risiko Sedang–Tinggi",
    statusBg: "#fff8e0",
    statusColor: "#b76e00",
    findings: "3 temuan perlu divalidasi",
    score: "68",
    scoreColor: "#001E2B",
    markerBg: "#f5b73b",
    haloBg: "rgba(245, 183, 59, 0.25)",
    roads: "M0 25 L100 75 M0 75 L100 25 M30 0 L70 100",
  },
  {
    id: 1,
    name: "Kota Wisata",
    location: "Cibubur",
    status: "Risiko Rendah–Sedang",
    statusBg: "#fff8e0",
    statusColor: "#b76e00",
    findings: "1 temuan mobilitas jam sibuk",
    score: "82",
    scoreColor: "#001E2B",
    markerBg: "#f5b73b",
    haloBg: "rgba(245, 183, 59, 0.25)",
    roads: "M0 40 L100 60 M20 0 L80 100 M0 80 L100 20",
  },
  {
    id: 2,
    name: "BSD City",
    location: "Tangerang Selatan",
    status: "Sangat Selaras",
    statusBg: "#eaf5ef",
    statusColor: "#00684a",
    findings: "Fasilitas lengkap · Bebas SUTET",
    score: "94",
    scoreColor: "#00684a",
    markerBg: "#00ed64",
    haloBg: "rgba(0, 237, 100, 0.25)",
    roads: "M0 30 L100 30 M50 0 L50 100 M0 70 L100 70",
  },
  {
    id: 3,
    name: "PIK 2",
    location: "Jakarta Utara",
    status: "Perlu Validasi",
    statusBg: "#ffeaee",
    statusColor: "#d32f2f",
    findings: "Pesisir rob · Ketergantungan tol",
    score: "55",
    scoreColor: "#d32f2f",
    markerBg: "#ef5350",
    haloBg: "rgba(239, 83, 80, 0.25)",
    roads: "M0 50 L100 50 M30 0 L30 100 M70 0 L70 100",
  },
];

interface AuthPolaroidCardStackProps {
  compact?: boolean;
  cardOrders: number[];
  tossingCardId: number | null;
  onCardClick: (id: number) => void;
}

function AuthPolaroidCardStack({
  compact = false,
  cardOrders,
  tossingCardId,
  onCardClick,
}: AuthPolaroidCardStackProps) {
  return (
    <div
      className={`auth-card-stack relative w-full select-none mx-auto ${
        compact ? "max-w-[365px] h-[318px]" : "max-w-[365px] h-[324px]"
      }`}
    >
      {CARDS_DATA.map((card) => {
        const order = cardOrders[card.id];
        const isTossing = tossingCardId === card.id;

        return (
          <div
            key={card.id}
            data-order={order}
            role="button"
            tabIndex={0}
            aria-label={`Laporan lokasi ${card.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(card.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick(card.id);
              }
            }}
            className={`floating-report rounded-[22px] border border-white/40 bg-white text-[#001E2B] select-none p-4 sm:p-4.5 ${
              isTossing ? "tossing-card" : ""
            }`}
          >
            {/* Card Header: 1:1 with Landing Page Hero */}
            <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EAF5EF] text-[#00684A]">
                  <Home size={18} />
                </div>
                <div className="text-left">
                  <h4 className="text-[15px] sm:text-base font-bold tracking-tight text-[#001E2B] leading-snug">
                    {card.name}
                  </h4>
                  <p className="text-xs text-[#5C6C7A]">{card.location}</p>
                </div>
              </div>
              <span
                className="rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors duration-150"
                style={{ backgroundColor: card.statusBg, color: card.statusColor }}
              >
                {card.status}
              </span>
            </div>

            {/* Map Radar Visual Mockup: 135px height 1:1 with Landing Page Hero */}
            <div
              className="relative my-3 h-[135px] w-full overflow-hidden rounded-xl border border-[#E1E5E8]/80 bg-gradient-to-br from-[#E8F5E9] via-[#F1F8E9] to-[#E0F2F1]"
            >
              <svg className="absolute inset-0 size-full opacity-35" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d={card.roads} stroke="#81C784" strokeWidth="1.5" fill="none" />
              </svg>

              {/* Danger/Risk zone halo */}
              <div
                className="absolute right-4 top-2 size-16 rounded-full blur-md transition-colors duration-200"
                style={{ backgroundColor: card.haloBg }}
              />

              {/* Property Target Pin */}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <span className="relative flex size-3">
                  <span
                    className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
                    style={{ backgroundColor: card.markerBg }}
                  />
                  <span
                    className="relative inline-flex size-3 rounded-full shadow-xs"
                    style={{ backgroundColor: card.markerBg }}
                  />
                </span>
                <span className="mt-1 rounded bg-[#001E2B] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                  Properti incaran
                </span>
              </div>
            </div>

            {/* Card Footer: Score & Findings */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs sm:text-[13px] font-semibold text-[#5C6C7A] text-left">
                {card.findings}
              </span>
              <div className="flex items-baseline gap-0.5">
                <span
                  className="text-xl sm:text-2xl font-black tracking-tight"
                  style={{ color: card.scoreColor }}
                >
                  {card.score}
                </span>
                <span className="text-xs font-bold text-[#7C8C9A]">/100</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AuthPageProps {
  mode: "login" | "register";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeDueDiligence, setAgreeDueDiligence] = useState(false);

  // Interactive 3D card stack state (Hero Landing V2 implementation)
  const [cardOrders, setCardOrders] = useState<number[]>([0, 1, 2, 3]);
  const [tossingCardId, setTossingCardId] = useState<number | null>(null);

  const activeCardIndex = cardOrders.indexOf(0) !== -1 ? cardOrders.indexOf(0) : 0;

  function selectCard(targetId: number) {
    const currentOrder = cardOrders[targetId];
    if (currentOrder === 0) return;
    setCardOrders((prev) =>
      prev.map((order, idx) => {
        if (idx === targetId) return 0;
        if (order < currentOrder) return order + 1;
        return order;
      })
    );
  }

  function cycleNextCard() {
    if (tossingCardId !== null) return;
    const currentTopId = cardOrders.indexOf(0) !== -1 ? cardOrders.indexOf(0) : 0;
    setTossingCardId(currentTopId);
    setTimeout(() => {
      setCardOrders((prev) =>
        prev.map((order) => {
          if (order === 0) return CARDS_DATA.length - 1;
          return order - 1;
        })
      );
      setTossingCardId(null);
    }, 140);
  }

  function handleCardClick(id: number) {
    if (cardOrders[id] === 0) {
      cycleNextCard();
    } else {
      selectCard(id);
    }
  }

  const isRegister = mode === "register";
  const canRegister = !isRegister || (agreeTerms && agreeDueDiligence);

  function onLogin(_u: User) {
    const from = (location.state as { from?: string } | null)?.from;
    const isV2 = from && from.startsWith("/v2");
    const target =
      !from || isV2 || from === "/" || from === "/login" || from === "/register"
        ? "/app/start"
        : from;
    navigate(target, { replace: true });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAF7EF] font-sans text-[#001E2B] selection:bg-[#00ED64]/30 selection:text-[#001E2B] lg:flex-row lg:items-stretch lg:justify-center">
      {/* =========================================================================
          MOBILE TOP HERO BANNER (< lg)
          Same size & proportion as Landing Page Hero (Reference: media_1791130375252.png)
          ========================================================================= */}
      <div className="relative flex flex-col items-center overflow-hidden rounded-b-[36px] bg-gradient-to-b from-[#00141D] via-[#001E2B] to-[#002838] px-4 pt-4 pb-6 text-center text-white shadow-xl transition-colors duration-200 lg:hidden">
        {/* Kinetic Grid perspective wireframe matching landing page hero */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <KineticGrid transparentBg={true} globalColor="default" className="size-full" />
        </div>

        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 size-64 rounded-full bg-[#00ED64]/15 blur-3xl z-1"
        />

        {/* Mobile top floating navbar pill (Parity with Landing Page floating navbar, without CTA & without back arrow) */}
        <div className="relative z-10 flex w-full max-w-[390px] h-[58px] items-center rounded-full border border-white/15 bg-[#001822]/90 px-5 backdrop-blur-md shadow-[0_12px_32px_rgba(0,12,18,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] mb-4">
          <Link
            to="/"
            aria-label="Beranda Rumper"
            className="flex items-center gap-3 transition-transform active:scale-95"
          >
            <img src={logoMark} alt="Rumper" className="size-7" />
            <span className="text-[19px] font-extrabold tracking-tight text-white">Rumper</span>
          </Link>
        </div>

        {/* Title & Subtitle — Coherent narrative aligned to auth intent & higher contrast */}
        <div className="relative z-10 mb-4 px-2 text-center max-w-[380px]">
          <h2 className="text-balance text-[26px] sm:text-[30px] font-black leading-[1.18] tracking-tight text-white">
            {isRegister ? (
              <>
                Sudah suka rumahnya?<br />
                <span className="text-[#00ED64]">Cek dulu risiko lokasinya.</span>
              </>
            ) : (
              <>
                Cek risiko properti Anda.<br />
                <span className="text-[#00ED64]">Buka hasil investigasinya.</span>
              </>
            )}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#E6EDF2] font-medium">
            {isRegister
              ? "Verifikasi riwayat banjir, macet jam kerja, dan perimeter aman sebelum bayar tanda jadi atau DP."
              : "Lanjutkan membaca riwayat banjir, perimeter aman, dan ringkasan investigasi properti tersimpan Anda."}
          </p>
        </div>

        {/* Mobile Card Stack (Same 295px proportion as Landing Page Hero) */}
        <div className="relative z-10 w-full flex justify-center">
          <AuthPolaroidCardStack
            compact={true}
            cardOrders={cardOrders}
            tossingCardId={tossingCardId}
            onCardClick={handleCardClick}
          />
        </div>

        {/* Tap to cycle hint (Tactile thumb-zone pill button) */}
        <button
          type="button"
          onClick={cycleNextCard}
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold text-[#00ED64] backdrop-blur-md transition-transform active:scale-95 cursor-pointer touch-manipulation select-none"
        >
          <span>Lihat contoh laporan lokasi ({activeCardIndex + 1}/{CARDS_DATA.length})</span>
          <ChevronRight size={13} className="stroke-[3]" />
        </button>
      </div>

      {/* =========================================================================
          MAIN AUTH WORKSPACE (DESKTOP SPLIT & MOBILE CONTENT)
          Seamless on mobile, elegant card split on desktop
          ========================================================================= */}
      <div className="mx-auto flex w-full max-w-[1240px] flex-1 items-stretch p-0 sm:p-6 lg:p-10">
        <div className="grid w-full grid-cols-1 overflow-hidden bg-transparent lg:min-h-[640px] lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[32px] lg:border lg:border-black/10 lg:bg-white lg:shadow-xl">
          {/* -------------------------------------------------------------------
              LEFT COLUMN: Interactive Form & Value Pitch (Top on Mobile, Centered on Desktop)
              ------------------------------------------------------------------- */}
          <div className="flex flex-col justify-between px-5 py-6 sm:p-10 lg:p-12">
            {/* Centered content block with text aligned left (my-0 on mobile, lg:my-auto on desktop) */}
            <div className="my-0 w-full max-w-[420px] mx-auto text-left lg:my-auto">
              {/* Title & Subtitle */}
              <div>
                <h1 className="text-balance text-2xl font-black tracking-tight text-[#001E2B] sm:text-3xl lg:text-[32px] lg:leading-[1.15]">
                  {isRegister ? "Buat akun Rumper, gratis." : "Masuk ke Akun Anda"}
                </h1>
                <p className="text-pretty mt-2 text-sm leading-relaxed text-[#5C6C7A]">
                  {isRegister
                    ? "Dapatkan laporan investigasi independen untuk rumah idaman Anda sebelum membayar DP atau tanda jadi."
                    : "Akses kembali seluruh laporan cek risiko, catatan survei, dan riwayat lokasi properti tersimpan Anda."}
                </p>
              </div>

              {/* REGISTER ONLY: "PAKET GRATIS KAMU" CARD */}
              {isRegister && (
                <div className="mt-6 rounded-2xl border border-[#E1E5E8] bg-[#F9FBFA] p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-[#E1E5E8]/60 pb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#00684A]">
                      Yang kamu dapat di paket gratis
                    </span>
                    <span className="rounded-md bg-[#00ED64]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#00684A]">
                      Rp 0 / selamanya
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2.5">
                    {/* Quota 1 */}
                    <li className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#001E2B]/5 text-xs font-black text-[#001E2B]">
                        1x
                      </span>
                      <span className="text-xs font-medium text-[#001E2B]">
                        1 Pindai risiko komprehensif (Banjir, Sutet, Akses &amp; Legalitas)
                      </span>
                    </li>

                    {/* Quota 2 */}
                    <li className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#001E2B]/5 text-xs font-black text-[#001E2B]">
                        50k
                      </span>
                      <span className="text-xs font-medium text-[#001E2B]">
                        50.000 token AI deep research &amp; tanya jawab lokasi
                      </span>
                    </li>

                    {/* Quota 3 */}
                    <li className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#001E2B]/5 text-xs font-black text-[#001E2B]">
                        PDF
                      </span>
                      <span className="text-xs font-medium text-[#001E2B]">
                        Ekspor ringkasan checklist due diligence survei fisik
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {/* REGISTER ONLY: Consent Checkboxes */}
              {isRegister && (
                <div className="mt-5 space-y-3">
                  {/* Checkbox 1: Terms of Service & Privacy Policy */}
                  <label className="group flex cursor-pointer items-start gap-3 select-none">
                    <div
                      className={`relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-all duration-150 ${
                        agreeTerms
                          ? "border-[#001E2B] bg-[#001E2B] text-[#00ED64]"
                          : "border-[#CBD5E1] bg-white group-hover:border-[#00684A]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="peer sr-only"
                        aria-label="Persetujuan Syarat Layanan dan Kebijakan Privasi"
                      />
                      {agreeTerms && (
                        <Check size={14} strokeWidth={2.5} className="animate-in zoom-in-75 duration-100" />
                      )}
                    </div>
                    <span className="text-xs leading-relaxed text-[#3D4F5B]">
                      Saya setuju dengan{" "}
                      <Link
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#001E2B] underline decoration-[#001E2B]/40 underline-offset-2 transition-colors hover:text-[#00684A] hover:decoration-[#00684A]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Syarat Layanan
                      </Link>{" "}
                      dan{" "}
                      <Link
                        to="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#001E2B] underline decoration-[#001E2B]/40 underline-offset-2 transition-colors hover:text-[#00684A] hover:decoration-[#00684A]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Kebijakan Privasi
                      </Link>{" "}
                      Rumper.
                    </span>
                  </label>

                  {/* Checkbox 2: Tailored User Context: Independent Risk & Physical Due Diligence Responsibility */}
                  <label className="group flex cursor-pointer items-start gap-3 select-none">
                    <div
                      className={`relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-all duration-150 ${
                        agreeDueDiligence
                          ? "border-[#001E2B] bg-[#001E2B] text-[#00ED64]"
                          : "border-[#CBD5E1] bg-white group-hover:border-[#00684A]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={agreeDueDiligence}
                        onChange={(e) => setAgreeDueDiligence(e.target.checked)}
                        className="peer sr-only"
                        aria-label="Pernyataan tanggung jawab validasi fisik dan independensi data lokasi"
                      />
                      {agreeDueDiligence && (
                        <Check size={14} strokeWidth={2.5} className="animate-in zoom-in-75 duration-100" />
                      )}
                    </div>
                    <span className="text-xs leading-relaxed text-[#3D4F5B]">
                      Saya mengerti laporan Rumper adalah analisis risiko awal independen, dan saya tetap bertanggung jawab memverifikasi fisik lokasi serta legalitas tanah sebelum membayar tanda jadi atau DP.
                    </span>
                  </label>
                </div>
              )}

              {/* Action Area */}
              <div className="mt-5 space-y-3">
                <GoogleSignInButton
                  onLogin={onLogin}
                  disabled={!canRegister}
                  variant="dark"
                  label={isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
                />

                {/* Interactive microcopy hint matching reference UI */}
                {isRegister && (
                  <p
                    className={`text-center text-xs transition-colors duration-150 ${
                      canRegister ? "font-semibold text-[#00684A]" : "text-[#7C8C9A]"
                    }`}
                  >
                    {canRegister
                      ? "Siap! Lanjut pilih akun Google kamu."
                      : "Centang dua persetujuan di atas untuk melanjutkan."}
                  </p>
                )}

                {/* LOGIN ONLY: Trust & Security Card */}
                {!isRegister && (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#CBD5E1]/60 bg-[#F9FBFA] p-3.5 shadow-2xs">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#001E2B]/5 text-[#00684A]">
                      <Lock size={15} />
                    </div>
                    <p className="text-xs leading-snug text-[#5C6C7A]">
                      <strong className="text-[#001E2B]">Akses aman tanpa password.</strong> Laporan
                      tersimpan Anda terlindungi &amp; hanya dapat diakses melalui akun Google resmi Anda.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer switcher: Replaced with the sleek pill button (top version) */}
            <div className="mt-6 border-t border-black/5 pt-4 text-center sm:text-left w-full max-w-[420px] mx-auto lg:mt-8 lg:pt-5">
              <Link
                to={isRegister ? "/login" : "/register"}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#FAF7EF] px-4 py-2.5 text-xs font-bold text-[#001E2B] transition-transform hover:bg-black/5 active:scale-[0.96]"
              >
                <span>{isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar gratis (1x cek bebas)"}</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              RIGHT COLUMN: Interactive Kinetic Grid + Hero Card Preview (Desktop)
              ------------------------------------------------------------------- */}
          <div className="relative hidden flex-col justify-between overflow-hidden rounded-r-[32px] bg-gradient-to-br from-[#00141D] via-[#001E2B] to-[#002D40] p-8 xl:p-10 text-white lg:flex">
            {/* Kinetic Grid Interactive Background */}
            <div className="absolute inset-0 z-0">
              <KineticGrid transparentBg={true} globalColor="default" className="size-full" />
            </div>

            {/* Ambient subtle light glow overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#00ED64]/12 blur-3xl z-1"
            />

            {/* Desktop Brand Logo on the Right Panel (Aligned Right) */}
            <div className="relative z-20 flex w-full justify-end">
              <Link
                to="/"
                className="group flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md transition-all hover:bg-white/15 active:scale-[0.96]"
                aria-label="Rumper — Kembali ke beranda"
              >
                <img src={logoMark} alt="Rumper" className="size-6 transition-transform group-hover:scale-105" />
                <span className="text-sm font-bold tracking-tight text-white">
                  Rumper
                </span>
              </Link>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center my-auto w-full">
              {/* 1. Title on top of polaroid card report */}
              <div className="text-center mb-6 max-w-sm">
                <h2 className="text-balance text-2xl lg:text-[27px] font-black leading-tight tracking-tight text-white">
                  {isRegister ? (
                    <>
                      Sudah suka rumahnya?<br />
                      <span className="text-[#00ED64]">Cek dulu risiko lokasinya.</span>
                    </>
                  ) : (
                    <>
                      Cek risiko properti Anda.<br />
                      <span className="text-[#00ED64]">Buka hasil investigasinya.</span>
                    </>
                  )}
                </h2>
                <p className="text-pretty mt-2 text-xs text-[#E6EDF2] leading-relaxed">
                  {isRegister
                    ? "Verifikasi riwayat banjir, macet harian, dan perimeter aman sebelum bayar tanda jadi atau DP."
                    : "Lanjutkan membaca riwayat banjir, perimeter aman, dan ringkasan investigasi properti tersimpan Anda."}
                </p>
              </div>

              {/* 2. Interactive Polaroid Card Stack (Click to Cycle & Hover Fanning) */}
              <div className="relative w-full">
                <AuthPolaroidCardStack
                  compact={false}
                  cardOrders={cardOrders}
                  tossingCardId={tossingCardId}
                  onCardClick={handleCardClick}
                />
              </div>

              {/* Click to Cycle Hint Button */}
              <button
                type="button"
                onClick={cycleNextCard}
                className="mt-3.5 flex items-center justify-center gap-1.5 text-xs font-bold text-[#00ED64] cursor-pointer hover:underline"
              >
                <span>Lihat contoh laporan lokasi ({activeCardIndex + 1}/{CARDS_DATA.length})</span>
                <ChevronRight size={13} className="stroke-[3]" />
              </button>
            </div>

            {/* Subtle bottom spacer matching top logo height for optical vertical centering */}
            <div className="relative z-10 h-8 w-full" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
