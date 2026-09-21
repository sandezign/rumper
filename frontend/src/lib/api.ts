// Typed client for the Rumper workspace API (docs/05, 12, 13, 14).
// Same-origin /api; cookies carry the session.

export type Confidence = "data_kuat" | "data_sedang" | "perlu_validasi";

export interface Evidence {
  source_title: string;
  url: string | null;
  accessed_at: string;
  kind: string;
}

export interface Source extends Evidence {
  id: number;
}

/** Reference into `report.categories[c].findings[i]` — red flags and gaps are pointers,
 *  not copies (docs/05). */
export interface FindingRef {
  category: string;
  index: number;
}

export interface Finding {
  claim: string;
  /** Indices into `report.sources`; resolve with `resolveEvidence`. */
  evidence_ids: number[];
  confidence: Confidence;
  limitation: string;
  validation_action: string;
  is_red_flag: boolean;
  is_critical: boolean;
  is_evidence_gap: boolean;
}

export interface Category {
  category: string;
  label: string;
  weight: number;
  score: number | null;
  confidence: Confidence;
  rationale: string;
  findings: Finding[];
}

export interface Report {
  report_type: string;
  property: { name: string | null; formatted_address: string | null; lat: number | null; lng: number | null; in_jabodetabek: boolean };
  rls_score: number | null;
  band: string | null;
  band_label: string;
  recommendation: string;
  recommendation_label: string;
  summary: string;
  categories: Category[];
  red_flags: FindingRef[];
  evidence_gaps: FindingRef[];
  sources: Source[];
  checklist: { item: string; category: string; reason: string }[];
  disclaimer: string;
}

/** Resolve a finding's cited sources from the report-level table. */
export function resolveEvidence(report: Report, f: Finding): Source[] {
  const byId = new Map(report.sources.map((s) => [s.id, s]));
  return f.evidence_ids.map((i) => byId.get(i)).filter((s): s is Source => !!s);
}

/** Follow a red-flag / evidence-gap reference back to the finding it points at. */
export function resolveRef(report: Report, ref: FindingRef): Finding | null {
  return report.categories.find((c) => c.category === ref.category)?.findings[ref.index] ?? null;
}

/** ─── Legacy shape ────────────────────────────────────────────────────────────
 *  The superseded V2/V3 analysis components and the ops `/check/:id` view were written
 *  against the pre-dedup payload. Rather than rewrite them for a UI that is being
 *  replaced, `inflateReport` reconstructs that shape at their single load point. Delete
 *  this together with those components. */
export interface LegacyFinding extends Omit<Finding, "evidence_ids"> {
  evidence: Evidence[];
}
export type LegacyCategory = Omit<Category, "findings"> & { findings: LegacyFinding[] };
export interface LegacyReport extends Omit<Report, "categories" | "red_flags" | "evidence_gaps"> {
  categories: LegacyCategory[];
  red_flags: LegacyFinding[];
  evidence_gaps: LegacyFinding[];
}

export function inflateReport(r: Report): LegacyReport {
  const byId = new Map(r.sources.map((s) => [s.id, s]));
  const inflate = (f: Finding): LegacyFinding => {
    const { evidence_ids, ...rest } = f;
    return { ...rest, evidence: evidence_ids.map((i) => byId.get(i)).filter(Boolean) as Evidence[] };
  };
  const categories = r.categories.map((c) => ({ ...c, findings: c.findings.map(inflate) }));
  const at = (ref: FindingRef) =>
    categories.find((c) => c.category === ref.category)?.findings[ref.index];
  return {
    ...r,
    categories,
    red_flags: r.red_flags.map(at).filter(Boolean) as LegacyFinding[],
    evidence_gaps: r.evidence_gaps.map(at).filter(Boolean) as LegacyFinding[],
  };
}

/** Flood geometry: a REAL kelurahan boundary (BIG 1:10.000) carrying the InaRISK regional
 *  hazard index sampled at the property point. The polygon is administrative, not a
 *  measured flood extent — render the disclaimer with it (ADR-015). */
export interface FloodArea {
  /** Corridor id for warehouse rows, intake id for a per-property lookup. */
  id: string;
  /** Null for pre-ingested corridor boundaries — those belong to no single property. */
  intake_id: string | null;
  label: string;
  region: string | null;
  point: { lat: number; lng: number };
  boundary: {
    name: string | null;
    kecamatan: string | null;
    kota: string | null;
    provinsi: string | null;
    area_ha: number | null;
    /** [[[lng, lat], …]] — GeoJSON winding, not Google's {lat,lng}. */
    rings: [number, number][][];
    source: string;
  };
  flood: { index: number; class: string } | null;
  disclaimer: string;
}

/** Without an id: pre-ingested corridor boundaries from the geo warehouse (weekly cadence,
 *  no live calls). With one: that property's boundary, looked up live and cached. */
export const getFloodAreas = (intakeId?: string) =>
  req<{ areas: FloodArea[]; sources: string[]; freshness: "warehouse" | "live" }>(
    "/api/hazard/flood-areas" + (intakeId ? `?intake_id=${encodeURIComponent(intakeId)}` : ""),
  );

/** Distinct from `RouteLeg` (the station/toll pair in `/routes`, whose polyline is always
 *  present): this one is fetched on demand for an arbitrary destination and returns nulls
 *  when Routes declines, so the caller draws nothing rather than a fabricated path. */
export interface RouteToPoint {
  polyline: string | null;
  duration_min: number | null;
  distance_km: number | null;
  mode: string;
}

/** Street route from the property to an arbitrary point. One Routes API call, so it is
 *  fetched on tap rather than bundled into the map payload. */
export const fetchRoute = (
  intakeId: string, dest: { lat: number; lng: number }, mode = "DRIVE",
) =>
  req<RouteToPoint>(
    `/api/checks/${intakeId}/route?dest_lat=${dest.lat}&dest_lng=${dest.lng}&mode=${mode}`,
  );

export interface MapFeature {
  kind: string;
  name: string;
  lat: number;
  lng: number;
  distance_km: number;
  label?: string;
  critical?: boolean;
  ingested_at?: string;
  /** How the coordinate was placed (docs/10 §5); `osm_bbox_center`/`osm_legacy` are low-precision. */
  pos_source?: "osm_node" | "osm_centroid" | "osm_vertex_mean" | "osm_bbox_center" | "osm_legacy" | "google_place";
}

export interface MapData {
  property: { name: string | null; formatted_address: string | null; lat: number; lng: number };
  rls: { score: number | null; band: string | null; band_label: string | null; recommendation_label: string | null };
  category_scores: Record<string, number | null>;
  flood: { index: number; class: string } | null;
  elevation: { elevation_m: number; relative_m: number; low_lying: boolean } | null;
  nearest_toll: MapFeature | null;
  nearest_station: MapFeature | null;
  facilities: MapFeature[];
  red_flags: MapFeature[];
  gaps?: MapFeature[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  tokens_used_today: number;
  token_limit: number;
}

export interface Convo {
  id: string;
  title: string;
  state: string;
  project_id: string | null;
  intake_id: string | null;
  updated_at: string;
  // enriched by GET /api/conversations for the Active Audit selector
  property_name?: string;
  rls_score?: number | null;
  band?: string | null;
  band_label?: string;
  review_state?: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  /** Report category ids this answer drew on ("banjir" | "commute" | …). A closed
   *  vocabulary, allowlisted server-side, so a chip always maps to a section the buyer can
   *  open — the model cannot invent a source title or URL here. */
  citations?: string[];
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : "API error");
    this.status = status;
    this.detail = detail;
  }
}

// Single-flight access-token refresh: the access cookie lives 1 day, the refresh
// cookie 7 days (rotated server-side). On a 401 we refresh once and retry.
let refreshing: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function req<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  if (res.status === 401 && !retried && !path.startsWith("/api/auth/")) {
    if (await tryRefresh()) return req<T>(path, init, true);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.detail ?? res.statusText);
  }
  return res.json();
}

// auth
export const googleLogin = (credential: string) =>
  req<User>("/api/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
// custom-button flow: OAuth2 access token (GIS token client) → backend userinfo verify
export const googleLoginToken = (access_token: string) =>
  req<User>("/api/auth/google", { method: "POST", body: JSON.stringify({ access_token }) });
export const me = () => req<User>("/api/auth/me");
export const logout = () => req("/api/auth/logout", { method: "POST" });
export const updatePicture = (picture_base64: string) =>
  req<User>("/api/auth/me/picture", { method: "PUT", body: JSON.stringify({ picture_base64 }) });

// projects + conversations
export const listProjects = () => req<{ id: string; name: string }[]>("/api/projects");
export const createProject = (name: string) =>
  req<{ id: string; name: string }>("/api/projects", { method: "POST", body: JSON.stringify({ name }) });
export const renameProject = (id: string, name: string) =>
  req<{ id: string; name: string }>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
export const listConversations = () => req<Convo[]>("/api/conversations");
export const createConversation = (project_id?: string | null) =>
  req<Convo>("/api/conversations", { method: "POST", body: JSON.stringify({ project_id }) });

// guided-wizard submit: structured intake → conversation + research job (docs/12)
export interface FromIntakePayload {
  address_text: string;
  property_name?: string;
  workplace_text: string;
  transport_mode: string;
  concerns: string[];
  concern_notes?: string;
  purpose?: string;
  buying_stage?: string;
  dp_timeline?: string;
}
export const createConversationFromIntake = (payload: FromIntakePayload) =>
  req<{ conversation_id: string; intake_id: string }>("/api/conversations/from-intake", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const getConversation = (id: string) =>
  req<Convo & { messages: ChatMessage[]; job_status: string | null; expects?: "address" | null }>(
    `/api/conversations/${id}`,
  );
/** Resolve a place description to coordinates (docs/21 §3). Throws on failure — the areas
 *  hub must never silently fall back to a default gravity centre. */
export const geocodePlace = (q: string) =>
  req<{ lat: number; lng: number; formatted_address: string }>(
    `/api/places/geocode?q=${encodeURIComponent(q)}`,
  );
/** Scope the search to a circle — used once a corridor is chosen so results cannot land
 *  outside it (docs/21 §9). Omit `near` for the unscoped picker. */
export const placesAutocompleteNear = (
  q: string, near: { lat: number; lng: number }, radiusM = 12000,
) =>
  req<{ description: string; place_id: string }[]>(
    `/api/places/autocomplete?q=${encodeURIComponent(q)}` +
    `&near_lat=${near.lat}&near_lng=${near.lng}&radius_m=${radiusM}`,
  );
export const placesAutocomplete = (q: string) =>
  req<{ description: string; place_id: string }[]>(`/api/places/autocomplete?q=${encodeURIComponent(q)}`);

// report + map
export interface ResearchProgressDTO {
  step: number; // 1..5 named loader step
  total: number; // always 5
  pct: number; // 0..100 bar, server-owned
  label: string; // live id-ID status line
}
export type CheckResponse =
  | { status: "pending" | "running"; categories_done?: number; progress?: ResearchProgressDTO }
  | { status: "failed"; error: string }
  | { status: "done"; report: Report };

export const getCheck = (id: string) => req<CheckResponse>(`/api/checks/${id}`);
export const getMap = (id: string) => req<MapData>(`/api/checks/${id}/map`);

/** Real street routes for the map (docs/14 §3); either side may be null when unavailable. */
export interface RouteLeg {
  polyline: string; // Google encoded path
  distance_km: number;
  duration_min: number;
  mode: string;
}
export interface MapRoutes {
  station: RouteLeg | null;
  toll: RouteLeg | null;
}
export const getRoutes = (id: string) => req<MapRoutes>(`/api/checks/${id}/routes`);

// ops-form intake (legacy /form route)
export interface IntakePayload {
  full_name: string;
  whatsapp: string;
  property_name?: string;
  maps_link?: string;
  address_text: string;
  purpose?: string;
  buying_stage?: string;
  dp_timeline?: string;
  workplace_text: string;
  transport_mode: string;
  concerns: string[];
  concern_notes?: string;
  consent_whatsapp: boolean;
  consent_privacy: boolean;
}

export const createIntake = (payload: IntakePayload) =>
  req<{ intake_id: string }>("/api/intakes", { method: "POST", body: JSON.stringify(payload) });

// chat send — POST + SSE stream
export interface SendResult {
  reply: string;
  suggestions: string[];
  citations?: string[];
  expects?: "address" | null;
  state: string;
  intake_id: string | null;
  research_started: boolean;
  tokens_used_today: number;
  token_limit: number;
}

export interface Entitlements {
  plan: "free" | "single" | "bundle" | "analyst";
  unlocked: boolean;
  locations_used: number;
  locations_limit: number;
  source: string | null;
  granted_at: string | null;
}

/** The server's view of what this account may do. Granted by operator script until the
 *  payment provider is approved — never self-serve (there is no POST). */
export const getEntitlements = () => req<Entitlements>("/api/entitlements");

/** One advisor topic: the drawer opens on it, and the turn is scoped to it server-side. */
export interface AdvisorTopic {
  id: string;
  label: string;
  /** Report category this topic scopes to, or null for a whole-report / advisory topic. */
  category: string | null;
  /** Grounded opener, derived from the report — not generated. */
  opener: string;
  suggestions: string[];
}

export const getAdvisor = (convoId: string) =>
  req<{ topics: AdvisorTopic[] }>(`/api/conversations/${convoId}/advisor`);

/** Clears the transcript. The audit and its report are untouched — no quota is spent. */
export const resetConversation = (convoId: string) =>
  req(`/api/conversations/${convoId}/reset`, { method: "POST" });

export async function sendMessageSSE(
  convoId: string,
  content: string,
  onStatus: (label: string) => void,
  topic?: string | null,
): Promise<SendResult> {
  let res = await fetch(`/api/conversations/${convoId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, topic: topic ?? null }),
  });
  if (res.status === 401 && (await tryRefresh())) {
    res = await fetch(`/api/conversations/${convoId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, topic: topic ?? null }),
    });
  }
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.detail ?? res.statusText);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let result: SendResult | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const raw = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let ev = "message";
      let data = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event: ")) ev = line.slice(7).trim();
        else if (line.startsWith("data: ")) data = line.slice(6);
      }
      if (!data) continue;
      const parsed = JSON.parse(data);
      if (ev === "status") onStatus(parsed.label);
      else if (ev === "error") throw new ApiError(500, parsed.detail);
      else if (ev === "message") result = parsed as SendResult;
    }
  }
  if (!result) throw new ApiError(500, "Stream terputus. Coba lagi.");
  return result;
}

// research progress — REST polling of GET /api/checks/{id}.
//
// We poll (not the SSE /events endpoint) because Firebase Hosting, in front of Cloud Run
// in prod, buffers responses and does not stream: an EventSource would receive nothing
// until the job ends, then every step at once. The poll just relays the server's own
// progress (step/pct/label) — the backend owns all progress; the FE never fakes it.
const RESEARCH_POLL_MS = 1500;
const RESEARCH_POLL_MAX = 440; // ~11 min safety cap (graph_timeout is 480s server-side)

export interface WatchProgress extends ResearchProgressDTO {
  status: string;
}

export function watchResearch(
  intakeId: string,
  onProgress: (p: WatchProgress) => void,
  onFinished: (status: string, error?: string) => void,
): () => void {
  let stopped = false;
  let timer: number | null = null;
  let polls = 0;

  async function tick() {
    if (stopped) return;
    try {
      const res = await getCheck(intakeId);
      if (stopped) return;
      if (res.status === "done") return onFinished("done");
      if (res.status === "failed") return onFinished("failed", res.error);
      const p = res.progress;
      onProgress({
        status: res.status,
        step: p?.step ?? res.categories_done ?? 1,
        total: p?.total ?? 5,
        pct: p?.pct ?? 0,
        label: p?.label ?? "",
      });
    } catch {
      // transient (network/proxy hiccup) — keep polling
    }
    if (stopped) return;
    if (++polls >= RESEARCH_POLL_MAX) return onFinished("failed", "Waktu tunggu habis.");
    timer = window.setTimeout(tick, RESEARCH_POLL_MS);
  }
  void tick();

  return () => {
    stopped = true;
    if (timer) window.clearTimeout(timer);
  };
}
