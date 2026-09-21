import { Link, useLocation } from "react-router-dom";
import { Home, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Catch-all 404 for unknown routes (registered as `path="*"` in main.tsx). Calm,
 *  evidence-led tone per the design guidelines — border-driven card, deep-teal brand
 *  mark, monospace only for the technical bits (status code + attempted path). */
export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* brand */}
      <header className="px-md py-lg md:px-2xl">
        <Link to="/" className="inline-flex items-center gap-xs" aria-label="Rumper — beranda">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="text-body-medium text-foreground">Rumper</span>
        </Link>
      </header>

      {/* centered card */}
      <main className="flex flex-1 items-center justify-center px-md py-2xl">
        <div className="w-full max-w-[34rem] rounded-2xl border border-border bg-card p-2xl text-center shadow-[var(--shadow-preview)]">
          <div className="mx-auto grid size-16 place-items-center rounded-xl bg-brand-teal-deep text-primary">
            <MapPinOff className="size-7" aria-hidden />
          </div>

          <p className="mt-lg inline-block rounded-full border border-border bg-surface-soft px-sm py-xxs font-mono text-caption text-text-tertiary">
            404
          </p>
          <h1 className="mt-md text-heading-3 text-foreground">Halaman tidak ditemukan.</h1>
          <p className="mx-auto mt-xs max-w-prose text-body-sm text-text-secondary">
            Alamat yang Anda buka tidak ada atau sudah dipindahkan. Periksa kembali tautannya,
            atau kembali ke beranda untuk memulai Mini Check.
          </p>

          <p
            className="mx-auto mt-md max-w-full truncate rounded-md border border-border bg-surface-soft px-sm py-xs font-mono text-caption text-text-tertiary"
            title={pathname}
          >
            {pathname}
          </p>

          <div className="mt-xl flex flex-col items-center justify-center gap-sm sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link to="/">Kembali ke beranda</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link to="/app">Buka aplikasi</Link>
            </Button>
          </div>
        </div>
      </main>

      <p className="px-md pb-xl text-center text-micro text-text-tertiary">
        Independen di sisi pembeli · Bukan marketplace properti · Bukan jaminan
      </p>
    </div>
  );
}
