import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X, Loader2, ArrowRight } from "lucide-react";
import { ApiError, createConversationFromIntake, placesAutocompleteNear } from "@/lib/api";
import { loadWizard, saveWizard, wizardToIntake } from "@/lib/wizard";

const MIN_QUERY = 4;

/** Final step of the corridor journey: name the house, then run the real Mini Check.
 *
 *  This replaces the old hand-off to `/app/location`. Everything the wizard already
 *  collected (anchor, concerns, purpose, context) is in the draft; only the address is
 *  missing, so that is all we ask for before `POST /api/conversations/from-intake` starts
 *  the research pipeline. */
export default function EvaluatePropertyModal({ areaName, centroid, open, onClose, onStarted }: {
  areaName: string;
  /** Corridor centroid — the search is hard-bounded to a circle around it, so a buyer
   *  evaluating Cibubur cannot accidentally pick a house in Serpong. */
  centroid: { lat: number; lng: number } | null;
  open: boolean;
  onClose: () => void;
  onStarted: (conversationId: string) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ description: string }[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!open) { setQ(""); setHits([]); setPicked(null); setError(null); }
  }, [open]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < MIN_QUERY) { setHits([]); return; }
    const mine = ++seq.current;
    const t = window.setTimeout(() => {
      (centroid ? placesAutocompleteNear(query, centroid) : Promise.resolve([]))
        .then((r) => { if (mine === seq.current) setHits(r); })
        .catch(() => { if (mine === seq.current) setHits([]); });
    }, 300);
    return () => window.clearTimeout(t);
  }, [q, centroid]);

  if (!open) return null;

  async function start() {
    const address = picked ?? q.trim();
    if (address.length < 5) { setError("Alamat terlalu pendek."); return; }
    setBusy(true); setError(null);
    try {
      const draft = { ...loadWizard(), property: address, area: areaName };
      saveWizard(draft);
      const res = await createConversationFromIntake(wizardToIntake(draft));
      onStarted(res.conversation_id);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? typeof e.detail === "string" ? e.detail : "Gagal memulai analisis."
          : "Gagal memulai analisis. Coba lagi.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-[#001E2B]/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby="evaluate-title"
           className="relative w-full sm:max-w-lg max-h-[90dvh] bg-white rounded-t-[28px] sm:rounded-3xl border border-[#E1E5E8] shadow-2xl overflow-hidden flex flex-col text-[#001E2B]">
        <header className="bg-[#001E2B] text-white p-5 shrink-0 flex items-start justify-between gap-3">
          <div>
            <h3 id="evaluate-title" className="text-base sm:text-lg font-black tracking-tight">
              Rumah mana yang mau dicek?
            </h3>
            <p className="text-xs text-[#A8B3BC] mt-0.5 font-medium">
              Koridor <strong className="text-white">{areaName}</strong>. Analisis 5 tahap akan
              dijalankan untuk alamat ini.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup"
                  className="text-[#A8B3BC] hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 -mr-2 -mt-1">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F4F7F8] rounded-2xl border border-[#D7E1E5] focus-within:border-[#001E2B] focus-within:bg-white transition-all">
            <Search size={15} className="text-[#7C8C9A] shrink-0" />
            <input
              autoFocus
              value={picked ?? q}
              onChange={(e) => { setPicked(null); setQ(e.target.value); }}
              placeholder={`Cari perumahan di ${areaName}…`}
              className="w-full text-sm font-semibold bg-transparent outline-none placeholder-[#7C8C9A]"
            />
          </div>

          {!picked && hits.length > 0 && (
            <div className="space-y-1">
              {hits.map((h) => (
                <button key={h.description} type="button"
                        onClick={() => { setPicked(h.description); setHits([]); }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium hover:bg-[#F4F7F6] flex items-center gap-2">
                  <MapPin size={13} className="text-[#7C8C9A] shrink-0" />
                  <span className="truncate">{h.description}</span>
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-xs font-semibold text-[#C95746]">{error}</p>}

          <p className="text-[11px] text-[#7C8C9A] leading-relaxed">
            Pencarian dibatasi di koridor <strong className="text-[#001E2B]">{areaName}</strong>.
            Analisis memakai profil yang sudah kamu konfirmasi — titik aktivitas, prioritas
            risiko, dan konteks rumah tangga. Hasilnya laporan awal, bukan jaminan.
          </p>
        </div>

        <div className="p-4 sm:p-5 pt-3 bg-white flex items-center justify-between gap-3 border-t border-[#F0F4F6] shrink-0">
          <button type="button" onClick={onClose} disabled={busy}
                  className="min-h-[44px] px-5 rounded-full border border-[#D7E1E5] text-xs font-bold text-[#5C6C7A] hover:bg-[#F4F7F6] disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={start} disabled={busy}
                  className="min-h-[44px] flex-1 px-4 rounded-full bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-60">
            {busy ? <><Loader2 size={15} className="animate-spin" /> Memulai analisis…</>
                  : <>Mulai Analisis Lokasi <ArrowRight size={15} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
