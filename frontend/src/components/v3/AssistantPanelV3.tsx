import { useEffect, useRef, useState } from "react";
import { ChevronDown, Minimize2, Send, User } from "lucide-react";
import { Clamped } from "@/components/ui/clamped";
import type { ChatMessage, LegacyFinding, LegacyReport } from "@/lib/api";

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

/** Green sparkle/star — the AI identity mark. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path d="M10 2 L11.5 8 L18 10 L11.5 12 L10 18 L8.5 12 L2 10 L8.5 8 Z" />
    </svg>
  );
}

function SparkleBadge({ size = "size-8" }: { size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-teal-deep shadow-[0_2px_8px_rgba(6,40,50,0.25)]`}>
      <Sparkle className="size-4 text-primary" />
    </span>
  );
}

/** Floating "AI Assistant" pill shown when the chat is fully collapsed (Figma state 1). */
export function AssistantPillV3({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="pointer-events-auto inline-flex items-center gap-xs rounded-full border border-border bg-white/95 backdrop-blur-md py-1.5 pl-1.5 pr-md shadow-preview hover:shadow-overlay transition-all duration-200 cursor-pointer active:scale-95"
      aria-label="Buka AI Assistant"
    >
      <SparkleBadge size="size-8" />
      <span className="text-body-sm-medium font-semibold text-text-primary">AI Assistant</span>
    </button>
  );
}

function DeepThinking({ research, done }: { research: ResearchProgress | null; done: boolean }) {
  const [open, setOpen] = useState(true);
  const step = research?.step ?? RESEARCH_STEPS.length;
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
                    <span className="text-slate-400">✓</span>
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
  const bullets = flags.slice(0, 2).map((f) => f.claim || f.limitation).filter(Boolean);
  const checklistBullets = report.checklist.slice(0, 2).map((c) => c.item);
  const items = bullets.length ? bullets : checklistBullets;

  return (
    <div className="flex items-start gap-sm">
      <SparkleBadge />
      <div className="flex-1 rounded-xl rounded-tl-sm border border-[rgba(0,200,100,0.25)] bg-[#f0fdf5] p-md text-body-sm text-foreground">
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

/**
 * AssistantPanelV3 — the expanded AI Assistant as its own middle column
 * (Figma state 3). Header carries the minimize control; thread + composer below.
 */
export default function AssistantPanelV3({
  messages,
  thinking,
  research,
  report,
  userPicture,
  onSend,
  onMinimize,
  onViewReport,
  disabled,
}: {
  messages: ChatMessage[];
  thinking: string | null;
  research: ResearchProgress | null;
  report: LegacyReport | null;
  userPicture?: string | null;
  onSend: (text: string) => void;
  onMinimize: () => void;
  onViewReport?: () => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const showThinkingCard = !!research?.active || !!report;
  const reportDone = !!report && !research?.active;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking, research?.step, reportDone]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    setText("");
    onSend(t);
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const chips = !thinking && !research?.active ? (lastAssistant?.suggestions ?? []) : [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-sm border-b border-border px-md py-sm">
        <p className="flex items-center gap-xs text-body-sm-medium font-bold text-foreground">
          <SparkleBadge size="size-7" />
          AI Assistant
        </p>
        <button
          onClick={onMinimize}
          className="flex size-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-soft hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Kecilkan AI Assistant"
          title="Kecilkan"
        >
          <Minimize2 className="size-4" aria-hidden />
        </button>
      </div>

      {/* Thread */}
      <div className="min-h-0 flex-1 overflow-y-auto px-md py-md bg-surface-soft/45">
        <div className="flex flex-col gap-sm">
          {messages.map((m, i) => {
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
                    <SparkleBadge />
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
              <SparkleBadge />
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

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-card px-md py-sm">
        <form onSubmit={submit} className="flex items-center gap-xs rounded-full border border-border-strong bg-surface-soft py-1.5 pl-md pr-1.5">
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
          <button
            type="submit"
            disabled={disabled || !text.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-teal-deep text-white transition duration-200 ease-out enabled:hover:bg-brand-teal disabled:opacity-30 cursor-pointer shadow-subtle"
            aria-label="Kirim"
          >
            <Send className="size-4" aria-hidden />
          </button>
        </form>
        <p className="mt-xs text-center text-micro text-text-tertiary">
          Mini Check awal, belum ditinjau analis — bukan jaminan.
        </p>
      </div>
    </div>
  );
}
