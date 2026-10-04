import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { createIntake } from "@/lib/api";
import { Button } from "@/components/ui/button";

const CONCERN_OPTIONS = [
  { key: "banjir", label: "Banjir / genangan" },
  { key: "commute", label: "Commute ke kantor" },
  { key: "akses", label: "Akses jalan" },
  { key: "fasilitas", label: "Fasilitas sekitar" },
  { key: "lingkungan", label: "Lingkungan / red flags" },
];

const inputCls =
  "min-h-11 w-full rounded-md border border-border-strong bg-background px-md text-body-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring";
const labelCls = "mb-xxs block text-body-sm-medium text-foreground";
const sectionCls = "flex flex-col gap-md rounded-lg border border-border bg-card p-xl";
const chip = (active: boolean) =>
  `flex min-h-11 cursor-pointer items-center justify-center rounded-md border px-sm py-xs text-body-sm-medium ${
    active ? "border-brand-green-dark bg-surface-feature text-brand-green-dark" : "border-border-strong bg-card text-foreground"
  }`;

export default function Intake() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    property_name: "",
    address_text: "",
    maps_link: "",
    purpose: "tinggal_keluarga",
    buying_stage: "survey",
    dp_timeline: "lt_30_hari",
    workplace_text: "",
    transport_mode: "krl",
    concerns: [] as string[],
    concern_notes: "",
    full_name: "",
    whatsapp: "",
    consent_whatsapp: false,
    consent_privacy: false,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggleConcern = (key: string) =>
    set("concerns", form.concerns.includes(key) ? form.concerns.filter((c) => c !== key) : [...form.concerns, key]);

  const canSubmit =
    form.address_text.length >= 5 &&
    form.workplace_text.length >= 3 &&
    form.full_name.length > 0 &&
    form.whatsapp.length >= 8 &&
    form.consent_whatsapp &&
    form.consent_privacy &&
    !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const { intake_id } = await createIntake({
        ...form,
        property_name: form.property_name || undefined,
        maps_link: form.maps_link || undefined,
        concern_notes: form.concern_notes || undefined,
      });
      navigate(`/check/${intake_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[28rem] px-md pb-2xl">
        <header className="py-2xl">
          <Link to="/" className="flex items-center gap-xs" aria-label="Rumper — beranda">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep">
              <Home className="size-5" aria-hidden />
            </span>
            <span className="text-body-medium text-foreground">Rumper</span>
          </Link>
          <h1 className="mt-md text-heading-3 text-foreground">Rumahnya bagus. Risikonya sudah dicek?</h1>
          <p className="mt-xs text-body-sm text-text-secondary">
            Mini Check awal: banjir, commute, akses, fasilitas, dan red flags lokasi — sebelum bayar
            booking fee atau DP.
          </p>
        </header>

        <form onSubmit={submit} className="flex flex-col gap-lg">
          <section className={sectionCls}>
            <h2 className="text-heading-5 text-foreground">1 · Lokasi kandidat</h2>
            <div>
              <label className={labelCls}>Nama perumahan / cluster (opsional)</label>
              <input className={inputCls} value={form.property_name} onChange={(e) => set("property_name", e.target.value)} placeholder="Cluster Mawar, Grand Wisata" />
            </div>
            <div>
              <label className={labelCls}>Alamat / area *</label>
              <input className={inputCls} required value={form.address_text} onChange={(e) => set("address_text", e.target.value)} placeholder="Tambun Selatan, Kab. Bekasi" />
            </div>
            <div>
              <label className={labelCls}>Link Google Maps / listing (opsional)</label>
              <input className={inputCls} value={form.maps_link} onChange={(e) => set("maps_link", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
            </div>
          </section>

          <section className={sectionCls}>
            <h2 className="text-heading-5 text-foreground">2 · Konteks pembelian</h2>
            <div>
              <label className={labelCls}>Tujuan</label>
              <select className={inputCls} value={form.purpose} onChange={(e) => set("purpose", e.target.value)}>
                <option value="tinggal_sendiri">Tinggal sendiri / berdua</option>
                <option value="tinggal_keluarga">Tinggal bersama keluarga / rencana anak</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Tahap</label>
              <select className={inputCls} value={form.buying_stage} onChange={(e) => set("buying_stage", e.target.value)}>
                <option value="survey">Masih survei kandidat</option>
                <option value="nego">Sedang nego</option>
                <option value="siap_dp">Siap booking fee / DP</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Target keputusan</label>
              <select className={inputCls} value={form.dp_timeline} onChange={(e) => set("dp_timeline", e.target.value)}>
                <option value="lt_30_hari">&lt; 30 hari</option>
                <option value="1_3_bulan">1–3 bulan</option>
                <option value="gt_3_bulan">&gt; 3 bulan</option>
              </select>
            </div>
          </section>

          <section className={sectionCls}>
            <h2 className="text-heading-5 text-foreground">3 · Rutinitas harian</h2>
            <div>
              <label className={labelCls}>Lokasi kerja / aktivitas utama *</label>
              <input className={inputCls} required value={form.workplace_text} onChange={(e) => set("workplace_text", e.target.value)} placeholder="SCBD, Jakarta Selatan" />
            </div>
            <div>
              <label className={labelCls}>Transportasi utama</label>
              <div className="grid grid-cols-2 gap-xs">
                {[
                  ["mobil", "Mobil"],
                  ["motor", "Motor"],
                  ["krl", "KRL"],
                  ["transjakarta", "TransJakarta"],
                  ["campuran", "Campuran"],
                ].map(([val, label]) => (
                  <label key={val} className={chip(form.transport_mode === val)}>
                    <input type="radio" name="transport" className="sr-only" checked={form.transport_mode === val} onChange={() => set("transport_mode", val)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className={sectionCls}>
            <h2 className="text-heading-5 text-foreground">4 · Kekhawatiran utama</h2>
            <div className="flex flex-wrap gap-xs">
              {CONCERN_OPTIONS.map((c) => (
                <label key={c.key} className={chip(form.concerns.includes(c.key))}>
                  <input type="checkbox" className="sr-only" checked={form.concerns.includes(c.key)} onChange={() => toggleConcern(c.key)} />
                  {c.label}
                </label>
              ))}
            </div>
            <textarea
              className={`${inputCls} min-h-0 py-sm`}
              rows={2}
              value={form.concern_notes}
              onChange={(e) => set("concern_notes", e.target.value)}
              placeholder='Catatan, mis. "Listing bilang bebas banjir"'
            />
          </section>

          <section className={sectionCls}>
            <h2 className="text-heading-5 text-foreground">5 · Kontak</h2>
            <div>
              <label className={labelCls}>Nama *</label>
              <input className={inputCls} required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Nomor WhatsApp *</label>
              <input className={inputCls} required inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
            <label className="flex cursor-pointer items-start gap-sm text-body-sm text-text-secondary">
              <input type="checkbox" className="mt-0.5 size-4 accent-brand-green-dark" checked={form.consent_whatsapp} onChange={(e) => set("consent_whatsapp", e.target.checked)} />
              Saya bersedia dihubungi via WhatsApp untuk tindak lanjut hasil cek.
            </label>
            <label className="flex cursor-pointer items-start gap-sm text-body-sm text-text-secondary">
              <input type="checkbox" className="mt-0.5 size-4 accent-brand-green-dark" checked={form.consent_privacy} onChange={(e) => set("consent_privacy", e.target.checked)} />
              Saya memahami data ini dipakai hanya untuk menyiapkan Mini Check dan tidak dibagikan ke penjual, agen, atau developer.
            </label>
          </section>

          {error && <p className="rounded-md bg-semantic-danger-bg px-md py-sm text-body-sm text-semantic-danger-text">{error}</p>}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {submitting ? "Mengirim…" : "Cek Risiko Lokasi Rumah Saya"}
          </Button>
          <p className="text-center text-caption text-text-tertiary">
            Independen di sisi pembeli · Bukan marketplace properti · Bukan jaminan
          </p>
        </form>
      </div>
    </div>
  );
}
