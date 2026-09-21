import { useCallback, useState, type ReactNode } from "react";
import InAppCheckoutModal from "./InAppCheckoutModal";
import UpgradeDrawer from "./UpgradeDrawer";
import ZeroQuotaModal from "./ZeroQuotaModal";
import type { PricingTierKey } from "@/lib/entitlements";

const INTEREST_KEY = "rumper.upgrade_interest.v1";

/** Until a payment provider exists (docs/18 GAP-12) the only thing a checkout can honestly
 *  do is record that the buyer wanted this pass. Kept client-side; this function is the seam
 *  for `POST /api/entitlements/interest` when that lands. */
function recordInterest(tier: PricingTierKey) {
  try {
    const prev = JSON.parse(localStorage.getItem(INTEREST_KEY) ?? "[]") as unknown[];
    localStorage.setItem(
      INTEREST_KEY,
      JSON.stringify([...prev, { tier, at: new Date().toISOString() }].slice(-20)),
    );
  } catch {
    /* storage unavailable — nothing else depends on this */
  }
}

export interface Commerce {
  /** Open the tier chooser, optionally pre-selecting a pass. */
  openUpgrade: (tier?: PricingTierKey) => void;
  /** Open the zero-quota interception instead of the chooser (free trial exhausted). */
  openZeroQuota: () => void;
  /** Render once per screen — the drawer, checkout and interception share one state. */
  modals: ReactNode;
}

/** The commerce trio (upgrade drawer → checkout → zero-quota interception) as one hook, so
 *  the workspace, the areas hub and the account hub all open the same flow from a single
 *  line instead of each re-declaring three pieces of state. */
export function useCommerce({
  propertyName, auditedCount = 0, onOpenArchive, onUnlocked,
}: {
  propertyName?: string;
  auditedCount?: number;
  onOpenArchive?: () => void;
  onUnlocked?: (tier: PricingTierKey) => void;
} = {}): Commerce {
  const [tier, setTier] = useState<PricingTierKey>("bundle");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [zeroQuotaOpen, setZeroQuotaOpen] = useState(false);

  const openUpgrade = useCallback((t?: PricingTierKey) => {
    if (t) setTier(t);
    setUpgradeOpen(true);
  }, []);

  const openZeroQuota = useCallback(() => setZeroQuotaOpen(true), []);

  const modals = (
    <>
      <UpgradeDrawer
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onProceed={(t) => { setTier(t); setCheckoutOpen(true); }}
        propertyName={propertyName}
        initialTier={tier}
      />
      <InAppCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        tier={tier}
        propertyName={propertyName}
        onPaid={(t) => onUnlocked?.(t)}
        onInterest={recordInterest}
      />
      <ZeroQuotaModal
        open={zeroQuotaOpen}
        onClose={() => setZeroQuotaOpen(false)}
        onSelectTier={(t) => { setTier(t); setCheckoutOpen(true); }}
        onOpenArchive={onOpenArchive}
        auditedCount={auditedCount}
      />
    </>
  );

  return { openUpgrade, openZeroQuota, modals };
}
