/** Single source of truth for what the current plan allows, and what the paid passes cost.
 *
 *  There is no payment provider and no entitlement endpoint yet (docs/18 GAP-11/GAP-12), so
 *  every production account is on the free trial. This module returns `false` honestly
 *  rather than pretending a subscription exists — and it is the one place to change when
 *  `GET /api/entitlements` lands, so no caller has to be hunted down.
 *
 *  The pricing catalogue (PRD-13 §4 Module 2) lives here too: the drawer, the checkout, the
 *  zero-quota interception and the account billing tab all read the same numbers, so a price
 *  can never disagree with itself across screens.
 */
import { useEffect, useSyncExternalStore } from "react";
import { getEntitlements, type Entitlements } from "./api";

export type PricingTierKey = "single" | "bundle" | "analyst";

export interface PricingTier {
  key: PricingTierKey;
  title: string;
  /** Rupiah, integral. Formatted through `formatRp` at every call site. */
  price: number;
  originalPrice: number;
  discountTag: string;
  /** One-line "what you get", shown under the title in the tier row. */
  deliverableLine: string;
  /** Longer restatement for the checkout header. */
  subtitle: string;
  features: string[];
  /** Properties this pass opens Tahap 2–5 for. */
  properties: number;
  /** Extra location quota bundled with the pass (PRD-13 §2: no standalone quota). */
  extraLocations: number;
  accent: "neutral" | "green";
}

/** Free-trial location cap (docs/18 §7.1). The same number gates the `N / 5` meter,
 *  the header chip, the property switcher and the shortlist seed. */
export const LOCATION_LIMIT = 5;

/** Ordered as the drawer presents them: the bundle is the anchor (PRD-13 §2.1 AOV lever). */
export const TIERS: readonly PricingTier[] = [
  {
    key: "bundle",
    title: "Property Shortlist Bundle",
    price: 120_000,
    originalPrice: 450_000,
    discountTag: "-73%",
    deliverableLine: "3 properti • Komparasi side-by-side",
    subtitle: "Akses 3 properti + matriks komparasi",
    features: [
      "Akses penuh 5 faktor risiko (banjir, transit, legalitas, fasilitas, lingkungan) untuk 3 properti",
      "Matriks komparasi side-by-side antar kandidat properti",
      "Rute transit komuter KRL/tol & layer banjir BNPB lengkap",
      "Ekspor PDF ringkasan due diligence seumur hidup",
      "+3 kuota kapasitas evaluasi properti baru",
    ],
    properties: 3,
    extraLocations: 3,
    accent: "green",
  },
  {
    key: "single",
    title: "Single Property Pass",
    price: 50_000,
    originalPrice: 150_000,
    discountTag: "-67%",
    deliverableLine: "1 properti aktif • 5 faktor risiko",
    subtitle: "Akses penuh Tahap 2–5 untuk 1 properti",
    features: [
      "Akses penuh 5 faktor risiko untuk 1 properti aktif",
      "Verifikasi red flag & deteksi genangan historis BNPB",
      "Rincian timeline komuter KRL, tol & arteri",
      "Checklist due diligence lapangan interaktif",
      "Direktori radius fasilitas esensial terdekat",
    ],
    properties: 1,
    extraLocations: 0,
    accent: "neutral",
  },
  {
    key: "analyst",
    title: "Expert Field Verification",
    price: 350_000,
    originalPrice: 750_000,
    discountTag: "-53%",
    deliverableLine: "Verifikasi GIS & surveyor lapangan resmi",
    subtitle: "Verifikasi GIS + laporan bersertifikat + konsultasi WhatsApp 30 menit",
    features: [
      "Seluruh fitur digital (akses 5 faktor risiko untuk 3 properti)",
      "Laporan bersertifikat & verifikasi spasial oleh surveyor",
      "Lembar rekomendasi survei fisik khusus 12 titik",
      "Garansi laporan terbit dalam 24 jam kerja",
      "30 menit sesi konsultasi privat via WhatsApp call",
    ],
    properties: 3,
    extraLocations: 3,
    accent: "green",
  },
] as const;

export function tierOf(key: PricingTierKey): PricingTier {
  return TIERS.find((t) => t.key === key) ?? TIERS[0];
}

/** `120000` → `"Rp 120.000"`. id-ID grouping, matching every price surface in the app. */
export function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/** No payment provider is wired (docs/18 GAP-12, Wave 4). While this is `false` no screen
 *  may take money or claim an unlock it cannot persist. Entitlements themselves are now
 *  real and server-held — they are just granted by operator script rather than bought. */
export const CHECKOUT_LIVE = false;

/** The Midtrans Snap surface (QRIS matrix, VA numbers, e-wallet deeplinks) is a *design*
 *  preview of Wave 4, not a way to pay. It renders only in dev, so production can never
 *  show a buyer a QR code or an account number that would take their money nowhere. */
export const CHECKOUT_PREVIEW = import.meta.env.DEV;

// ── Preview-only entitlement ────────────────────────────────────────────────────────────
//
// Granted by the dev checkout preview so the unlocked workspace can be designed and
// reviewed. Kept in sessionStorage (gone with the tab) and read only under `import.meta.env
// .DEV`, so a production build has no path to a truthy entitlement at all.

const PREVIEW_KEY = "rumper.preview_pass.v1";
const listeners = new Set<() => void>();

/** Server-held entitlement, loaded once per session by `useEntitlement`. `null` means "not
 *  loaded yet"; a loaded free account is `{plan: "free"}`, which is not the same thing. */
let serverPlan: Entitlements | null = null;
let serverLoad: Promise<void> | null = null;

function loadServerPlan(): Promise<void> {
  serverLoad ??= getEntitlements()
    .then((e) => { serverPlan = e; emit(); })
    .catch(() => { /* signed out or offline — the free default already applies */ });
  return serverLoad;
}

function emit() {
  listeners.forEach((l) => l());
}

function readPreviewPass(): PricingTierKey | null {
  if (!CHECKOUT_PREVIEW) return null;
  try {
    const raw = sessionStorage.getItem(PREVIEW_KEY);
    return raw && TIERS.some((t) => t.key === raw) ? (raw as PricingTierKey) : null;
  } catch {
    return null; // private mode / storage disabled
  }
}

/** The pass currently in effect, or `null` on the free trial. Always `null` in production
 *  until `GET /api/entitlements` lands. */
export function activePass(): PricingTierKey | null {
  // The server is authoritative. The dev preview grant only fills in when there is no
  // server-side plan, so it can never mask or contradict a real one.
  if (serverPlan && serverPlan.plan !== "free") return serverPlan.plan;
  return readPreviewPass();
}

/** Records a pass from the dev checkout preview. A no-op in production by construction. */
export function grantPreviewPass(key: PricingTierKey): void {
  if (!CHECKOUT_PREVIEW) return;
  try {
    sessionStorage.setItem(PREVIEW_KEY, key);
  } catch {
    /* storage unavailable — the preview just won't stick */
  }
  emit();
}

export function clearPreviewPass(): void {
  try {
    sessionStorage.removeItem(PREVIEW_KEY);
  } catch {
    /* no-op */
  }
  emit();
}

/** Whether Tahap 2–5 and the paid surfaces are open for this account. */
export function hasSubscription(): boolean {
  return activePass() !== null;
}

/** Location quota available to this account: the free cap plus whatever a pass bundled. */
export function locationLimit(): number {
  if (serverPlan) return serverPlan.locations_limit;
  const pass = activePass();
  return LOCATION_LIMIT + (pass ? tierOf(pass).extraLocations : 0);
}

/** Re-running curation spends a fresh location quota, so it is a paid capability.
 *  On the free trial the caller must show the upgrade drawer instead. */
export function canRecurate(): boolean {
  return hasSubscription();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive view of the entitlement, so a grant during a session repaints the screens that
 *  gate on it instead of waiting for a reload. */
export function useEntitlement(): {
  pass: PricingTierKey | null;
  unlocked: boolean;
  locationLimit: number;
} {
  const pass = useSyncExternalStore(subscribe, activePass, () => null);
  useEffect(() => { void loadServerPlan(); }, []);
  return { pass, unlocked: pass !== null, locationLimit: locationLimit() };
}
