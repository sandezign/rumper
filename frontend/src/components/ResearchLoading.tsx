import { Check } from "lucide-react";
import type { ResearchProgress } from "./AssistantRail";
import { loadWizard } from "@/lib/wizard";

// One entry per backend loader step (orchestrator `_PHASES`, mirrored by AssistantRail's
// RESEARCH_STEPS): spatial_scan → plan → search → extract → score/compose.
const STEPS = [
  "Membaca lokasi & memindai data spasial",
  "Menyusun rencana riset",
  "Mencari & memperdalam bukti dari web",
  "Mengekstrak temuan & sumber",
  "Menghitung skor & menyiapkan laporan awal",
];

/** First-run full-screen loader — mirrors research-loading.html (orbit + sequential step
 *  cards + meter). Purely server-driven: the backend owns the step/pct/label (orchestrator
 *  `_PHASES`, polled via GET /api/checks/{id}); this component only renders those values —
 *  no client-side timers or faked "creep". The loader is unmounted by the workspace the
 *  moment the report lands. */
export default function ResearchLoading({ research }: { research: ResearchProgress | null }) {
  const step = Math.min(STEPS.length, Math.max(1, research?.step ?? 1));
  const active = step - 1; // index of the step currently running
  const pct = Math.min(100, Math.max(0, research?.pct ?? 0));
  const w = loadWizard();
  const summary: [string, string][] = [
    ["Properti", w.property ?? ""],
    ["Aktivitas", w.activity ?? ""],
    ["Transportasi", w.transport ?? ""],
    ["Prioritas", (w.risks ?? []).join(", ")],
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-md py-2xl">
      <div className="grid w-full max-w-[64rem] gap-md rounded-2xl border border-border bg-card p-2xl shadow-[var(--shadow-preview)] md:grid-cols-[1fr_320px]">
        {/* main */}
        <section className="text-center">
          {/* orbit */}
          <div className="relative mx-auto grid size-28 place-items-center rounded-full border border-border">
            <span className="orbit-dot absolute left-1/2 top-0 size-3 -translate-x-1/2 rounded-full bg-primary" />
            <span className="orbit-dot absolute bottom-1 left-2 size-3 rounded-full bg-primary" />
            <span className="orbit-dot absolute bottom-1 right-2 size-3 rounded-full bg-primary" />
            <span className="grid size-14 place-items-center rounded-xl bg-brand-teal-deep text-heading-5 font-bold text-primary">R</span>
          </div>

          <h1 className="mt-md text-heading-3 text-foreground">Menyusun analisis pertama.</h1>
          <p className="mx-auto mt-xs max-w-prose text-body-sm text-text-secondary">
            {research?.label || `${STEPS[active]}…`}
          </p>

          <ol className="mx-auto mt-2xl flex max-w-[34rem] flex-col gap-sm text-left">
            {STEPS.map((s, i) => {
              const state = i < active ? "done" : i === active ? "now" : "wait";
              return (
                <li
                  key={s}
                  className={`flex items-center gap-sm rounded-xl border px-md py-sm text-body-sm-medium ${
                    state === "done"
                      ? "border-[#bfe7ce] bg-[#effaf3] text-foreground"
                      : state === "now"
                        ? "border-brand-green-dark bg-card text-foreground"
                        : "border-border bg-surface text-text-tertiary"
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                      state === "done"
                        ? "bg-semantic-positive text-white"
                        : state === "now"
                          ? "bg-brand-green-dark text-white"
                          : "bg-surface-soft text-text-tertiary"
                    }`}
                  >
                    {state === "done" ? <Check className="size-3" aria-hidden /> : i + 1}
                  </span>
                  {s}
                </li>
              );
            })}
          </ol>

          <div className="mx-auto mt-xl h-2.5 max-w-[34rem] overflow-hidden rounded-full bg-surface-soft">
            <div className="h-full rounded-full bg-brand-green-dark transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </section>

        {/* input summary — readonly fields (research-loading.html) */}
        <aside className="rounded-xl border border-border bg-card p-xl">
          <span className="text-micro-uppercase text-text-tertiary">Ringkasan input</span>
          <dl className="mt-md flex flex-col gap-sm">
            {summary.map(([k, v]) => (
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
          <p className="mt-lg text-caption text-text-tertiary">
            Hasil awal berbasis sinyal data dan interpretasi AI. Bukan rekomendasi final atau pengganti survei lokasi.
          </p>
        </aside>
      </div>
    </div>
  );
}
