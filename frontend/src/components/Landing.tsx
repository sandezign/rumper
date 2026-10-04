import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as art from "@/assets/landing";
import { cn } from "@/lib/utils";

/* ============================================================
   Landing — public marketing page.
   One responsive implementation: the mobile design (390w) is
   followed 1:1 at base width; md/lg widen the same sections to
   the 1440w desktop layout. No V(n) variants.

   Every glyph on this page comes from the Figma frame via
   `@/assets/landing` — no icon-library stand-ins (their colours
   are baked in by the design, so they are rendered as <img>).
   ============================================================ */

/** Decorative artwork from the design; never announced to AT. */
function Art({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden className={cn("shrink-0", className)} />;
}

const NAV_LINKS = [
  { label: "Yang Perlu Dicek", href: "#periksa" },
  { label: "Contoh Mini Check", href: "#contoh" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Tentang Rumper", href: "#tentang" },
];

const HERO_POINTS = [
  "Mulai dari rumah incaran Anda",
  "Jawab beberapa pertanyaan singkat",
  "Hasil awal untuk ditelaah",
];

const CHECK_TAGS = ["Banjir", "Commute", "Akses", "Red Flag"];

const PITFALLS = [
  {
    icon: art.pitfall1,
    title: "Klaim penjual belum tentu cukup",
    body: "“Bebas banjir” perlu dibandingkan dengan data area, pengalaman warga, dan kondisi akses saat hujan.",
  },
  {
    icon: art.pitfall2,
    title: "Jarak tidak sama dengan rutinitas",
    body: "Perjalanan perlu dibaca sesuai tujuan, moda, dan waktu yang benar-benar Anda jalani.",
  },
  {
    icon: art.pitfall3,
    title: "Rumah yang cocok belum tentu lokasinya cocok",
    body: "Akses, fasilitas, dan lingkungan sekitar perlu diperiksa sebagai bagian dari keputusan yang sama.",
  },
];

const CATEGORIES = [
  {
    num: "01",
    icon: art.category1,
    title: "Ketahanan banjir",
    body: "Riwayat, konteks elevasi, dan keterbatasan data yang perlu divalidasi.",
  },
  {
    num: "02",
    icon: art.category2,
    title: "Efisiensi commute",
    body: "Waktu tempuh pada jam acuan sesuai tujuan dan moda perjalanan Anda.",
  },
  {
    num: "03",
    icon: art.category3,
    title: "Akses fisik",
    body: "Kondisi keluar-masuk area, konektivitas jalan, dan akses transportasi.",
  },
  {
    num: "04",
    icon: art.category4,
    title: "Fasilitas esensial",
    body: "Ketersediaan fasilitas kesehatan dan kebutuhan rutin di sekitar lokasi.",
  },
  {
    num: "05",
    icon: art.category5,
    title: "Lingkungan & red flag",
    body: "Sinyal lingkungan sekitar yang perlu diperiksa sebelum mengambil keputusan.",
  },
];

const STEPS = [
  {
    step: "Langkah 1",
    title: "Berikan konteks lokasi",
    body: "Masukkan satu rumah incaran, tujuan perjalanan, moda, dan kekhawatiran utama.",
  },
  {
    step: "Langkah 2",
    title: "Telaah bukti yang tersedia",
    body: "Rumper menyusun temuan awal, sumber, kekuatan bukti, serta evidence gap.",
  },
  {
    step: "Langkah 3",
    title: "Bawa pertanyaan ke lapangan",
    body: "Gunakan hasil awal untuk memeriksa, bertanya, atau menunda keputusan bila bukti belum cukup.",
  },
];

const STANCE = [
  {
    icon: art.stance1,
    body: "Rumper tidak menjual rumah dan tidak mewakili kepentingan penjual atau developer.",
  },
  {
    icon: art.stance2,
    body: "Temuan yang belum kuat ditampilkan sebagai keterbatasan atau kebutuhan validasi, bukan dianggap aman.",
  },
  {
    icon: art.stance3,
    body: "Mini Check awal bukan inspeksi fisik, opini legal, valuasi, atau jaminan kesesuaian lokasi.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Apakah Rumper menjual rumah?",
    answer:
      "Tidak. Rumper tidak menjual rumah, tidak menerima komisi penjualan, dan tidak mewakili developer maupun agen. Kami hanya membantu Anda membaca sinyal lokasi sebelum mengambil keputusan.",
  },
  {
    question: "Apakah Rumper menjamin lokasi bebas risiko?",
    answer:
      "Tidak. Mini Check adalah opini kedua awal berdasarkan sinyal lokasi yang tersedia. Setiap temuan disertai sumber dan kekuatan bukti, termasuk hal yang masih perlu divalidasi di lapangan.",
  },
  {
    question: "Apa yang saya dapatkan?",
    answer:
      "Temuan awal pada lima kategori (ketahanan banjir, efisiensi commute, akses fisik, fasilitas esensial, serta lingkungan & red flag), sumber yang dicantumkan, kekuatan bukti, evidence gap, dan langkah validasi yang bisa Anda bawa saat survei.",
  },
  {
    question: "Lokasi mana yang dapat diperiksa?",
    answer:
      "Saat ini Rumper fokus pada wilayah Jabodetabek. Mulailah dari satu rumah incaran; ketelitian data tingkat area dapat berbeda dari kondisi persis di titik rumah.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/app?q=${encodeURIComponent(q)}` : "/app");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader />

      <main>
        <Hero query={query} onQueryChange={setQuery} onSubmit={handleSubmit} />
        <PitfallsSection />
        <ExampleSection />
        <CategoriesSection />
        <StepsSection />
        <StanceSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </div>
  );
}

/* ---------------------------------------------------------- header */

function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto w-full max-w-[1200px] pt-[12px]">
        <div className="relative flex items-center justify-between px-2xl pb-md pt-[28px] lg:px-3xl lg:py-md">
          <Link to="/" aria-label="Rumper — beranda" className="flex items-center gap-xs">
            <Art src={art.logoMark} className="size-[40px]" />
            <span className="text-body-medium font-semibold tracking-tight text-white">Rumper</span>
          </Link>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2xl lg:flex">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-body-sm-medium text-text-on-dark-muted duration-150 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-sm lg:flex">
            <Link
              to="/login"
              className="flex h-[36px] items-center rounded-full border border-white/30 bg-white/5 px-md text-body-sm-medium text-white duration-150 hover:bg-white/10"
            >
              Masuk
            </Link>
            <Link
              to="/app"
              className="flex h-[36px] items-center rounded-full bg-primary px-md text-body-sm-medium text-primary-foreground duration-150 hover:bg-brand-green-hover active:bg-brand-green-pressed"
            >
              Mulai Mini Check
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="-mr-2 p-2 text-white lg:hidden"
          >
            <Art src={art.menu} className="size-[24px]" />
          </button>
        </div>

        {open && (
          <div className="mx-md mb-xs rounded-2xl border border-white/10 bg-brand-teal-deep p-xl shadow-overlay lg:hidden">
            <ul className="space-y-md">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-body-medium text-text-on-dark-muted duration-150 hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-xl flex flex-col gap-sm">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex h-[44px] items-center justify-center rounded-xl border border-white/30 bg-white/5 text-body-medium text-white"
              >
                Masuk
              </Link>
              <Link
                to="/app"
                onClick={() => setOpen(false)}
                className="flex h-[44px] items-center justify-center rounded-xl bg-primary text-body-medium text-primary-foreground"
              >
                Mulai Mini Check
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ---------------------------------------------------------- hero */

type HeroProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function Hero({ query, onQueryChange, onSubmit }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-teal-deep text-text-on-dark">
      {/* radial scrim + brand glow behind the hero stack */}
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--brand-teal-deep)_75%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-20 lg:block">
        <div className="absolute -left-[370px] -top-[360px] size-[1300px] rounded-full bg-[radial-gradient(circle_at_55%_31%,rgba(0,240,104,0.15)_0%,rgba(0,240,104,0.05)_50%,transparent_80%)]" />
        <div className="absolute -left-[408px] -top-[531px] size-[1063px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,104,0.1)_0%,transparent_80%)]" />
      </div>

      <div className="relative">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-xl pt-[128px] lg:pt-[160px]">
          <Link
            to="/app"
            className="flex w-fit items-center gap-xs rounded-full border border-white/10 bg-white/5 py-xxs pl-md pr-md shadow-raised duration-300 hover:bg-white/10 lg:gap-md lg:pr-1"
          >
            <Art src={art.heroBadge} className="size-[16px]" />
            <span className="text-body-sm-medium text-white">
              Mini Check lokasi rumah · Jabodetabek
            </span>
            <span className="hidden size-[24px] items-center justify-center rounded-full bg-primary lg:flex">
              <Art src={art.arrowRight} className="size-[12px]" />
            </span>
          </Link>

          <h1 className="mt-2xl max-w-[342px] text-center text-[3rem] font-medium leading-none tracking-[-0.025em] text-white lg:mt-3xl lg:max-w-[896px] lg:text-[5.25rem]">
            Sudah suka rumahnya? Cek dulu risiko lokasinya.
          </h1>
          <p className="mt-xl max-w-[342px] text-center text-body leading-[28px] text-text-on-dark-muted lg:max-w-[672px] lg:text-subtitle">
            Masukkan lokasi rumah incaran Anda. Rumper membantu melihat temuan awal tentang banjir,
            waktu tempuh, akses, fasilitas penting, dan red flag di sekitar lokasi.
          </p>

          <form onSubmit={onSubmit} className="mt-3xl w-full max-w-[672px]">
            <div className="flex flex-col gap-xs rounded-xl border border-white/10 bg-white/5 p-xs shadow-preview backdrop-blur-md duration-300 focus-within:border-primary/50 lg:flex-row">
              <div className="flex flex-1 items-center gap-xs px-sm">
                <Art src={art.inputHome} className="size-[20px]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Contoh: Grand Galaxy Bekasi"
                  aria-label="Lokasi rumah incaran"
                  className="w-full bg-transparent py-sm text-body text-white placeholder:text-text-on-dark-muted focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-xs rounded-xl bg-primary px-xl py-sm text-body font-medium text-primary-foreground duration-150 hover:bg-brand-green-hover active:bg-brand-green-pressed"
              >
                <span>Cek lokasi incaran</span>
                <Art src={art.arrowRight} className="hidden size-[16px] lg:block" />
              </button>
            </div>

            <div className="mt-md flex flex-col items-center gap-xs lg:flex-row lg:justify-center lg:gap-xl">
              {HERO_POINTS.map((point) => (
                <span key={point} className="flex items-center gap-xs">
                  <Art src={art.heroPointCheck} className="size-[16px]" />
                  <span className="text-body-sm-medium text-text-on-dark-muted">{point}</span>
                </span>
              ))}
            </div>
          </form>
        </div>

        <ReportPreview />

        {/* what a Mini Check looks at */}
        <div className="border-t border-white/5 bg-brand-teal-deep/30 px-xl pb-section pt-2xl">
          <div className="mx-auto max-w-[1024px]">
            <a
              href="#periksa"
              className="flex items-center justify-center gap-xs text-body-sm-medium font-semibold text-primary duration-150 hover:text-brand-green-hover"
            >
              <span>Lihat hal yang perlu diperiksa</span>
              <Art src={art.chevronDownSm} className="size-[12px]" />
            </a>
            <div className="mt-xl flex flex-wrap items-center justify-between gap-xl lg:justify-center lg:gap-2xl">
              {CHECK_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="text-caption-bold uppercase tracking-[0.05em] text-text-on-dark-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Illustrative Mini Check summary that sits under the hero form. */
function ReportPreview() {
  return (
    <div className="px-md py-md lg:px-xl lg:py-section">
      <div className="mx-auto w-full max-w-[640px] rounded-2xl border border-white/15 bg-brand-teal-deep/50 p-md shadow-overlay">
        <div className="flex flex-col gap-sm rounded-xl border border-white/10 bg-brand-teal p-sm">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-brand-teal-deep/70 px-sm py-md">
            <span className="flex items-center gap-xs">
              <Art src={art.previewPin} className="size-[12px]" />
              <span className="text-micro font-normal text-white/70">Lokasi contoh</span>
            </span>
            <span className="rounded-full bg-primary/15 px-xs py-xxs text-[10px] font-semibold uppercase leading-3 tracking-[0.1em] text-primary">
              Contoh
            </span>
          </div>

          <div className="rounded-xl bg-white p-md">
            <p className="text-caption-bold text-foreground">Ringkasan lokasi</p>

            <div className="mt-md flex items-center justify-between gap-md">
              <div className="min-w-0">
                <p className="text-micro font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Location Risk Index
                </p>
                <p className="mt-xxs flex items-baseline gap-xxs">
                  <span className="text-[24px] font-bold leading-[30px] tracking-[-0.025em] text-foreground">
                    68
                  </span>
                  <span className="text-body-sm-medium text-muted-foreground">/ 100</span>
                </p>
                <p className="mt-xs flex items-center gap-xxs">
                  <span className="size-[8px] shrink-0 rounded-full bg-semantic-warning" aria-hidden />
                  <span className="text-body-sm-medium font-semibold text-semantic-warning-text">
                    Risiko sedang–tinggi
                  </span>
                </p>
              </div>
              <RiskDial />
            </div>

            <p className="mt-md text-body-sm leading-[22px] text-text-tertiary">
              3 faktor risiko signifikan terdeteksi. Paparan banjir adalah perhatian prioritas
              tertinggi di lokasi ini.
            </p>
            <p className="mt-xxs text-micro font-normal text-semantic-warning">
              Berdasarkan 6 sumber data
            </p>

            <div className="mt-xs flex items-center gap-xs rounded-lg bg-primary/10 p-xs">
              <Art src={art.previewCheck} className="size-[16px]" />
              <span className="text-caption text-text-secondary">Langkah validasi lapangan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* The 0–100 dial exactly as drawn in the design (ring, white face, glyph).
   It is fixed artwork for the illustrative example — not a rendered score. */
function RiskDial() {
  return (
    <div className="relative size-[72px] shrink-0" aria-hidden>
      <Art src={art.riskDialRing} className="absolute inset-0 size-[72px]" />
      <span className="absolute inset-[7px] rounded-full bg-white" />
      <Art src={art.riskDialGlyph} className="absolute left-1/2 top-1/2 size-[36px] -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

/* ---------------------------------------------------------- sections */

function SectionEyebrow({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <p className={cn("text-caption-bold", tone === "dark" ? "text-brand-green-dark" : "text-primary")}>
      {children}
    </p>
  );
}

function PitfallsSection() {
  return (
    <section id="periksa" className="scroll-mt-[96px] bg-background px-xl py-section lg:px-2xl">
      <div className="mx-auto grid max-w-[1152px] gap-2xl lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionEyebrow>Sebelum membayar booking fee atau DP</SectionEyebrow>
          <h2 className="mt-md text-heading-2 text-foreground">
            Hal terpenting bukan mendapat jawaban cepat. Melainkan tahu apa yang masih perlu
            dibuktikan.
          </h2>
          <p className="mt-sm text-body leading-[24.8px] text-text-secondary">
            Rumper membantu Anda mengubah informasi lokasi yang tersebar menjadi pertanyaan survei
            yang lebih terarah.
          </p>
        </div>

        <div className="lg:col-span-7">
          {PITFALLS.map((item, idx) => {
            return (
              <article
                key={item.title}
                className={cn(
                  "grid gap-sm py-lg",
                  idx === 0 && "pt-0",
                  idx < PITFALLS.length - 1 && "border-b border-border",
                )}
              >
                {/* dark tile — these glyphs are bright green (#00ED64) */}
                <span className="flex size-[40px] items-center justify-center rounded-xl bg-brand-teal-deep">
                  <Art src={item.icon} className="size-[20px]" />
                </span>
                <div>
                  <h3 className="text-heading-5 text-foreground">{item.title}</h3>
                  <p className="mt-xs text-body leading-[24.8px] text-text-secondary">{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExampleSection() {
  return (
    <section id="contoh" className="scroll-mt-[96px] bg-surface-soft px-xl py-section lg:px-2xl">
      <div className="mx-auto max-w-[1152px]">
        <div className="lg:mx-auto lg:max-w-[768px] lg:text-center">
          <SectionEyebrow>Bukti sebelum kesimpulan</SectionEyebrow>
          <h2 className="mt-md text-heading-2 text-foreground">
            Satu temuan harus menunjukkan seluruh jejak berpikirnya.
          </h2>
          <p className="mt-sm text-body leading-[24.8px] text-text-secondary">
            Contoh berikut menjelaskan struktur Mini Check. Isinya ilustratif dan tidak menggambarkan
            kondisi lokasi nyata.
          </p>
        </div>

        <article className="mx-auto mt-2xl max-w-[900px] overflow-hidden rounded-2xl bg-card shadow-preview">
          <header className="flex flex-col gap-sm bg-brand-teal-deep p-lg">
            <p className="flex items-center gap-xs">
              <Art src={art.examplePin} className="size-[16px]" />
              <span className="text-caption-bold text-primary">Lokasi ilustratif di Jabodetabek</span>
            </p>
            <h3 className="text-heading-4 text-white">Contoh cara Rumper menyajikan satu temuan</h3>
            <span className="w-fit rounded-full bg-semantic-warning-bg px-sm py-xxs text-caption-bold text-semantic-warning-text">
              Ilustrasi · bukan hasil lokasi nyata
            </span>
          </header>

          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="p-lg">
              <div className="flex flex-wrap items-center gap-sm">
                <span className="flex items-center gap-xxs rounded-full bg-semantic-warning-bg px-sm py-xxs text-caption-bold text-semantic-warning-text">
                  <Art src={art.badgeWarning} className="size-[14px]" />
                  Perlu validasi
                </span>
                <span className="text-caption text-text-tertiary">Kategori: Ketahanan banjir</span>
              </div>

              <h4 className="mt-md text-heading-3 text-foreground">
                Data area menunjukkan sinyal yang perlu ditelusuri sebelum mengandalkan klaim “bebas
                banjir”.
              </h4>
              <p className="mt-sm text-body leading-[24.8px] text-text-secondary">
                Ini bukan kesimpulan bahwa rumah pasti terdampak. Ketepatan data tingkat area dapat
                berbeda dari kondisi persis di titik rumah.
              </p>

              <dl className="mt-2xl grid gap-lg">
                <div>
                  <dt className="text-caption-bold text-foreground">Sumber yang dicantumkan</dt>
                  <dd className="mt-xxs text-body-sm leading-[21px] text-text-secondary">
                    Contoh sumber publik: InaRISK. Tanggal akses dan tautan sumber ditampilkan pada
                    laporan.
                  </dd>
                </div>
                <div>
                  <dt className="text-caption-bold text-foreground">Kekuatan bukti</dt>
                  <dd className="mt-xxs text-body-sm leading-[21px] text-text-secondary">
                    Data area tersedia, tetapi kondisi titik rumah masih memerlukan validasi lapangan.
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="bg-surface-feature p-lg">
              <p className="text-caption-bold text-brand-green-dark">Tindakan saat survei</p>
              <ul className="mt-md grid gap-sm">
                {[
                  "Tanyakan riwayat genangan kepada lebih dari satu warga sekitar.",
                  "Periksa elevasi akses masuk dan jejak air pada bangunan atau pagar.",
                  "Datangi lokasi saat atau setelah hujan jika memungkinkan.",
                ].map((item) => (
                  <li key={item} className="flex gap-sm">
                    <Art src={art.surveyCheck} className="mt-[2px] size-[20px]" />
                    <span className="text-body-sm leading-[21px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-md border-t border-brand-green-dark/15 pt-md text-caption leading-[18.2px] text-text-secondary">
                Rumper memisahkan bukti, interpretasi, keterbatasan, dan tindakan berikutnya agar
                ketidakpastian tidak terlihat seperti kepastian.
              </p>
            </aside>
          </div>
        </article>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section id="kategori" className="scroll-mt-[96px] bg-background px-xl py-section lg:px-2xl">
      <div className="mx-auto max-w-[1152px]">
        <div className="lg:mx-auto lg:max-w-[768px] lg:text-center">
          <SectionEyebrow>Lima kategori yang konsisten</SectionEyebrow>
          <h2 className="mt-md text-heading-2 text-foreground">
            Cakupan yang mudah dipahami dan dibandingkan.
          </h2>
          <p className="mt-sm text-body leading-[24.8px] text-text-secondary">
            Semua temuan masuk ke lima kategori yang sama. Sinyal tambahan tetap menjadi contoh di
            dalam kategori, bukan sistem penilaian baru.
          </p>
        </div>

        <div className="mt-2xl overflow-hidden rounded-2xl bg-card shadow-raised">
          <div className="grid md:grid-cols-2 lg:grid-cols-5">
            {CATEGORIES.map((item, idx) => {
              return (
                <div
                  key={item.num}
                  className={cn(
                    "grid content-start gap-sm border-border p-lg",
                    idx < CATEGORIES.length - 1 && "border-b lg:border-b-0",
                    idx > 0 && "md:border-l lg:border-l",
                    // second column on md restarts the row → drop its left border
                    "md:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(2n+1)]:border-l",
                    "lg:[&:first-child]:border-l-0",
                  )}
                >
                  <span className="flex size-[40px] items-center justify-center rounded-xl bg-surface-feature">
                    <Art src={item.icon} className="size-[20px]" />
                  </span>
                  <div>
                    <p className="text-caption text-text-tertiary">{item.num}</p>
                    <h3 className="mt-xxs text-heading-5 text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-body-sm leading-[21px] text-text-secondary">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section
      id="cara-kerja"
      className="scroll-mt-[96px] bg-brand-teal-deep px-xl py-section text-text-on-dark lg:px-2xl"
    >
      <div className="mx-auto max-w-[1152px]">
        <div className="lg:mx-auto lg:max-w-[768px] lg:text-center">
          <SectionEyebrow tone="light">Dari lokasi menuju tindakan</SectionEyebrow>
          <h2 className="mt-md text-heading-2 text-white">
            Tiga langkah, tanpa mengaburkan keterbatasan data.
          </h2>
        </div>

        <ol className="mt-2xl grid gap-xl lg:grid-cols-3">
          {STEPS.map((item) => (
            <li key={item.step}>
              <p className="text-caption-bold text-primary">{item.step}</p>
              <h3 className="mt-xs text-heading-5 text-white">{item.title}</h3>
              <p className="mt-xs text-body-sm leading-[21px] text-text-on-dark-muted">{item.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-2xl flex flex-col gap-md border-t border-white/15 pt-xl lg:flex-row lg:items-center lg:justify-between lg:gap-2xl">
          <p className="flex gap-sm">
            <Art src={art.stepsNote} className="mt-[2px] size-[20px]" />
            <span className="text-body-sm leading-[21px] text-text-on-dark-muted">
              Skor, confidence bukti, interpretasi, informasi yang hilang, dan tindakan berikutnya
              selalu disampaikan sebagai hal yang berbeda.
            </span>
          </p>
          <Link
            to="/app"
            className="flex h-[48px] shrink-0 items-center justify-center gap-xs rounded-xl bg-primary px-2xl text-body font-medium text-primary-foreground duration-150 hover:bg-brand-green-hover active:bg-brand-green-pressed"
          >
            <span>Cek lokasi rumah incaran</span>
            <Art src={art.arrowRight} className="size-[16px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function StanceSection() {
  return (
    <section id="tentang" className="scroll-mt-[96px] bg-surface-soft px-xl py-section lg:px-2xl">
      <div className="mx-auto max-w-[1152px]">
        <div className="lg:mx-auto lg:max-w-[768px] lg:text-center">
          <SectionEyebrow>Berpihak pada pembeli</SectionEyebrow>
          <h2 className="mt-md text-heading-2 text-foreground">Keputusan tetap di tangan Anda.</h2>
        </div>

        <div className="mt-2xl grid lg:grid-cols-3 lg:gap-xl">
          {STANCE.map((item, idx) => (
            <p
              key={item.body}
              className={cn(
                "flex gap-sm py-lg",
                idx === 0 && "pt-0 lg:pt-lg",
                idx < STANCE.length - 1 && "border-b border-border lg:border-b-0",
              )}
            >
              <Art src={item.icon} className="mt-[4px] size-[20px]" />
              <span className="text-body leading-[24.8px] text-text-secondary">{item.body}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-[96px] bg-background px-xl py-section lg:px-2xl">
      <div className="mx-auto max-w-[896px]">
        <h2 className="text-heading-2 text-foreground lg:text-center">Pertanyaan sebelum mulai</h2>

        <div className="mt-2xl divide-y divide-border border-y border-border">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question}>
              <summary className="flex items-center justify-between gap-md py-lg">
                <span className="text-body-medium text-foreground">{item.question}</span>
                <Art src={art.faqChevron} className="faq-chevron size-[20px]" />
              </summary>
              <p className="pb-lg text-body-sm leading-[21px] text-text-secondary">{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-2xl rounded-2xl bg-card p-xl shadow-raised lg:flex lg:items-center lg:justify-between lg:gap-2xl">
          <div>
            <h3 className="text-heading-4 text-foreground">
              Mulai dari satu lokasi yang sedang Anda pertimbangkan.
            </h3>
            <p className="mt-xs text-body-sm leading-[21px] text-text-secondary">
              Jawab beberapa pertanyaan singkat, lalu gunakan hasil awal untuk merencanakan survei
              lapangan.
            </p>
          </div>
          <Link
            to="/app"
            className="mt-lg flex h-[48px] w-fit shrink-0 items-center justify-center gap-xs rounded-xl bg-primary px-2xl text-body font-medium text-primary-foreground duration-150 hover:bg-brand-green-hover active:bg-brand-green-pressed lg:mt-0"
          >
            <span>Mulai Mini Check</span>
            <Art src={art.arrowRight} className="size-[16px]" />
          </Link>
        </div>

        <p className="mt-lg flex gap-xs">
          <Art src={art.disclaimerWarning} className="mt-[2px] size-[14px]" />
          <span className="text-caption leading-[18.2px] text-text-tertiary">
            Mini Check ini adalah opini kedua awal berdasarkan sinyal lokasi yang tersedia dan belum
            ditinjau analis. Ini bukan jaminan bahwa lokasi aman, bebas banjir, atau sesuai.
          </span>
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- footer */

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card px-md py-xl lg:px-2xl">
      <div className="mx-auto flex max-w-[1152px] flex-col gap-sm lg:flex-row lg:items-center lg:justify-between">
        <span className="flex items-center gap-xs text-caption-bold text-foreground">
          <Art src={art.footerLogo} className="size-[16px]" /> Rumper
        </span>
        <span className="text-caption text-text-tertiary">
          © {new Date().getFullYear()} Rumper. Lebih yakin sebelum bayar DP. Keputusan tetap di tangan
          Anda.
        </span>
      </div>
    </footer>
  );
}
