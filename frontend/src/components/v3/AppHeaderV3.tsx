import { Link } from "react-router-dom";
import { Check, ChevronDown, Download, Home, Menu, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Convo, User } from "@/lib/api";

const BAND_DOT: Record<string, string> = {
  relatif_kuat: "bg-semantic-positive",
  layak_dengan_catatan: "bg-blue-500",
  hati_hati: "bg-amber-500",
  risiko_tinggi: "bg-semantic-danger",
};

/**
 * AppHeaderV3 — global dark header for the redesigned workspace.
 * New vs V2: the Active Audit (property) selector moves from the assistant rail
 * into the header as a white pill dropdown, per the Figma redesign.
 */
export default function AppHeaderV3({
  meta,
  convos,
  activeId,
  user,
  onOpenConvo,
  onExpertReview,
  onShare,
  shareLabel = "Unduh laporan",
  sharing,
  onMenu,
}: {
  meta?: string | null;
  convos: Convo[];
  activeId: string | null;
  user?: User | null;
  onOpenConvo: (id: string) => void;
  onExpertReview?: () => void;
  onShare?: () => void;
  shareLabel?: string;
  sharing?: boolean;
  onMenu?: () => void;
}) {
  const active = convos.find((c) => c.id === activeId);
  const activeTitle = active?.property_name || active?.title || "Audit baru";

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-md border-b border-border-dark bg-[#001e2b] px-md z-30 shadow-md">
      {onMenu && (
        <button
          onClick={onMenu}
          className="flex size-9 items-center justify-center rounded-md text-text-on-dark-muted hover:bg-white/10 md:hidden cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      )}
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
          <Button variant="outlineOnDark" size="sm" onClick={onExpertReview} className="cursor-pointer rounded-full">
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
            className="rounded-full bg-[#00ed64] hover:bg-[#00b545] text-[#001e2b] hover:text-white font-bold cursor-pointer transition-all duration-200 border border-transparent shadow-sm"
          >
            <Download className="size-4" aria-hidden />
            <span className="hidden sm:inline">{sharing ? "Menyiapkan…" : shareLabel}</span>
          </Button>
        )}

        {/* Active Audit selector — white pill dropdown (moved here from the rail) */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="hidden md:flex h-10 min-w-0 max-w-56 items-center justify-between gap-xs rounded-full bg-white px-md text-body-sm-medium font-semibold text-text-primary shadow-sm outline-none hover:bg-slate-50 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Pilih audit aktif"
          >
            <span className="truncate">{activeTitle}</span>
            <ChevronDown className="size-4 shrink-0 text-text-tertiary" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-80 w-72 overflow-y-auto shadow-raised border border-border bg-white"
          >
            <DropdownMenuLabel className="font-bold text-text-primary px-sm py-2">Audit tersedia</DropdownMenuLabel>
            {convos.length === 0 && <p className="px-sm py-2 text-caption text-text-tertiary">Belum ada audit.</p>}
            {convos.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onSelect={() => onOpenConvo(c.id)}
                className="flex flex-col items-start gap-xxs py-2.5 px-sm hover:bg-surface-soft cursor-pointer transition-colors border-b border-border/30 last:border-0 min-h-11"
              >
                <span className="flex w-full items-center gap-xs">
                  <span className="truncate text-body-sm-medium font-semibold text-text-primary">
                    {c.property_name || c.title}
                  </span>
                  {c.id === activeId && <Check className="ml-auto size-4 shrink-0 text-brand-green-dark" aria-hidden />}
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
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          to="/app/account"
          aria-label="Akun"
          title={user?.name || "Akun"}
          className="ml-xs flex size-9 items-center justify-center overflow-hidden rounded-full border border-[#00ed64]/60 bg-white/10 text-text-on-dark hover:bg-white/20 transition-colors"
        >
          {user?.picture ? (
            <img src={user.picture} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-caption-bold">{(user?.name || user?.email || "?")[0]?.toUpperCase()}</span>
          )}
        </Link>
      </nav>
    </header>
  );
}
