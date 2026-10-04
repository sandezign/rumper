import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Map as MapIcon, Menu, Download, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * AppShellV2 implements the refactored global header styling, including:
 * - Expert Review ("Tinjau analis") styled as variant="outlineOnDark"
 * - Download Report ("Unduh laporan") button with solid Brand-green bg, white text, and a Download icon.
 * - Center-aligned property date meta text.
 */
export default function AppShellV2({
  meta,
  rail,
  analysis,
  map,
  railOpen,
  onRailOpenChange,
  onExpertReview,
  onShare,
  shareLabel = "Unduh laporan",
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
  const [mapWidth, setMapWidth] = useState(450); // Default map width
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);

    const startX = mouseDownEvent.clientX;
    const startWidth = mapWidth;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      // Map is on the right, so dragging left increases width.
      // Constraint: Min 320px, Max 65% of screen width.
      const newWidth = Math.max(320, Math.min(window.innerWidth * 0.65, startWidth - deltaX));
      setMapWidth(newWidth);
    };

    const stopDrag = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* global header — dark teal bg-brand-teal-deep */}
      <header className="flex h-[72px] shrink-0 items-center gap-md border-b border-border-dark bg-[#001e2b] px-md z-30 shadow-md">
        <button
          onClick={() => onRailOpenChange(!railOpen)}
          className="flex size-9 items-center justify-center rounded-md text-text-on-dark-muted hover:bg-white/10 md:hidden cursor-pointer"
          aria-label="Buka asisten"
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <Link to="/app" className="flex items-center gap-xs" aria-label="Rumper — beranda">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep shadow-sm">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="text-body-medium font-bold text-text-on-dark">Rumper</span>
        </Link>
        
        {/* Context Meta date string */}
        <p className="hidden flex-1 truncate text-center text-caption font-medium text-text-on-dark-muted lg:block">
          {meta}
        </p>

        <nav className="ml-auto flex items-center gap-xs" aria-label="Aksi laporan">
          {onExpertReview && (
            <Button variant="outlineOnDark" size="sm" onClick={onExpertReview} className="cursor-pointer">
              <UserCheck className="size-4" aria-hidden />
              <span className="hidden sm:inline">Tinjau analis</span>
            </Button>
          )}
          {onShare && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onShare} 
              disabled={sharing} 
              className="bg-[#00ed64] hover:bg-[#00b545] text-[#001e2b] hover:text-white font-bold cursor-pointer transition-all duration-200 border border-transparent shadow-sm"
            >
              <Download className="size-4" aria-hidden />
              <span className="hidden sm:inline">{sharing ? "Menyiapkan…" : shareLabel}</span>
            </Button>
          )}
          <Link
            to="/app/account"
            aria-label="Akun"
            title={user?.name || "Akun"}
            className="ml-xs flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-text-on-dark hover:bg-white/20 transition-colors"
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
        {/* assistant rail */}
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

        {/* resize handle divider — shown only on desktop layout */}
        {map && (
          <div
            onMouseDown={startResizing}
            className="hidden lg:flex w-[6px] hover:w-[8px] bg-border hover:bg-brand-teal-mid hover:cursor-col-resize shrink-0 transition-all z-25 relative justify-center items-center group"
            title="Tarik untuk mengubah ukuran peta"
          >
            <div className="w-[2px] h-8 rounded-full bg-slate-300 group-hover:bg-white group-hover:scale-y-110 transition-all duration-150" />
          </div>
        )}

        {/* map workspace */}
        {map && (
          <aside
            style={{ width: mapOpen ? "100%" : `${mapWidth}px` }}
            className={`shrink-0 lg:static lg:z-auto lg:block ${isResizing ? "pointer-events-none select-none" : ""} ${
              mapOpen ? "fixed inset-0 z-40 w-full" : "hidden"
            }`}
          >
            {map}
          </aside>
        )}

        {/* map toggle button for responsive view (< lg) */}
        {map && (
          <button
            onClick={() => setMapOpen((v) => !v)}
            className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-xs rounded-full bg-brand-teal-deep px-md py-sm text-button text-text-on-dark shadow-overlay cursor-pointer lg:hidden transition-transform duration-200 active:scale-95"
          >
            {mapOpen ? <X className="size-4" aria-hidden /> : <MapIcon className="size-4" aria-hidden />}
            {mapOpen ? "Tutup peta" : "Peta risiko"}
          </button>
        )}
      </div>
    </div>
  );
}
