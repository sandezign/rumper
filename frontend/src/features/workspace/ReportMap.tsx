import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { groupOf } from "./facilityGroups";
import {
  Plus, Minus, Layers, Maximize2, House, TriangleAlert,
  GraduationCap, ShoppingBag, Cross, Train, Ticket, Pill, Store, Stethoscope,
  Zap, Landmark, Factory, Trash2, X, ExternalLink,
} from "lucide-react";
import { getRoutes, type FloodArea, type MapData, type MapFeature, type MapRoutes } from "@/lib/api";
import { decodePolyline } from "@/features/areas/api";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;


/** Hide Google's own POI/transit/business pins. The report draws its *own* markers from
 *  the warehouse — leaving Google's defaults on means a restaurant icon sits next to our
 *  evidence pin with no provenance, which is exactly the confusion docs/14 §2 warns about. */
const NO_DEFAULT_POI: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

const KIND: Record<string, { color: string; Icon: typeof House }> = {
  // One glyph per kind — three different health facilities sharing a red cross made a
  // pharmacy indistinguishable from a hospital at a glance.
  hospital: { color: "#E12626", Icon: Cross },
  clinic: { color: "#E8563F", Icon: Stethoscope },
  pharmacy: { color: "#C2410C", Icon: Pill },
  school: { color: "#7C3AED", Icon: GraduationCap },
  market: { color: "#0891B2", Icon: ShoppingBag },
  supermarket: { color: "#0E7490", Icon: Store },
  station: { color: "#169BD5", Icon: Train },
  // A wrench read as a workshop. A toll gate is where you tap an e-toll card, so a ticket
  // is the glyph buyers actually associate with it.
  toll_gate: { color: "#1D4ED8", Icon: Ticket },
};

/** Red flags are not interchangeable: a cemetery next door and a high-voltage tower are
 *  different objections a buyer weighs differently. One triangle for all of them made them
 *  unreadable on the map, so each hazard kind gets its own glyph. */
const RED_FLAG_KIND: Record<string, { color: string; Icon: typeof House }> = {
  sutet_tower: { color: "#B45309", Icon: Zap },
  cemetery: { color: "#6B7280", Icon: Landmark },
  industrial: { color: "#7C2D12", Icon: Factory },
  landfill: { color: "#57534E", Icon: Trash2 },
};
const RED_FLAG = { color: "#E12626", Icon: TriangleAlert };
const redFlagStyle = (kind: string) => RED_FLAG_KIND[kind] ?? RED_FLAG;

/** What a pin *is*, in the buyer's words. Tapping a pin shows this and nothing else — no
 *  route is drawn and no deeplink opens, because a tap is a question ("what is that?"),
 *  not a request to be navigated somewhere. */
const KIND_LABEL: Record<string, string> = {
  hospital: "Rumah sakit", clinic: "Klinik", pharmacy: "Apotek", school: "Sekolah",
  market: "Pasar", supermarket: "Supermarket", station: "Stasiun",
  toll_gate: "Gerbang tol", sutet_tower: "Menara SUTET",
  industrial: "Kawasan industri", cemetery: "Pemakaman", landfill: "TPA",
};

function HtmlMarker({ position, zIndex = 1, title, onClick, children }: {
  position: google.maps.LatLngLiteral; zIndex?: number; title?: string;
  onClick?: () => void; children: React.ReactNode;
}) {
  const map = useMap();
  const [el] = useState(() => document.createElement("div"));
  useEffect(() => {
    if (!map) return;
    const o = new google.maps.OverlayView();
    o.onAdd = function () { this.getPanes()!.overlayMouseTarget.appendChild(el); };
    o.draw = function () {
      const pt = this.getProjection()?.fromLatLngToDivPixel(new google.maps.LatLng(position));
      if (!pt) return;
      Object.assign(el.style, {
        position: "absolute", transform: "translate(-50%,-50%)",
        left: `${pt.x}px`, top: `${pt.y}px`, zIndex: String(zIndex),
      });
    };
    o.onRemove = () => el.remove();
    o.setMap(map);
    return () => o.setMap(null);
  }, [map, position.lat, position.lng, zIndex, el]);
  useEffect(() => { if (title) el.title = title; }, [el, title]);
  useEffect(() => {
    if (!onClick) return;
    el.style.cursor = "pointer";
    const h = (e: MouseEvent) => { e.stopPropagation(); onClick(); };
    el.addEventListener("click", h);
    return () => el.removeEventListener("click", h);
  }, [el, onClick]);
  return createPortal(children, el);
}

/** The kelurahan boundary a location sits in (BIG 1:10.000).
 *
 *  IMPORTANT — this is an administrative border, **not** a flood extent. A kelurahan runs
 *  300–600 ha and in a real flood typically only a small fraction of it goes under. We have
 *  no extent data: InaRISK publishes a regional hazard *index* sampled at a point, with no
 *  geometry (ADR-015).
 *
 *  So it is drawn as a boundary and not as an area: dashed outline, near-transparent fill.
 *  A solid red 600 ha blob would claim a flooded area we cannot evidence, which is the
 *  alarmist failure mode docs/06 §4 exists to prevent. */
export function BoundaryPolygon({ rings, color, fill = 0.06 }: {
  rings: [number, number][][]; color: string; fill?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map || !rings.length) return;
    // BIG returns [lng, lat]; Google wants {lat, lng}.
    const paths = rings.map((r) => r.map(([lng, lat]) => ({ lat, lng })));
    const poly = new google.maps.Polygon({
      paths,
      strokeOpacity: 0, // the dashes below are the visible border
      fillColor: color, fillOpacity: fill, clickable: false, map,
    });
    // Dashed border reads as "boundary / approximate", the way the reference draws it —
    // a solid edge reads as a surveyed line.
    const dash = {
      path: "M 0,-1 0,1", strokeColor: color, strokeOpacity: 1, scale: 2,
    } as google.maps.Symbol;
    const outlines = paths.map((path) =>
      new google.maps.Polyline({
        path: [...path, path[0]], strokeOpacity: 0, clickable: false, map,
        icons: [{ icon: dash, offset: "0", repeat: "9px" }],
      }),
    );
    return () => { poly.setMap(null); outlines.forEach((o) => o.setMap(null)); };
  }, [map, rings, color, fill]);
  return null;
}

/** Flood geometry is always drawn in the hazard red of the reference design — one colour
 *  for one meaning ("this is the flood layer"), so the polygon is never mistaken for a
 *  general boundary overlay. Severity is carried by the label and the evidence bar, not by
 *  hue: an amber or green polygon reads as a verdict on the whole kelurahan, which is
 *  exactly what a regional point index cannot support (ADR-015). */
export const FLOOD_RED = "#E12626";

/** The actual street route to a tapped facility — decoded from the Routes API polyline.
 *  A straight connector would understate the trip badly in a city where the road network,
 *  not the crow, decides how far something is (measured: 1.3 km straight vs 1.7 km / 4 min
 *  driving to the nearest hospital). */
function RoutePath({ encoded, color = "#3B66FF", fit = true }: {
  encoded: string; color?: string; fit?: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const path = decodePolyline(encoded);
    if (!path.length) return;
    const halo = new google.maps.Polyline({
      path, map, clickable: false, strokeColor: "#FFFFFF", strokeOpacity: 0.9, strokeWeight: 7,
    });
    const line = new google.maps.Polyline({
      path, map, clickable: false, strokeColor: color, strokeOpacity: 1, strokeWeight: 4,
    });
    // The step framing owns the viewport on Perjalanan; only a tapped facility reframes.
    if (fit) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 72);
    }
    return () => { halo.setMap(null); line.setMap(null); };
  }, [map, encoded, color, fit]);
  return null;
}

function Circle({ center, radius, color, fill }: {
  center: google.maps.LatLngLiteral; radius: number; color: string; fill: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const c = new google.maps.Circle({
      map, center, radius, clickable: false,
      strokeColor: color, strokeOpacity: 0.9, strokeWeight: 2,
      fillColor: color, fillOpacity: fill,
    });
    return () => c.setMap(null);
  }, [map, center.lat, center.lng, radius, color, fill]);
  return null;
}

/** What each report step wants the map to show (PRD-00 §7: the map is the step's evidence,
 *  not decoration). Selecting a tab re-frames the map and switches the layers to the ones
 *  that step is actually about, so the buyer never has to reason about which pins matter. */
export type MapFocus = "ringkasan" | "faktor-risiko" | "perjalanan" | "checklist" | "fasilitas";

interface FocusPreset {
  layers: { banjir: boolean; poi: boolean; radius: boolean };
  /** Which features to frame. `home` always participates. */
  frame: "radius" | "flags" | "access" | "property" | "facilities";
  /** Used when there is nothing to frame against (no flags, no facilities returned). */
  fallbackZoom: number;
  /** Zoom floor/ceiling applied after `fitBounds`. A kelurahan boundary is 300–600 ha and a
   *  far-flung red flag can be kilometres away, so an unclamped fit reads as "zoomed out to
   *  the whole province" — useless for judging a house. */
  zoomRange: [number, number];
}

const FOCUS: Record<MapFocus, FocusPreset> = {
  // Overview: everything on, the 1 km walkable radius sets the frame.
  ringkasan: { layers: { banjir: true, poi: true, radius: true }, frame: "radius",
               fallbackZoom: 15, zoomRange: [14, 16] },
  // Hazard: the kelurahan boundary and nearby red flags, POI clutter out of the way.
  "faktor-risiko": { layers: { banjir: true, poi: false, radius: false }, frame: "flags",
                     fallbackZoom: 15, zoomRange: [14, 16] },
  // Commute: pull back far enough to hold the station and the toll gate in one view.
  perjalanan: { layers: { banjir: false, poi: true, radius: false }, frame: "access",
                fallbackZoom: 14, zoomRange: [12, 16] },
  // Field survey: you are standing at the house, so sit on the house.
  // Field survey: sit on the house, and keep the radius so the pins around it have a scale.
  checklist: { layers: { banjir: false, poi: true, radius: true }, frame: "property",
               fallbackZoom: 16, zoomRange: [16, 16] },
  // Facilities: frame the pins themselves, with the radius for a sense of scale.
  fasilitas: { layers: { banjir: false, poi: true, radius: true }, frame: "facilities",
               fallbackZoom: 15, zoomRange: [13, 16] },
};

/** Features further out than this never pull the frame — a red flag 12 km away says nothing
 *  about the house, and including it empties the viewport of everything that does. */
const FRAME_RADIUS_KM = 4;

/** Applies the active step's framing. Runs on step change only — panning or zooming by hand
 *  afterwards is never fought, because the effect does not depend on the map viewport. */
function FocusFrame({ focus, focusGroup, home, data, floodArea }: {
  focus: MapFocus;
  /** A facility group the buyer opened in Tahap 05 — frames those pins instead of the step's
   *  default, so opening "Kesehatan" actually moves the map to the clinics. */
  focusGroup?: string | null;
  home: google.maps.LatLngLiteral;
  data: MapData;
  floodArea?: FloodArea | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const preset = FOCUS[focus];
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(home);

    const add = (fs: (MapFeature | null | undefined)[]) =>
      fs.forEach((f) => {
        if (f && f.distance_km <= FRAME_RADIUS_KM) bounds.extend({ lat: f.lat, lng: f.lng });
      });

    // An opened facility group wins: it is the more specific intent.
    if (focusGroup) {
      const members = [...data.facilities, data.nearest_station, data.nearest_toll]
        .filter((f): f is MapFeature => Boolean(f) && groupOf(f!.kind).id === focusGroup);
      if (members.length) {
        add(members);
        map.fitBounds(bounds, 72);
        const settle = google.maps.event.addListenerOnce(map, "idle", () => {
          const z = map.getZoom() ?? 15;
          if (z > 17) map.setZoom(17);
        });
        return () => google.maps.event.removeListener(settle);
      }
    }

    switch (preset.frame) {
      case "radius":
        // ~1 km box around the property, matching the drawn radius.
        bounds.extend({ lat: home.lat + 0.009, lng: home.lng + 0.009 });
        bounds.extend({ lat: home.lat - 0.009, lng: home.lng - 0.009 });
        break;
      case "flags":
        add(data.red_flags);
        // BIG returns [lng, lat] (GeoJSON winding), not Google's {lat, lng} — same swap
        // `BoundaryPolygon` makes. Reading them in the wrong order put the bounds at
        // lat 106, which is what made this view span half the country.
        floodArea?.boundary.rings.forEach((ring) =>
          ring.forEach(([lng, lat]) => bounds.extend({ lat, lng })),
        );
        break;
      case "access":
        add([data.nearest_station, data.nearest_toll]);
        break;
      case "facilities":
        add(data.facilities.slice(0, 12));
        break;
      case "property":
        break;
    }

    // A single point makes a zero-area box, which `fitBounds` resolves to maximum zoom.
    // Those steps want an explicit zoom instead.
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const degenerate = ne.equals(sw);
    if (preset.frame === "property" || degenerate) {
      map.panTo(home);
      map.setZoom(preset.fallbackZoom);
      return;
    }

    map.fitBounds(bounds, 64);
    // `fitBounds` settles asynchronously, so the clamp has to wait for it. A kelurahan
    // outline alone would otherwise sit around z11 and the house would be a dot.
    const once = google.maps.event.addListenerOnce(map, "idle", () => {
      const [lo, hi] = preset.zoomRange;
      const z = map.getZoom() ?? preset.fallbackZoom;
      if (z < lo || z > hi) {
        map.setZoom(Math.min(hi, Math.max(lo, z)));
        map.panTo(home);
      }
    });
    return () => google.maps.event.removeListener(once);
  }, [map, focus, focusGroup, home.lat, home.lng, data, floodArea]);

  return null;
}

function Controls({ onRecenter }: { onRecenter: () => void }) {
  const map = useMap();
  const by = (d: number) => () => map?.setZoom((map.getZoom() ?? 15) + d);
  const cls = "flex size-9 cursor-pointer items-center justify-center rounded-xl bg-white text-base font-bold transition-colors hover:bg-gray-50";
  const style = { boxShadow: "0 2px 8px rgba(0,0,0,0.12)", color: "#001e2b", border: "1px solid #E1E5E8" };
  return (
    <div className="absolute left-4 z-[1060] flex flex-col gap-1.5" style={{ bottom: 76 }}>
      <button title="Zoom in" onClick={by(1)} className={cls} style={style}><Plus size={15} /></button>
      <button title="Zoom out" onClick={by(-1)} className={cls} style={style}><Minus size={15} /></button>
      <button title="Recenter" onClick={onRecenter} className={cls} style={style}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="2.5" stroke="#001e2b" strokeWidth="1.3" />
          <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2" stroke="#001e2b" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/** Detail card for a tapped marker.
 *
 *  There is no side panel in the revamped workspace, so the card carries the two actions a
 *  buyer actually wants from a pin: see the place, or get a route to it. Both open Google
 *  Maps in a new tab via the universal `?api=1` links — no extra API cost, and the native
 *  app opens on mobile. Distance is the straight-line figure our warehouse computed, and it
 *  is labelled as such: the driving route is what the Google link will show. */
function Content({
  data, intakeId, layers, floodArea, focus, routeLayers, focusGroup, visibleGroups,
  selected, onSelect,
}: {
  data: MapData; intakeId?: string; layers: Record<string, boolean>;
  floodArea?: FloodArea | null;
  focus: MapFocus;
  /** Which commute routes to draw on the Perjalanan step. */
  routeLayers?: { station: boolean; toll: boolean };
  focusGroup?: string | null;
  /** Facility group ids currently switched on in Tahap 05. */
  visibleGroups?: Set<string>;
  selected: MapFeature | null; onSelect: (f: MapFeature | null) => void;
}) {
  const map = useMap();

  const home = { lat: data.property.lat, lng: data.property.lng };
  useEffect(() => { map?.panTo(home); }, [map, home.lat, home.lng]);

  // Nearest few *per kind*, not the nearest 12 overall. The list arrives sorted by
  // distance, so a flat slice in a hospital-dense area returned twelve hospitals and the
  // school / market / pharmacy pins never appeared at all — which read as "missing icons".
  const pois: MapFeature[] = useMemo(() => {
    if (!layers.poi) return [];
    const shown = (f: MapFeature) => !visibleGroups || visibleGroups.has(groupOf(f.kind).id);
    // NB: plain object, not `new Map()` — `Map` here is the @vis.gl component.
    const perKind: Record<string, MapFeature[]> = {};
    for (const f of data.facilities) {
      if (!shown(f)) continue;
      const bucket = (perKind[f.kind] ??= []);
      // An opened group shows all of its members; otherwise the nearest few per kind, so a
      // hospital-dense area cannot crowd out every school and market pin.
      const cap = focusGroup && groupOf(f.kind).id === focusGroup ? 12 : 3;
      if (bucket.length < cap) bucket.push(f);
    }
    // Toll gate and station are reported separately but are the two access points buyers
    // ask about most, so they belong on the same layer.
    const extra = [data.nearest_toll, data.nearest_station]
      .filter((f): f is MapFeature => Boolean(f) && shown(f!));
    return [...Object.values(perKind).flat(), ...extra];
  }, [layers.poi, data.facilities, data.nearest_toll, data.nearest_station, visibleGroups, focusGroup]);

  const flags: MapFeature[] = layers.banjir ? data.red_flags : [];

  /* Perjalanan is about how you actually get out of here, so the measured routes are drawn
     rather than described. One Routes call per report, only on the step that shows them. */
  const [commute, setCommute] = useState<MapRoutes | null>(null);
  useEffect(() => {
    if (focus !== "perjalanan" || !intakeId || commute) return;
    let alive = true;
    getRoutes(intakeId).then((r) => alive && setCommute(r)).catch(() => {});
    return () => { alive = false; };
  }, [focus, intakeId, commute]);

  return (
    <>
      <FocusFrame focus={focus} focusGroup={focusGroup} home={home} data={data} floodArea={floodArea} />

      {layers.radius && (
        <Circle center={home} radius={1000} color="#5C5CE2" fill={0.06} />
      )}
      {/* Flood context is a radius, not a polygon: InaRISK gives an index at a point, so
          drawing a boundary would invent an extent the data does not have (doc 19 §4). */}
      {/* Real kelurahan boundary, tinted by the regional hazard index. Falls back to
          nothing when BIG has no polygon — an approximate blob would be worse than absent. */}
      {layers.banjir && floodArea && (
        <BoundaryPolygon rings={floodArea.boundary.rings} color={FLOOD_RED} />
      )}

      {focus === "perjalanan" && routeLayers?.station !== false && commute?.station?.polyline && (
        <RoutePath encoded={commute.station.polyline} color="#16A34A" fit={false} />
      )}
      {focus === "perjalanan" && routeLayers?.toll !== false && commute?.toll?.polyline && (
        <RoutePath encoded={commute.toll.polyline} color="#2563EB" fit={false} />
      )}


      {[...pois, ...flags].map((f, i) => {
        const cfg = flags.includes(f) ? redFlagStyle(f.kind) : (KIND[f.kind] ?? KIND.station);
        const I = cfg.Icon;
        const active = selected === f;
        return (
          <HtmlMarker key={`${f.kind}-${f.name}-${i}`} position={{ lat: f.lat, lng: f.lng }}
                      title={`${f.name} · ${f.distance_km} km`}
                      zIndex={active ? 400 : 200}
                      onClick={() => onSelect(active ? null : f)}>
            <div style={{
              position: "relative",
              width: active ? 42 : 36, height: active ? 42 : 36, borderRadius: "50%",
              background: cfg.color,
              border: active ? "3px solid #001E2B" : "2.5px solid white",
              boxShadow: "0 3px 10px rgba(0,0,0,0.22)", transition: "all .12s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <I size={16} color="white" />
            </div>
            {active && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}&hl=id`}
                 target="_blank" rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 title="Buka lokasi ini di Google Maps"
                 className="absolute left-1/2 top-full z-10 mt-1.5 max-w-[220px] -translate-x-1/2 rounded-lg border border-[#E1E5E8] bg-white px-2.5 py-1.5 text-center shadow-md transition-colors hover:border-[#00684A] hover:bg-[#F4F7F6]">
                {/* Both lines: the OSM name alone is often a bare number, and the kind alone
                    ("Gerbang tol") does not say *which* one. */}
                <span className="block truncate text-[11px] font-bold leading-tight text-[#001E2B]">
                  {f.name && !/^\d+$/.test(f.name) ? f.name : (KIND_LABEL[f.kind] ?? f.kind)}
                </span>
                <span className="block truncate text-[10px] leading-tight text-[#7C8C9A]">
                  {KIND_LABEL[f.kind] ?? f.kind} · {f.distance_km.toFixed(2)} km
                </span>
                <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-[#00684A]">
                  <ExternalLink size={9} /> Buka di Google Maps
                </span>
              </a>
            )}
          </HtmlMarker>
        );
      })}

      <HtmlMarker position={home} zIndex={900} title={data.property.name ?? "Lokasi"}>
        <div className="flex flex-col items-center">
          {/* The one labelled pin: which house this report is about. Facility pins carry no
              card — their name is in the Tahap 05 list, where it can be read properly. */}
          <div className="mb-1 whitespace-nowrap rounded-lg border border-[#E1E5E8] bg-white px-2 py-1 text-center shadow-md">
            <strong className="block text-[11px] font-bold leading-tight text-[#001E2B]">
              {data.property.name ?? "Lokasi properti"}
            </strong>
            <span className="text-[10px] leading-tight text-[#7C8C9A]">Lokasi properti</span>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "#5B5CE2",
            border: "3px solid white", boxShadow: "0 4px 14px rgba(91,92,226,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <House size={14} color="white" strokeWidth={2.2} />
          </div>
          <svg width="12" height="8" viewBox="0 0 12 8" style={{ marginTop: -2 }}>
            <polygon points="0,0 12,0 6,8" fill="#5B5CE2" />
          </svg>
        </div>
      </HtmlMarker>
    </>
  );
}

export default function ReportMap({
  data, intakeId, floodArea, focus = "ringkasan", focusGroup, visibleGroups,
  fullscreen, onToggleFullscreen, embedded = false,
}: {
  data: MapData;
  /** Needed to fetch street routes when a facility is tapped. */
  intakeId?: string;
  /** This location's flood polygon. The workspace shows only its own — the areas hub is
     where every analysed location's boundary is drawn together. */
  floodArea?: FloodArea | null;
  /** The report step currently open. Drives both the layer set and the framing. */
  focus?: MapFocus;
  /** Facility group opened in Tahap 05 — frames its pins and shows all of them. */
  focusGroup?: string | null;
  /** Facility group ids switched on in Tahap 05. Omit to show every group. */
  visibleGroups?: Set<string>;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  /** Fill the parent instead of claiming a viewport-height column — the mobile layout drops
   *  the map into a fixed-height card under the stage tabs. */
  embedded?: boolean;
}) {
  const [layers, setLayers] = useState(FOCUS.ringkasan.layers);
  /* Perjalanan swaps the thematic layers for the routes themselves — on that step "Banjir"
     is not what the buyer is toggling. Colours match the drawn polylines. */
  const [routeLayers, setRouteLayers] = useState({ station: true, toll: true });

  // The tab owns the layer set; the pills below stay live so a buyer can still override for
  // the step they are on. Switching tabs re-applies the preset, which is the point.
  useEffect(() => { setLayers(FOCUS[focus].layers); }, [focus]);

  const [selected, setSelected] = useState<MapFeature | null>(null);
  const [key, setKey] = useState(0);
  const home = { lat: data.property.lat, lng: data.property.lng };

  const evidence = useMemo(() => {
    // When a boundary is drawn, say what it is. The outline covers the whole kelurahan
    // (300–600 ha) while an actual flood affects a small part of it — naming the polygon
    // "batas kelurahan" and the reading "indeks regional" keeps those apart.
    if (layers.banjir && floodArea) {
      const b = floodArea.boundary;
      const cls = floodArea.flood ? `bahaya ${floodArea.flood.class}` : "indeks belum tersedia";
      return {
        dot: FLOOD_RED,
        title: `Batas kelurahan ${b.name ?? "—"} · ${cls}`,
        sub: `Garis putus-putus = batas wilayah${b.area_ha ? ` (${b.area_ha} ha)` : ""}, `
           + "bukan luas genangan · InaRISK regional",
      };
    }
    const nearest = [...data.red_flags].sort((a, b) => a.distance_km - b.distance_km)[0];
    if (nearest) {
      return { dot: "#E12626", title: nearest.label ?? nearest.name,
               sub: `${nearest.name} · ${Math.round(nearest.distance_km * 1000)} m dari properti` };
    }
    if (data.flood) {
      return { dot: "#E12626", title: `Kelas banjir: ${data.flood.class}`,
               sub: "InaRISK BNPB · indeks regional, bukan pengukuran per-RT" };
    }
    return { dot: "#94A3B8", title: "Belum ada red flag terdeteksi",
             sub: "Tetap verifikasi langsung saat survei" };
  }, [data, floodArea, layers.banjir]);

  if (!MAPS_KEY) {
    return <div className="flex size-full items-center justify-center p-6 text-center text-xs font-medium text-[#5C6C7A]">
      Peta tidak dapat dimuat: <code>VITE_GOOGLE_MAPS_KEY</code> belum diset.
    </div>;
  }

  const routePill = (k: "station" | "toll", label: string, color: string) => {
    const on = routeLayers[k];
    return (
      <button key={k} type="button"
              onClick={() => setRouteLayers((l) => ({ ...l, [k]: !l[k] }))}
              className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={on
                ? { backgroundColor: `${color}18`, color, border: `1px solid ${color}` }
                : { backgroundColor: "#F4F7F6", color: "#7C8C9A", border: "1px solid #E1E5E8" }}>
        <span className="size-1.5 rounded-full" style={{ backgroundColor: on ? color : "#C1CCD6" }} />
        {label}
      </button>
    );
  };

  const pill = (k: "banjir" | "poi" | "radius", label: string) => {
    const on = layers[k];
    return (
      <button key={k} type="button" onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}
              className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer"
              style={on
                ? { backgroundColor: "#E3FCEF", color: "#00684A", border: "1px solid #00ED64" }
                : { backgroundColor: "#F4F7F6", color: "#7C8C9A", border: "1px solid #E1E5E8" }}>
        <span className="size-1.5 rounded-full" style={{ backgroundColor: on ? "#00D972" : "#C1CCD6" }} />
        {label}
      </button>
    );
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-white transition-all duration-300"
         style={fullscreen
           ? { position: "fixed", inset: 0, zIndex: 1500, borderRadius: 0 }
           : embedded
             ? { height: "100%", borderRadius: 0 }
             : { borderRadius: 24, boxShadow: "0 8px 24px rgba(15,42,51,0.1)",
                 height: "calc(100vh - 108px)", minHeight: 500 }}>
      <div className="pointer-events-auto absolute inset-x-4 top-4 z-[1060] flex items-center gap-2 px-4 py-2.5"
           style={{ backgroundColor: "white", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", minHeight: 44 }}>
        <div className="flex shrink-0 items-center gap-1.5">
          <Layers size={14} className="text-[#3d4f5b]" />
          <span className="text-xs font-semibold" style={{ color: "#3D4F5B" }}>
            {focus === "perjalanan" ? "Rute" : "Map Layers"}
          </span>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          {focus === "perjalanan" ? (
            <>
              {routePill("station", "Transit (stasiun)", "#16A34A")}
              {routePill("toll", "Tol (mobil)", "#2563EB")}
            </>
          ) : (
            <>{pill("banjir", "Banjir")}{pill("poi", "POI")}{pill("radius", "Radius")}</>
          )}
        </div>
      </div>

      <div className="relative flex-1" style={{ zIndex: 0 }}>
        <Map key={key} defaultCenter={home} defaultZoom={15} gestureHandling="greedy"
             disableDefaultUI styles={NO_DEFAULT_POI} className="size-full">
          <Content data={data} intakeId={intakeId} layers={layers} floodArea={floodArea} focus={focus}
                   routeLayers={routeLayers} focusGroup={focusGroup} visibleGroups={visibleGroups}
                   selected={selected} onSelect={setSelected} />
          <Controls onRecenter={() => setKey((k) => k + 1)} />
        </Map>
      </div>

      <div className="pointer-events-auto absolute inset-x-4 z-[1060] flex items-center gap-2" style={{ bottom: 12 }}>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2"
             style={{ background: "rgba(255,255,255,0.96)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #E1E5E8" }}>
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: evidence.dot }} />
          <p className="truncate text-xs font-semibold" style={{ color: "#001E2B" }}>{evidence.title}</p>
          <p className="hidden truncate text-xs sm:block" style={{ color: "#7C8C9A" }}>{evidence.sub}</p>
        </div>
        <button type="button" onClick={onToggleFullscreen}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold shadow-md transition-all hover:bg-blue-50 active:scale-95 cursor-pointer"
                style={{ background: "white", color: "#2563EB", border: "1px solid #93C5FD" }}>
          {fullscreen ? <X size={13} /> : <Maximize2 size={13} />}
          {fullscreen ? "Tutup" : "Perluas Peta"}
        </button>
      </div>
    </div>
  );
}

export function ReportMapProvider({ children }: { children: React.ReactNode }) {
  if (!MAPS_KEY) return <>{children}</>;
  return <APIProvider apiKey={MAPS_KEY} language="id" region="ID">{children}</APIProvider>;
}
