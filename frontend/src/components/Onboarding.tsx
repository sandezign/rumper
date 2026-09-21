import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Home, ListChecks, MapPin, Pencil, Send, Sparkles, User, X } from "lucide-react";
import { ApiError, createConversationFromIntake, placesAutocomplete } from "@/lib/api";
import { loadWizard, saveWizard, wizardToIntake } from "@/lib/wizard";
import type { WizardAnswers } from "@/lib/wizard";
import HeaderMenu from "./HeaderMenu";

type Step = {
  key: keyof WizardAnswers;
  label: string;
  question: string;
  helper: string;
  options?: string[];
  multi?: boolean;
  optional?: boolean;
  property?: boolean;
  review?: boolean;
};

const STEPS: Step[] = [
  {
    key: "property",
    label: "Properti shortlist",
    question: "Properti mana yang sedang Anda pertimbangkan?",
    helper: "Tulis nama klaster/area atau pilih dari pencarian alamat. Saya pakai ini untuk membaca sinyal lokasi, akses, dan data pembanding.",
    property: true,
  },
  {
    key: "activity",
    label: "Lokasi aktivitas",
    optional: true,
    question: "Lokasi aktivitas harian mana yang paling relevan?",
    helper: "Membantu saya menimbang commute, akses tol, dan reliabilitas perjalanan harian.",
    options: ["SCBD / Sudirman", "Mega Kuningan", "Kawasan Industri Cikarang", "Remote work lebih dominan", "Lewati dulu"],
  },
  {
    key: "transport",
    label: "Moda transportasi",
    question: "Moda transportasi utama yang akan dipakai?",
    helper: "Mengubah cara saya membaca akses jalan, transportasi umum, dan biaya waktu.",
    options: ["Mobil pribadi", "Motor pribadi", "Transportasi umum", "Ojek online", "Kombinasi"],
  },
  {
    key: "risks",
    label: "Prioritas risiko",
    multi: true,
    question: "Risiko apa yang paling ingin diprioritaskan?",
    helper: "Pilih satu atau beberapa. Saya akan menonjolkan bukti yang paling relevan di dashboard.",
    options: ["Banjir", "Commute reliability", "Akses jalan", "Fasilitas keluarga", "Lingkungan sekitar", "Investment potential"],
  },
  {
    key: "timeline",
    label: "Tahap & timeline",
    question: "Seberapa dekat Anda dengan keputusan finansial?",
    helper: "Membantu saya menandai temuan yang perlu divalidasi sebelum booking fee atau DP.",
    options: ["Baru riset", "Survey terjadwal", "Booking fee pending", "Hampir bayar DP", "Siap beli"],
  },
  {
    key: "notes",
    label: "Catatan tambahan",
    optional: true,
    question: "Ada catatan atau klaim sales yang ingin dicek?",
    helper: "Membantu saya membedakan data dari asumsi.",
    options: ["Sales klaim bebas banjir", "Akses masuk terlihat sempit", "Khawatir macet pagi", "Butuh cek sekolah/fasilitas", "Tidak ada catatan tambahan"],
  },
  { key: "property", label: "Review & Confirm", question: "", helper: "", review: true },
];

const TOTAL = STEPS.length;

const PROPERTY_EXAMPLES = [
  "Grand Galaxy City, Bekasi",
  "BSD City, Tangerang Selatan",
  "Summarecon Bekasi",
];

function valueFor(a: WizardAnswers, key: keyof WizardAnswers): string {
  const v = a[key];
  return Array.isArray(v) ? v.join(", ") : v ?? "";
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<WizardAnswers>(() => loadWizard());
  const [current, setCurrent] = useState(() => (loadWizard().property ? 1 : 0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // property step autocomplete
  const [propText, setPropText] = useState(() => loadWizard().property ?? "");
  const [acItems, setAcItems] = useState<{ description: string }[]>([]);
  const acTimer = useRef<number | null>(null);

  const step = STEPS[current];

  useEffect(() => saveWizard(answers), [answers]);
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [current, answers]);

  useEffect(() => {
    if (!step.property || step.review || propText.trim().length < 4) {
      setAcItems([]);
      return;
    }
    if (acTimer.current) window.clearTimeout(acTimer.current);
    acTimer.current = window.setTimeout(() => {
      placesAutocomplete(propText.trim()).then(setAcItems).catch(() => setAcItems([]));
    }, 350);
    return () => {
      if (acTimer.current) window.clearTimeout(acTimer.current);
    };
  }, [propText, step]);

  function pick(key: keyof WizardAnswers, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }) as WizardAnswers);
    setCurrent((c) => Math.min(c + 1, TOTAL - 1));
  }
  function toggleMulti(key: keyof WizardAnswers, value: string) {
    setAnswers((a) => {
      const set = new Set(Array.isArray(a[key]) ? (a[key] as string[]) : []);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...a, [key]: [...set] } as WizardAnswers;
    });
  }
  function setProperty(value: string) {
    const property = value.trim();
    if (property.length < 3) return;
    setAnswers((a) => ({ ...a, property }));
    setAcItems([]);
    setCurrent(1);
  }

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const { conversation_id } = await createConversationFromIntake(wizardToIntake(answers));
      // keep the wizard draft so ResearchLoading can show the input summary; it's reset on a
      // new audit ("+" → Workspace.newChat → clearWizard).
      // `research: true` tells the workspace to open the full-screen loader immediately,
      // skipping the 3-column flash before research progress starts.
      navigate(`/app/c/${conversation_id}`, { state: { research: true } });
    } catch (e) {
      setSubmitting(false);
      if (e instanceof ApiError && e.status === 401) {
        navigate("/login");
        return;
      }
      const detail = e instanceof ApiError ? e.detail : null;
      if (e instanceof ApiError && e.status === 400) {
        setError(typeof detail === "string" ? detail : "Lokasi belum bisa dipetakan.");
        setCurrent(0);
        setPropText(answers.property ?? "");
        return;
      }
      setError(typeof detail === "string" ? detail : "Terjadi kesalahan. Coba lagi.");
    }
  }

  const dossier = useMemo(
    () => [
      ["Properti", valueFor(answers, "property")],
      ["Aktivitas", valueFor(answers, "activity")],
      ["Transportasi", valueFor(answers, "transport")],
      ["Risiko", valueFor(answers, "risks")],
    ],
    [answers],
  );

  // chat-input-dock (onboarding.html): readonly input shows the selection; back + send flank it.
  const dockValue = step.property
    ? propText
    : step.review
      ? "Siap mulai analisis"
      : valueFor(answers, step.key);
  const dockDisabled = step.property
    ? propText.trim().length < 3
    : step.review
      ? submitting
      : step.multi
        ? !(answers.risks ?? []).length
        : !answers[step.key];
  function dockSend() {
    if (dockDisabled) return;
    if (step.property) setProperty(propText);
    else if (step.review) void confirm();
    else setCurrent((c) => Math.min(c + 1, TOTAL - 1));
  }

  // status rail open by default on desktop, hidden (chat-first) on mobile; toggled in the topbar
  const [panelOpen, setPanelOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 1024,
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* dark topbar (rumi-topbar) */}
      <header className="flex h-[72px] shrink-0 items-center justify-between gap-md border-b border-border-dark bg-brand-teal-deep px-md md:px-2xl">
        <Link to="/app" className="flex items-center gap-sm" aria-label="Rumper — beranda">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-brand-teal-deep">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <strong className="block text-body-medium text-text-on-dark">Rumper</strong>
            <small className="hidden text-caption text-text-on-dark-muted sm:block">Due diligence properti</small>
          </span>
        </Link>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs text-right sm:w-48 sm:flex-col sm:items-stretch sm:gap-xxs" aria-live="polite">
            <span className="text-micro-uppercase text-text-on-dark-muted">
              <span className="sm:hidden">{current + 1}/{TOTAL}</span>
              <span className="hidden sm:inline">Langkah {current + 1} dari {TOTAL}</span>
            </span>
            <div className="hidden h-2 overflow-hidden rounded-full bg-white/10 sm:block">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${((current + 1) / TOTAL) * 100}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            aria-controls="onboarding-status-panel"
            aria-label={panelOpen ? "Sembunyikan panel status" : "Tampilkan panel status"}
            className="flex size-9 items-center justify-center rounded-md text-text-on-dark-muted hover:bg-white/10"
          >
            <ListChecks className="size-5" aria-hidden />
          </button>
          <HeaderMenu onDark />
        </div>
      </header>

      {/* card shell: conversation card + status rail */}
      <main className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 gap-lg px-md py-lg md:px-xl">
        {/* conversation card */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-raised)]">
          <header className="flex shrink-0 items-center gap-sm border-b border-border px-xl py-md">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-teal-deep text-primary">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <div>
              <h1 className="text-heading-5 text-foreground">Asisten AI</h1>
              <p className="text-caption text-text-tertiary">
                Rumi mengumpulkan konteks lewat pilihan bertahap sebelum analisis pertama.
              </p>
            </div>
          </header>
          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-md py-lg md:px-xl">
            <div className="mx-auto flex max-w-[44rem] flex-col gap-md">
              <Bubble role="ai">
                <strong className="text-body-medium text-foreground">Halo! Saya Rumi, asisten due diligence Rumper.</strong>
                <p className="mt-xxs text-body-sm text-text-secondary">
                  Saya pandu {TOTAL} langkah singkat. Cukup pilih opsi yang paling sesuai.
                </p>
              </Bubble>

              {STEPS.slice(0, current).map((s, i) => (
                <div key={i} className="flex flex-col gap-md">
                  <Bubble role="ai">
                    <strong className="text-body-sm-medium text-foreground">{s.label}</strong>
                    <p className="mt-xxs text-body-sm text-text-secondary">{s.question}</p>
                  </Bubble>
                  {valueFor(answers, s.key) && !s.review && (
                    <Bubble role="user">{valueFor(answers, s.key)}</Bubble>
                  )}
                </div>
              ))}

              {step.review ? (
                <Bubble role="ai">
                  <strong className="text-body-medium text-foreground">Review &amp; Confirm</strong>
                  <p className="mt-xxs text-body-sm text-text-secondary">
                    Ringkasan input yang akan dipakai untuk analisis pertama.
                  </p>
                  <div className="mt-sm flex flex-col gap-xs">
                    {STEPS.filter((s) => !s.review).map((s, i) => {
                      const val = valueFor(answers, s.key);
                      return (
                        <div key={i} className="rounded-md border border-border bg-card p-sm">
                          <div className="flex items-center justify-between gap-sm">
                            <span className="text-micro-uppercase text-text-tertiary">{s.label}</span>
                            <button
                              type="button"
                              onClick={() => setCurrent(STEPS.indexOf(s))}
                              className="inline-flex shrink-0 items-center gap-xxs text-caption-bold text-brand-green-dark hover:underline"
                            >
                              <Pencil className="size-3" aria-hidden /> Edit
                            </button>
                          </div>
                          <p
                            className={`mt-xxs text-body-sm-medium wrap-anywhere ${
                              val ? "text-foreground" : "text-text-tertiary"
                            }`}
                          >
                            {val || "Belum dipilih"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-sm text-caption text-text-tertiary">
                    Informasi dari Anda cukup untuk analisis awal. Tingkat keyakinan tetap saya tandai di dashboard.
                  </p>
                </Bubble>
              ) : (
                <Bubble role="ai">
                  <strong className="text-body-sm-medium text-foreground">{step.label}</strong>
                  <p className="mt-xxs text-body-sm text-text-secondary">{step.question}</p>
                  <small className="mt-xs block text-caption text-text-tertiary">{step.helper}</small>
                </Bubble>
              )}
            </div>
          </div>

          {/* chat-input-dock: back · input · send, then quick-option chips (onboarding.html) */}
          <footer className="shrink-0 border-t border-border bg-card px-md py-md md:px-xl">
            <div className="mx-auto max-w-[44rem]">
              {error && (
                <p className="mb-sm rounded-md bg-semantic-danger-bg px-sm py-xs text-caption text-semantic-danger-text">
                  {error}
                </p>
              )}

              <div className="relative">
                {step.property && acItems.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 z-20 mb-xs overflow-hidden rounded-lg border border-border bg-popover shadow-[var(--shadow-raised)]">
                    <p className="flex items-center gap-xxs border-b border-border px-sm py-xs text-micro-uppercase text-text-tertiary">
                      <MapPin className="size-3.5" aria-hidden /> Pilih alamat (Google Maps)
                    </p>
                    {acItems.map((a) => (
                      <button
                        key={a.description}
                        type="button"
                        onClick={() => setProperty(a.description)}
                        className="block w-full truncate px-sm py-xs text-left text-caption text-text-secondary hover:bg-surface-soft"
                      >
                        {a.description}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-strong bg-card text-foreground hover:bg-surface-soft disabled:opacity-40"
                    aria-label="Kembali ke langkah sebelumnya"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                  <input
                    value={dockValue}
                    readOnly={!step.property}
                    onChange={step.property ? (e) => setPropText(e.target.value) : undefined}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        dockSend();
                      }
                    }}
                    placeholder={step.property ? "Nama klaster, alamat, atau link listing…" : "Pilih salah satu opsi untuk lanjut…"}
                    aria-label="Jawaban langkah ini"
                    className="min-h-11 min-w-0 flex-1 rounded-full border border-border-strong bg-surface-soft px-md text-body-sm text-foreground outline-none read-only:cursor-default focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={dockSend}
                    disabled={dockDisabled}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-strong bg-card text-foreground transition enabled:hover:border-brand-green-dark enabled:hover:text-brand-green-dark disabled:opacity-40"
                    aria-label="Lanjut"
                  >
                    <Send className="size-4" aria-hidden />
                  </button>
                </div>
              </div>

              {/* quick options */}
              <div className="mt-sm flex flex-wrap gap-xs">
                {step.review ? (
                  <button
                    type="button"
                    onClick={confirm}
                    disabled={submitting}
                    className="inline-flex min-h-9 items-center gap-xs rounded-full bg-primary px-md text-caption-bold text-primary-foreground hover:bg-brand-green-hover disabled:opacity-50"
                  >
                    <Sparkles className="size-4" aria-hidden />
                    {submitting ? "Memulai analisis…" : "Confirm & Mulai Analisis"}
                  </button>
                ) : step.property ? (
                  PROPERTY_EXAMPLES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setProperty(c)}
                      className="rounded-full border border-border-strong bg-card px-sm py-xs text-caption text-text-secondary hover:border-brand-green-dark hover:text-brand-green-dark"
                    >
                      {c}
                    </button>
                  ))
                ) : (
                  <>
                    {step.options!.map((opt) => {
                      const selected =
                        step.multi && Array.isArray(answers[step.key])
                          ? (answers[step.key] as string[]).includes(opt)
                          : answers[step.key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => (step.multi ? toggleMulti(step.key, opt) : pick(step.key, opt))}
                          className={`inline-flex items-center gap-xxs rounded-full border px-sm py-xs text-body-sm-medium ${
                            selected
                              ? "border-brand-green-dark bg-surface-feature text-brand-green-dark"
                              : "border-border-strong bg-card text-foreground hover:border-brand-green-dark"
                          }`}
                        >
                          {selected && <Check className="size-3.5" aria-hidden />}
                          {opt}
                        </button>
                      );
                    })}
                    {step.multi && (
                      <button
                        type="button"
                        onClick={dockSend}
                        disabled={dockDisabled}
                        className="inline-flex min-h-9 items-center gap-xs rounded-full bg-primary px-md text-caption-bold text-primary-foreground hover:bg-brand-green-hover disabled:opacity-50"
                      >
                        Simpan pilihan risiko
                      </button>
                    )}
                    {step.optional && (
                      <button
                        type="button"
                        onClick={() => setCurrent((c) => Math.min(c + 1, TOTAL - 1))}
                        className="rounded-full px-sm py-xs text-caption-bold text-text-tertiary hover:text-foreground"
                      >
                        Lewati langkah ini
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </footer>
        </section>

        {/* status rail — overlay on mobile (chat-first), card column on desktop */}
        {panelOpen && (
          <div
            className="fixed inset-0 z-40 bg-[var(--surface-scrim)] lg:hidden"
            onClick={() => setPanelOpen(false)}
          />
        )}
        <aside
          id="onboarding-status-panel"
          aria-hidden={!panelOpen}
          className={`fixed inset-y-0 right-0 z-50 w-[340px] max-w-[88vw] flex-col gap-md overflow-y-auto border-l border-border bg-surface p-lg transition-transform lg:static lg:z-auto lg:w-[360px] lg:translate-x-0 lg:border-l-0 lg:bg-transparent lg:p-0 ${
            panelOpen ? "flex translate-x-0 lg:flex" : "flex translate-x-full lg:hidden"
          }`}
        >
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-label="Tutup panel status"
            className="flex size-9 items-center justify-center self-end rounded-md text-text-tertiary hover:bg-surface-soft lg:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
          <section className="rounded-xl border border-border bg-card p-lg shadow-[var(--shadow-subtle)]">
            <span className="text-micro-uppercase text-text-tertiary">Onboarding</span>
            <ol className="mt-sm flex flex-col gap-xs">
              {STEPS.map((s, i) => (
                <li key={i} className="flex items-center gap-sm text-body-sm">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-caption-bold ${
                      i < current
                        ? "bg-semantic-positive-bg text-semantic-positive-text"
                        : i === current
                          ? "bg-brand-teal-deep text-text-on-dark"
                          : "bg-surface-soft text-text-tertiary"
                    }`}
                  >
                    {i < current ? <Check className="size-3" aria-hidden /> : i + 1}
                  </span>
                  <span className={i === current ? "text-foreground" : "text-text-secondary"}>{s.label}</span>
                  {s.optional && <span className="ml-auto text-micro text-text-tertiary">Opsional</span>}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-border bg-card p-lg shadow-[var(--shadow-subtle)]">
            <span className="text-micro-uppercase text-text-tertiary">Status input</span>
            <p className="mt-xxs text-caption text-text-tertiary">
              Jawaban terpilih memperbarui ringkasan analisis awal secara real-time.
            </p>
            <dl className="mt-md flex flex-col gap-sm">
              {dossier.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-micro-uppercase text-text-tertiary">{k}</dt>
                  <dd
                    className={`mt-xxs rounded-md border px-sm py-xs text-body-sm-medium wrap-anywhere ${
                      v ? "border-[#bfe7ce] bg-[#effaf3] text-[#0a6640]" : "border-border bg-surface-soft text-text-tertiary"
                    }`}
                  >
                    {v || "Belum dipilih"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl bg-brand-teal-deep p-lg text-text-on-dark shadow-[var(--shadow-subtle)]">
            <span className="inline-flex items-center rounded-full bg-white/10 px-sm py-xxs text-micro-uppercase text-primary">
              ± 3 menit
            </span>
            <h2 className="mt-sm text-heading-5 text-text-on-dark">Ringkas, buyer-side, siap untuk analisis awal.</h2>
            <p className="mt-xxs text-caption text-text-on-dark-muted">
              Ini prototipe. Rumper bukan agen properti dan tidak menggantikan survei fisik.
            </p>
          </section>
        </aside>
      </main>
    </div>
  );
}

/** Conversation bubble (onboarding.html): pale-green bubble for both roles; AI = deep-teal
 *  sparkle avatar (left), user = neutral person avatar (right). */
function Bubble({ role, children }: { role: "ai" | "user"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-sm ${isUser ? "flex-row-reverse self-end" : "self-start"} max-w-[88%]`}>
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "border border-border bg-card text-text-secondary" : "bg-brand-teal-deep text-primary"
        }`}
        aria-hidden
      >
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </div>
      <div
        className={`rounded-lg px-md py-sm text-body-sm text-foreground ${
          isUser
            ? "rounded-tr-sm border border-border bg-card"
            : "rounded-tl-sm border border-[rgba(0,200,100,0.25)] bg-[#e9fff1]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
