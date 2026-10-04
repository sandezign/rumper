import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, MapPin, Plus, Send, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clamped } from "@/components/ui/clamped";
import { placesAutocomplete } from "@/lib/api";
import type { ChatMessage, Convo, LegacyFinding, LegacyReport } from "@/lib/api";

export const STARTERS = [
  "Cek rumah incaran di Bekasi",
  "Seberapa rawan banjir area ini?",
  "Commute ke SCBD realistis nggak?",
  "Apa saja yang Rumper periksa?",
];

const RESEARCH_STEPS = [
  "Memindai data spasial (banjir, elevasi, tol, fasilitas)",
  "Menyusun rencana riset",
  "Mencari & memperdalam bukti dari web",
  "Mengekstrak temuan & sumber",
  "Menghitung skor & menyusun laporan",
];

export interface ResearchProgress {
  active: boolean;
  step: number;
  label: string;
}

/** Green sparkle/star — the AI identity mark (matches dashboard.html). */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path d="M10 2 L11.5 8 L18 10 L11.5 12 L10 18 L8.5 12 L2 10 L8.5 8 Z" />
    </svg>
  );
}

const BAND_DOT: Record<string, string> = {
  relatif_kuat: "bg-semantic-positive",
  layak_dengan_catatan: "bg-blue-500", // Teal/Blue dot
  hati_hati: "bg-amber-500", // Orange dot
  risiko_tinggi: "bg-semantic-danger",
};

function auditDot(c: Convo) {
  const cls = (c.band && BAND_DOT[c.band]) || (c.state === "researching" ? "bg-amber-500" : "bg-text-tertiary");
  return <span className={`size-2.5 shrink-0 rounded-full ${cls}`} aria-hidden />;
}

function DeepThinking({ research, done }: { research: ResearchProgress | null; done: boolean }) {
  const [open, setOpen] = useState(true);
  const step = research?.step ?? RESEARCH_STEPS.length; // done → all complete
  return (
    <div className="overflow-hidden rounded-xl bg-[#0d2b30] shadow-[0_4px_16px_rgba(6,40,50,0.18)]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-xs px-md py-sm text-left cursor-pointer hover:bg-[#0f343a] transition-all duration-200"
      >
        <Sparkle className="size-3.5 text-primary" />
        <span className="flex-1 font-mono text-caption-bold tracking-tight text-primary">Deep Thinking</span>
        <ChevronDown className={`size-3.5 text-primary transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
      </button>
      {open && (
        <div className="flex flex-col gap-xs px-md pb-md">
          {RESEARCH_STEPS.map((s, i) => {
            const state = done || step > i + 1 ? "done" : step === i + 1 ? "now" : "wait";
            return (
              <div
                key={s}
                className={`flex items-start gap-xs font-mono text-[12.5px] leading-tight ${
                  state === "wait" ? "text-text-on-dark-muted/60" : "text-[rgba(200,230,210,0.85)]"
                }`}
              >
                <span className="flex size-[18px] shrink-0 items-center justify-center font-bold">
                  {state === "done" ? (
                    <span className="text-slate-400">✓</span> // Muted slate checkmark
                  ) : state === "now" ? (
                    <span className="text-primary">▸</span>
                  ) : (
                    <span className="text-text-on-dark-muted/40">·</span>
                  )}
                </span>
                <span className={state === "done" ? "text-text-on-dark-muted/80" : ""}>{s}…</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AiSummary({ report, onViewReport }: { report: LegacyReport; onViewReport?: () => void }) {
  const score = report.rls_score;
  const flags: LegacyFinding[] = report.red_flags.length ? report.red_flags : report.evidence_gaps;
  const bullets = (flags.length ? flags : []).slice(0, 2).map((f) => f.claim || f.limitation).filter(Boolean);
  const checklistBullets = report.checklist.slice(0, 2).map((c) => c.item);
  const items = bullets.length ? bullets : checklistBullets;

  return (
    <div className="flex items-start gap-sm">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-teal-deep shadow-[0_2px_8px_rgba(6,40,50,0.25)]">
        <Sparkle className="size-4 text-primary" />
      </div>
      <div className="flex-1 rounded-lg rounded-tl-sm border border-[rgba(0,200,100,0.25)] bg-[#f0fdf5] p-md text-body-sm text-foreground">
        <p>
          Analisis selesai. Lokasi ini mendapat skor{" "}
          <strong>{score !== null ? Math.round(score) : "–"}/100</strong> — {report.band_label}.
        </p>
        {items.length > 0 && (
          <>
            <p className="mt-xs text-text-secondary font-semibold">
              {report.red_flags.length
                ? "Ada sinyal pendukung, tetapi beberapa hal perlu divalidasi:"
                : "Beberapa langkah validasi yang disarankan:"}
            </p>
            <ul className="mt-xxs list-disc pl-lg text-text-secondary leading-relaxed">
              {items.map((b, i) => (
                <li key={i}>
                  <Clamped text={b} max={96} />
                </li>
              ))}
            </ul>
          </>
        )}
        {onViewReport && (
          <button
            onClick={onViewReport}
            className="mt-sm inline-flex items-center gap-xxs text-body-sm-medium text-brand-green-dark hover:underline cursor-pointer"
          >
            Lihat detail laporan →
          </button>
        )}
      </div>
    </div>
  );
}

export default function AssistantRailV2({
  convos,
  activeId,
  expectsAddress,
  messages,
  thinking,
  research,
  report,
  userPicture,
  onSend,
  onOpenConvo,
  onNewChat,
  onViewReport,
  disabled,
}: {
  convos: Convo[];
  activeId: string | null;
  expectsAddress?: boolean;
  messages: ChatMessage[];
  thinking: string | null;
  research: ResearchProgress | null;
  report: LegacyReport | null;
  userPicture?: string | null;
  onSend: (text: string) => void;
  onOpenConvo: (id: string) => void;
  onNewChat: () => void;
  onViewReport?: () => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const [acItems, setAcItems] = useState<{ description: string }[]>([]);
  const acTimer = useRef<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const active = convos.find((c) => c.id === activeId);
  const activeTitle = active?.property_name || active?.title || "Audit baru";
  const showThinkingCard = !!research?.active || !!report;
  const reportDone = !!report && !research?.active;

  useEffect(() => {
    if (!expectsAddress || text.trim().length < 4) {
      setAcItems([]);
      return;
    }
    if (acTimer.current) window.clearTimeout(acTimer.current);
    acTimer.current = window.setTimeout(() => {
      placesAutocomplete(text.trim()).then(setAcItems).catch(() => setAcItems([]));
    }, 350);
    return () => {
      if (acTimer.current) window.clearTimeout(acTimer.current);
    };
  }, [text, expectsAddress]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking, research?.step, reportDone]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    setText("");
    setAcItems([]);
    onSend(t);
  }

  const visibleMessages = messages.filter(
    (m) => !(m.role === "assistant" && m.content.startsWith("Siap! Deep research dimulai")),
  );
  const lastAssistant = [...visibleMessages].reverse().find((m) => m.role === "assistant");
  const chips = !thinking && !research?.active ? (lastAssistant?.suggestions ?? []) : [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* header */}
      <div className="shrink-0 border-b border-border bg-card px-md py-sm">
        <p className="flex items-center gap-xs text-body-sm-medium font-bold text-foreground">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-teal-deep">
            <Sparkle className="size-3.5 text-primary" />
          </span>
          AI Assistant
        </p>
        <p className="mt-sm text-micro-uppercase text-text-secondary font-bold tracking-wider">Active Audit</p>
        <div className="mt-xxs flex items-center gap-xs">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-xs rounded-lg border border-border-strong bg-card px-sm text-body-sm-medium text-foreground shadow-subtle outline-none hover:border-brand-green-dark hover:bg-surface-soft cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring">
              <span className="truncate text-left">{activeTitle}</span>
              <ChevronDown className="size-4 shrink-0 text-text-tertiary" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="max-h-80 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto shadow-raised border border-border bg-white"
            >
              <DropdownMenuLabel className="font-bold text-text-primary px-sm py-2">Audit tersedia</DropdownMenuLabel>
              {convos.length === 0 && (
                <p className="px-sm py-2 text-caption text-text-tertiary">Belum ada audit.</p>
              )}
              {convos.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onSelect={() => onOpenConvo(c.id)}
                  className="flex flex-col items-start gap-xxs py-2.5 px-sm hover:bg-surface-soft cursor-pointer transition-colors border-b border-border/30 last:border-0"
                  style={{ minHeight: "44px" }}
                >
                  <span className="flex w-full items-center gap-xs">
                    <span className="truncate text-body-sm-medium font-semibold text-text-primary">
                      {c.property_name || c.title}
                    </span>
                    {c.id === activeId && <Check className="ml-auto size-4 shrink-0 text-brand-green-dark" aria-hidden />}
                  </span>
                  {(c.rls_score != null || c.review_state) && (
                    <span className="flex items-center gap-xs text-micro text-text-tertiary mt-0.5">
                      {auditDot(c)}
                      <span className="font-bold text-text-secondary">
                        {c.rls_score != null ? `${Math.round(c.rls_score)}/100` : ""}
                      </span>
                      {c.band_label ? <span>· {c.band_label}</span> : ""}
                      {c.review_state ? <span>· {c.review_state}</span> : ""}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={onNewChat}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-brand-teal-deep shadow-subtle transition-all duration-200 hover:bg-brand-green-hover cursor-pointer"
            aria-label="Audit baru"
            title="Audit baru"
          >
            <Plus className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* thread */}
      <div className="min-h-0 flex-1 overflow-y-auto px-md py-md bg-surface-soft/45">
        <div className="flex flex-col gap-sm">
          {visibleMessages.map((m, i) => {
            const isRequest = i === 0;
            return (
              <div key={m.id ?? i} className="fade-up flex flex-col gap-sm">
                {m.role === "user" ? (
                  <div className="flex items-start gap-xs rounded-xl border border-border bg-card p-sm shadow-subtle">
                    {userPicture ? (
                      <img
                        src={userPicture}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="size-7 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary">
                        <User className="size-4" aria-hidden />
                      </span>
                    )}
                    <p className="flex-1 text-body-sm text-text-primary leading-relaxed">{m.content}</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-sm">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-teal-deep">
                      <Sparkle className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 whitespace-pre-wrap rounded-xl rounded-tl-sm border border-border bg-card p-md text-body-sm text-foreground leading-relaxed shadow-subtle">
                      {m.content}
                    </div>
                  </div>
                )}
                {isRequest && showThinkingCard && <DeepThinking research={research} done={reportDone} />}
                {isRequest && reportDone && report && <AiSummary report={report} onViewReport={onViewReport} />}
              </div>
            );
          })}

          {thinking && (
            <div className="fade-up flex items-start gap-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-teal-deep">
                <Sparkle className="size-4 text-primary" />
              </div>
              <div className="flex items-center gap-xs rounded-xl rounded-tl-sm border border-border bg-card px-md py-sm shadow-subtle">
                <span className="dots"><span /><span /><span /></span>
                <span className="text-caption text-text-tertiary">{thinking}</span>
              </div>
            </div>
          )}

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-xs">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => onSend(c)}
                  disabled={disabled}
                  className="rounded-full border border-border-strong bg-card px-sm py-1.5 text-caption font-semibold text-text-secondary hover:border-brand-teal hover:text-brand-teal disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-border bg-card px-md py-sm">
        <form onSubmit={submit} className="relative">
          {acItems.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 z-20 mb-xs overflow-hidden rounded-xl border border-border bg-popover shadow-raised">
              <p className="flex items-center gap-xxs border-b border-border px-sm py-2 text-micro-uppercase text-text-tertiary font-bold">
                <MapPin className="size-3.5 text-brand-teal" aria-hidden /> Pilih alamat (Google Maps)
              </p>
              {acItems.map((a) => (
                <button
                  key={a.description}
                  type="button"
                  onClick={() => {
                    setText(a.description);
                    setAcItems([]);
                  }}
                  className="block w-full truncate px-sm py-2.5 text-left text-caption text-text-secondary hover:bg-surface-soft hover:text-text-primary transition-colors cursor-pointer border-b border-border/20 last:border-0"
                >
                  {a.description}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-xs rounded-full border border-border-strong bg-surface-soft py-1.5 pl-md pr-1.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              disabled={disabled}
              placeholder={disabled && research?.active ? "Menunggu analisis selesai…" : "Tanya soal lokasi ini…"}
              aria-label="Tanya soal lokasi ini"
              className="min-w-0 flex-1 bg-transparent text-body-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
            />
            {/* 44x44px hitbox Send button */}
            <button
              type="submit"
              disabled={disabled || !text.trim()}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-teal-deep text-white transition duration-200 ease-out enabled:hover:bg-brand-teal disabled:opacity-30 cursor-pointer shadow-subtle"
              aria-label="Kirim"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </div>
        </form>
        <p className="mt-xs text-center text-micro text-text-tertiary">
          Mini Check awal, belum ditinjau analis — bukan jaminan. Validasi di lapangan sebelum DP.
        </p>
      </div>
    </div>
  );
}
