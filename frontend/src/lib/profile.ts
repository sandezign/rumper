// Buyer Priority Profile — the durable output of the onboarding wizard (docs/18 GAP-01,
// shape per PRD-11 §9). The prototype held this in component state and dropped it on
// unmount; here it survives reloads.
//
// Persistence is localStorage for now. It moves behind `GET/PUT /api/profile` when that
// contract is accepted (docs/18 §6.2) — `loadProfile`/`saveProfile` are the seam, so no
// component changes when it does.

export type HouseholdType = "single" | "pasangan" | "keluarga-muda";
export type WorkPattern = "wfo" | "hybrid" | "remote";
export type ScenarioChoice = "A" | "B" | "neither" | "reject";

export type PriorityKey =
  | "flood_safety"
  | "commute_reliability"
  | "budget_discipline"
  | "quiet_environment"
  | "school_access"
  | "healthcare_access"
  | "daily_amenities"
  | "future_space";

export interface BuyerPriority {
  key: PriorityKey;
  weight: 1 | 2 | 3 | 4 | 5;
  dealbreaker: boolean;
  confidence: "tentative" | "medium" | "strong";
  reasons: { scenarioId: string; optionId: string; explanation: string }[];
  confirmedByUser: boolean;
}

/** Raw, un-interpreted wizard answers. We store what the buyer actually chose; turning
 *  these into weighted priorities needs the deterministic mapping in PRD-11 §10, which is
 *  still awaiting product/UX sign-off (docs/18 GAP-02). Until then `priorities` stays empty
 *  rather than being filled with an unapproved inference. */
export interface ProfileSignals {
  selectedFriction?: string;
  selectedFrictionLabel?: string;
  scenarioResponses: Record<string, ScenarioChoice>;
}

export interface BuyerPriorityProfile {
  id: string;
  schemaVersion: 1;
  status: "draft" | "confirmed";
  householdType: HouseholdType;
  workPattern: WorkPattern;
  anchors: { label: string; type: "primary" | "secondary"; placeId?: string }[];
  /** Buyer-stated one-way commute threshold. This is passed to the areas API; it is not
   * an estimate of any route. */
  commuteToleranceMinutes?: number;
  budget: { minMillions: number; maxMillions: number };
  preferredCorridors: string[];
  signals: ProfileSignals;
  priorities: BuyerPriority[];
  updatedAt: string;
}

const KEY = "rumper.buyer_profile.v1";
const SCHEMA_VERSION = 1;

export function loadProfile(): BuyerPriorityProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as BuyerPriorityProfile;
    // Forward-compatible: an unknown/older schema is discarded rather than half-read.
    if (p?.schemaVersion !== SCHEMA_VERSION) return null;
    return p;
  } catch {
    return null; // private mode / cleared storage / corrupt value
  }
}

export function saveProfile(p: BuyerPriorityProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() }));
  } catch {
    /* storage unavailable — the journey still works, it just won't be remembered */
  }
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}

export const hasConfirmedProfile = (): boolean => loadProfile()?.status === "confirmed";

export function newProfileId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}`;
}
