import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import GoogleSignInButton from "./GoogleSignInButton";
import type { User } from "@/lib/api";

const COPY = {
  login: {
    eyebrow: "Selamat datang kembali",
    title: "Masuk dan lanjutkan cek lokasi Anda.",
    lead: "Kembali ke alur Mini Check risiko lokasi rumah incaran Anda.",
    proof: [
      ["Lanjut dengan aman", "Alur buyer-first yang sama."],
      ["Tanpa simpan kata sandi", "Masuk dengan akun Google."],
      ["Hasil awal", "Rumper tidak menjamin keamanan lokasi."],
    ],
    formLabel: "Masuk",
    formTitle: "Lanjutkan dari terakhir.",
    switch: ["Belum punya akun?", "Buat akun gratis", "/register"],
    navCta: ["Buat akun", "/register"],
  },
  register: {
    eyebrow: "Mini Check gratis",
    title: "Buat akun gratis untuk lanjut.",
    lead: "Satu langkah singkat untuk masuk ke alur Mini Check risiko lokasi Rumper.",
    proof: [
      ["Satu pindai gratis", "Lanjut ke Mini Check pertama."],
      ["Berbasis bukti", "Skor, kepercayaan, risiko, langkah."],
      ["Data Anda aman", "Tidak dibagikan ke agen/penjual."],
    ],
    formLabel: "Buat akun",
    formTitle: "Mulai dengan akun Google.",
    switch: ["Sudah punya akun?", "Masuk", "/login"],
    navCta: ["Masuk", "/login"],
  },
} as const;

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const c = COPY[mode];

  function onLogin(_u: User) {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/app", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* nav */}
      <header className="flex h-[72px] shrink-0 items-center justify-between gap-md px-md md:px-2xl">
        <Link to="/" className="flex items-center gap-xs" aria-label="Rumper — beranda">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="text-body-medium text-foreground">Rumper</span>
        </Link>
        <Button asChild variant="secondary" size="sm">
          <Link to={c.navCta[1]}>{c.navCta[0]}</Link>
        </Button>
      </header>

      {/* auth-shell: one card, value panel + form panel */}
      <main className="flex min-h-0 flex-1 items-stretch px-md pb-2xl md:px-2xl">
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-overlay)] lg:grid-cols-[0.95fr_1.05fr]">
          {/* value panel (deep teal) */}
          <section className="flex flex-col justify-between gap-2xl bg-brand-teal-deep p-2xl text-text-on-dark md:p-3xl">
            <div>
              <span className="text-micro-uppercase text-primary">{c.eyebrow}</span>
              <h1 className="mt-md text-heading-1 text-text-on-dark">{c.title}</h1>
              <p className="mt-md max-w-prose text-subtitle text-text-on-dark-muted">{c.lead}</p>
            </div>
            <ul className="flex flex-col gap-sm">
              {c.proof.map(([t, d]) => (
                <li key={t} className="rounded-xl border border-white/15 bg-white/[0.07] p-md backdrop-blur">
                  <p className="text-body-sm-medium text-text-on-dark">{t}</p>
                  <p className="mt-xxs text-caption text-text-on-dark-muted">{d}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* form panel (white) */}
          <section className="flex flex-col justify-center bg-card p-2xl md:p-3xl">
            <div className="mx-auto w-full max-w-[34rem]">
              <span className="text-micro-uppercase text-brand-green-dark">{c.formLabel}</span>
              <h2 className="mt-xxs text-heading-3 text-foreground">{c.formTitle}</h2>
              <p className="mt-sm text-body-sm text-text-secondary">
                Otentikasi memakai akun Google.{mode === "register" && " Kolom di bawah opsional, disimpan untuk pengembangan ke depan."}
              </p>

              <div className="mt-xl">
                <GoogleSignInButton onLogin={onLogin} />
              </div>

              {mode === "register" && (
                <div className="mt-xl flex flex-col gap-md">
                  <div className="flex flex-col gap-xxs">
                    <Label htmlFor="full_name">Nama lengkap (opsional)</Label>
                    <Input id="full_name" name="full_name" autoComplete="name" placeholder="Nama Anda" />
                  </div>
                  <div className="flex flex-col gap-xxs">
                    <Label htmlFor="email">Email (opsional)</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" />
                  </div>
                </div>
              )}

              <p className="mt-xl text-body-sm text-text-secondary">
                {c.switch[0]}{" "}
                <Link to={c.switch[2]} className="font-semibold text-brand-green-dark underline underline-offset-2">
                  {c.switch[1]}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
