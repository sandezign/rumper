import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Download, Home, Map as MapIcon, Plus, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Convo } from "@/lib/api";

const BAND_DOT: Record<string, string> = {
  relatif_kuat: "bg-semantic-positive",
  layak_dengan_catatan: "bg-blue-500",
  hati_hati: "bg-amber-500",
  risiko_tinggi: "bg-semantic-danger",
};

/** Default share of the viewport given to the map on desktop (docs/14: ≥50% on wide desktop). */
const MAP_DEFAULT_RATIO = 0.55;
const MAP_MAX_RATIO = 0.7;
/** The analysis column never drops below this before the map yields space instead. */
const ANALYSIS_MIN_PX = 360;
const ASSISTANT_WIDTH_PX = 380;

const viewportWidth = () => (typeof window === "undefined" ? 1440 : window.innerWidth);

/**
 * V3 workspace shell: 72px global header + analysis · assistant · map. The map is the
 * dominant region on desktop (drag the divider to rebalance); below `lg` it becomes a
 * full-screen overlay toggled by the floating "Peta risiko" button.
 */
export default function AppShellV3({
  meta,
  analysis,
  assistant,
  assistantOpen,
  map,
  onShare,
  shareLabel = "Unduh laporan",
  sharing,
  onExpertReview,
  user,
  convos = [],
  activeId = null,
  onOpenConvo,
  onNewAudit,
}: {
  meta?: string | null;
  analysis: React.ReactNode;
  assistant?: React.ReactNode;
  assistantOpen: boolean;
  map?: React.ReactNode;
  onShare?: () => void;
  shareLabel?: string;
  sharing?: boolean;
  onExpertReview?: () => void;
  user?: { name: string; email: string; picture: string | null } | null;
  convos?: Convo[];
  activeId?: string | null;
  onOpenConvo?: (id: string) => void;
  onNewAudit?: () => void;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const [viewport, setViewport] = useState(viewportWidth);
  const [mapWidth, setMapWidth] = useState(() => Math.round(viewportWidth() * MAP_DEFAULT_RATIO));
  const [isResizing, setIsResizing] = useState(false);
  // Until the user drags the divider the map keeps tracking the viewport, so the default
  // share stays ≥50% when the window is resized.
  const userResized = useRef(false);

  useEffect(() => {
    const onResize = () => {
      setViewport(window.innerWidth);
      if (!userResized.current) setMapWidth(Math.round(window.innerWidth * MAP_DEFAULT_RATIO));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    userResized.current = true;

    const startX = mouseDownEvent.clientX;
    const startWidth = mapWidth;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      // Map sits on the right: dragging left widens it.
      const newWidth = Math.max(320, Math.min(window.innerWidth * MAP_MAX_RATIO, startWidth - deltaX));
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

  // Opening the assistant borrows space from the map before it squeezes the analysis
  // column — the report stays readable, the map stays the largest region.
  const spaceForMap = viewport - (assistantOpen ? ASSISTANT_WIDTH_PX : 0) - ANALYSIS_MIN_PX;
  const effectiveMapWidth = Math.max(320, Math.min(mapWidth, spaceForMap));

  const active = convos.find((c) => c.id === activeId);
  const activeTitle = active?.property_name || active?.title || "Audit baru";
  const showAuditMenu = !!onOpenConvo || !!onNewAudit;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* global header — dark teal */}
      <header className="z-30 flex h-[72px] shrink-0 items-center gap-md border-b border-border-dark bg-[#001e2b] px-md shadow-md">
        <Link to="/app" className="flex items-center gap-xs" aria-label="Rumper — beranda">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep shadow-sm">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="text-body-medium font-bold text-text-on-dark">Rumper</span>
        </Link>

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
              className="mr-2 cursor-pointer border border-transparent bg-[#00ed64] font-bold text-[#001e2b] shadow-sm transition-all duration-200 hover:bg-[#00b545] hover:text-white"
            >
              <Download className="size-4" aria-hidden />
              <span className="hidden sm:inline">{sharing ? "Menyiapkan…" : shareLabel}</span>
            </Button>
          )}

          {/* Active audit selector */}
          {showAuditMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="hidden h-9 min-w-0 max-w-56 cursor-pointer items-center justify-between gap-2 rounded-md border border-white/20 bg-white/5 px-3 text-sm font-medium text-text-on-dark outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring sm:flex"
                aria-label="Pilih audit aktif"
              >
                <span className="truncate">{activeTitle}</span>
                <ChevronDown className="size-4 shrink-0 text-text-on-dark-muted" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-80 w-72 overflow-y-auto border border-border bg-white shadow-raised"
              >
                <DropdownMenuLabel className="px-sm py-2 font-bold text-text-primary">Audit tersedia</DropdownMenuLabel>
                {convos.length === 0 && <p className="px-sm py-2 text-caption text-text-tertiary">Belum ada audit.</p>}
                {onOpenConvo &&
                  convos.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onSelect={() => onOpenConvo(c.id)}
                      className="flex min-h-11 cursor-pointer flex-col items-start gap-xxs border-b border-border/30 px-sm py-2.5 transition-colors last:border-0 hover:bg-surface-soft"
                    >
                      <span className="flex w-full items-center gap-xs">
                        <span className="truncate text-body-sm-medium font-semibold text-text-primary">
                          {c.property_name || c.title}
                        </span>
                        {c.id === activeId && (
                          <Check className="ml-auto size-4 shrink-0 text-brand-green-dark" aria-hidden />
                        )}
                      </span>
                      {c.rls_score != null && (
                        <span className="flex items-center gap-xs text-micro text-text-tertiary">
                          <span
                            className={`size-2.5 shrink-0 rounded-full ${(c.band && BAND_DOT[c.band]) || "bg-text-tertiary"}`}
                            aria-hidden
                          />
                          <span className="font-bold text-text-secondary">{Math.round(c.rls_score)}/100</span>
                          {c.band_label ? <span>· {c.band_label}</span> : null}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                {onNewAudit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={onNewAudit}
                      className="flex min-h-11 cursor-pointer items-center gap-xs px-sm py-2.5 font-semibold text-brand-teal-deep hover:bg-surface-soft"
                    >
                      <Plus className="size-4" aria-hidden />
                      Audit baru
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link
            to="/app/account"
            aria-label="Akun"
            title={user?.name || "Akun"}
            className="ml-xs flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-text-on-dark transition-colors hover:bg-white/20"
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
      <div className="relative flex min-h-0 flex-1">
        {/* analysis workspace */}
        <main className="min-w-0 flex-1 overflow-hidden border-r border-border bg-background">{analysis}</main>

        {/* assistant column */}
        {assistant && (
          <aside
            className={`shrink-0 overflow-hidden border-r border-border bg-card transition-all duration-300 ease-in-out ${
              assistantOpen ? "w-[380px] opacity-100" : "w-0 opacity-0"
            }`}
            aria-hidden={!assistantOpen}
          >
            <div className="h-full w-[380px]">{assistant}</div>
          </aside>
        )}

        {/* resize handle — desktop only */}
        {map && (
          <div
            onMouseDown={startResizing}
            className="group relative z-20 hidden w-[6px] shrink-0 items-center justify-center bg-border transition-all hover:w-[8px] hover:cursor-col-resize hover:bg-brand-teal-mid lg:flex"
            title="Tarik untuk mengubah ukuran peta"
            role="separator"
            aria-orientation="vertical"
          >
            <div className="h-8 w-[2px] rounded-full bg-slate-300 transition-all duration-150 group-hover:scale-y-110 group-hover:bg-white" />
          </div>
        )}

        {/* map workspace */}
        {map && (
          <aside
            style={{ width: mapOpen ? "100%" : `${effectiveMapWidth}px` }}
            className={`shrink-0 lg:static lg:z-auto lg:block ${
              // the map canvas would otherwise swallow the drag mid-resize
              isResizing ? "pointer-events-none select-none" : ""
            } ${
              mapOpen ? "fixed inset-0 z-40 w-full" : "hidden"
            }`}
          >
            {map}
          </aside>
        )}

        {/* map toggle for < lg */}
        {map && (
          <button
            onClick={() => setMapOpen((v) => !v)}
            className="fixed bottom-5 right-4 z-50 inline-flex cursor-pointer items-center gap-xs rounded-full bg-brand-teal-deep px-md py-sm text-button text-text-on-dark shadow-overlay transition-transform duration-200 active:scale-95 lg:hidden"
          >
            {mapOpen ? <X className="size-4" aria-hidden /> : <MapIcon className="size-4" aria-hidden />}
            {mapOpen ? "Tutup peta" : "Peta risiko"}
          </button>
        )}
      </div>
    </div>
  );
}
