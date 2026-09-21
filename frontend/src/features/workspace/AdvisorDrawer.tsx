import { useCallback, useEffect, useRef, useState } from "react";
import {
  Building, ClipboardList, DollarSign, Layers, Loader2, MapPin, RotateCcw, Send, Shield,
  Sparkles, TramFront, TriangleAlert, X,
} from "lucide-react";
import {
  ApiError, getAdvisor, getConversation, resetConversation, sendMessageSSE,
  type AdvisorTopic, type ChatMessage, type Report,
} from "@/lib/api";

/** "Rumper Advisor" — the assistant as a right-hand drawer over the workspace.
 *
 *  A drawer, not a fullscreen takeover: the buyer asks about what they are looking at, so
 *  the report has to stay on screen behind the answer. Same surface and dismissal as the
 *  upgrade drawer, so the app has one "panel slides in from the right" idiom.
 *
 *  The drawer is *topic-scoped*. Each topic carries an opener and suggested questions that
 *  `GET /api/conversations/{id}/advisor` derives from this report — no LLM call to open the
 *  panel, and no opener that describes findings the report does not hold. The chosen topic
 *  rides along on every turn so the answer stays inside the subject the buyer opened. */

const TOPIC_ICON: Record<string, typeof Sparkles> = {
  ringkasan: Sparkles,
  banjir: Shield,
  commute: TramFront,
  akses: MapPin,
  fasilitas: Layers,
  lingkungan: TriangleAlert,
  legalitas: Building,
  harga: DollarSign,
  checklist: ClipboardList,
};

/** Report category ids the chat may cite. A closed vocabulary, allowlisted server-side, so a
 *  chip always maps to a section the buyer can open — the model cannot invent a source. */
const CATEGORY_LABEL: Record<string, string> = {
  banjir: "Ketahanan Banjir",
  commute: "Efisiensi Commute",
  akses: "Akses Fisik dan Jalan",
  fasilitas: "Fasilitas Esensial",
  lingkungan: "Kualitas Lingkungan",
};

function Citations({ ids, onOpen }: { ids: string[]; onOpen?: (id: string) => void }) {
  const known = ids.filter((c) => c in CATEGORY_LABEL);
  if (!known.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {known.map((c) => (
        <button key={c} type="button" onClick={() => onOpen?.(c)} disabled={!onOpen}
                className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 transition-colors enabled:hover:bg-sky-100 disabled:cursor-default">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">Dari laporan: {CATEGORY_LABEL[c]}</span>
        </button>
      ))}
    </div>
  );
}

export default function AdvisorDrawer({
  conversationId, open, onClose, onOpenCategory, report, seed, initialTopic,
}: {
  conversationId: string;
  open: boolean;
  onClose: () => void;
  /** Jump the workspace to the cited report section. */
  onOpenCategory?: (id: string) => void;
  /** Drives the context bar. Null while the report is still loading. */
  report: Report | null;
  /** Question pre-filled from a stage's "Tanya AI" button — never auto-sent. */
  seed?: string | null;
  /** Topic the stage that opened the drawer belongs to. */
  initialTopic?: string | null;
}) {
  const [topics, setTopics] = useState<AdvisorTopic[]>([]);
  const [topicId, setTopicId] = useState<string>("ringkasan");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const topic = topics.find((t) => t.id === topicId) ?? null;

  useEffect(() => {
    if (!open) return;
    getAdvisor(conversationId).then((r) => setTopics(r.topics)).catch(() => setTopics([]));
    getConversation(conversationId)
      .then((c) => {
        setMessages(c.messages);
        const last = [...c.messages].reverse().find((m) => m.role === "assistant");
        setSuggestions(last?.suggestions ?? []);
      })
      .catch(() => setError("Gagal memuat percakapan."));
    inputRef.current?.focus();
  }, [open, conversationId]);

  useEffect(() => { if (open && initialTopic) setTopicId(initialTopic); }, [open, initialTopic]);
  useEffect(() => { if (open && seed) setInput(seed); }, [open, seed]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || status) return;
    setInput(""); setError(null); setSuggestions([]);
    setMessages((m) => [...m, { role: "user", content }]);
    setStatus("Memahami pesan Anda…");
    try {
      const res = await sendMessageSSE(conversationId, content, setStatus, topicId);
      setMessages((m) => [...m, { role: "assistant", content: res.reply,
                                  citations: res.citations ?? [] }]);
      setSuggestions(res.suggestions ?? []);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 402
          ? "Kuota token harian habis. Coba lagi besok."
          : "Gagal mengirim pesan. Coba lagi.",
      );
    } finally {
      setStatus(null);
    }
  }, [conversationId, status, topicId]);

  /** Clears the transcript only. The audit and its report stay exactly where they were. */
  const restart = useCallback(async () => {
    if (resetting || status) return;
    setResetting(true);
    try {
      await resetConversation(conversationId);
      setMessages([]);
      setSuggestions([]);
      setError(null);
    } catch {
      setError("Gagal memulai ulang percakapan.");
    } finally {
      setResetting(false);
    }
  }, [conversationId, resetting, status]);

  if (!open) return null;

  const propertyName = report?.property.name ?? report?.property.formatted_address ?? "Lokasi ini";
  const address = report?.property.formatted_address ?? null;
  const chips = suggestions.length > 0 ? suggestions : topic?.suggestions ?? [];

  return (
    <div className="fixed inset-0 z-[1200] flex justify-end">
      <div className="fixed inset-0 bg-[#001E2B]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />

      <aside role="dialog" aria-modal="true" aria-label="Rumper Advisor"
             className="relative flex h-dvh w-full max-w-[500px] flex-col bg-[#F9FBFA] text-[#001E2B] shadow-2xl animate-slideInRight">
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-[#E1E5E8] bg-white px-4 py-3 shadow-xs sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#001E2B] text-[#00ED64] shadow-xs" aria-hidden="true">
              <Sparkles size={18} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-black text-[#001E2B]">Rumper Advisor</h2>
                <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-[#00684A]">
                  Spatial AI
                </span>
              </div>
              <p className="truncate text-xs text-[#5C6C7A]">
                Menjawab dari laporan lokasi ini — bukan dari tebakan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => void restart()} disabled={resetting || !!status}
                    title="Mulai ulang percakapan" aria-label="Mulai ulang percakapan"
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#5C6C7A] transition-colors hover:bg-[#F4F7F6] hover:text-[#001E2B] disabled:opacity-40">
              <RotateCcw size={15} className={resetting ? "animate-spin" : ""} />
            </button>
            <button type="button" onClick={onClose} aria-label="Tutup asisten"
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#3D4F5B] transition-colors hover:bg-[#F4F7F6] hover:text-[#001E2B]">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Which property this thread is bound to. The assistant runs on the conversation
            already tied to this intake, so it can never answer about a different one. */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E1E5E8] bg-[#F1F5F9] px-4 py-2 text-xs">
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-[#00684A]" />
            <span className="truncate font-bold text-[#001E2B]">{propertyName}</span>
            {address && address !== propertyName && (
              <>
                <span className="text-[#94A3B8]">•</span>
                <span className="truncate text-[11px] text-[#5C6C7A]">{address}</span>
              </>
            )}
          </div>
          {report?.rls_score != null && (
            <span className="shrink-0 rounded-md bg-[#001E2B] px-2 py-0.5 font-mono text-[10px] font-bold text-[#00ED64]">
              Skor: {Math.round(report.rls_score)}/100
            </span>
          )}
        </div>

        {topics.length > 0 && (
          <div className="shrink-0 border-b border-[#E5E5EA] bg-white px-3 py-2">
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto" role="tablist"
                 aria-label="Topik advisor">
              {topics.map((t) => {
                const Icon = TOPIC_ICON[t.id] ?? Sparkles;
                const on = t.id === topicId;
                return (
                  <button key={t.id} type="button" role="tab" aria-selected={on}
                          onClick={() => setTopicId(t.id)}
                          className={`flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            on ? "bg-[#001E2B] text-white shadow-xs"
                               : "bg-[#F4F7F6] text-[#5C6C7A] hover:bg-[#E5EAE8]"
                          }`}>
                    <Icon size={12} className={on ? "text-[#00ED64]" : ""} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <main className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5">
          {/* The topic opener, read off the report. Not a chat message — it does not go to
              the model and is not part of the transcript. */}
          {topic && (
            <div className="flex flex-col items-start">
              <div className="max-w-[92%] space-y-2 rounded-2xl rounded-tl-xs border border-[#E1E5E8] bg-white px-4 py-3 text-xs leading-relaxed text-[#1E293B] shadow-xs sm:text-sm">
                <p>
                  Halo! Aku <strong className="font-extrabold text-[#001E2B]">Rumper Advisor</strong>
                  {" untuk "}
                  <strong className="font-extrabold text-[#001E2B]">{propertyName}</strong>.
                </p>
                <p>{topic.opener}</p>
                <p className="text-[#5C6C7A]">
                  Pilih pertanyaan cepat di bawah, atau tanyakan apa pun seputar topik ini.
                </p>
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="max-w-[88%] self-end whitespace-pre-wrap rounded-2xl rounded-br-xs bg-[#003D4F] px-4 py-3 text-xs leading-relaxed text-white shadow-xs sm:text-sm">
                {m.content}
              </div>
            ) : (
              <div key={i} className="flex max-w-[92%] flex-col items-start">
                <div className="whitespace-pre-wrap rounded-2xl rounded-tl-xs border border-[#E1E5E8] bg-white px-4 py-3 text-xs leading-relaxed text-[#1E293B] shadow-xs sm:text-sm">
                  {m.content}
                </div>
                {m.citations?.length ? (
                  <Citations ids={m.citations} onOpen={onOpenCategory} />
                ) : null}
              </div>
            ),
          )}

          {status && (
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-[#E1E5E8] bg-white px-4 py-3 text-xs text-[#5C6C7A] shadow-xs">
              <Loader2 size={14} className="animate-spin text-[#00684A]" />
              {status}
            </div>
          )}

          {error && (
            <p className="rounded-2xl border border-[#D4A017]/30 bg-[#FFF9E6] px-4 py-3 text-xs font-semibold text-[#523A00]">
              {error}
            </p>
          )}

          <div ref={endRef} />
        </main>

        <footer className="shrink-0 space-y-2.5 border-t border-[#E1E5E8] bg-white px-4 py-3 sm:px-5"
                style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          {chips.length > 0 && !status && (
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {chips.map((c) => (
                <button key={c} type="button" onClick={() => void send(c)}
                        className="shrink-0 cursor-pointer rounded-full border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-1.5 text-xs font-bold text-[#334155] transition-all hover:border-[#00684A] hover:bg-white hover:text-[#001E2B] active:scale-95">
                  {c}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); void send(input); }}
                className="flex items-center gap-2">
            <label className="sr-only" htmlFor="advisor-input">Tanyakan tentang lokasi ini</label>
            <input
              id="advisor-input" ref={inputRef} value={input} disabled={!!status}
              onChange={(e) => setInput(e.target.value)}
              placeholder={topic ? `Tanyakan seputar ${topic.label.toLowerCase()}…`
                                 : "Tanyakan tentang lokasi ini…"}
              className="min-h-11 min-w-0 flex-1 rounded-full border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-xs text-[#001E2B] outline-none transition-shadow placeholder:text-[#94A3B8] focus:border-[#00684A] focus:bg-white focus:ring-2 focus:ring-[#00ED64]/30 disabled:bg-[#F1F5F9] sm:text-sm"
            />
            <button type="submit" disabled={!input.trim() || !!status} aria-label="Kirim pertanyaan"
                    className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#001E2B] text-[#00ED64] shadow-xs transition-all hover:bg-[#061E28] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]">
              <Send size={16} />
            </button>
          </form>
        </footer>
      </aside>
    </div>
  );
}
