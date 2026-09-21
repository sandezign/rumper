import { useState, useRef, useEffect } from "react";
import { X, SendHorizontal, Bot } from "lucide-react";
import type { ChatMessage } from "@/lib/api";

interface AssistantColumnV3Props {
  messages: ChatMessage[];
  thinking: string | null;
  onClose: () => void;
  onSend: (text: string) => void;
  /** Blocks sending while a reply streams, research runs, or the daily quota is spent. */
  disabled?: boolean;
  placeholder?: string;
}

export function AssistantColumnV3({
  messages,
  thinking,
  onClose,
  onSend,
  disabled = false,
  placeholder = "Tanyakan sesuatu...",
}: AssistantColumnV3Props) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled) return;
    onSend(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative border-l border-border">
      {/* Header */}
      <div className="h-[72px] border-b border-border flex items-center px-md justify-between bg-white shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-sm">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#001e2b] text-[#00ed64] shadow-sm">
            <Bot className="size-5" />
          </div>
          <div>
            <h2 className="text-body-sm-bold font-bold text-text-primary leading-tight">
              AI Assistant
            </h2>
            <p className="text-[10px] text-text-tertiary font-medium mt-0.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="size-1.5 rounded-full bg-[#00ed64] animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-slate-100 text-text-tertiary transition-colors cursor-pointer border border-transparent hover:border-border"
          aria-label="Tutup asisten"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id ?? `${m.role}-${i}`}
              className={`flex flex-col gap-1 max-w-[90%] ${isUser ? "self-end" : "self-start"}`}
            >
              <div
                className={`p-sm rounded-xl text-body-sm leading-relaxed ${
                  isUser
                    ? "bg-[#001e2b] text-white rounded-tr-sm"
                    : "bg-white border border-border text-text-primary rounded-tl-sm shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-xs flex flex-wrap gap-2 pt-2 border-t border-border/10">
                    {m.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => !disabled && onSend(s)}
                        disabled={disabled}
                        className="text-[11px] px-2 py-1 bg-brand-teal-light/20 text-brand-teal hover:bg-brand-teal hover:text-white rounded-md font-medium transition-colors border border-brand-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Deep Thinking indicator */}
        {thinking && (
          <div className="flex flex-col gap-1 max-w-[90%] self-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-sm rounded-xl bg-white border border-brand-teal/30 text-text-primary rounded-tl-sm shadow-sm flex items-start gap-3">
              <div className="mt-1 shrink-0">
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
              <p className="text-body-xs font-medium text-text-secondary italic">
                {thinking}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px" />
      </div>

      {/* Input Area */}
      <div className="p-md bg-white border-t border-border shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-xs bg-slate-50 border border-border focus-within:border-brand-teal focus-within:ring-1 focus-within:ring-brand-teal rounded-xl px-3 py-2 shadow-inner-sm transition-all"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent border-none focus:outline-none text-body-sm placeholder:text-slate-400 py-1 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={disabled || !inputValue.trim()}
            className="flex size-8 items-center justify-center rounded-lg bg-brand-teal hover:bg-brand-teal-deep text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <SendHorizontal className="size-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-text-tertiary mt-2 font-medium">
          AI Assistant dapat berhalusinasi. Selalu verifikasi data.
        </p>
      </div>
    </div>
  );
}
