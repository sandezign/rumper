import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Map as MapIcon, Menu, Share2, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Three-region workspace shell (docs/16): 72px global header + assistant rail · analysis ·
 * map. Desktop = flex row with independent region scroll; mobile = analysis with a rail
 * drawer and a full-screen map overlay. The shell is purely presentational.
 */
export default function AppShell({
  meta,
  rail,
  analysis,
  map,
  railOpen,
  onRailOpenChange,
  onExpertReview,
  onShare,
  shareLabel = "Bagikan",
  sharing,
  user,
}: {
  meta?: string | null;
  rail: React.ReactNode;
  analysis: React.ReactNode;
  map?: React.ReactNode;
  railOpen: boolean;
  onRailOpenChange: (open: boolean) => void;
  onExpertReview?: () => void;
  onShare?: () => void;
  shareLabel?: string;
  sharing?: boolean;
  user?: { name: string; email: string; picture: string | null } | null;
}) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* global header — dark teal (follows dashboard.html .app-header) */}
      <header className="flex h-[72px] shrink-0 items-center gap-md border-b border-border-dark bg-brand-teal-deep px-md">
        <button
          onClick={() => onRailOpenChange(!railOpen)}
          className="flex size-9 items-center justify-center rounded-md text-text-on-dark-muted hover:bg-white/10 md:hidden"
          aria-label="Buka asisten"
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <Link to="/app" className="flex items-center gap-xs" aria-label="Rumper — beranda">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="text-body-medium text-text-on-dark">Rumper</span>
        </Link>
        <p className="hidden flex-1 truncate text-center text-caption text-text-on-dark-muted lg:block">{meta}</p>
        <nav className="ml-auto flex items-center gap-xs" aria-label="Aksi laporan">
          {onExpertReview && (
            <Button variant="outlineOnDark" size="sm" onClick={onExpertReview}>
              <UserCheck className="size-4" aria-hidden />
              <span className="hidden sm:inline">Tinjau analis</span>
            </Button>
          )}
          {onShare && (
            <Button variant="primary" size="sm" onClick={onShare} disabled={sharing}>
              <Share2 className="size-4" aria-hidden />
              <span className="hidden sm:inline">{sharing ? "Menyiapkan…" : shareLabel}</span>
            </Button>
          )}
          <Link
            to="/app/account"
            aria-label="Akun"
            title={user?.name || "Akun"}
            className="ml-xs flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-text-on-dark hover:bg-white/20"
          >
            {user?.picture ? (
              <img src={user.picture} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-caption-bold">{(user?.name || user?.email || "?")[0]?.toUpperCase()}</span>
            )}
          </Link>
        </nav>
      </header>

      {/* workspace */}
      <div className="flex min-h-0 flex-1">
        {/* assistant rail — drawer on mobile, column on desktop */}
        {railOpen && (
          <div className="fixed inset-0 z-40 bg-[var(--surface-scrim)] md:hidden" onClick={() => onRailOpenChange(false)} />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] max-w-[88vw] border-r border-border bg-card transition-transform md:static md:z-auto md:translate-x-0 ${
            railOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {rail}
        </aside>

        {/* analysis workspace */}
        <main className="min-w-0 flex-1 overflow-hidden border-r border-border bg-background">{analysis}</main>

        {/* map workspace — static right column only on wide desktop (≥lg); below that it's a
            full-screen overlay toggled by the "Peta risiko" button (avoids cramped 3 columns) */}
        {map && (
          <aside
            className={`shrink-0 lg:static lg:z-auto lg:block lg:w-[var(--map-panel-width)] ${
              mapOpen ? "fixed inset-0 z-40 w-full" : "hidden"
            }`}
          >
            {map}
          </aside>
        )}

        {/* map toggle — shown below lg (tablet + mobile) */}
        {map && (
          <button
            onClick={() => setMapOpen((v) => !v)}
            className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-xs rounded-full bg-brand-teal-deep px-md py-sm text-button text-text-on-dark shadow-[var(--shadow-overlay)] lg:hidden"
          >
            {mapOpen ? <X className="size-4" aria-hidden /> : <MapIcon className="size-4" aria-hidden />}
            {mapOpen ? "Tutup peta" : "Peta risiko"}
          </button>
        )}
      </div>
    </div>
  );
}
