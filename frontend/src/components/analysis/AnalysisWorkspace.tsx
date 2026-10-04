import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, ClipboardCheck, ExternalLink, FileText, UserCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clamped } from "@/components/ui/clamped";
import { CAT_LABEL, CONFIDENCE } from "@/lib/risk";
import type { LegacyFinding, LegacyReport } from "@/lib/api";
import { SeverityBadge } from "./badges";
import { ScoreCard } from "./ScoreCard";

const CAT_CODE: Record<string, string> = {
  banjir: "BJR", commute: "CMT", akses: "AKS", fasilitas: "FAS", lingkungan: "LNG",
};

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
  return (
    <article className="flex flex-col gap-xs rounded-xl border border-border bg-card p-md shadow-[var(--shadow-subtle)]">
      <SeverityBadge finding={ff.f} />
      <h3 className="text-body-medium text-foreground">{ff.catLabel}</h3>
      <p className="flex-1 text-body-sm text-text-secondary">
        <Clamped text={ff.f.claim} max={160} />
      </p>
      {ff.f.validation_action && (
        <p className="flex items-start gap-xxs text-caption text-text-secondary">
          <ClipboardCheck className="mt-0.5 size-3.5 shrink-0 text-brand-green-dark" aria-hidden />
          <span>
            <span className="font-semibold text-brand-green-dark">Validasi: </span>
            <Clamped text={ff.f.validation_action} max={110} />
          </span>
        </p>
      )}
    </article>
  );
}

/** Evidence sources — deduped, capped at 3 + "+N" (citation style); each linked to its
 *  origin when web search returned a URL. */
function SourceLinks({ evidence }: { evidence: LegacyFinding["evidence"] }) {
  const seen = new Set<string>();
  const uniq = evidence.filter((e) => {
    const key = (e.url || e.source_title || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!uniq.length) return <>—</>;
  const shown = uniq.slice(0, 3);
  const extra = uniq.length - shown.length;
  return (
    <>
      {shown.map((e, i) => (
        <span key={i} className="inline-flex items-center">
          {i > 0 && <span className="mx-xxs text-text-tertiary">·</span>}
          {e.url ? (
            <a
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-px text-brand-green-dark underline underline-offset-2"
            >
              {e.source_title || "Sumber"}
              <ExternalLink className="ml-px size-3 shrink-0" aria-hidden />
            </a>
          ) : (
            <span>{e.source_title || "Sumber"}</span>
          )}
        </span>
      ))}
      {extra > 0 && (
        <span className="ml-xxs rounded-full bg-[#e2e8ea] px-xs py-px text-micro font-semibold text-text-secondary">
          +{extra}
        </span>
      )}
    </>
  );
}

/** Rich evidence card (Evidence tab). */
function EviCard({ ff }: { ff: FlatFinding }) {
  const { f } = ff;
  const src = f.evidence[0];
  return (
    <article className="flex flex-col gap-sm border-t border-border p-md first:border-t-0">
      <div className="flex items-center justify-between gap-sm">
        <div className="flex items-center gap-xs">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-micro font-bold text-text-secondary">
            {CAT_CODE[ff.category] ?? "RMP"}
          </span>
          <h3 className="text-body-medium text-foreground">{ff.catLabel}</h3>
        </div>
        <SeverityBadge finding={f} />
      </div>
      <p className="text-body-sm leading-relaxed text-text-secondary">
        <Clamped text={f.claim} max={220} />
      </p>
      <div className="flex flex-wrap gap-x-md gap-y-xxs text-micro text-text-tertiary">
        <span className="inline-flex flex-wrap items-center gap-xxs">
          <strong className="font-semibold text-foreground">Sumber:</strong> <SourceLinks evidence={f.evidence} />
        </span>
        <span><strong className="font-semibold text-foreground">Kepercayaan:</strong> {CONFIDENCE[f.confidence].label}</span>
        {src?.accessed_at && <span><strong className="font-semibold text-foreground">Diamati:</strong> {src.accessed_at}</span>}
      </div>
      {f.limitation && (
        <div role="note" className="rounded-r-md border-l-[3px] border-[#f5a623] bg-semantic-warning-bg px-sm py-xs text-caption text-semantic-warning-text">
          <strong className="font-semibold">Keterbatasan:</strong>{" "}
          <Clamped text={f.limitation} max={180} />
        </div>
      )}
      {f.validation_action && (
        <p className="flex items-start gap-xxs text-caption text-text-secondary">
          <ClipboardCheck className="mt-0.5 size-3.5 shrink-0 text-brand-green-dark" aria-hidden />
          <span>
            <span className="font-semibold text-brand-green-dark">Langkah validasi: </span>
            <Clamped text={f.validation_action} max={160} />
          </span>
        </p>
      )}
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
        <Badge variant="neutral">{total} item</Badge>
      </div>

      <div>
        <p className="mb-xxs text-caption text-text-tertiary">
          Progres <span className="text-foreground">{done.size} dari {total} selesai</span>
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-valuenow={done.size} aria-valuemin={0} aria-valuemax={total}>
          <div className="h-full rounded-full bg-brand-green-dark transition-[width] duration-300" style={{ width: `${pct}%` }} />
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
              className="flex items-start gap-sm rounded-xl border border-border bg-card p-md text-left shadow-[var(--shadow-subtle)] hover:border-brand-green-dark"
            >
              <span className={`mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-brand-green-dark bg-brand-green-dark text-white" : "border-border-strong text-transparent"}`}>
                {checked && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="flex-1">
                <span className={`block text-body-sm-medium ${checked ? "text-text-tertiary line-through" : "text-foreground"}`}>{c.item}</span>
                {c.reason && <span className="mt-xxs block text-caption text-text-tertiary">{c.reason}</span>}
                <span className="mt-xs inline-flex rounded-full border border-[rgba(0,200,100,0.2)] bg-[rgba(0,230,118,0.08)] px-xs py-px text-micro text-[#0a6640]">
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
        className="flex items-center justify-between gap-sm rounded-xl border border-border bg-surface-feature p-md text-left hover:brightness-[0.98]"
      >
        <span>
          <span className="flex items-center gap-xs text-body-medium text-foreground">
            <UserCheck className="size-4 text-brand-green-dark" aria-hidden /> Minta tinjauan analis
          </span>
          <span className="mt-xxs block text-caption text-text-secondary">
            Konsultan Rumper memverifikasi checklist ini bersama Anda.
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-brand-green-dark" aria-hidden />
      </a>
    </div>
  );
}

const EVI_PAGE = 20;

export function AnalysisWorkspace({ report }: { report: LegacyReport }) {
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
      <TabsList className="h-15 shrink-0 items-stretch bg-surface px-xl">
        <TabsTrigger value="ringkasan">
          Ringkasan
        </TabsTrigger>
        <TabsTrigger value="bukti">
          Bukti
          {flat.length > 0 && <Badge variant="neutral" className="px-xs py-0">{flat.length}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="checklist">
          Checklist
          {report.checklist.length > 0 && <Badge variant="neutral" className="px-xs py-0">{report.checklist.length}</Badge>}
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
              <p className="mt-xs text-body-sm text-text-secondary">{report.summary}</p>
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
                  <li key={i} className="flex items-start gap-xs text-body-sm text-text-secondary">
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
                  <li key={i} className="flex items-start gap-sm text-body-sm text-text-secondary">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-micro text-text-secondary">
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
            <Badge variant="warning">{flat.length} temuan</Badge>
          </div>
          <p className="text-body-sm text-text-secondary">
            Setiap temuan didukung data dan memiliki keterbatasan yang perlu diverifikasi di lapangan.
          </p>
          {flat.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
                {flat.slice(0, eviCount).map((ff, i) => (
                  <EviCard key={i} ff={ff} />
                ))}
              </div>
              {flat.length > eviCount && (
                <button
                  onClick={() => setEviCount((n) => n + EVI_PAGE)}
                  className="self-center rounded-full border border-border-strong bg-card px-xl py-xs text-body-sm-medium text-foreground hover:border-brand-green-dark hover:text-brand-green-dark"
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
