// Adapter: real `GET /api/areas` payload -> the shape the ported reference views render.
//
// The views (DaftarAksesibelView, AreaDetailDrawer, UnlockAreaQuotaModal, ShortlistAreasView)
// are the approved UI and stay untouched. Fields we genuinely do not have are filled with an
// explicit "belum tersedia", never with a plausible-looking number — a fabricated price or
// checkpoint count is exactly the failure mode docs/18 §8 rule 4 exists to prevent.
import type { CuratedArea as ViewArea } from "./data/mockCuratedAreas";
import type { AreasResponse } from "./api";
import { CATEGORY_LABEL, TO_VIEW_CATEGORY } from "./labels";

const NOT_AVAILABLE = "Belum tersedia";

function elevationScore(m: number | undefined, lowLying: boolean | undefined) {
  if (m === undefined) return "Waspada" as const;
  if (lowLying || m < 20) return "Tinggi" as const;   // risk level, not altitude
  if (m < 40) return "Waspada" as const;
  return "Aman" as const;
}

export function toViewAreas(res: AreasResponse, shortlist: Set<string>): ViewArea[] {
  const anchor: [number, number] = [res.anchor.lat, res.anchor.lng];
  return res.areas.map((a) => {
    const latLng: [number, number] = [a.centroid.lat, a.centroid.lng];
    return {
      id: a.id,
      name: a.name,
      region: a.region,
      category: TO_VIEW_CATEGORY[a.category],
      categoryLabel: CATEGORY_LABEL[a.category],
      commuteTime: a.commute ? `~${a.commute.minutes} Menit` : NOT_AVAILABLE,
      commuteMinutes: a.commute?.minutes ?? 0,
      commuteMode: a.commute ? `Transit · berangkat Senin 07.00 WIB` : NOT_AVAILABLE,
      // No price source: ADR-010 rules out listing data and ZNT/NJOP is not ingested yet
      // (docs/18 GAP-13, docs/21 §7). Shown as unavailable rather than invented.
      priceRange: NOT_AVAILABLE,
      priceMin: 0,
      priceMax: 0,
      elevationDpl: a.elevation ? `${Math.round(a.elevation.elevation_m)} mdpl` : NOT_AVAILABLE,
      elevationScore: elevationScore(a.elevation?.elevation_m, a.elevation?.low_lying),
      isShortlisted: shortlist.has(a.id),
      latLng,
      latLngRoute: [latLng, anchor],
      mapCoordinates: { x: 50, y: 50 },   // legacy canvas fallback; unused by the Google map
      routePoints: [],
      summaryNarrative: a.fit_reasons[0]?.text ?? NOT_AVAILABLE,
      cocokReason: a.fit_reasons[0]?.text ?? NOT_AVAILABLE,
      tradeoffReason: a.tradeoffs[0]?.text ?? NOT_AVAILABLE,
      registeredPropertiesCount: 0,   // no property inventory (GAP-18)
      checkpointsCount: 0,
      transitOptions: a.transit.map((t) => ({
        type: (t.type === "krl" || t.type === "tol" || t.type === "mrt" || t.type === "lrt"
          ? t.type : "krl") as "krl" | "tol" | "mrt" | "lrt",
        label: t.label || NOT_AVAILABLE,
        distance: `${t.distance_km} km`,
        // No open GTFS headway feed (GAP-08) — never render a plausible interval.
        interval: t.headway_min ? `Setiap ${t.headway_min} menit` : "Jadwal belum terverifikasi",
      })),
      essentialFacilities: {
        hospital: `${a.facilities.hospital ?? 0} dalam 3 km`,
        school: `${a.facilities.school ?? 0} dalam 3 km`,
        market: `${(a.facilities.market ?? 0) + (a.facilities.supermarket ?? 0)} dalam 3 km`,
        transitKm: a.facilities.nearest_station_km != null
          ? `${a.facilities.nearest_station_km} km ke stasiun`
          : NOT_AVAILABLE,
      },
    };
  });
}
