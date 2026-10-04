// Shortlist + area→report links (docs/18 GAP-06).
//
// Client-side for now: there is no `POST /api/areas/{id}/shortlist` yet, and no server-side
// place to record "this corridor was analysed as that conversation". Both move behind the
// API when doc 21 phase B lands — these four functions are the seam.
import type { CuratedArea, FitCategory } from "./api";
import { LOCATION_LIMIT } from "@/lib/entitlements";

const KEY = "rumper.areas.v1";

/** Free-tier location cap (docs/18 §7.1) — defined once in `lib/entitlements`, re-exported
 *  here so the existing area-side callers keep their import. */
export { LOCATION_LIMIT };

/** Categories auto-saved after curation: a corridor that fits, or fits with a known
 *  compromise, is worth keeping. `challenge_assumptions` is deliberately excluded — it is
 *  shown to widen the buyer's options, not because we think it suits them. */
const AUTO_SAVE: FitCategory[] = ["strong_fit", "interesting_tradeoff"];

interface Stored {
  shortlist: string[];
  /** areaId → conversationId, so a curated corridor opens its report instead of re-running. */
  reports: Record<string, string>;
  seededFor?: string;  // profile id the auto-shortlist was seeded from
}

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { shortlist: [], reports: {}, ...JSON.parse(raw) } : { shortlist: [], reports: {} };
  } catch {
    return { shortlist: [], reports: {} };
  }
}

function write(s: Stored) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}

export const getShortlist = (): Set<string> => new Set(read().shortlist);
export const getReports = (): Record<string, string> => read().reports;

export function toggleShortlisted(id: string): Set<string> {
  const s = read();
  s.shortlist = s.shortlist.includes(id)
    ? s.shortlist.filter((x) => x !== id)
    : [...s.shortlist, id];
  write(s);
  return new Set(s.shortlist);
}

export function linkReport(areaId: string, conversationId: string) {
  const s = read();
  s.reports[areaId] = conversationId;
  if (!s.shortlist.includes(areaId)) s.shortlist.push(areaId);
  write(s);
}

/** Drop links to conversations that no longer exist server-side.
 *
 *  The area → conversation map lives in localStorage while shortlist persistence is still
 *  client-side (docs/18 GAP-06), so it outlives the server: a `make reset-user-data`, a
 *  deleted audit, or a different environment all leave links pointing at rows that are
 *  gone. Without reconciliation the hub shows "Lihat Laporan" on a card whose report 404s.
 *
 *  Returns the surviving map. */
export function reconcileReports(liveConversationIds: Iterable<string>): Record<string, string> {
  const live = new Set(liveConversationIds);
  const s = read();
  const kept: Record<string, string> = {};
  let dropped = 0;
  for (const [areaId, convId] of Object.entries(s.reports)) {
    if (live.has(convId)) kept[areaId] = convId;
    else dropped++;
  }
  if (dropped) {
    s.reports = kept;
    write(s);
  }
  return kept;
}

/** Forget one stale link — used when a report page 404s on a conversation the client
 *  still believed in. */
export function unlinkReport(areaId: string) {
  const s = read();
  delete s.reports[areaId];
  write(s);
}

/** Forget a link by conversation id, when that is all the caller has. */
export function unlinkConversation(conversationId: string) {
  const s = read();
  const areaId = Object.keys(s.reports).find((k) => s.reports[k] === conversationId);
  if (areaId) {
    delete s.reports[areaId];
    write(s);
  }
}

/** Seed the shortlist once per profile: every fitting corridor, capped at the free-tier
 *  limit. Ordered so `strong_fit` fills the cap before `interesting_tradeoff` — with 6
 *  fitting corridors and a cap of 5, the one we drop should be the weaker match.
 *
 *  Returns the seeded ids, or null when this profile was already seeded (so a buyer who
 *  deliberately emptied their shortlist does not get it refilled on every visit). */
export function seedShortlist(
  areas: CuratedArea[], profileId: string, { force = false } = {},
): string[] | null {
  const s = read();
  // `force` is re-curation: the corridor set was recomputed, so the once-per-profile guard
  // must not suppress re-seeding against the new set.
  if (!force && s.seededFor === profileId) return null;
  if (force) s.shortlist = [];
  let fitting = AUTO_SAVE.flatMap((c) => areas.filter((a) => a.category === c)).map((a) => a.id);

  // Guarantee at least one saved corridor. A profile can legitimately produce no fitting
  // corridor at all — a strict commute tolerance against a far anchor makes every option
  // `challenge_assumptions` — and leaving the buyer with an empty shortlist and no report
  // is a dead end. Fall back to the shortest commute, which is the least-bad option by the
  // one measure we always have.
  if (fitting.length === 0 && areas.length > 0) {
    const best = [...areas].sort(
      (a, b) => (a.commute?.minutes ?? Infinity) - (b.commute?.minutes ?? Infinity),
    )[0];
    fitting = [best.id];
  }

  s.shortlist = Array.from(new Set([...s.shortlist, ...fitting])).slice(0, LOCATION_LIMIT);
  s.seededFor = profileId;
  write(s);
  return s.shortlist;
}
