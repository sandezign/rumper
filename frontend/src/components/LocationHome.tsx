import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUp, Home, MapPin, Sparkles } from "lucide-react";
import { placesAutocomplete } from "@/lib/api";
import { loadWizard, saveWizard } from "@/lib/wizard";
import HeaderMenu from "./HeaderMenu";

const CHIPS = [
  "Grand Galaxy City, Bekasi",
  "BSD City, Tangerang Selatan",
  "Summarecon Bekasi",
  "Cluster Bintaro Jaya, Tangerang Selatan",
];

/** Entry hero (location-home.html): collects the property, then hands off to the guided
 *  onboarding wizard. Progress topbar marks this as the start of the analysis journey. */
export default function LocationHome() {
  const navigate = useNavigate();
  const [text, setText] = useState(() => loadWizard().property ?? "");
  const area = loadWizard().area;
  const [items, setItems] = useState<{ description: string }[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (text.trim().length < 4) {
      setItems([]);
      return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      placesAutocomplete(text.trim()).then(setItems).catch(() => setItems([]));
    }, 350);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [text]);

  function start(value: string) {
    const property = value.trim();
    if (property.length < 3) return;
    saveWizard({ ...loadWizard(), property });
    navigate("/app/intake");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* progress topbar */}
      <header className="flex h-[72px] shrink-0 items-center justify-between gap-md border-b border-border px-md md:px-2xl">
        <Link to="/" className="flex items-center gap-xs" aria-label="Rumper — beranda">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="text-body-medium text-foreground">Rumper</span>
        </Link>
        <div className="flex items-center gap-md">
          <div className="hidden w-40 flex-col gap-xxs sm:flex" aria-live="polite">
            <span className="text-micro-uppercase text-text-tertiary">Mulai analisis lokasi</span>
            <div className="h-1 overflow-hidden rounded-full bg-surface-soft">
              <div className="h-full w-[12%] rounded-full bg-brand-green-dark" />
            </div>
          </div>
          <HeaderMenu />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-md py-2xl">
        <div className="w-full max-w-[40rem] text-center">
          <span className="inline-flex items-center gap-xxs text-micro-uppercase text-brand-green-dark">
            <Sparkles className="size-3.5" aria-hidden /> Due diligence properti
          </span>
          {area && (
            <p className="mt-xs text-body-small text-text-secondary">
              Koridor pilihan Anda: <strong className="text-foreground">{area}</strong>. Masukkan
              rumah yang ingin dievaluasi di area ini.
            </p>
          )}
          <h1 className="mt-sm text-heading-1 text-foreground">
            Rumahnya bagus.<br />Risikonya sudah dicek?
          </h1>
          <p className="mx-auto mt-md max-w-prose text-subtitle text-text-secondary">
            Ceritakan rumah incaran Anda — saya kumpulkan datanya, jalankan deep research
            (banjir, commute, akses, fasilitas, red flags), lalu sajikan skor + peta risiko.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(text);
            }}
            className="relative mt-2xl text-left"
          >
            {items.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 z-20 mb-xs overflow-hidden rounded-lg border border-border bg-popover text-left shadow-[var(--shadow-raised)]">
                <p className="flex items-center gap-xxs border-b border-border px-sm py-xs text-micro-uppercase text-text-tertiary">
                  <MapPin className="size-3.5" aria-hidden /> Pilih alamat (Google Maps)
                </p>
                {items.map((a) => (
                  <button
                    key={a.description}
                    type="button"
                    onClick={() => start(a.description)}
                    className="block w-full truncate px-sm py-xs text-left text-caption text-text-secondary hover:bg-surface-soft"
                  >
                    {a.description}
                  </button>
                ))}
              </div>
            )}
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nama klaster, alamat, atau link listing rumah incaran…"
              aria-label="Lokasi rumah incaran"
              className="min-h-12 w-full rounded-md border border-border-strong bg-background py-sm pl-md pr-14 text-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={text.trim().length < 3}
              className="absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-30 enabled:hover:bg-brand-green-hover"
              aria-label="Mulai onboarding"
            >
              <ArrowUp className="size-5" aria-hidden />
            </button>
          </form>

          <div className="mt-md flex flex-wrap justify-center gap-xs">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => start(c)}
                className="rounded-full border border-border-strong bg-card px-sm py-xs text-caption text-text-secondary hover:border-brand-green-dark hover:text-brand-green-dark"
              >
                {c}
              </button>
            ))}
          </div>

          <p className="mt-3xl text-caption text-text-tertiary">
            Didukung data InaRISK BNPB, OpenStreetMap warehouse, elevasi & rute real-time —
            bukan sekadar jawaban chatbot.
          </p>
        </div>
      </main>
    </div>
  );
}
