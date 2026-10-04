import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, MapPin, RefreshCw, User as UserIcon } from "lucide-react";
import { listConversations, me, type Convo, type User } from "@/lib/api";
import PropertySwitcherModal from "./PropertySwitcherModal";
import { useEntitlement } from "@/lib/entitlements";

/** Dark app bar for the post-login journey (areas hub, workspace).
 *
 *  Quota: the plan badge and remaining-locations counter are the *user-facing* meter from
 *  docs/18 §7.1. There is no location-quota endpoint yet (GAP-11), so the count is derived
 *  from how many audits this user already has — honest and already true — rather than from
 *  an invented entitlement. It moves to `GET /api/entitlements` when that lands. */

/** Two variants, because the two pages are at different points in the journey:
 *
 *  "areas"     — curation hub. The buyer has not picked a property yet, so a location
 *                switcher would have nothing meaningful to switch between; the right side
 *                offers the way *forward* into the workspace instead.
 *  "workspace" — a property is open, so the switcher and "Profil Kamu" (back to curation)
 *                are the controls that matter. */
export default function JourneyHeader({
  variant = "workspace", onUpgrade, onZeroQuota, onRecurate,
}: {
  variant?: "areas" | "workspace";
  onUpgrade?: () => void;
  /** Free trial exhausted — the interception modal, not the generic tier chooser. */
  onZeroQuota?: () => void;
  onRecurate?: () => void;
} = {}) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { threadId } = useParams();

  useEffect(() => {
    me().then(setUser).catch(() => setUser(null));
    listConversations().then(setConvos).catch(() => setConvos([]));
  }, []);

  const { pass, locationLimit } = useEntitlement();
  const analysed = convos.filter((c) => c.intake_id);
  const current = analysed.find((c) => c.id === threadId);
  const used = analysed.length;
  const remaining = Math.max(0, locationLimit - used);
  const latest = analysed[0];
  const full = remaining === 0;

  const quotaChip = (
    <span className={`hidden h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold leading-none ${
      variant === "areas" ? "sm:inline-flex" : "lg:inline-flex"
    } border-emerald-500/40 bg-emerald-500/10 text-[#00ED64]`}>
      <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#00ED64]" />
      {full ? `Kuota penuh (${used}/${locationLimit})` : `${remaining} lokasi tersisa`}
    </span>
  );

  const avatarGlyph = user?.picture ? (
    <img src={user.picture} alt="" className="size-8 object-cover" />
  ) : (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 10.8333C12.3012 10.8333 14.1667 8.96785 14.1667 6.66667C14.1667 4.36548 12.3012 2.5 10 2.5C7.69881 2.5 5.83333 4.36548 5.83333 6.66667C5.83333 8.96785 7.69881 10.8333 10 10.8333Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
      <path d="M16.6666 17.5007C16.6666 15.7325 15.9642 14.0368 14.714 12.7866C13.4637 11.5364 11.768 10.834 9.99992 10.834C8.23181 10.834 6.53612 11.5364 5.28587 12.7866C4.03563 14.0368 3.33325 15.7325 3.33325 17.5007" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </svg>
  );

  const avatarClass =
    "size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white cursor-pointer";

  /* On the curation hub the avatar is a menu, because re-running curation belongs with the
     profile that drives it — the corridor set is a function of the buyer's priorities. */
  const avatar =
    variant === "areas" ? (
      <div className="relative shrink-0">
        <button type="button" aria-label="Profil" aria-haspopup="menu" aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex ${avatarClass}`}>
          {avatarGlyph}
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
            <div role="menu"
                 className="absolute right-0 top-10 z-50 w-[236px] overflow-hidden rounded-2xl border border-[#E1E5E8] bg-white p-1.5 shadow-2xl">
              <button role="menuitem" type="button"
                      onClick={() => { setMenuOpen(false); navigate("/app/account"); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#001E2B] transition-colors hover:bg-[#F4F7F6] cursor-pointer">
                <UserIcon size={14} className="shrink-0 text-[#5C6C7A]" />
                Profil Saya
              </button>
              <button role="menuitem" type="button"
                      onClick={() => { setMenuOpen(false); onRecurate?.(); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#001E2B] transition-colors hover:bg-[#F4F7F6] cursor-pointer">
                <RefreshCw size={14} className="shrink-0 text-[#5C6C7A]" />
                <span className="flex-1">Re-kurasi wilayah</span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  Pro
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    ) : (
      <Link to="/app/account" aria-label="Profil" className={`flex ${avatarClass}`}>
        {avatarGlyph}
      </Link>
    );

  return (
    <header className="shrink-0 bg-[#001E2B] text-white border-b border-white/20 px-4 sm:px-5 py-2 min-h-[52px] flex items-center justify-between gap-3 shadow-sm z-30">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link to="/app" className="flex items-center gap-2" aria-label="Rumper — beranda">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#001E2B]" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15.0515 3.50391H15.0457L15.0964 3.51953C15.1082 3.52428 15.1192 3.52992 15.1297 3.53613L15.2 3.59082L15.5066 3.85254L15.5115 3.85742L15.5173 3.8623C18.2257 6.10888 21.6488 7.31502 25.1687 7.26367H25.1824L25.6111 7.25098H25.6277C25.6841 7.24842 25.7399 7.26413 25.7859 7.29688C25.8328 7.33035 25.8653 7.37786 25.8806 7.42969C26.4577 9.39036 26.6346 11.4474 26.4002 13.4775C26.1657 15.5077 25.5252 17.4709 24.5164 19.249C23.5076 21.0269 22.1498 22.5847 20.5261 23.8291C18.9026 25.0732 17.045 25.979 15.0642 26.4922C15.023 26.5028 14.979 26.503 14.9373 26.4922C12.9562 25.9791 11.098 25.0732 9.47438 23.8291C7.85076 22.5849 6.49416 21.0263 5.48512 19.248C4.47617 17.4699 3.83483 15.5075 3.60036 13.4775C3.36592 11.4474 3.5428 9.39042 4.11989 7.42969C4.13523 7.3778 4.16773 7.33032 4.21461 7.29688C4.26065 7.26408 4.31647 7.24842 4.37282 7.25098C8.04755 7.41871 11.6533 6.20992 14.4832 3.8623L14.489 3.85742L14.4949 3.85156L14.8054 3.58496L14.867 3.53711C14.8787 3.52979 14.8907 3.52431 14.9021 3.51953L14.95 3.50488C14.9518 3.50455 14.9538 3.50422 14.9558 3.50391L14.9998 3.50098L15.0515 3.50391Z" stroke="#00ED64" strokeWidth="2" />
              <path d="M19.2424 9.80155C20.344 10.9307 20.974 12.4547 20.9992 14.0514C21.0245 15.648 20.443 17.1922 19.3778 18.3573L19.2424 18.5009L16.4138 21.3999C16.0549 21.7677 15.5731 21.9818 15.066 21.9989C14.5588 22.016 14.0643 21.8349 13.6826 21.4922L13.5866 21.3999L10.7573 18.5002C9.63213 17.3467 9 15.7822 9 14.1509C9 12.5196 9.63213 10.9551 10.7573 9.80155C11.8825 8.64804 13.4086 8 14.9999 8C16.5911 8 18.1172 8.64804 19.2424 9.80155ZM14.9999 12.1006C14.7372 12.1006 14.4772 12.1536 14.2345 12.2567C13.9919 12.3597 13.7714 12.5107 13.5857 12.7011C13.4 12.8915 13.2527 13.1175 13.1522 13.3663C13.0517 13.615 12.9999 13.8816 12.9999 14.1509C12.9999 14.4201 13.0517 14.6867 13.1522 14.9355C13.2527 15.1842 13.4 15.4102 13.5857 15.6006C13.7714 15.791 13.9919 15.942 14.2345 16.0451C14.4772 16.1481 14.7372 16.2011 14.9999 16.2011C15.5303 16.2011 16.039 15.9851 16.4141 15.6006C16.7891 15.2161 16.9998 14.6946 16.9998 14.1509C16.9998 13.6071 16.7891 13.0856 16.4141 12.7011C16.039 12.3166 15.5303 12.1006 14.9999 12.1006Z" fill="#5085FF" />
            </svg>
          </span>
          <span className="whitespace-nowrap text-lg font-bold leading-tight text-white">Rumper</span>
        </Link>
        <button
          type="button"
          onClick={() => (onUpgrade ? onUpgrade() : navigate("/app/account"))}
          className="flex h-8 shrink-0 items-center rounded-full border border-[rgba(1,237,100,0.5)] bg-[rgba(1,237,100,0.1)] px-3 text-xs font-semibold leading-none text-[#00ED64] transition-colors hover:bg-[rgba(1,237,100,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00ED64] cursor-pointer"
        >
          {pass ? "Premium" : "Free Trial"}
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {variant === "areas" ? (
          <>
            {/* Curation hub: the forward action is entering the workspace for the property
                most recently analysed. With nothing analysed yet there is nowhere to go, so
                the button is omitted rather than rendered dead. */}
            {latest && (
              <button
                type="button"
                onClick={() => navigate(`/app/c/${latest.id}`)}
                aria-label="Lanjut ke Workspace"
                className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 text-white transition-colors hover:border-white/30 hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
              >
                <MapPin size={16} className="shrink-0" stroke="#00ED64" />
                <span className="hidden text-xs font-semibold leading-none text-white sm:inline">
                  Lanjut ke Workspace
                </span>
                <ChevronRight size={14} className="shrink-0" stroke="#A8B3BC" />
              </button>
            )}
            {quotaChip}
            {avatar}
          </>
        ) : (
          <>
            {/* Location switcher opens the full property modal (not a bare dropdown), so the
                quota state and each property's verdict are visible at the moment of choosing. */}
            <button
              type="button"
              onClick={() => (analysed.length ? setSwitcherOpen(true) : navigate("/app/areas"))}
              aria-haspopup="dialog"
              aria-expanded={switcherOpen}
              aria-label={current ? `Pilih lokasi: ${current.title}` : "Pilih lokasi"}
              className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 text-white transition-colors hover:border-white/30 hover:bg-white/10 active:scale-[0.98] cursor-pointer"
            >
              <MapPin size={15} className="shrink-0" stroke="#00ED64" />
              <span className="hidden max-w-[200px] truncate text-xs font-semibold leading-none text-white sm:block md:max-w-[260px] lg:max-w-[320px]">
                {current?.title ?? "Pilih lokasi"}
              </span>
              <ChevronDown size={14} className="shrink-0" stroke="#A8B3BC" />
            </button>

            {/* The profile drives the corridor set, so editing it returns the buyer to
                curation rather than to a settings page. */}
            <button
              type="button"
              onClick={() => (onRecurate ? onRecurate() : navigate("/app/areas"))}
              aria-label="Ubah parameter prioritas dan lokasi pencarian"
              title="Ubah parameter prioritas dan lokasi pencarian"
              className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 text-xs font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
            >
              <MapPin size={14} className="shrink-0 text-[#00ED64]" />
              <span>Ubah Lokasi</span>
            </button>

            {quotaChip}
            {avatar}
          </>
        )}
      </div>

      <PropertySwitcherModal
        open={switcherOpen}
        items={analysed}
        activeId={threadId}
        limit={locationLimit}
        onClose={() => setSwitcherOpen(false)}
        onSelect={(id) => navigate(`/app/c/${id}`)}
        onExploreAreas={() => navigate("/app/areas")}
        onUpgrade={() =>
          onZeroQuota ? onZeroQuota() : onUpgrade ? onUpgrade() : navigate("/app/account")
        }
      />
    </header>
  );
}
