// Evidence index — the single derivation of "what the V3 workspace shows" from the two
// real API payloads: GET /api/checks/{id} (report) and GET /api/checks/{id}/map (map data).
//
// The analysis panels, the map markers and the map inspector all read from here, so a row
// in "Evidence Risk" and its marker on the map are literally the same object with the same
// id — that is what makes the two-way selection sync real instead of string-matching kinds.
//
// Rules that matter (CLAUDE.md): nothing is invented. Every claim/limitation/validation
// step comes from a researcher LegacyFinding; features that carry no finding are described from
// the warehouse fields we actually have (name, distance, ingest date) and nothing more.

import type { Confidence, Evidence, MapData, MapFeature, LegacyReport } from "@/lib/api";

export type MapTab = "overview" | "red-flags" | "commute" | "facilities" | "toll-access";
export type LayerKey = "flood" | "redflags" | "facilities" | "transit" | "toll" | "gaps";

export interface EvidenceItem {
  /** Stable id, shared by the analysis row and the map marker. */
  id: string;
  /** LegacyReport category key (banjir/commute/akses/fasilitas/lingkungan) or "gap". */
  category: string;
  categoryLabel: string;
  /** Map tab that shows this item's layer. */
  mapTab: MapTab;
  layerKey: LayerKey;
  /** Warehouse feature kind, or a synthetic kind for finding-only items. */
  kind: string;
  title: string;
  claim: string;
  limitation: string;
  validationAction: string;
  confidence: Confidence;
  evidence: Evidence[];
  isRedFlag: boolean;
  isCritical: boolean;
  isEvidenceGap: boolean;
  distanceKm: number | null;
  position: { lat: number; lng: number } | null;
  /** Set when the item is anchored to a warehouse feature (marker on the map). */
  feature: MapFeature | null;
  /** True for items synthesised from a map feature with no matching finding. */
  spatialOnly: boolean;
}

export interface FacilityGroup {
  key: string;
  label: string;
  /** Feature kinds folded into this group — the map filters on these. */
  kinds: string[];
  count: number;
  /** "2 rumah sakit, 1 apotek" — counted from the real features. */
  breakdown: string;
  items: MapFeature[];
}

export interface EvidenceIndex {
  /** Rows for the "Evidence Risk" tab, in report-category order. */
  items: EvidenceItem[];
  /** Every selectable thing on the map, including features without a finding. */
  byId: Map<string, EvidenceItem>;
  facilityGroups: FacilityGroup[];
  evidenceCount: number;
  facilityCount: number;
}

export const KIND_LABEL: Record<string, string> = {
  hospital: "rumah sakit",
  clinic: "klinik",
  pharmacy: "apotek",
  school: "sekolah",
  market: "pasar",
  supermarket: "supermarket",
  station: "stasiun",
  toll_gate: "gerbang tol",
  sutet_tower: "menara SUTET",
  landfill: "pembuangan sampah",
  industrial: "area industri",
  cemetery: "pemakaman",
  rail_point: "rel kereta",
};

const FACILITY_KINDS = ["hospital", "clinic", "pharmacy", "school", "market", "supermarket"];

const FACILITY_GROUP_DEFS: { key: string; label: string; kinds: string[] }[] = [
  { key: "kesehatan", label: "Kesehatan", kinds: ["hospital", "clinic", "pharmacy"] },
  { key: "pendidikan", label: "Pendidikan", kinds: ["school"] },
  { key: "ritel", label: "Ritel & belanja", kinds: ["market", "supermarket"] },
  { key: "transportasi", label: "Transportasi", kinds: ["station", "toll_gate"] },
];

/** LegacyReport category → the map tab whose layer carries that category's evidence. */
const CATEGORY_TAB: Record<string, MapTab> = {
  banjir: "red-flags",
  lingkungan: "red-flags",
  commute: "commute",
  akses: "toll-access",
  fasilitas: "facilities",
};

const CATEGORY_LAYER: Record<string, LayerKey> = {
  banjir: "flood",
  lingkungan: "redflags",
  commute: "transit",
  akses: "toll",
  fasilitas: "facilities",
};

function featureTab(kind: string): MapTab {
  if (kind === "station") return "commute";
  if (kind === "toll_gate") return "toll-access";
  if (FACILITY_KINDS.includes(kind)) return "facilities";
  return "red-flags";
}

function featureLayer(kind: string): LayerKey {
  if (kind === "station") return "transit";
  if (kind === "toll_gate") return "toll";
  if (FACILITY_KINDS.includes(kind)) return "facilities";
  return "redflags";
}

function featureCategory(kind: string): string {
  if (kind === "station") return "commute";
  if (kind === "toll_gate") return "akses";
  if (FACILITY_KINDS.includes(kind)) return "fasilitas";
  return "lingkungan";
}

/** Stable id for a warehouse feature — kind + rounded coordinates. */
export function featureId(f: MapFeature): string {
  return `feat:${f.kind}:${f.lat.toFixed(5)},${f.lng.toFixed(5)}`;
}

export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined) return "";
  if (km < 1) return `sekitar ${Math.round(km * 1000)} m`;
  return `sekitar ${km.toFixed(2).replace(".", ",")} km`;
}

export function facilityGroupOf(kind: string): string | null {
  return FACILITY_GROUP_DEFS.find((g) => g.kinds.includes(kind))?.key ?? null;
}

function allFeatures(map: MapData): MapFeature[] {
  return [
    ...(map.facilities ?? []),
    ...(map.red_flags ?? []),
    ...(map.gaps ?? []),
    ...(map.nearest_station ? [map.nearest_station] : []),
    ...(map.nearest_toll ? [map.nearest_toll] : []),
  ];
}

/** Describe a feature using only warehouse fields — used when no finding mentions it. */
function itemFromFeature(f: MapFeature, categoryLabels: Record<string, string>): EvidenceItem {
  const category = featureCategory(f.kind);
  const kindLabel = f.label || KIND_LABEL[f.kind] || f.kind.replace(/_/g, " ");
  const name = f.name || kindLabel;
  const dist = formatDistance(f.distance_km);
  return {
    id: featureId(f),
    category,
    categoryLabel: categoryLabels[category] ?? category,
    mapTab: featureTab(f.kind),
    layerKey: featureLayer(f.kind),
    kind: f.kind,
    title: name,
    claim: `${name} — ${kindLabel} ${dist} dari lokasi kandidat (jarak garis lurus).`,
    limitation: "Belum ada temuan riset yang menautkan titik ini; jarak dihitung garis lurus dari data warehouse.",
    validationAction: "",
    confidence: "data_sedang",
    evidence: f.ingested_at
      ? [{ source_title: `OpenStreetMap warehouse (data ${f.ingested_at})`, url: null, accessed_at: f.ingested_at, kind: "warehouse" }]
      : [],
    isRedFlag: !!f.critical || featureLayer(f.kind) === "redflags",
    isCritical: !!f.critical,
    isEvidenceGap: false,
    distanceKm: f.distance_km ?? null,
    position: { lat: f.lat, lng: f.lng },
    feature: f,
    spatialOnly: true,
  };
}

/**
 * Link a finding to the warehouse feature it talks about. Researchers phrase claims with
 * the feature name ("RS Hermina Galaxy (~0.48 km)"), so a name match is a reliable tie —
 * and when there is no match the finding simply anchors to the property instead.
 */
function matchFeature(claim: string, features: MapFeature[], taken: Set<string>): MapFeature | null {
  const haystack = claim.toLowerCase();
  let best: MapFeature | null = null;
  for (const f of features) {
    const name = (f.name || "").trim();
    if (name.length < 4) continue;
    if (!haystack.includes(name.toLowerCase())) continue;
    const id = featureId(f);
    if (taken.has(id)) continue;
    // Prefer the most specific (longest) name that matches.
    if (!best || name.length > (best.name || "").length) best = f;
  }
  return best;
}

export function buildEvidenceIndex(report: LegacyReport | null, map: MapData | null): EvidenceIndex {
  const byId = new Map<string, EvidenceItem>();
  const items: EvidenceItem[] = [];
  const features = map ? allFeatures(map) : [];
  const categoryLabels: Record<string, string> = {};
  for (const c of report?.categories ?? []) categoryLabels[c.category] = c.label;

  const linked = new Set<string>();
  const property = map?.property ?? null;

  for (const cat of report?.categories ?? []) {
    cat.findings.forEach((f, i) => {
      const feature = matchFeature(f.claim, features, linked);
      const id = feature ? featureId(feature) : `find:${cat.category}:${i}`;
      if (feature) linked.add(id);
      const item: EvidenceItem = {
        id,
        category: cat.category,
        categoryLabel: cat.label,
        mapTab: feature ? featureTab(feature.kind) : CATEGORY_TAB[cat.category] ?? "overview",
        layerKey: feature ? featureLayer(feature.kind) : CATEGORY_LAYER[cat.category] ?? "flood",
        kind: feature?.kind ?? cat.category,
        title: feature?.name || shortTitle(f.claim),
        claim: f.claim,
        limitation: f.limitation,
        validationAction: f.validation_action,
        confidence: f.confidence,
        evidence: f.evidence,
        isRedFlag: f.is_red_flag,
        isCritical: f.is_critical,
        isEvidenceGap: f.is_evidence_gap,
        distanceKm: feature?.distance_km ?? null,
        position: feature
          ? { lat: feature.lat, lng: feature.lng }
          : property
            ? { lat: property.lat, lng: property.lng }
            : null,
        feature: feature ?? null,
        spatialOnly: false,
      };
      items.push(item);
      byId.set(item.id, item);
    });
  }

  // `report.red_flags` and `report.evidence_gaps` are views over the same category findings
  // (the backend re-projects them by flag), so they are deliberately NOT appended here —
  // doing so would duplicate rows and double-count the tab badge.

  // Every remaining marker still needs an inspector payload when clicked.
  for (const f of features) {
    const id = featureId(f);
    if (byId.has(id)) continue;
    byId.set(id, itemFromFeature(f, categoryLabels));
  }

  const facilityGroups = buildFacilityGroups(map);
  const facilityCount =
    (map?.facilities?.length ?? 0) + (map?.nearest_station ? 1 : 0) + (map?.nearest_toll ? 1 : 0);

  return { items, byId, facilityGroups, evidenceCount: items.length, facilityCount };
}

export function buildFacilityGroups(map: MapData | null): FacilityGroup[] {
  if (!map) return [];
  const pool: MapFeature[] = [
    ...(map.facilities ?? []),
    ...(map.nearest_station ? [map.nearest_station] : []),
    ...(map.nearest_toll ? [map.nearest_toll] : []),
  ];
  return FACILITY_GROUP_DEFS.map((def) => {
    const groupItems = pool
      .filter((f) => def.kinds.includes(f.kind))
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    const perKind = new Map<string, number>();
    for (const f of groupItems) perKind.set(f.kind, (perKind.get(f.kind) ?? 0) + 1);
    return {
      ...def,
      count: groupItems.length,
      breakdown: [...perKind.entries()].map(([k, n]) => `${n} ${KIND_LABEL[k] ?? k}`).join(", "),
      items: groupItems,
    };
  }).filter((g) => g.count > 0);
}

/**
 * First clause of a claim — findings are full sentences, rows need a short label. A "." is
 * only a break when it ends a sentence, so decimals ("~35.0 m") stay intact.
 */
function shortTitle(claim: string): string {
  const clean = claim.trim();
  const m = clean.match(/^(.{12,}?)(?:[;:(]|\s[—–]\s|\.(?=\s|$))/);
  const head = (m ? m[1] : clean).trim();
  return head.length > 68 ? `${head.slice(0, 65).trimEnd()}…` : head;
}
