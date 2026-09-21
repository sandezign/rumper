import { useEffect, useRef, useState } from "react";
import ResearchLoading from "@/components/ResearchLoading";
import type { ResearchProgress } from "@/components/AssistantRail";
import { saveWizard } from "@/lib/wizard";

/** DEV-only preview for <ResearchLoading>. Mounted at /dev/research-loading (see main.tsx,
 *  gated by import.meta.env.DEV). Replays a mocked, server-shaped progress flow via timeouts
 *  — no API, no backend — so the first-run loader can be designed/tuned in isolation.
 *
 *  The loader is purely server-driven (renders step/pct/label as-is), so this mock supplies
 *  the same fields the backend would (orchestrator `_PHASES`). Gaps are deliberately uneven
 *  (the web-research node is the slow one) to mimic real timing. */

// { step, pct, label, at } — what the backend would report, and when (ms after start).
const TIMELINE: { step: number; pct: number; label: string; at: number }[] = [
  { step: 1, pct: 6, label: "Memindai data spasial: banjir, elevasi, tol, fasilitas…", at: 600 },
  { step: 2, pct: 18, label: "Menyusun rencana riset…", at: 3_500 },
  { step: 3, pct: 28, label: "Mencari & memperdalam bukti dari web (0/6)…", at: 7_000 },
  { step: 3, pct: 40, label: "Mencari & memperdalam bukti dari web (2/6)…", at: 11_000 },
  { step: 3, pct: 56, label: "Mencari & memperdalam bukti dari web (5/6)…", at: 15_000 },
  { step: 3, pct: 66, label: "Menilai kecukupan bukti…", at: 18_000 },
  { step: 4, pct: 78, label: "Mengekstrak temuan & sumber…", at: 22_000 },
  { step: 5, pct: 90, label: "Menghitung skor…", at: 26_000 },
  { step: 5, pct: 96, label: "Menyiapkan laporan awal…", at: 28_000 },
];

const SEED: ResearchProgress = { active: true, step: 1, total: 5, pct: 2, label: "Membaca lokasi…" };
/** DEV-only entrypoint. Mounted at /dev/research-loading (see main.tsx).
 *  Directly renders the standalone map playground workspace for testing and UI layout design. */
export default function DevResearchLoading() {
  const [research, setResearch] = useState<ResearchProgress | null>(SEED);
  const [runId, setRunId] = useState(0);
  const timers = useRef<number[]>([]);

  // Seed a realistic input summary — ResearchLoading reads loadWizard() for the side panel.
  useEffect(() => {
    saveWizard({
      property: "Cluster Mawar, Grand Wisata, Tambun Selatan",
      activity: "SCBD, Jakarta Selatan",
      transport: "Transportasi umum",
      risks: ["Banjir", "Commute reliability", "Akses jalan"],
    });
  }, []);

  // (Re)start the mock flow whenever runId changes.
  useEffect(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setResearch(SEED);
    for (const { step, pct, label, at } of TIMELINE) {
      timers.current.push(
        window.setTimeout(() => setResearch({ active: true, step, total: 5, pct, label }), at),
      );
    }
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, [runId]);

  return (
    <>
      <ResearchLoading key={runId} research={research} />
      <div className="fixed bottom-md left-1/2 z-50 flex -translate-x-1/2 items-center gap-sm rounded-full border border-border bg-card px-md py-xs shadow-[var(--shadow-raised)]">
        <span className="text-micro-uppercase text-text-tertiary">DEV · mock flow</span>
        <span className="text-caption text-text-secondary">
          step {research?.step ?? 1}/5 · {research?.pct ?? 0}%
        </span>
        <button
          onClick={() => setRunId((n) => n + 1)}
          className="rounded-full bg-brand-teal-deep px-sm py-xxs text-caption text-white hover:bg-brand-teal"
        >
          Restart
        </button>
      </div>
    </>
  );
}