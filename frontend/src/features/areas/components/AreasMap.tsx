import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { Plus, Minus, RotateCcw, Search } from "lucide-react";
import { decodePolyline, type CuratedArea, type FitCategory } from "../api";
import type { FloodArea } from "@/lib/api";
import { BoundaryPolygon, FLOOD_RED } from "@/features/workspace/ReportMap";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

export const CATEGORY_DOT: Record<FitCategory, string> = {
  strong_fit: "#00B545",
  interesting_tradeoff: "#D4A017",
  challenge_assumptions: "#64748B",
};

const JABODETABEK = { lat: -6.25, lng: 106.85 };

function toCanvasCoords(lat: number, lng: number): { x: number; y: number } {
  const minLat = -6.45, maxLat = -6.15;
  const minLng = 106.58, maxLng = 107.20;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return { x: Math.max(8, Math.min(92, x)), y: Math.max(12, Math.min(88, y)) };
}

/** Hide Google's own POI/transit/business pins. The report draws its *own* markers from
 *  the warehouse — leaving Google's defaults on means a restaurant icon sits next to our
 *  evidence pin with no provenance, which is exactly the confusion docs/14 §2 warns about. */
const NO_DEFAULT_POI: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

/** DOM overlay marker — same primitive the V3 workspace map uses, so markers can be styled
 *  with the design tokens instead of being flat pin images. */
function HtmlMarker({ position, zIndex = 1, onClick, children }: {
  position: { lat: number; lng: number };
  zIndex?: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const map = useMap();
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    if (!map) return;
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = function () {
      this.getPanes()!.overlayMouseTarget.appendChild(container);
    };
    overlay.draw = function () {
      const proj = this.getProjection();
      if (!proj) return;
      const pt = proj.fromLatLngToDivPixel(new google.maps.LatLng(position));
      if (!pt) return;
      Object.assign(container.style, {
        position: "absolute",
        transform: "translate(-50%, -100%)",
        left: `${pt.x}px`,
        top: `${pt.y}px`,
        zIndex: String(zIndex),
        cursor: onClick ? "pointer" : "default",
      });
    };
    overlay.onRemove = () => container.remove();
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, position.lat, position.lng, zIndex, container, onClick]);

  useEffect(() => {
    container.onclick = onClick ? (e) => { e.stopPropagation(); onClick(); } : null;
  }, [container, onClick]);

  return createPortal(children, container);
}

function Ring({ center, radiusM, color, dash }: {
  center: google.maps.LatLngLiteral; radiusM: number; color: string; dash: number[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const c = new google.maps.Circle({
      map, center, radius: radiusM, clickable: false,
      strokeOpacity: 0, fillColor: color, fillOpacity: 0.025,
    });
    // dashed outline via a symbol-stroked polyline approximation of the circle
    const path: google.maps.LatLngLiteral[] = [];
    for (let a = 0; a <= 360; a += 4) {
      const r = radiusM / 6378137;
      const lat = (center.lat * Math.PI) / 180;
      const lng = (center.lng * Math.PI) / 180;
      const br = (a * Math.PI) / 180;
      const la2 = Math.asin(Math.sin(lat) * Math.cos(r) + Math.cos(lat) * Math.sin(r) * Math.cos(br));
      const ln2 = lng + Math.atan2(Math.sin(br) * Math.sin(r) * Math.cos(lat),
                                   Math.cos(r) - Math.sin(lat) * Math.sin(la2));
      path.push({ lat: (la2 * 180) / Math.PI, lng: (ln2 * 180) / Math.PI });
    }
    const outline = new google.maps.Polyline({
      map, path, clickable: false, strokeOpacity: 0, strokeColor: color,
      icons: [{
        icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, strokeWeight: 1.4, scale: 3 },
        offset: "0", repeat: `${dash[0] + dash[1]}px`,
      }],
    });
    return () => { c.setMap(null); outline.setMap(null); };
  }, [map, center.lat, center.lng, radiusM, color, dash]);
  return null;
}

function RouteLine({ encoded }: { encoded: string }) {
  const map = useMap();
  const path = useMemo(() => decodePolyline(encoded), [encoded]);
  useEffect(() => {
    if (!map || path.length < 2) return;
    const line = new google.maps.Polyline({
      map, path, clickable: false, strokeColor: "#00684A",
      strokeOpacity: 0, // drawn via dash icons, matching the reference's dashed route
      icons: [{
        icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, strokeWeight: 4, scale: 4,
                strokeColor: "#00684A" },
        offset: "0", repeat: "14px",
      }],
    });
    return () => line.setMap(null);
  }, [map, path]);
  return null;
}

function Controls({ onReset, onZoomIn, onZoomOut }: { onReset: () => void; onZoomIn?: () => void; onZoomOut?: () => void }) {
  const map = useMap();
  const by = (d: number) => () => {
    if (map) map.setZoom((map.getZoom() ?? 11) + d);
    else if (d > 0 && onZoomIn) onZoomIn();
    else if (d < 0 && onZoomOut) onZoomOut();
  };
  const btn = "w-8 h-8 rounded-xl flex items-center justify-center text-[#001E2B] hover:bg-[#F4F7F8] active:scale-95 transition-all cursor-pointer";
  return (
    <div className="absolute top-16 sm:top-auto sm:bottom-4 right-3 sm:right-4 z-10">
      <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E1E5E8] shadow-lg">
        <button type="button" title="Perbesar Peta" onClick={by(1)} className={`${btn} font-bold`}>
          <Plus size={16} />
        </button>
        <button type="button" title="Perkecil Peta" onClick={by(-1)} className={`${btn} font-bold`}>
          <Minus size={16} />
        </button>
        <button type="button" title="Reset Tampilan Jabodetabek" onClick={onReset}
                className={`${btn} border-t border-[#E1E5E8]`}>
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}

function FloodBoundaries({ areas }: { areas: FloodArea[] }) {
  return (
    <>
      {areas.map((a) => (
        <BoundaryPolygon key={a.id} rings={a.boundary.rings} color={FLOOD_RED} />
      ))}
    </>
  );
}

function Layers({ anchor, areas, activeId, layers, floodAreas, onSelect }: {
  anchor: { label: string; lat: number; lng: number };
  areas: CuratedArea[];
  activeId: string | null;
  layers: { radius: boolean; transit: boolean; flood?: boolean };
  floodAreas?: FloodArea[];
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  const active = areas.find((a) => a.id === activeId);

  useEffect(() => {
    if (map && active) map.panTo(active.centroid);
  }, [map, active?.id]);

  return (
    <>
      {layers.flood && floodAreas?.length ? <FloodBoundaries areas={floodAreas} /> : null}
      {layers.radius && [10000, 20000, 35000].map((r, i) => (
        <Ring key={r} center={{ lat: anchor.lat, lng: anchor.lng }} radiusM={r}
              color={["#00ED64", "#3B82F6", "#94A3B8"][i]} dash={[6, 6]} />
      ))}

      {layers.transit && active?.commute?.polyline && (
        <RouteLine encoded={active.commute.polyline} />
      )}

      {/* Primary gravity anchor marker */}
      <HtmlMarker position={{ lat: anchor.lat, lng: anchor.lng }} zIndex={900}>
        <div className="relative flex flex-col items-center">
          <div className="relative z-10 flex items-center gap-1.5 rounded-full border-2 border-[#00ED64] bg-[#001E2B] px-3 py-1.5 text-white shadow-[0_6px_20px_rgba(0,30,43,0.5)]">
            <span className="size-2 rounded-full bg-[#00ED64] animate-pulse" />
            <span className="whitespace-nowrap text-[11px] font-black tracking-tight">
              {anchor.label} (Pusat SCBD)
            </span>
          </div>
          <div className="-mt-1 size-2 rotate-45 border-r-2 border-b-2 border-[#00ED64] bg-[#001E2B]" />
        </div>
      </HtmlMarker>

      {/* Corridor Centroid Pins */}
      {areas.map((a) => {
        const on = a.id === activeId;
        return (
          <HtmlMarker key={a.id} position={a.centroid} zIndex={on ? 800 : 100}
                      onClick={() => onSelect(a.id)}>
            <div className="relative flex flex-col items-center group cursor-pointer transition-transform duration-200">
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1 backdrop-blur-md transition-all duration-200"
                style={on
                  ? { background: "#001E2B", color: "#fff", border: "2px solid #00ED64",
                      boxShadow: "0 8px 24px rgba(0,237,100,0.45)", transform: "scale(1.08)" }
                  : { background: "rgba(255,255,255,0.96)", color: "#001E2B",
                      border: "1.5px solid rgba(203,213,225,0.9)",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
              >
                <span className="size-2 shrink-0 rounded-full"
                      style={{ background: CATEGORY_DOT[a.category] }} />
                <span className="whitespace-nowrap text-[11px] font-black tracking-tight">
                  {a.name.split(" & ")[0]}
                </span>
                <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                      style={on
                        ? { background: "rgba(0,237,100,0.22)", color: "#00ED64" }
                        : { background: "#F1F5F9", color: "#64748B" }}>
                  {a.commute ? `~${a.commute.minutes} mnt` : "?"}
                </span>
              </div>
              <div className={`-mt-1 size-2 rotate-45 border-r border-b ${
                on ? "bg-[#001E2B] border-[#00ED64]" : "bg-white border-[#CBD5E1]"
              }`} />
            </div>
          </HtmlMarker>
        );
      })}
    </>
  );
}

function OverlayBar({ query, onQuery, layers, onToggle, corridorCount, floodCount }: {
  query: string;
  onQuery: (q: string) => void;
  layers: { radius: boolean; transit: boolean; flood: boolean };
  onToggle: (k: "radius" | "transit" | "flood") => void;
  corridorCount: number;
  floodCount: number;
}) {
  const pill = (k: "radius" | "transit" | "flood", label: string, title: string) => {
    const on = layers[k];
    return (
      <button
        key={k}
        type="button"
        title={title}
        onClick={() => onToggle(k)}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
          on
            ? "bg-[#E3FCEF] text-[#00684A] border border-[#00ED64]"
            : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
        }`}
      >
        <span className={`size-1.5 shrink-0 rounded-full ${on ? "bg-[#00ED64]" : "bg-[#94A3B8]"}`} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2 sm:inset-x-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-2">
        <div className="group relative flex h-[38px] items-center rounded-full border border-[#E1E5E8] bg-white/95 px-3 shadow-sm backdrop-blur-md transition-all hover:border-[#CBD5E1] focus-within:border-[#001E2B] focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#001E2B]/10">
          <Search size={14} className="mr-2 shrink-0 text-[#7C8C9A] transition-colors group-focus-within:text-[#001E2B]" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Cari nama area atau wilayah..."
            aria-label="Cari nama area atau wilayah"
            className="w-36 bg-transparent text-xs font-semibold text-[#001E2B] outline-none transition-all placeholder:font-normal placeholder:text-[#8E9CA8] sm:w-56"
          />
        </div>

        <div className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-full border border-[#E1E5E8] bg-white/95 px-3 shadow-sm backdrop-blur-md">
          {pill(
            "flood",
            "Banjir",
            floodCount ? "Batas analisis risiko genangan BIG & BNPB" : "Layer banjir",
          )}
          {pill("transit", "Transit", "Rute transit koridor ke pusat aktivitas")}
          {pill("radius", "Radius", "Tampilkan lingkaran radius 10 / 20 / 35 km")}
        </div>
      </div>

      <div className="pointer-events-auto hidden shrink-0 items-center gap-2 rounded-full border border-white/15 bg-[#001E2B]/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-md xl:flex">
        <span className="size-2 animate-pulse rounded-full bg-[#00ED64]" />
        <span>InaRISK · Routes API · BIG 2024 · {corridorCount} Wilayah</span>
      </div>
    </div>
  );
}

/** Fallback interactive canvas map rendering when Google Maps API key is not supplied */
function InteractiveCanvasMap({
  anchor,
  areas,
  activeId,
  layers,
  query,
  onQuery,
  onSelect,
  corridorCount,
}: {
  anchor: { label: string; lat: number; lng: number };
  areas: CuratedArea[];
  activeId: string | null;
  layers: { radius: boolean; transit: boolean; flood: boolean };
  query: string;
  onQuery: (q: string) => void;
  onSelect: (id: string) => void;
  corridorCount: number;
}) {
  const [zoom, setZoom] = useState(1);
  const anchorCoords = toCanvasCoords(anchor.lat, anchor.lng);

  return (
    <div className="relative size-full overflow-hidden bg-[#F1F5F9] select-none">
      {/* Overlay Bar */}
      <OverlayBar
        query={query}
        onQuery={onQuery}
        layers={layers}
        onToggle={() => {}}
        corridorCount={corridorCount}
        floodCount={0}
      />

      {/* SVG Canvas Map Surface */}
      <div
        className="size-full transition-transform duration-300 ease-out origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Subtle grid pattern */}
          <defs>
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E2E8F0" strokeWidth="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Jakarta Bay Coastline Contour */}
          <path
            d="M 0 16 Q 25 18 45 15 T 75 17 T 100 14 L 100 0 L 0 0 Z"
            fill="#E0F2FE"
            opacity="0.8"
          />

          {/* Major arterial expressway lines */}
          <path d="M 10 35 L 90 40" stroke="#CBD5E1" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
          <path d="M 50 15 L 55 90" stroke="#CBD5E1" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
          <path d="M 20 80 L 80 25" stroke="#CBD5E1" strokeWidth="0.3" strokeDasharray="0.6 0.6" />

          {/* Concentric Radius Circles from Anchor */}
          {layers.radius && (
            <>
              <circle cx={anchorCoords.x} cy={anchorCoords.y} r="12" fill="none" stroke="#00ED64" strokeWidth="0.25" strokeDasharray="0.5 0.5" opacity="0.7" />
              <circle cx={anchorCoords.x} cy={anchorCoords.y} r="22" fill="none" stroke="#3B82F6" strokeWidth="0.25" strokeDasharray="0.5 0.5" opacity="0.6" />
              <circle cx={anchorCoords.x} cy={anchorCoords.y} r="34" fill="none" stroke="#94A3B8" strokeWidth="0.25" strokeDasharray="0.5 0.5" opacity="0.5" />
            </>
          )}

          {/* Transit lines to selected corridor */}
          {layers.transit && areas.map((a) => {
            if (a.id !== activeId) return null;
            const c = toCanvasCoords(a.centroid.lat, a.centroid.lng);
            return (
              <line
                key={a.id}
                x1={c.x}
                y1={c.y}
                x2={anchorCoords.x}
                y2={anchorCoords.y}
                stroke="#00684A"
                strokeWidth="0.5"
                strokeDasharray="0.8 0.8"
              />
            );
          })}
        </svg>

        {/* Anchor Pin Marker (Sudirman) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-30"
          style={{ left: `${anchorCoords.x}%`, top: `${anchorCoords.y}%` }}
        >
          <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-1.5 rounded-full border-2 border-[#00ED64] bg-[#001E2B] px-2.5 py-1 text-white shadow-lg">
              <span className="size-2 rounded-full bg-[#00ED64] animate-ping" />
              <span className="whitespace-nowrap text-[10px] font-black">
                {anchor.label} (Pusat SCBD)
              </span>
            </div>
            <div className="-mt-1 size-2 rotate-45 border-r-2 border-b-2 border-[#00ED64] bg-[#001E2B]" />
          </div>
        </div>

        {/* Corridor Centroid Pins */}
        {areas.map((a) => {
          const c = toCanvasCoords(a.centroid.lat, a.centroid.lng);
          const on = a.id === activeId;
          return (
            <div
              key={a.id}
              onClick={() => onSelect(a.id)}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-20 group"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <div className="relative flex flex-col items-center transition-transform duration-200 group-hover:scale-105">
                <div
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md transition-all shadow-md"
                  style={on
                    ? { background: "#001E2B", color: "#fff", border: "2px solid #00ED64", transform: "scale(1.06)" }
                    : { background: "rgba(255,255,255,0.95)", color: "#001E2B", border: "1.5px solid #CBD5E1" }}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ background: CATEGORY_DOT[a.category] }} />
                  <span className="whitespace-nowrap text-[10.5px] font-black">
                    {a.name.split(" & ")[0]}
                  </span>
                  <span
                    className="rounded px-1 py-0.2 text-[9px] font-bold"
                    style={on
                      ? { background: "rgba(0,237,100,0.25)", color: "#00ED64" }
                      : { background: "#F1F5F9", color: "#64748B" }}
                  >
                    {a.commute ? `~${a.commute.minutes} mnt` : "?"}
                  </span>
                </div>
                <div className={`-mt-1 size-2 rotate-45 border-r border-b ${
                  on ? "bg-[#001E2B] border-[#00ED64]" : "bg-white border-[#CBD5E1]"
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Zoom Controls */}
      <Controls
        onReset={() => setZoom(1)}
        onZoomIn={() => setZoom((z) => Math.min(1.8, z + 0.2))}
        onZoomOut={() => setZoom((z) => Math.max(0.8, z - 0.2))}
      />
    </div>
  );
}

export default function AreasMap(props: {
  anchor: { label: string; lat: number; lng: number };
  areas: CuratedArea[];
  activeId: string | null;
  layers: { radius: boolean; transit: boolean };
  floodAreas?: FloodArea[];
  onSelect: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const { query, onQuery, floodAreas } = props;
  const hasFlood = !!floodAreas?.length;
  const [layers, setLayers] = useState({ radius: true, transit: true, flood: true });
  const shown = props.areas;

  if (!MAPS_KEY) {
    return (
      <InteractiveCanvasMap
        anchor={props.anchor}
        areas={shown}
        activeId={props.activeId}
        layers={layers}
        query={query}
        onQuery={onQuery}
        onSelect={props.onSelect}
        corridorCount={props.areas.length}
      />
    );
  }

  return (
    <APIProvider apiKey={MAPS_KEY} language="id" region="ID">
      <Map
        key={resetKey}
        defaultCenter={JABODETABEK}
        defaultZoom={11}
        gestureHandling="greedy"
        disableDefaultUI
        styles={NO_DEFAULT_POI}
        className="h-full w-full"
      >
        <Layers {...props} areas={shown} layers={{ ...layers, flood: layers.flood && hasFlood }} />
        <Controls onReset={() => setResetKey((k) => k + 1)} />
        <OverlayBar
          query={query}
          onQuery={onQuery}
          layers={layers}
          onToggle={(k) => setLayers((l) => (k === "flood" && !hasFlood ? l : { ...l, [k]: !l[k] }))}
          floodCount={floodAreas?.length ?? 0}
          corridorCount={props.areas.length}
        />
      </Map>
    </APIProvider>
  );
}
