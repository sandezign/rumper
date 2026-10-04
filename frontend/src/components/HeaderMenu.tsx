import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listConversations, logout, me } from "@/lib/api";
import type { Convo, User } from "@/lib/api";

const BAND_DOT: Record<string, string> = {
  relatif_kuat: "bg-semantic-positive",
  layak_dengan_catatan: "bg-brand-teal",
  hati_hati: "bg-semantic-warning",
  risiko_tinggi: "bg-semantic-danger",
};

/** Header account menu — jump back to a recent audit, open the account page, or log out.
 *  Lives on the entry/onboarding screens where there's otherwise no way back to a report. */
export default function HeaderMenu({ onDark }: { onDark?: boolean }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [convos, setConvos] = useState<Convo[]>([]);

  useEffect(() => {
    me()
      .then(async (u) => {
        setUser(u);
        setConvos(await listConversations().catch(() => []));
      })
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className={`text-body-sm-medium ${onDark ? "text-text-on-dark" : "text-brand-green-dark"}`}
      >
        Masuk
      </Link>
    );
  }

  const avatar = user.picture ? (
    <img src={user.picture} alt="" referrerPolicy="no-referrer" className="size-full rounded-full object-cover" />
  ) : (
    <span className="text-caption-bold">{(user.name || user.email)[0]?.toUpperCase()}</span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu akun"
        className={`flex items-center gap-xs rounded-full p-0.5 pr-xs outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          onDark ? "border border-white/20 bg-white/10 text-text-on-dark" : "border border-border bg-card text-foreground"
        }`}
      >
        <span className="flex size-8 items-center justify-center overflow-hidden rounded-full">{avatar}</span>
        <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-sm py-xs">
          <p className="truncate text-body-sm-medium text-foreground">{user.name || user.email}</p>
          {user.name && <p className="truncate text-caption text-text-tertiary">{user.email}</p>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Audit terbaru</DropdownMenuLabel>
        {convos.length === 0 ? (
          <p className="px-sm py-xs text-caption text-text-tertiary">Belum ada audit.</p>
        ) : (
          convos.slice(0, 5).map((c) => (
            <DropdownMenuItem
              key={c.id}
              onSelect={() => navigate(`/app/c/${c.id}`)}
              className="flex-col items-start gap-xxs"
            >
              <span className="flex w-full items-center gap-xs">
                <span className={`size-2 shrink-0 rounded-full ${(c.band && BAND_DOT[c.band]) || "bg-text-tertiary"}`} aria-hidden />
                <span className="truncate text-body-sm-medium text-foreground">{c.property_name || c.title}</span>
              </span>
              {(c.rls_score != null || c.review_state) && (
                <span className="truncate pl-4 text-micro text-text-tertiary">
                  {c.rls_score != null ? `${Math.round(c.rls_score)}/100 · ` : ""}
                  {c.review_state}
                </span>
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/app/account")}>
          <UserRound className="size-4 text-text-tertiary" aria-hidden /> Akun &amp; penggunaan
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            void logout().finally(() => navigate("/"));
          }}
        >
          <LogOut className="size-4 text-text-tertiary" aria-hidden /> Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
