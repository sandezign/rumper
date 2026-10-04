// Curated areas — real endpoint (docs/21 §3), backed by `GET /api/areas`.
//
// Commute comes from the Google Routes API at Monday 07:00 WIB, elevation and flood class
// from the same cached providers the research pipeline uses, facility counts from the OSM
// warehouse. Category is assigned by deterministic rules server-side; the prose is a
// guard-railed composer that cannot change the category or introduce a number.
//
// Corridor *geometry* is still a representative point, not a polygon — `meta.geometry_note`
// says so and the UI surfaces it. Polygons land with docs/19 Wave B.
import { req } from "@/lib/api";

export type FitCategory = "strong_fit" | "interesting_tradeoff" | "challenge_assumptions";

export interface AreaCommute {
  minutes: number;
  mode: string;
  distance_km: number;
  transfers: number | null;
  polyline: string | null;
  departure_window: string;
}

export interface CuratedArea {
  id: string;
  name: string;
  region: string;
  centroid: { lat: number; lng: number };
  category: FitCategory;
  category_label: string;
  commute: AreaCommute | null;
  elevation: { elevation_m: number; relative_m: number; low_lying: boolean; method: string } | null;
  flood: { index: number; class: string; resolution_note: string } | null;
  transit: { type: string; label: string; distance_km: number; headway_min: number | null }[];
  facilities: Record<string, number | null>;
  fit_reasons: { key: string; text: string }[];
  tradeoffs: { key: string; text: string }[];
  unknowns: { field: string; text: string; suggested_action?: string }[];
  dealbreaker_conflicts: string[];
  /** Client-side only — shortlist is not persisted server-side yet (docs/18 GAP-06). */
  isShortlisted?: boolean;
}

export interface AreasResponse {
  anchor: { label: string; lat: number; lng: number };
  areas: CuratedArea[];
  meta: {
    counts: Partial<Record<FitCategory, number>>;
    commute_tolerance_min: number;
    sources: string[];
    geometry_note: string;
  };
}

export interface AreasQuery {
  anchorLat: number;
  anchorLng: number;
  anchorLabel: string;
  toleranceMin?: number;
  dealbreakers?: string[];
}

/** A Places description is a full formatted address ("Telkomsat, The Telkom Hub, Jalan
 *  Gatot Subroto, RT.6/RW.1, …"). The map pill needs the name, so take the leading
 *  component and drop any parenthetical the wizard's own presets carry. */
export function shortAnchorLabel(desc: string): string {
  const head = desc.split(",")[0].split(" (")[0].trim();
  return (head || desc).slice(0, 40);
}

export function fetchAreas(q: AreasQuery): Promise<AreasResponse> {
  const p = new URLSearchParams({
    anchor_lat: String(q.anchorLat),
    anchor_lng: String(q.anchorLng),
    anchor_label: q.anchorLabel,
    tolerance_min: String(q.toleranceMin ?? 60),
    dealbreakers: (q.dealbreakers ?? []).join(","),
  });
  return req<AreasResponse>(`/api/areas?${p}`);
}

/** Google's encoded-polyline algorithm. Decoding here avoids loading the Maps geometry
 *  library just to draw one route per corridor. */
export function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const pts: { lat: number; lng: number }[] = [];
  let i = 0, lat = 0, lng = 0;
  while (i < encoded.length) {
    let shift = 0, result = 0, b: number;
    do {
      b = encoded.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    pts.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return pts;
}
