import { useEffect, useState } from "react";
import {
  AlertTriangle, Check, ChevronLeft, ChevronRight, FileCheck, MapPin, Printer, ShieldCheck, X,
} from "lucide-react";
import { resolveRef, type Category, type Report } from "@/lib/api";

const CONFIDENCE_LABEL: Record<string, string> = {
  data_kuat: "Data kuat",
  data_sedang: "Data sedang",
  perlu_validasi: "Perlu validasi",
};

/** Due-diligence brief preview (PRD-13 §4 Module 6).
 *
 *  Every figure on these three pages is read off the report the deterministic engine
 *  produced — score, band, per-category scores, confidence labels, checklist and disclaimer.
 *  Nothing is illustrative: a document a buyer may carry to a site visit or hand to family
 *  cannot contain a number we made up.
 *
 *  There is no server-side PDF generation (docs/00 §4), so "download" is the browser's own
 *  print-to-PDF over the same sheet — a real file, not a simulated one. */
export default function PdfDueDiligenceModal({
  open, onClose, report, docId,
}: {
  open: boolean;
  onClose: () => void;
  report: Report | null;
  docId?: string;
}) {
  const [page, setPage] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !report) return null;

  const name = report.property.name ?? report.property.formatted_address ?? "Lokasi tanpa nama";
  const address = report.property.formatted_address ?? "—";
  const issued = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const reference = docId ? `RMP-${docId.slice(0, 8).toUpperCase()}` : "RMP-PRATINJAU";

  const scored = report.categories.filter((c): c is Category & { score: number } => c.score !== null);
  const strengths = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);
  const redFlags = report.red_flags.map((r) => resolveRef(report, r)).filter((f) => f !== null);
  const gaps = report.evidence_gaps.map((r) => resolveRef(report, r)).filter((f) => f !== null);

  const footer = (n: number, label: string) => (
    <div className="flex items-center justify-between border-t border-[#E5E5EA] pt-4 text-[9px] text-[#7C8C9A]">
      <span>Halaman {n} dari 3 • {label}</span>
      <span>Rumper — analisis pendukung keputusan, bukan jaminan</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[3000] flex select-none items-center justify-center bg-[#001E2B]/75 p-3 backdrop-blur-md animate-fadeIn sm:p-6"
         onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pratinjau ringkasan due diligence"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-slate-800 text-[#001E2B] shadow-2xl animate-fadeIn"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#001E2B] px-5 py-3.5 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl border border-[#00ED64]/30 bg-[#00ED64]/15 text-[#00ED64]">
              <FileCheck size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="max-w-[200px] truncate text-xs font-black text-white sm:max-w-xs">{name}</span>
                <span className="rounded bg-white/10 px-1.5 font-mono text-[10px] text-[#00ED64]">{reference}</span>
              </div>
              <span className="block text-[10px] text-[#A8B3BC]">Ringkasan due diligence (3 halaman)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-white/10 bg-white/10 p-1 text-xs font-bold text-white">
              <button type="button" disabled={page === 1} aria-label="Halaman sebelumnya"
                      onClick={() => setPage((p) => Math.max(1, p - 1) as 1 | 2 | 3)}
                      className="cursor-pointer rounded-full p-1 hover:bg-white/10 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-mono text-[11px]">{page} / 3</span>
              <button type="button" disabled={page === 3} aria-label="Halaman berikutnya"
                      onClick={() => setPage((p) => Math.min(3, p + 1) as 1 | 2 | 3)}
                      className="cursor-pointer rounded-full p-1 hover:bg-white/10 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>

            <button type="button" onClick={() => window.print()}
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#00ED64] px-4 text-xs font-black text-[#001E2B] shadow-md transition-all active:scale-95">
              <Printer size={14} />
              <span>Cetak / simpan PDF</span>
            </button>

            <button type="button" onClick={onClose} aria-label="Tutup pratinjau"
                    className="ml-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar flex flex-1 justify-center overflow-y-auto bg-slate-900/60 p-4 sm:p-6">
          <div className="rumper-print-sheet flex min-h-[750px] w-full max-w-[680px] flex-col justify-between space-y-6 rounded-2xl bg-white p-6 text-[#001E2B] shadow-2xl sm:p-8">
            {page === 1 && (
              <div className="flex flex-1 flex-col justify-between space-y-6">
                <div>
                  <div className="mb-5 flex items-start justify-between border-b-2 border-[#001E2B] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-[#001E2B]">RUMPER</span>
                        <span className="rounded bg-[#00ED64] px-2 py-0.5 text-[10px] font-black uppercase text-[#001E2B]">
                          Location report
                        </span>
                      </div>
                      <span className="mt-0.5 block text-[10px] font-bold text-[#5C6C7A]">
                        Analisis risiko lokasi untuk calon pembeli rumah
                      </span>
                    </div>
                    <div className="text-right font-mono text-[10px] text-[#5C6C7A]">
                      <div>Ref: <strong>{reference}</strong></div>
                      <div>Tanggal: {issued}</div>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <span className="mb-0.5 block text-[10px] font-black uppercase tracking-wider text-[#00684A]">
                        Lokasi yang dianalisis
                      </span>
                      <h2 className="text-lg font-black text-[#001E2B]">{name}</h2>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#5C6C7A]">
                        <MapPin size={12} className="shrink-0 text-[#00684A]" />
                        <span>{address}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-[#CBD5E1] bg-white p-3 shadow-xs">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#001E2B] font-mono text-lg font-black text-[#00ED64]">
                        {report.rls_score ?? "—"}
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] font-bold uppercase text-[#7C8C9A]">Rekomendasi</span>
                        <span className="block text-xs font-black uppercase text-[#00684A]">
                          {report.recommendation_label}
                        </span>
                        <span className="block text-[9px] text-[#5C6C7A]">{report.band_label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#001E2B]">
                      1. Ringkasan
                    </h3>
                    <p className="text-[11px] leading-relaxed text-[#3A3A3C]">{report.summary}</p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5 rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3.5">
                        <span className="flex items-center gap-1 text-[11px] font-black text-[#00684A]">
                          <Check size={14} className="stroke-[3]" /> Skor tertinggi
                        </span>
                        <ul className="list-inside list-disc space-y-1 text-[11px] text-[#004D36]">
                          {strengths.length > 0
                            ? strengths.map((c) => <li key={c.category}>{c.label} — {c.score}/100</li>)
                            : <li>Belum ada kategori yang selesai dinilai.</li>}
                        </ul>
                      </div>
                      <div className="space-y-1.5 rounded-xl border border-amber-200/60 bg-amber-50/60 p-3.5">
                        <span className="flex items-center gap-1 text-[11px] font-black text-amber-900">
                          <AlertTriangle size={14} /> Perlu diperiksa di lapangan
                        </span>
                        <ul className="list-inside list-disc space-y-1 text-[11px] text-amber-900">
                          {redFlags.length > 0
                            ? redFlags.slice(0, 4).map((f, i) => <li key={i}>{f.claim}</li>)
                            : <li>Tidak ada red flag yang terdeteksi pada data saat ini.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                {footer(1, "Ringkasan")}
              </div>
            )}

            {page === 2 && (
              <div className="flex flex-1 flex-col justify-between space-y-6">
                <div>
                  <div className="mb-4 flex items-center justify-between border-b border-[#001E2B] pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#001E2B]">
                      2. Skor per faktor &amp; kekuatan bukti
                    </span>
                    <span className="font-mono text-[10px] text-[#5C6C7A]">{reference}</span>
                  </div>

                  <table className="w-full border-collapse overflow-hidden rounded-xl border border-[#CBD5E1] text-left text-[11px]">
                    <thead className="bg-[#F4F7F6] text-[#334155]">
                      <tr className="border-b border-[#CBD5E1]">
                        <th className="p-2 font-bold">Faktor</th>
                        <th className="p-2 font-bold">Bobot</th>
                        <th className="p-2 font-bold">Skor</th>
                        <th className="p-2 font-bold">Kepercayaan bukti</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {report.categories.map((c) => (
                        <tr key={c.category}>
                          <td className="p-2 font-medium">{c.label}</td>
                          <td className="p-2 font-mono">{Math.round(c.weight * 100)}%</td>
                          <td className="p-2 font-mono font-bold">{c.score ?? "—"}</td>
                          <td className="p-2">{CONFIDENCE_LABEL[c.confidence] ?? c.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-5 space-y-2">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#001E2B]">
                      <ShieldCheck size={14} className="text-[#00684A]" />
                      <span>Informasi yang belum bisa diverifikasi</span>
                    </h4>
                    <div className="space-y-1.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 text-[11px]">
                      {gaps.length > 0 ? (
                        gaps.slice(0, 5).map((f, i) => (
                          <p key={i} className="text-[#3A3A3C]">
                            • {f.claim} <span className="text-[#7C8C9A]">— {f.validation_action}</span>
                          </p>
                        ))
                      ) : (
                        <p className="text-[#3A3A3C]">
                          Tidak ada celah bukti yang tercatat untuk lokasi ini.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-[10px] text-[#5C6C7A]">
                    <span className="font-bold text-[#001E2B]">Sumber data:</span>
                    {report.sources.slice(0, 8).map((s) => (
                      <p key={s.id}>[{s.id}] {s.source_title}</p>
                    ))}
                  </div>
                </div>
                {footer(2, "Skor & bukti")}
              </div>
            )}

            {page === 3 && (
              <div className="flex flex-1 flex-col justify-between space-y-6">
                <div>
                  <div className="mb-4 flex items-center justify-between border-b border-[#001E2B] pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#001E2B]">
                      3. Lembar verifikasi lapangan
                    </span>
                    <span className="font-mono text-[10px] text-[#5C6C7A]">{reference}</span>
                  </div>

                  <p className="mb-3 text-[10px] text-[#5C6C7A]">
                    Bawa lembar ini saat survei fisik. Centang setelah kamu verifikasi langsung
                    bersama pemilik atau developer.
                  </p>

                  <div className="space-y-1.5 text-[10px]">
                    {report.checklist.length > 0 ? (
                      report.checklist.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1.5">
                          <div className="mt-0.5 size-3.5 shrink-0 rounded border-2 border-[#CBD5E1] bg-white" />
                          <div>
                            <span className="font-medium text-[#334155]">{item.item}</span>
                            <span className="block text-[9px] text-[#7C8C9A]">{item.reason}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#5C6C7A]">Checklist belum tersedia untuk laporan ini.</p>
                    )}
                  </div>

                  <p className="mt-5 rounded-xl border border-dashed border-[#CBD5E1] p-3 text-[10px] leading-relaxed text-[#5C6C7A]">
                    {report.disclaimer}
                  </p>
                </div>
                {footer(3, "Checklist lapangan")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
