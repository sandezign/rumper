import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive, ArrowLeft, Briefcase, ChevronRight, CreditCard, Download, FileText, LogOut,
  MapPin, Share2, ShieldCheck, Sparkles, User as UserIcon, Zap,
} from "lucide-react";
import JourneyHeader from "@/features/areas/components/JourneyHeader";
import PdfDueDiligenceModal from "@/features/export/PdfDueDiligenceModal";
import { useCommerce } from "@/features/commerce/useCommerce";
import { getCheck, listConversations, logout, me, type Convo, type Report, type User } from "@/lib/api";
import { formatRp, tierOf, useEntitlement } from "@/lib/entitlements";
import { loadProfile, saveProfile, type BuyerPriorityProfile, type WorkPattern } from "@/lib/profile";

type TabKey = "profile" | "billing" | "archive" | "share";

const WORK_MODES: { id: WorkPattern; label: string }[] = [
  { id: "wfo", label: "Full WFO (5 hari)" },
  { id: "hybrid", label: "Hybrid (2–3 hari WFO)" },
  { id: "remote", label: "Full remote / WFH" },
];

const OFFICE_PRESETS = ["SCBD", "Kuningan", "Mega Kuningan", "TB Simatupang", "Thamrin"];

/** Status chip per archived property. Derived from the audit's own band — never invented:
 *  a location with no finished report reads "Investigasi", which is what it is. */
function statusOf(c: Convo): { label: string; cls: string } {
  if (c.band === "relatif_kuat") return { label: "Lanjutkan", cls: "bg-emerald-50 text-[#00684A] border-emerald-200/70" };
  if (c.band === "risiko_tinggi") return { label: "Tunda", cls: "bg-rose-50 text-rose-800 border-rose-200/70" };
  return { label: "Investigasi", cls: "bg-amber-50 text-amber-800 border-amber-200/70" };
}

function scoreTone(score: number | null | undefined): string {
  if (score == null) return "bg-slate-50 text-slate-500 border-slate-200/60";
  if (score >= 80) return "bg-emerald-50 text-[#00684A] border-emerald-200/60";
  if (score >= 65) return "bg-amber-50 text-amber-900 border-amber-200/60";
  return "bg-rose-50 text-rose-800 border-rose-200/60";
}

/** `/app/account` — account settings hub (PRD-13 §4 Module 5): profile & work anchors,
 *  quota and billing, the property archive, and export/sharing.
 *
 *  Everything on this page is read from something real: the identity from `GET /api/auth/me`,
 *  the archive and its verdicts from `GET /api/conversations`, the work anchors from the
 *  buyer profile the wizard wrote, the quota from how many audits actually exist. Where the
 *  backend does not exist yet — billing history, family sharing — the tab says so instead of
 *  showing a plausible-looking placeholder. */
export default function Account() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [profile, setProfile] = useState<BuyerPriorityProfile | null>(null);
  const [primaryOffice, setPrimaryOffice] = useState("");
  const [secondaryOffice, setSecondaryOffice] = useState("");
  const [workMode, setWorkMode] = useState<WorkPattern>("hybrid");
  const [saved, setSaved] = useState(false);
  const [pdfReport, setPdfReport] = useState<{ report: Report; id: string } | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const { pass, locationLimit } = useEntitlement();
  const analysed = useMemo(() => convos.filter((c) => c.intake_id), [convos]);
  const used = analysed.length;
  const remaining = Math.max(0, locationLimit - used);
  const quotaPercent = Math.min(100, Math.round((used / locationLimit) * 100));

  const commerce = useCommerce({
    auditedCount: used,
    onOpenArchive: () => setTab("archive"),
  });

  useEffect(() => {
    me().then(setUser).catch(() => navigate("/login"));
    listConversations().then(setConvos).catch(() => setConvos([]));
    const p = loadProfile();
    if (!p) return;
    setProfile(p);
    setPrimaryOffice(p.anchors.find((a) => a.type === "primary")?.label ?? "");
    setSecondaryOffice(p.anchors.find((a) => a.type === "secondary")?.label ?? "");
    setWorkMode(p.workPattern);
  }, [navigate]);

  const saveWorkAnchors = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const anchors = [
      ...(primaryOffice.trim() ? [{ label: primaryOffice.trim(), type: "primary" as const }] : []),
      ...(secondaryOffice.trim() ? [{ label: secondaryOffice.trim(), type: "secondary" as const }] : []),
    ];
    const next = { ...profile, anchors, workPattern: workMode };
    saveProfile(next);
    setProfile(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [profile, primaryOffice, secondaryOffice, workMode]);

  /** Export needs a finished report, so it is fetched on demand for the most recent audit
   *  rather than assumed to exist. */
  const openPdf = useCallback(async (c: Convo) => {
    if (!c.intake_id) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      const check = await getCheck(c.intake_id);
      if (check.status !== "done") {
        setPdfError("Analisis lokasi ini belum selesai, jadi ringkasannya belum bisa diekspor.");
        return;
      }
      setPdfReport({ report: check.report, id: c.intake_id });
    } catch {
      setPdfError("Gagal memuat laporan. Coba lagi sebentar lagi.");
    } finally {
      setPdfBusy(false);
    }
  }, []);

  async function doLogout() {
    await logout().catch(() => {});
    navigate("/");
  }

  const tokenPct = user ? Math.min(100, Math.round((user.tokens_used_today / user.token_limit) * 100)) : 0;
  const initials = (user?.name || user?.email || "?").slice(0, 2).toUpperCase();

  const TABS: { id: TabKey; label: string; short: string; subtitle: string; Icon: typeof UserIcon }[] = [
    { id: "profile", label: "Profil & lokasi kerja", short: "Profil", subtitle: "Titik kantor & pola komuter", Icon: UserIcon },
    { id: "billing", label: "Kuota & paket", short: "Kuota", subtitle: `${remaining} kuota tersisa`, Icon: CreditCard },
    { id: "archive", label: "Arsip properti", short: "Arsip", subtitle: `${used} properti tersimpan`, Icon: Archive },
    { id: "share", label: "Ekspor & berbagi", short: "Berbagi", subtitle: "Ringkasan PDF", Icon: Share2 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F8F7] text-[#001E2B] antialiased">
      <div className="sticky top-0 z-50 flex w-full flex-col">
        <JourneyHeader variant="areas" onUpgrade={() => commerce.openUpgrade()}
                       onZeroQuota={commerce.openZeroQuota}
                       onRecurate={() => navigate("/app/areas")} />
      </div>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-16 pt-6 sm:px-6 md:px-8 md:pb-12">
        <div className="space-y-4">
          <button type="button" onClick={() => navigate("/app/areas")}
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E5E5EA] bg-white px-3.5 py-1.5 text-xs font-bold text-[#334155] shadow-xs transition-all hover:bg-[#F0F4F2] hover:text-[#001E2B] active:scale-95">
            <ArrowLeft size={14} className="text-[#00684A] transition-transform group-hover:-translate-x-0.5" />
            <span>Kembali ke peta wilayah</span>
          </button>

          <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5EA] pb-5 sm:flex-row sm:items-end">
            <div>
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#00684A]">
                Akun &amp; preferensi
              </span>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-[#001E2B] sm:text-3xl">
                Pengaturan akun &amp; profil
              </h1>
              <p className="mt-1 text-xs text-[#5C6C7A] sm:text-sm">
                Kelola lokasi kerja, kuota evaluasi, arsip properti, dan ekspor ringkasan.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-[#E5E5EA] bg-white p-2.5 shadow-xs sm:self-auto sm:px-4 sm:py-2">
              {user?.picture ? (
                <img src={user.picture} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full" />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-[#001E2B] text-xs font-black text-[#00ED64] shadow-xs">
                  {initials}
                </div>
              )}
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-bold text-[#001E2B]">{user?.name ?? "—"}</span>
                  <span className={`rounded-full border px-2 py-px text-[9px] font-black uppercase ${
                    pass ? "border-[#00ED64]/40 bg-[#00ED64]/15 text-[#00684A]" : "border-slate-300 bg-slate-100 text-[#5C6C7A]"
                  }`}>
                    {pass ? tierOf(pass).title : "Free trial"}
                  </span>
                </div>
                <span className="block max-w-[140px] truncate text-[11px] text-[#7C8C9A] sm:max-w-[180px]">
                  {user?.email ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* mobile segmented control */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-300/40 bg-slate-200/60 p-1 shadow-xs backdrop-blur-md md:hidden">
          {TABS.map(({ id, short, Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)}
                    className={`flex min-h-[40px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
                      tab === id ? "bg-white font-bold text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}>
              <Icon size={14} className={tab === id ? "text-[#00684A]" : ""} />
              <span>{short}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          <aside className="hidden flex-col gap-2 md:col-span-4 md:flex lg:col-span-3">
            <div className="space-y-1 rounded-[24px] border border-[#E5E5EA] bg-white p-3.5 shadow-xs">
              <span className="mb-2 block px-3 text-[10px] font-black uppercase tracking-wider text-[#7C8C9A]">
                Menu pengaturan
              </span>
              {TABS.map(({ id, label, subtitle, Icon }) => (
                <button key={id} type="button" onClick={() => setTab(id)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-2xl p-3 text-left transition-all ${
                          tab === id ? "bg-[#001E2B] text-white shadow-md ring-1 ring-white/10" : "text-[#334155] hover:bg-[#F4F7F6]"
                        }`}>
                  <span className="flex items-center gap-3">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                      tab === id ? "bg-white/10 text-[#00ED64]" : "bg-slate-100 text-[#5C6C7A]"
                    }`}>
                      <Icon size={16} />
                    </span>
                    <span>
                      <span className="block text-xs font-black leading-tight">{label}</span>
                      <span className={`mt-0.5 block text-[10px] leading-tight ${tab === id ? "text-[#A8B3BC]" : "text-[#7C8C9A]"}`}>
                        {subtitle}
                      </span>
                    </span>
                  </span>
                  <ChevronRight size={14} className={tab === id ? "text-[#00ED64]" : "text-[#CBD5E1]"} />
                </button>
              ))}
            </div>

            <div className="space-y-1.5 rounded-[22px] border border-emerald-200/60 bg-emerald-50/70 p-4 text-xs text-[#004D36]">
              <div className="flex items-center gap-1.5 font-extrabold text-[#00684A]">
                <ShieldCheck size={16} />
                <span>Privasi terjamin</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#004D36]/90">
                Titik kantor dan data investigasimu dipakai hanya untuk menyiapkan analisis risiko —
                tidak dibagikan ke penjual, agen, atau developer.
              </p>
            </div>
          </aside>

          <section className="space-y-6 md:col-span-8 lg:col-span-9">
            {tab === "profile" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-6 rounded-[28px] border border-[#E5E5EA] bg-white p-6 shadow-xs sm:p-8">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[#001E2B]">Profil akun &amp; lokasi kerja</h2>
                    <p className="mt-1 text-xs leading-relaxed text-[#5C6C7A]">
                      Titik kantor menentukan perhitungan waktu tempuh, transit KRL, akses tol, dan rute
                      jam sibuk pada setiap analisis lokasi.
                    </p>
                  </div>

                  {saved && (
                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-[#00684A] animate-fadeIn">
                      <ShieldCheck size={16} />
                      <span>Preferensi lokasi kerja tersimpan.</span>
                    </div>
                  )}

                  {!profile && (
                    <div className="rounded-2xl border border-[#D4A017]/30 bg-[#FFF9E6] p-3.5 text-xs leading-relaxed text-[#523A00]">
                      Kamu belum menyelesaikan wizard prioritas, jadi belum ada titik kantor yang tersimpan.{" "}
                      <button type="button" onClick={() => navigate("/app/start")}
                              className="cursor-pointer font-bold underline">
                        Mulai dari prioritas saya
                      </button>
                    </div>
                  )}

                  <form onSubmit={saveWorkAnchors} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 border-b border-[#E5E5EA] pb-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="acc-name" className="mb-1.5 block text-xs font-bold text-[#001E2B]">
                          Nama lengkap
                        </label>
                        <input id="acc-name" type="text" value={user?.name ?? ""} disabled
                               className="h-11 w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-3.5 text-sm font-medium text-[#64748B]" />
                      </div>
                      <div>
                        <label htmlFor="acc-email" className="mb-1.5 block text-xs font-bold text-[#001E2B]">
                          Email terdaftar
                        </label>
                        <input id="acc-email" type="email" value={user?.email ?? ""} disabled
                               className="h-11 w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-3.5 text-sm font-medium text-[#64748B]" />
                      </div>
                      <p className="text-[11px] text-[#7C8C9A] sm:col-span-2">
                        Nama dan email ikut akun Google yang kamu pakai untuk masuk.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="acc-office" className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-[#001E2B]">
                        <MapPin size={14} className="text-[#00684A]" />
                        <span>Lokasi kantor utama</span>
                      </label>
                      <input id="acc-office" type="text" value={primaryOffice} disabled={!profile}
                             onChange={(e) => setPrimaryOffice(e.target.value)}
                             placeholder="Nama gedung atau area kantor utamamu"
                             className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm font-medium text-[#001E2B] focus:outline-none focus:ring-2 focus:ring-[#00684A] disabled:bg-[#F1F5F9]" />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="py-0.5 text-[10px] text-[#7C8C9A]">Preset:</span>
                        {OFFICE_PRESETS.map((preset) => (
                          <button key={preset} type="button" disabled={!profile}
                                  onClick={() => setPrimaryOffice(preset)}
                                  className="cursor-pointer rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#334155] hover:bg-slate-200 disabled:opacity-50">
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="acc-office-2" className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-[#001E2B]">
                        <Briefcase size={14} className="text-[#00684A]" />
                        <span>Kantor pasangan / kampus / lainnya (opsional)</span>
                      </label>
                      <input id="acc-office-2" type="text" value={secondaryOffice} disabled={!profile}
                             onChange={(e) => setSecondaryOffice(e.target.value)}
                             placeholder="Area kantor pasangan, kampus, atau cabang"
                             className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm font-medium text-[#001E2B] focus:outline-none focus:ring-2 focus:ring-[#00684A] disabled:bg-[#F1F5F9]" />
                    </div>

                    <div className="pt-2">
                      <span className="mb-2 block text-xs font-extrabold text-[#001E2B]">Pola kerja mingguan</span>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {WORK_MODES.map((mode) => (
                          <button key={mode.id} type="button" disabled={!profile}
                                  onClick={() => setWorkMode(mode.id)}
                                  className={`cursor-pointer rounded-2xl border p-3 text-center text-xs font-bold transition-all disabled:opacity-50 ${
                                    workMode === mode.id
                                      ? "border-[#001E2B] bg-[#001E2B] text-[#00ED64] shadow-xs"
                                      : "border-[#CBD5E1] bg-white text-[#5C6C7A] hover:bg-[#F4F7F6]"
                                  }`}>
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      {profile && (
                        <p className="mt-2 text-[11px] text-[#7C8C9A]">
                          Anggaran dari wizard: Rp {profile.budget.minMillions} jt – {profile.budget.maxMillions} jt.
                          Ubah lewat re-kurasi wilayah.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={!profile}
                              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-[#00684A] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#00523A] active:scale-95 disabled:opacity-40">
                        <ShieldCheck size={16} />
                        <span>Simpan perubahan</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-[28px] border border-[#E5E5EA] bg-white p-6 shadow-xs sm:p-8">
                  <h3 className="text-base font-black tracking-tight text-[#001E2B]">Sesi</h3>
                  <p className="mt-0.5 text-xs text-[#5C6C7A]">Keluar dari akun ini di perangkat ini.</p>
                  <button type="button" onClick={() => void doLogout()}
                          className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-[#CBD5E1] px-5 text-xs font-bold text-[#3D4F5B] transition-colors hover:bg-slate-50">
                    <LogOut size={15} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}

            {tab === "billing" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-6 rounded-[28px] border border-[#E5E5EA] bg-white p-6 shadow-xs sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[#7C8C9A]">
                        Kapasitas evaluasi
                      </span>
                      <h2 className="text-xl font-black tracking-tight text-[#001E2B]">Kuota lokasi &amp; status paket</h2>
                    </div>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      pass ? "border-[#00ED64]/40 bg-[#00ED64]/15 text-[#00684A]" : "border-slate-300 bg-slate-100 text-[#334155]"
                    }`}>
                      {pass ? tierOf(pass).title : "Free trial"}
                    </span>
                  </div>

                  <div className="space-y-3 rounded-[22px] border border-[#E5E5EA] bg-[#F9FBFA] p-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#001E2B]">
                        {used} dari {locationLimit} kuota lokasi terpakai
                      </span>
                      <span className="font-mono text-xs font-black text-[#00684A]">{remaining} slot tersisa</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#00684A] to-[#00ED64] transition-all duration-500"
                           style={{ width: `${quotaPercent}%` }} />
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#5C6C7A]">
                      Satu kuota terpakai per lokasi yang dianalisis. Menghapus tautan properti tidak
                      mengembalikan kuota, dan {used} properti yang sudah dianalisis tetap bisa dibuka
                      dari arsip.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-[22px] border border-[#E5E5EA] bg-[#F9FBFA] p-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#001E2B]">Token harian untuk chat &amp; riset</span>
                      <span className="font-mono text-xs font-black text-[#00684A]">
                        {user ? `${user.tokens_used_today.toLocaleString("id")} / ${user.token_limit.toLocaleString("id")}` : "—"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-full rounded-full ${tokenPct > 90 ? "bg-rose-500" : "bg-[#00684A]"}`}
                           style={{ width: `${tokenPct}%` }} />
                    </div>
                    <p className="text-[11px] text-[#5C6C7A]">Reset otomatis setiap tengah malam WIB.</p>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] bg-gradient-to-r from-[#001E2B] to-[#0F2B38] p-5 text-white sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#00ED64]">
                        <Sparkles size={14} />
                        <span>Butuh tambahan kuota?</span>
                      </div>
                      <p className="max-w-md text-xs text-[#A8B3BC]">
                        <strong>{tierOf("bundle").title}</strong> seharga {formatRp(tierOf("bundle").price)} menambah
                        +{tierOf("bundle").extraLocations} kuota sekaligus membuka matriks komparasi.
                      </p>
                    </div>
                    <button type="button" onClick={() => commerce.openUpgrade("bundle")}
                            className="flex min-h-[42px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#00ED64] px-5 py-2 text-xs font-black text-[#001E2B] shadow-md transition-all hover:bg-[#00b545] active:scale-95">
                      <Zap size={14} className="fill-current" />
                      <span>Lihat paket akses</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 rounded-[28px] border border-[#E5E5EA] bg-white p-6 shadow-xs sm:p-8">
                  <h3 className="text-base font-black tracking-tight text-[#001E2B]">Riwayat transaksi</h3>
                  {/* No payment provider is wired yet (docs/18 GAP-12), so there is nothing to
                      list — and an illustrative invoice row would read as a real charge. */}
                  <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center">
                    <FileText size={20} className="mx-auto mb-2 text-[#7C8C9A]" />
                    <p className="text-xs font-semibold text-[#001E2B]">Belum ada transaksi</p>
                    <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-[#5C6C7A]">
                      Pembayaran in-app belum dibuka, jadi belum ada invoice yang bisa ditampilkan.
                      Begitu paket akses bisa dibeli, seluruh riwayat dan invoicenya muncul di sini.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tab === "archive" && (
              <div className="space-y-4 animate-fadeIn sm:space-y-5">
                <div className="flex flex-col justify-between gap-1 px-1 sm:flex-row sm:items-baseline">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-[#001E2B] sm:text-xl">Arsip properti</h2>
                    <p className="mt-0.5 text-xs text-[#5C6C7A]">
                      Hasil analisis, skor, dan checklist lapangan tiap lokasi yang sudah kamu evaluasi.
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-semibold text-[#7C8C9A]">{used} properti</span>
                </div>

                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-[#E5E5EA] bg-white shadow-xs md:rounded-[24px]">
                  {analysed.length === 0 && (
                    <p className="p-6 text-center text-xs leading-relaxed text-[#5C6C7A]">
                      Belum ada properti yang dianalisis. Pilih koridor di peta wilayah untuk mulai.
                    </p>
                  )}
                  {analysed.map((c) => {
                    const status = statusOf(c);
                    return (
                      <button key={c.id} type="button" onClick={() => navigate(`/app/c/${c.id}`)}
                              className="group flex w-full cursor-pointer select-none items-center justify-between gap-3.5 bg-white p-3.5 text-left transition-all hover:bg-slate-50/50 active:bg-slate-50/90 sm:p-4">
                        <div className={`flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border font-mono font-bold ${scoreTone(c.rls_score)}`}>
                          <span className="text-sm font-black leading-none">{c.rls_score ?? "—"}</span>
                          <span className="mt-0.5 font-sans text-[8px] font-semibold uppercase tracking-wider opacity-70">Skor</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-bold text-[#001E2B] transition-colors group-hover:text-[#00684A] sm:text-[15px]">
                              {c.property_name?.trim() || c.title}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${status.cls}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#5C6C7A]">
                            <MapPin size={11} className="shrink-0 text-[#00684A]" />
                            <span className="truncate">{c.title}</span>
                          </p>
                        </div>

                        <ChevronRight size={16} className="shrink-0 text-[#CBD5E1] transition-all group-hover:translate-x-0.5 group-hover:text-[#00684A]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "share" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-4 rounded-[28px] border border-[#E5E5EA] bg-white p-6 shadow-xs sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black tracking-tight text-[#001E2B]">
                        Ringkasan due diligence (PDF)
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#5C6C7A]">
                        Dokumen 3 halaman: ringkasan &amp; rekomendasi, skor per faktor dengan kekuatan
                        bukti, dan lembar checklist untuk dibawa saat survei. Simpan lewat
                        cetak-ke-PDF di browser.
                      </p>
                    </div>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#00684A]">
                      <FileText size={18} />
                    </div>
                  </div>

                  {pdfError && (
                    <p className="rounded-2xl border border-[#D4A017]/30 bg-[#FFF9E6] p-3 text-xs font-semibold text-[#523A00]">
                      {pdfError}
                    </p>
                  )}

                  <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-[#E5E5EA]">
                    {analysed.length === 0 && (
                      <p className="p-4 text-xs text-[#5C6C7A]">
                        Belum ada laporan yang bisa diekspor.
                      </p>
                    )}
                    {analysed.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 p-3.5">
                        <span className="min-w-0 truncate text-xs font-semibold text-[#001E2B]">
                          {c.property_name?.trim() || c.title}
                        </span>
                        <button type="button" disabled={pdfBusy} onClick={() => void openPdf(c)}
                                className="flex min-h-[36px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-[#001E2B] px-4 text-xs font-bold text-white transition-all hover:bg-[#061E28] active:scale-95 disabled:opacity-50">
                          <Download size={14} className="text-[#00ED64]" />
                          <span>{pdfBusy ? "Memuat…" : "Lihat ringkasan"}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-[28px] border border-[#E5E5EA] bg-white p-6 shadow-xs sm:p-8">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-800">
                      Sinkronisasi pasangan &amp; keluarga
                    </span>
                  </div>
                  <h3 className="text-base font-black tracking-tight text-[#001E2B]">Bagikan akses view-only</h3>
                  {/* Tokenised share links need a server-side grant that does not exist; showing
                      a copyable URL here would hand out a link that opens nothing. */}
                  <p className="text-xs leading-relaxed text-[#5C6C7A]">
                    Tautan berbagi belum tersedia — butuh token akses di sisi server supaya pasangan atau
                    keluarga bisa membuka laporanmu tanpa akun. Untuk sekarang, bagikan ringkasan PDF di
                    atas. Kami kabari begitu berbagi live aktif.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <PdfDueDiligenceModal
        open={pdfReport !== null}
        onClose={() => setPdfReport(null)}
        report={pdfReport?.report ?? null}
        docId={pdfReport?.id}
      />
      {commerce.modals}
    </div>
  );
}
