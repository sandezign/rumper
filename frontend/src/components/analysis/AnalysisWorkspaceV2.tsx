import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, ClipboardCheck, FileText, UserCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clamped } from "@/components/ui/clamped";
import { CAT_LABEL, CONFIDENCE } from "@/lib/risk";
import type { LegacyFinding, LegacyReport } from "@/lib/api";
import { SeverityBadge } from "./badges";
import { ScoreCard } from "./ScoreCard";

const CAT_CODE: Record<string, string> = {
  banjir: "BJR", commute: "CMT", akses: "AKS", fasilitas: "FAS", lingkungan: "LNG",
};

const CAT_TO_LAYER_KEY = {
  banjir: "flood",
  commute: "transit",
  akses: "akses",
  lingkungan: "kebisingan",
  fasilitas: "transit", // fallback
} as const;

const WA_REVIEW = `https://wa.me/?text=${encodeURIComponent(
  "Halo Rumper, saya ingin meminta tinjauan analis untuk checklist Mini Check lokasi saya.",
)}`;

type FlatFinding = { f: LegacyFinding; catLabel: string; category: string };

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="text-caption-bold uppercase tracking-wide text-foreground">{children}</h2>;
}

function Disclaimer({ text }: { text: string }) {
  return (
    <div role="note" className="flex items-start gap-sm rounded-xl border border-[rgba(245,166,35,0.25)] bg-semantic-warning-bg p-md">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgba(245,166,35,0.3)] text-caption-bold text-semantic-warning-text">!</span>
      <p className="text-body-sm text-semantic-warning-text">{text}</p>
    </div>
  );
}

/** Compact finding card (Summary · Priority Findings). */
function FindingCard({ ff }: { ff: FlatFinding }) {
  let borderLeftColor = "border-l-sky-500";
  if (ff.f.is_critical) {
    borderLeftColor = "border-l-[#EF4444]";
  } else if (ff.f.is_red_flag) {
    borderLeftColor = "border-l-[#F59E0B]";
  }

  return (
    <article className={`flex flex-col gap-xs rounded-xl border border-border bg-card p-md shadow-[var(--shadow-subtle)] border-l-4 ${borderLeftColor}`}>
      <SeverityBadge finding={ff.f} />
      <h3 className="text-body-medium font-bold text-text-primary mt-1">{ff.catLabel}</h3>
      <p className="flex-1 text-body-sm text-text-secondary mt-0.5">
        <Clamped text={ff.f.claim} max={160} />
      </p>
      {ff.f.validation_action && (
        <p className="flex items-start gap-xxs text-caption text-text-secondary mt-2">
          <ClipboardCheck className="mt-0.5 size-3.5 shrink-0 text-brand-teal-deep" aria-hidden />
          <span>
            <span className="font-semibold text-brand-teal-deep">Validasi: </span>
            <Clamped text={ff.f.validation_action} max={110} />
          </span>
        </p>
      )}
    </article>
  );
}



/** Redesigned evidence card supporting dynamic toggling, severity tags and drawer triggers */
function EviCard({ 
  ff, 
  activeLayers, 
  onToggleLayer, 
  onOpenDrawer 
}: { 
  ff: FlatFinding; 
  activeLayers: { flood: boolean; transit: boolean; akses: boolean; kebisingan: boolean };
  onToggleLayer: (key: "flood" | "transit" | "akses" | "kebisingan") => void;
  onOpenDrawer: (finding: LegacyFinding) => void;
}) {
  const { f } = ff;
  const src = f.evidence[0];

  // Determine severity tag based on the design system spec
  let severity: "ALERT" | "WARNING" | "INFO" | "AMAN" | "GAP" = "INFO";
  if (f.is_evidence_gap) {
    severity = "GAP";
  } else if (f.is_critical) {
    severity = "ALERT";
  } else if (f.is_red_flag) {
    severity = "WARNING";
  } else if (f.confidence === "data_kuat") {
    severity = "AMAN"; // Teal tag, NOT using brand-green
  }

  const tagStyles = {
    ALERT: "text-[#ef4444] bg-[#fef2f2] border-[#fecaca]",
    WARNING: "text-[#f97316] bg-[#fff7ed] border-[#fed7aa]",
    INFO: "text-[#3b82f6] bg-[#eff6ff] border-[#bfdbfe]",
    AMAN: "text-[#0d9488] bg-[#f0fdfa] border-[#ccfbf1]",
    GAP: "text-[#6b7280] bg-[#f3f4f6] border-[#e5e7eb]"
  };

  const layerKey = CAT_TO_LAYER_KEY[ff.category as keyof typeof CAT_TO_LAYER_KEY];
  const isToggled = layerKey ? activeLayers[layerKey] : false;

  return (
    <article className="flex flex-row items-center justify-between border-t border-border p-md first:border-t-0 bg-card gap-md min-h-24">
      {/* Left Details (60%) */}
      <div className="w-[60%] flex flex-col gap-xxs">
        <div className="flex items-center gap-xs">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-micro font-bold text-text-secondary font-mono">
            {CAT_CODE[ff.category] ?? "RMP"}
          </span>
          <h3 className="text-body-sm-medium font-bold text-text-primary truncate">{ff.catLabel}</h3>
        </div>
        <p className="text-[13px] leading-relaxed text-text-secondary font-medium">
          <Clamped text={f.claim} max={140} />
        </p>
        <div className="flex flex-wrap gap-x-xs text-[10px] text-text-tertiary font-sans mt-0.5">
          <span>Kepercayaan: {CONFIDENCE[f.confidence].label}</span>
          {src?.accessed_at && <span>· Diamati: {src.accessed_at}</span>}
        </div>
      </div>

      {/* Severity Tag (15%) */}
      <div className="w-[15%] flex justify-center">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${tagStyles[severity]}`}>
          {severity}
        </span>
      </div>

      {/* Right Controls (25%) */}
      <div className="w-[25%] flex items-center justify-end gap-sm">
        {/* Toggle Switch */}
        {layerKey && (
          <button
            onClick={() => onToggleLayer(layerKey)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 min-h-6 min-w-[44px] ${
              isToggled ? "bg-brand-teal-deep" : "bg-slate-200"
            }`}
            role="switch"
            aria-checked={isToggled}
            aria-label={`Toggle layer ${ff.catLabel}`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isToggled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        )}

        {/* Chevron > Button (Drawer Trigger, touch target at least 44x44px for accessibility) */}
        <button
          onClick={() => onOpenDrawer(f)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-strong/60 hover:bg-surface-soft hover:text-text-primary text-text-secondary transition-all"
          aria-label="Tampilkan detail temuan"
        >
          <span className="text-base font-bold font-mono">&gt;</span>
        </button>
      </div>
    </article>
  );
}

function ChecklistPanel({ report }: { report: LegacyReport }) {
  const total = report.checklist.length;
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const pct = total ? Math.round((done.size / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-start justify-between gap-sm">
        <div>
          <SectionHeader>Checklist survei kedua</SectionHeader>
          <p className="mt-xxs text-body-sm text-text-secondary">
            Selesaikan sebelum keputusan uang muka atau booking fee.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-micro font-bold text-slate-600 border border-border">
          {total} item
        </span>
      </div>

      <div className="bg-white border border-border rounded-xl p-md shadow-subtle">
        <p className="mb-xs text-caption text-text-tertiary font-medium">
          Progres <span className="text-text-primary font-bold">{done.size} dari {total} selesai</span>
        </p>
        <div className="h-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={done.size} aria-valuemin={0} aria-valuemax={total}>
          <div className="h-full rounded-full bg-brand-teal-deep transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        {report.checklist.map((c, i) => {
          const checked = done.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              aria-pressed={checked}
              className="flex items-start gap-sm rounded-xl border border-border bg-card p-md text-left shadow-[var(--shadow-subtle)] hover:border-brand-teal transition-all duration-150 ease-out group"
            >
              <span className={`mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${checked ? "border-brand-teal bg-brand-teal text-white" : "border-border-strong text-transparent group-hover:border-brand-teal group-hover:bg-brand-teal/5"}`}>
                {checked ? (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-opacity duration-150">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="size-2 rounded-full bg-brand-teal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                )}
              </span>
              <span className="flex-1">
                <span className={`block text-body-sm-medium transition-all duration-150 ${checked ? "text-text-tertiary line-through decoration-text-tertiary/60" : "text-foreground font-semibold"}`}>{c.item}</span>
                {c.reason && <span className="mt-xxs block text-caption text-text-tertiary leading-relaxed">{c.reason}</span>}
                <span className="mt-xs inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-micro text-slate-600 font-semibold font-sans">
                  Terkait: {CAT_LABEL[c.category] ?? c.category}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <a
        href={WA_REVIEW}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-sm rounded-xl border border-border bg-surface-feature p-md text-left hover:brightness-[0.98] transition-all duration-200"
      >
        <span>
          <span className="flex items-center gap-xs text-body-medium font-bold text-foreground">
            <UserCheck className="size-4 text-brand-green-dark" aria-hidden /> Minta tinjauan analis
          </span>
          <span className="mt-xxs block text-caption text-text-secondary leading-relaxed">
            Konsultan Rumper memverifikasi checklist ini bersama Anda.
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-brand-green-dark" aria-hidden />
      </a>
    </div>
  );
}

const EVI_PAGE = 20;

export function AnalysisWorkspaceV2({ 
  report,
  activeLayers = { flood: false, transit: false, akses: false, kebisingan: false },
  onToggleLayer = () => {},
  onOpenDrawer = () => {}
}: { 
  report: LegacyReport;
  activeLayers?: { flood: boolean; transit: boolean; akses: boolean; kebisingan: boolean };
  onToggleLayer?: (key: "flood" | "transit" | "akses" | "kebisingan") => void;
  onOpenDrawer?: (finding: LegacyFinding) => void;
}) {
  const [tab, setTab] = useState("ringkasan");
  const [eviCount, setEviCount] = useState(EVI_PAGE);

  const flat = useMemo<FlatFinding[]>(
    () => report.categories.flatMap((c) => c.findings.map((f) => ({ f, catLabel: c.label, category: c.category }))),
    [report],
  );
  const priority = useMemo(() => {
    const flags = flat.filter((x) => x.f.is_red_flag);
    flags.sort((a, b) => Number(b.f.is_critical) - Number(a.f.is_critical));
    return (flags.length ? flags : flat).slice(0, 4);
  }, [flat]);

  const limitations = useMemo(() => {
    const out: string[] = [];
    for (const g of report.evidence_gaps) out.push(g.claim || g.limitation);
    for (const x of flat) if (x.f.limitation) out.push(x.f.limitation);
    return [...new Set(out.filter(Boolean))].slice(0, 5);
  }, [report, flat]);

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex h-full min-h-0 flex-col">
      <TabsList className="h-15 shrink-0 items-stretch bg-surface px-xl border-b border-border/40">
        <TabsTrigger value="ringkasan">
          Ringkasan
        </TabsTrigger>
        <TabsTrigger value="bukti" className="flex items-center gap-1.5">
          Bukti
          {flat.length > 0 && (
            <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-bold border border-border">
              {flat.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="checklist" className="flex items-center gap-1.5">
          Checklist
          {report.checklist.length > 0 && (
            <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-bold border border-border">
              {report.checklist.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <div className="min-h-0 flex-1 overflow-y-auto px-xl py-lg">
        {/* ── RINGKASAN ── */}
        <TabsContent value="ringkasan" className="flex flex-col gap-md">
          <ScoreCard report={report} onPrimaryAction={() => setTab("checklist")} />
          <Disclaimer text={report.disclaimer} />

          {report.summary && (
            <section className="rounded-xl border border-border bg-card p-md shadow-[var(--shadow-subtle)]">
              <SectionHeader>Ringkasan</SectionHeader>
              <p className="mt-xs text-body-sm text-text-secondary leading-relaxed">{report.summary}</p>
            </section>
          )}

          {priority.length > 0 && (
            <section className="flex flex-col gap-sm">
              <SectionHeader>Temuan prioritas</SectionHeader>
              <div className="grid gap-sm md:grid-cols-2">
                {priority.map((ff, i) => (
                  <FindingCard key={i} ff={ff} />
                ))}
              </div>
            </section>
          )}

          {limitations.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-md shadow-[var(--shadow-subtle)]">
              <SectionHeader>Keterbatasan bukti</SectionHeader>
              <ul className="mt-sm flex flex-col gap-xs">
                {limitations.map((l, i) => (
                  <li key={i} className="flex items-start gap-xs text-body-sm text-text-secondary leading-relaxed font-sans">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-semantic-warning" aria-hidden />
                    <Clamped text={l} max={170} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {report.checklist.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-md shadow-[var(--shadow-subtle)]">
              <SectionHeader>Checklist survei lapangan</SectionHeader>
              <ol className="mt-sm flex flex-col gap-xs">
                {report.checklist.slice(0, 3).map((c, i) => (
                  <li key={i} className="flex items-start gap-sm text-body-sm text-text-secondary leading-relaxed font-sans">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-micro font-bold text-text-secondary font-mono">
                      {i + 1}
                    </span>
                    {c.item}
                  </li>
                ))}
              </ol>
              {report.checklist.length > 3 && (
                <button onClick={() => setTab("checklist")} className="mt-sm inline-flex items-center gap-xxs text-caption-bold text-brand-green-dark hover:underline">
                  <FileText className="size-3.5" aria-hidden /> Buka checklist ({report.checklist.length})
                </button>
              )}
            </section>
          )}
        </TabsContent>

        {/* ── BUKTI ── */}
        <TabsContent value="bukti" className="flex flex-col gap-md">
          <div className="flex items-center justify-between gap-sm">
            <SectionHeader>Bukti pendukung</SectionHeader>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-micro font-bold text-amber-700">
              {flat.length} temuan
            </span>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            Setiap temuan didukung data dan memiliki keterbatasan yang perlu diverifikasi di lapangan.
          </p>
          {flat.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
                {flat.slice(0, eviCount).map((ff, i) => (
                  <EviCard 
                    key={i} 
                    ff={ff} 
                    activeLayers={activeLayers}
                    onToggleLayer={onToggleLayer}
                    onOpenDrawer={onOpenDrawer}
                  />
                ))}
              </div>
              {flat.length > eviCount && (
                <button
                  onClick={() => setEviCount((n) => n + EVI_PAGE)}
                  className="self-center rounded-full border border-border-strong bg-card px-xl py-2 text-body-sm-medium text-foreground hover:border-brand-teal hover:text-brand-teal transition-colors duration-200 cursor-pointer"
                >
                  Muat {Math.min(EVI_PAGE, flat.length - eviCount)} bukti lagi ({flat.length - eviCount} tersisa)
                </button>
              )}
            </>
          ) : (
            <p className="flex items-center gap-xs rounded-xl border border-border bg-card p-md text-body-sm text-text-tertiary">
              <AlertTriangle className="size-4" aria-hidden /> Belum ada bukti yang terkumpul.
            </p>
          )}
          <Disclaimer text="Semua bukti di atas adalah interpretasi AI dari data publik. Selalu lakukan verifikasi fisik sebelum keputusan uang muka." />
        </TabsContent>

        {/* ── CHECKLIST ── */}
        <TabsContent value="checklist">
          <ChecklistPanel report={report} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
