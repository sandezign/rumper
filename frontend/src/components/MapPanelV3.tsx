import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link2,
  X,
  Home,
  Hospital,
  Stethoscope,
  Pill,
  School,
  Store,
  ShoppingCart,
  Train,
  Milestone,
  Zap,
  Trash2,
  Factory,
  Skull,
  Layers,
  LoaderCircle,
  MapPin,
  Minus,
  MousePointerClick,
  Plus,
} from "lucide-react";
import type { MapData, MapFeature, MapRoutes, RouteLeg } from "@/lib/api";
import { bandHex, CONFIDENCE } from "@/lib/risk";
import { AssistantPillV3 } from "@/components/v3/AssistantPanelV3";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildEvidenceIndex,
  featureId,
  formatDistance,
  type EvidenceIndex,
  type EvidenceItem,
  type MapTab,
} from "@/features/analysis/evidence";

const FACILITY_MAP: Record<
  string,
  { icon: React.ComponentType<any>; color: string; bg: string; border: string }
> = {
  hospital: { icon: Hospital, color: "text-rose-600", bg: "bg-rose-50/90", border: "border-rose-200" },
  clinic: { icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50/90", border: "border-blue-200" },
  pharmacy: { icon: Pill, color: "text-emerald-600", bg: "bg-emerald-50/90", border: "border-emerald-200" },
  school: { icon: School, color: "text-indigo-600", bg: "bg-indigo-50/90", border: "border-indigo-200" },
  market: { icon: Store, color: "text-amber-600", bg: "bg-amber-50/90", border: "border-amber-200" },
  supermarket: { icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50/90", border: "border-orange-200" },
  station: { icon: Train, color: "text-violet-600", bg: "bg-violet-50/90", border: "border-violet-200" },
  toll_gate: { icon: Milestone, color: "text-cyan-600", bg: "bg-cyan-50/90", border: "border-cyan-200" },
};

const DANGER_MAP: Record<
  string,
  { icon: React.ComponentType<any>; color: string; bg: string; border: string }
> = {
  sutet_tower: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50/90", border: "border-amber-300" },
  landfill: { icon: Trash2, color: "text-red-600", bg: "bg-red-50/90", border: "border-red-300" },
  industrial: { icon: Factory, color: "text-slate-600", bg: "bg-slate-50/90", border: "border-slate-300" },
  cemetery: { icon: Skull, color: "text-zinc-600", bg: "bg-zinc-50/90", border: "border-zinc-300" },
  rail_point: { icon: Train, color: "text-red-600", bg: "bg-red-50/90", border: "border-red-300" },
};

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e3f2fd" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f9fbfa" }] },
];

const COVERAGE_RADIUS_M = 3000;

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

const streetViewUrl = (lat: number, lng: number) =>
  `https://maps.googleapis.com/maps/api/streetview?size=440x220&location=${lat},${lng}&fov=90&key=${MAPS_KEY}`;
const gmapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/* ────────────────────────── Google Maps primitives ────────────────────────── */

/** DOM marker on the overlayMouseTarget pane — lets markers be styled with Tailwind. */
function HtmlMarker({
  position,
  zIndex = 1,
  onClick,
  children,
}: {
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
      if (pt) {
        Object.assign(container.style, {
          position: "absolute",
          transform: "translate(-50%, -50%)",
          left: `${pt.x}px`,
          top: `${pt.y}px`,
          zIndex: String(zIndex),
          cursor: onClick ? "pointer" : "default",
        });
      }
    };
    overlay.onRemove = () => container.remove();
    overlay.setMap(map);
    return () => overlay.setMap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, position.lat, position.lng, zIndex]);

  useEffect(() => {
    container.onclick = onClick
      ? (e) => {
          e.stopPropagation();
          onClick();
        }
      : null;
  }, [container, onClick]);

  return createPortal(children, container);
}

function MapCircle({
  center,
  radius,
  color,
  fillOpacity,
  weight = 1.5,
}: {
  center: { lat: number; lng: number };
  radius: number;
  color: string;
  fillOpacity: number;
  weight?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      map,
      center,
      radius,
      strokeColor: color,
      strokeOpacity: 0.6,
      strokeWeight: weight,
      fillColor: color,
      fillOpacity,
      clickable: false,
    });
    return () => circle.setMap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center.lat, center.lng, radius, color, fillOpacity, weight]);
  return null;
}

/**
 * The real driving route, drawn from Google's encoded polyline
 * (`GET /api/checks/{id}/routes`). Casing + line, like a navigation app.
 */
function RouteLine({ encoded, color }: { encoded: string; color: string }) {
  const map = useMap();
  const geometry = useMapsLibrary("geometry");
  useEffect(() => {
    if (!map || !geometry) return;
    const path = geometry.encoding.decodePath(encoded);
    const casing = new google.maps.Polyline({
      map,
      path,
      strokeColor: "#ffffff",
      strokeOpacity: 0.95,
      strokeWeight: 8,
      clickable: false,
      zIndex: 1,
    });
    const line = new google.maps.Polyline({
      map,
      path,
      strokeColor: color,
      strokeOpacity: 0.95,
      strokeWeight: 4.5,
      clickable: false,
      zIndex: 2,
    });
    return () => {
      casing.setMap(null);
      line.setMap(null);
    };
  }, [map, geometry, encoded, color]);
  return null;
}

/**
 * Fallback connector when no route is available: dashed, because it is the straight-line
 * `distance_km` from the warehouse — not a drivable path — and it must not read as one.
 */
function MapConnector({
  from,
  to,
  color,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  color: string;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const line = new google.maps.Polyline({
      map,
      path: [from, to],
      strokeOpacity: 0,
      clickable: false,
      icons: [
        {
          icon: { path: "M 0,-1 0,1", strokeOpacity: 0.85, strokeColor: color, scale: 3 },
          offset: "0",
          repeat: "12px",
        },
      ],
    });
    return () => line.setMap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, from.lat, from.lng, to.lat, to.lng, color]);
  return null;
}

/** Keeps the camera in sync with the selected evidence (two-way sync with the panels). */
function MapCamera({
  center,
  target,
}: {
  center: { lat: number; lng: number };
  target: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (target) {
      map.panTo(target);
      if ((map.getZoom() ?? 14) < 15) map.setZoom(15);
    } else {
      map.panTo(center);
      map.setZoom(14);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, target?.lat, target?.lng, center.lat, center.lng]);
  return null;
}

function ZoomControl() {
  const map = useMap();
  const zoomBy = (d: number) => () => {
    if (!map) return;
    map.setZoom((map.getZoom() ?? 14) + d);
  };
  return (
    <div className="absolute bottom-24 right-4 z-10 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-raised lg:bottom-6">
      <button
        onClick={zoomBy(1)}
        className="flex size-11 cursor-pointer items-center justify-center border-b border-border/60 text-text-secondary transition-colors hover:bg-surface-soft hover:text-text-primary"
        aria-label="Perbesar peta"
      >
        <Plus className="size-4" aria-hidden />
      </button>
      <button
        onClick={zoomBy(-1)}
        className="flex size-11 cursor-pointer items-center justify-center text-text-secondary transition-colors hover:bg-surface-soft hover:text-text-primary"
        aria-label="Perkecil peta"
      >
        <Minus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/* ────────────────────────── Overlay chrome ────────────────────────── */

function MapLegend({
  activeMapTab,
  onOpenChange,
}: {
  activeMapTab: MapTab;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(max-width: 479px)").matches,
  );

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  useEffect(() => {
    const compactViewport = window.matchMedia("(max-width: 479px)");
    const collapseForCompactViewport = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    compactViewport.addEventListener("change", collapseForCompactViewport);
    return () => compactViewport.removeEventListener("change", collapseForCompactViewport);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className="absolute bottom-4 left-4 z-10 inline-flex min-h-11 cursor-pointer items-center gap-xs rounded-xl border border-border/80 bg-card/95 px-sm py-2 font-sans text-caption-bold shadow-raised backdrop-blur-md transition-[background-color,box-shadow,transform] duration-200 hover:bg-surface-soft active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Layers className="size-4 text-brand-teal" aria-hidden /> Legenda
      </button>
    );
  }

  const legendChip = (Icon: React.ComponentType<any>, colorClass: string, bgClass: string) => (
    <span className={`map-emoji !h-6 !w-6 shrink-0 border shadow-none ${bgClass} ${colorClass} flex items-center justify-center rounded-full`}>
      <Icon className="size-3" />
    </span>
  );

  return (
    <div
      className="absolute bottom-4 left-4 z-10 w-64 max-w-[calc(100%-var(--space-2xl))] rounded-xl border border-border/50 bg-card/95 p-md font-sans text-caption shadow-raised backdrop-blur-md max-[479px]:bottom-24"
      aria-label="Legenda peta"
    >
      <div className="flex min-h-11 items-center justify-between border-b border-border/40 pb-xs">
        <p className="flex items-center gap-xxs font-sans text-body-sm-medium font-semibold text-text-primary">
          <Layers className="size-3.5 text-brand-teal" aria-hidden /> Legenda
        </p>
        <button
          onClick={() => setOpen(false)}
          className="-mr-sm flex size-11 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-[background-color,color,transform] duration-150 hover:bg-surface-soft hover:text-text-secondary active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Tutup legenda"
          aria-expanded={true}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-xs flex flex-col gap-xs text-text-secondary">
        <div className="flex items-center gap-xs">
          <span className="map-pin !h-6 !w-6 flex shrink-0 items-center justify-center rounded-full border border-surface-canvas/20 bg-brand-teal-deep shadow-sm">
            <Home className="size-3 text-white" />
          </span>
          <span className="text-micro font-medium">Rumah kandidat</span>
        </div>

        {activeMapTab === "overview" && (
          <>
            <div className="flex items-center gap-xs">
              <span className="size-4 shrink-0 rounded-full border-2 border-brand-teal bg-brand-teal/10" />
              <span className="text-micro font-medium leading-snug">Radius survei 3 km</span>
            </div>
            <div className="flex items-start gap-xs">
              <div className="mt-0.5 flex shrink-0 gap-1">
                {legendChip(Hospital, "text-rose-600", "bg-rose-50 border-rose-200")}
                {legendChip(Train, "text-violet-600", "bg-violet-50 border-violet-200")}
                {legendChip(Factory, "text-slate-600", "bg-slate-50 border-slate-300")}
              </div>
              <div className="flex flex-col">
                <span className="text-micro font-medium text-text-primary">Ringkasan gabungan</span>
                <span className="text-[10px] text-text-tertiary">
                  Fasilitas terdekat per jenis, stasiun, tol, dan red flag
                </span>
              </div>
            </div>
          </>
        )}

        {activeMapTab === "red-flags" && (
          <>
            <div className="flex items-center gap-xs">
              <span className="size-4 shrink-0 rounded-full border-2 border-blue-500 bg-blue-500/10" />
              <span className="text-micro font-medium leading-snug">Konteks banjir InaRISK (1 km)</span>
            </div>
            <div className="mt-1 flex items-start gap-xs">
              <div className="mt-0.5 flex shrink-0 gap-1">
                {legendChip(Factory, "text-slate-600", "bg-slate-50 border-slate-300")}
                <span className="map-emoji !h-6 !w-6 flex shrink-0 items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-600">
                  <Zap className="size-3" />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-micro font-medium text-text-primary">Risiko sekitar</span>
                <span className="text-[10px] text-text-tertiary">SUTET, pembuangan, industri</span>
              </div>
            </div>
          </>
        )}

        {activeMapTab === "facilities" && (
          <div className="flex items-start gap-xs">
            <div className="mt-0.5 flex shrink-0 gap-1">
              {legendChip(Hospital, "text-rose-600", "bg-rose-50 border-rose-200")}
              {legendChip(School, "text-indigo-600", "bg-indigo-50 border-indigo-200")}
            </div>
            <div className="flex flex-col">
              <span className="text-micro font-medium text-text-primary">Fasilitas esensial</span>
              <span className="text-[10px] text-text-tertiary">RS, klinik, sekolah, dll.</span>
            </div>
          </div>
        )}

        {activeMapTab === "commute" && (
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs">
              <span className="size-4 shrink-0 rounded-full border-2 border-violet-600 bg-violet-600/10" />
              <span className="text-micro font-medium leading-snug">Radius jalan kaki 0,5–2 km</span>
            </div>
            <div className="flex items-center gap-xs">
              {legendChip(Train, "text-violet-600", "bg-violet-50 border-violet-200")}
              <span className="text-micro font-medium">Stasiun terdekat</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="h-1 w-4 shrink-0 rounded-full bg-violet-600" />
              <span className="text-micro font-medium leading-snug">Rute jalan nyata (berkendara)</span>
            </div>
          </div>
        )}

        {activeMapTab === "toll-access" && (
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs">
              {legendChip(Milestone, "text-cyan-600", "bg-cyan-50 border-cyan-200")}
              <span className="text-micro font-medium">Gerbang tol terdekat</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="h-1 w-4 shrink-0 rounded-full bg-cyan-600" />
              <span className="text-micro font-medium leading-snug">Rute jalan nyata (berkendara)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const MAP_TABS: Array<{ key: MapTab; label: string }> = [
  { key: "overview", label: "Ringkasan" },
  { key: "red-flags", label: "Risiko" },
  { key: "commute", label: "Perjalanan" },
  { key: "facilities", label: "Fasilitas" },
  { key: "toll-access", label: "Tol & akses" },
];

/** Shown instead of leaving a tab silently blank — an absent layer is itself information. */
const EMPTY_TAB_NOTE: Record<MapTab, string> = {
  overview: "",
  "red-flags": "Tidak ada red flag terdeteksi dalam radius 3 km pada data warehouse.",
  commute: "Stasiun terdekat belum tersedia di data warehouse untuk lokasi ini.",
  facilities: "Data fasilitas untuk area ini belum tersedia di data warehouse.",
  "toll-access": "Gerbang tol terdekat belum tersedia di data warehouse untuk lokasi ini.",
};

const CONFIDENCE_STYLE: Record<string, string> = {
  data_kuat: "text-emerald-700 bg-emerald-50 border-emerald-200",
  data_sedang: "text-amber-700 bg-amber-50 border-amber-200",
  perlu_validasi: "text-rose-700 bg-rose-50 border-rose-200",
};

/** Confidence drives marker treatment (docs/14 §2 confidence-based rendering). */
function confidenceBorder(item: EvidenceItem | undefined, fallback: string): string {
  if (!item) return fallback;
  if (item.confidence === "perlu_validasi") return "border-dashed border-2 border-amber-500";
  if (item.confidence === "data_sedang") return "border-2 border-amber-300";
  return fallback;
}

/**
 * Map workspace region for the V3 workspace (docs/14, docs/16). Google Maps via
 * @vis.gl/react-google-maps — same provider as the rest of the app, no second tile stack.
 * Every marker and inspector field is real API data resolved through the evidence index.
 */
export default function MapPanelV3({
  data,
  index,
  routes,
  activeMapTab,
  onMapTabChange,
  selectedEvidence,
  onMarkerClick,
  visibleLayers,
  activeFacilityCategory,
  assistantOpen = false,
  onToggleAssistant,
}: {
  data: MapData;
  /** Shared index; built here when the caller does not pass one. */
  index?: EvidenceIndex;
  /** Real street routes to the station / toll gate; null → dashed straight-line fallback. */
  routes?: MapRoutes | null;
  activeMapTab: MapTab;
  onMapTabChange: (tab: MapTab) => void;
  selectedEvidence: string | null;
  onMarkerClick: (evidenceId: string | null) => void;
  visibleLayers: string[];
  activeFacilityCategory: string | null;
  assistantOpen?: boolean;
  onToggleAssistant?: () => void;
}) {
  const { property, rls } = data;
  const bandColor = bandHex(rls.band);
  const fallbackIndex = useMemo(() => buildEvidenceIndex(null, data), [data]);
  const evidenceIndex = index ?? fallbackIndex;
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [legendOpen, setLegendOpen] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(max-width: 479px)").matches,
  );
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">(
    MAPS_KEY ? "loading" : "error",
  );

  const selected = selectedEvidence ? evidenceIndex.byId.get(selectedEvidence) ?? null : null;
  const selectedRoute =
    selected?.kind === "station" ? routes?.station ?? null
    : selected?.kind === "toll_gate" ? routes?.toll ?? null
    : null;
  const center = { lat: property.lat, lng: property.lng };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMarkerClick(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMarkerClick]);

  const pick = useCallback((f: MapFeature) => () => onMarkerClick(featureId(f)), [onMarkerClick]);

  // Layer filters according to the current tab selection.
  const showOverview = activeMapTab === "overview";
  const showRedFlags = activeMapTab === "red-flags";
  const showCommute = activeMapTab === "commute";
  const showFacilities = activeMapTab === "facilities";
  const showToll = activeMapTab === "toll-access";

  const facilities = useMemo(() => {
    const all = data.facilities ?? [];
    if (!activeFacilityCategory) return all;
    const group = evidenceIndex.facilityGroups.find((g) => g.key === activeFacilityCategory);
    return group ? all.filter((f) => group.kinds.includes(f.kind)) : all;
  }, [data.facilities, activeFacilityCategory, evidenceIndex.facilityGroups]);

  /** What each tab actually has to show — surfaced on the tab and used for empty states. */
  const tabCounts = useMemo<Record<MapTab, number | null>>(
    () => ({
      overview: null,
      "red-flags": (data.red_flags?.length ?? 0) + (data.flood && data.flood.class !== "rendah" ? 1 : 0),
      commute: data.nearest_station ? 1 : 0,
      // same total as the analysis "Nearby Facilities" badge (facilities + station + toll)
      facilities: evidenceIndex.facilityCount,
      "toll-access": data.nearest_toll ? 1 : 0,
    }),
    [data, evidenceIndex.facilityCount],
  );

  // Overview is the composite view: the nearest facility of each kind plus transit, toll
  // and every red flag — so the default map already reflects the report instead of showing
  // a bare pin. Deeper tabs then widen one layer at a time.
  const overviewFacilities = useMemo(() => {
    // (`Map` is the google-maps component here, so a plain record does the grouping.)
    const best: Record<string, MapFeature> = {};
    for (const f of data.facilities ?? []) {
      const cur = best[f.kind];
      if (!cur || (f.distance_km ?? Infinity) < (cur.distance_km ?? Infinity)) best[f.kind] = f;
    }
    return Object.values(best);
  }, [data.facilities]);

  const visibleFacilities =
    showFacilities || visibleLayers.includes("facilities")
      ? facilities
      : showOverview
        ? overviewFacilities
        : [];
  // Station and toll gate belong to the "Transportasi" facility group as well, so the
  // Facilities tab must render them — otherwise picking that group empties the map.
  const groupKinds = activeFacilityCategory
    ? evidenceIndex.facilityGroups.find((g) => g.key === activeFacilityCategory)?.kinds ?? []
    : null;
  const facilitiesTabShows = (kind: string) => showFacilities && (!groupKinds || groupKinds.includes(kind));

  const showStation = showCommute || showOverview || visibleLayers.includes("transit") || facilitiesTabShows("station");
  const showTollGate = showToll || showOverview || visibleLayers.includes("toll") || facilitiesTabShows("toll_gate");
  const showHazards = showRedFlags || showOverview || visibleLayers.includes("redflags");
  const emptyTab = tabCounts[activeMapTab] === 0;

  const markerClass = (
    f: MapFeature,
    config: { color: string; bg: string; border: string } | undefined,
    critical = false,
  ) => {
    const item = evidenceIndex.byId.get(featureId(f));
    const isSelected = selectedEvidence === featureId(f);
    const deEmphasize = !!selectedEvidence && !isSelected;
    const base = critical
      ? "critical border-2 border-red-500 bg-red-100/90 text-red-600 size-9"
      : `${confidenceBorder(item, config ? config.border : "border-border")} ${config ? `${config.bg} ${config.color}` : "bg-white text-foreground"}`;
    return `map-emoji flex size-8 cursor-pointer items-center justify-center rounded-full border shadow-raised transition-all duration-200 hover:scale-125 ${base} ${
      isSelected ? "ring-4 ring-brand-teal ring-offset-2 scale-110 shadow-overlay" : ""
    } ${deEmphasize ? "opacity-35 grayscale blur-[0.3px] scale-90" : ""}`;
  };

  const propertySelected = !!selected && selected.position?.lat === center.lat && selected.feature === null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      {/* Compact property summary — the analysis column already carries it on desktop. */}
      <div className="z-20 shrink-0 border-b border-border bg-card px-md py-sm shadow-subtle lg:hidden">
        <div className="flex items-start justify-between gap-md">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-xs">
              <span className="whitespace-nowrap rounded-md bg-surface-soft px-2 py-0.5 text-micro-uppercase font-bold tracking-widest text-text-muted">
                Bukti lokasi
              </span>
              {rls.band_label && (
                <span
                  className="shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-micro font-semibold"
                  style={{ color: bandColor, backgroundColor: `${bandColor}12` }}
                >
                  {rls.band_label}
                </span>
              )}
            </div>
            <h2 className="mt-xs flex items-center gap-1.5 truncate text-body-medium font-bold text-text-primary">
              <MapPin className="size-4 shrink-0 text-brand-teal" />
              {property.name || "Lokasi kandidat"}
            </h2>
            <p className="mt-0.5 truncate text-caption font-medium text-text-tertiary">
              {property.formatted_address}
            </p>
          </div>

          <div
            className="relative flex shrink-0 items-center justify-center"
            role="img"
            aria-label={`Skor lokasi ${rls.score !== null ? Math.round(rls.score) : "belum tersedia"} dari 100${
              rls.band_label ? `, ${rls.band_label}` : ""
            }`}
          >
            <svg className="size-14 -rotate-90">
              <circle cx="28" cy="28" r="24" className="fill-none stroke-surface-soft" strokeWidth="4" />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="fill-none transition-all duration-500 ease-out"
                strokeWidth="4"
                stroke={bandColor}
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - (rls.score ?? 0) / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-body-sm-medium font-bold tabular-nums text-text-primary">
                {rls.score !== null ? Math.round(rls.score) : "–"}
              </span>
              <span className="-mt-0.5 text-[9px] font-bold tabular-nums text-text-tertiary">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map viewport */}
      <div className="relative z-10 min-h-0 flex-1 bg-surface-soft">
        {MAPS_KEY && (
          <APIProvider apiKey={MAPS_KEY} language="id" region="ID">
            <Map
              defaultCenter={center}
              defaultZoom={14}
              styles={MAP_STYLES}
              gestureHandling="greedy"
              disableDefaultUI
              clickableIcons={false}
              className="h-full w-full"
              onTilesLoaded={() => setMapStatus("ready")}
              onClick={() => onMarkerClick(null)}
            >
              <MapCamera center={center} target={selected?.position ?? null} />

              {/* Survey radius, tinted by the interpretation band */}
              {showOverview && (
                <MapCircle center={center} radius={COVERAGE_RADIUS_M} color={bandColor} fillOpacity={0.05} />
              )}

              {/* InaRISK flood context — only when the warehouse reports a real class */}
              {(showRedFlags || showOverview || visibleLayers.includes("flood")) &&
                data.flood &&
                data.flood.class !== "rendah" && (
                  <MapCircle center={center} radius={1000} color="#3b82f6" fillOpacity={0.08} />
                )}

              {/* Walkability rings around the property */}
              {(showCommute || visibleLayers.includes("transit")) && (
                <>
                  <MapCircle center={center} radius={500} color="#8b5cf6" fillOpacity={0.04} />
                  <MapCircle center={center} radius={1000} color="#8b5cf6" fillOpacity={0.02} />
                  <MapCircle center={center} radius={2000} color="#8b5cf6" fillOpacity={0.015} />
                </>
              )}

              {/* Candidate property */}
              <HtmlMarker position={center} zIndex={100} onClick={() => onMarkerClick(null)}>
                <div
                  className={`map-pin flex size-10 scale-105 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-brand-teal-deep text-white shadow-raised transition-transform hover:scale-110 ${
                    propertySelected ? "ring-4 ring-brand-teal ring-offset-2 scale-110" : ""
                  }`}
                >
                  <Home className="size-5" />
                </div>
              </HtmlMarker>

              {/* Route to the station: real street path when we have one, else dashed */}
              {showCommute &&
                data.nearest_station &&
                (routes?.station ? (
                  <RouteLine encoded={routes.station.polyline} color="#8b5cf6" />
                ) : (
                  <MapConnector
                    from={center}
                    to={{ lat: data.nearest_station.lat, lng: data.nearest_station.lng }}
                    color="#8b5cf6"
                  />
                ))}
              {showToll &&
                data.nearest_toll &&
                (routes?.toll ? (
                  <RouteLine encoded={routes.toll.polyline} color="#0891b2" />
                ) : (
                  <MapConnector
                    from={center}
                    to={{ lat: data.nearest_toll.lat, lng: data.nearest_toll.lng }}
                    color="#0891b2"
                  />
                ))}

              {/* Essential facilities */}
              {visibleFacilities.map((f, i) => {
                const config = FACILITY_MAP[f.kind];
                const Icon = config?.icon;
                return (
                  <HtmlMarker key={`f${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={10} onClick={pick(f)}>
                    <div className={markerClass(f, config)}>
                      {Icon ? <Icon className="size-4" /> : <MapPin className="size-4" />}
                    </div>
                  </HtmlMarker>
                );
              })}

              {/* Commute — nearest station */}
              {showStation && data.nearest_station && (
                <HtmlMarker
                  position={{ lat: data.nearest_station.lat, lng: data.nearest_station.lng }}
                  zIndex={20}
                  onClick={pick(data.nearest_station)}
                >
                  <div className={markerClass(data.nearest_station, FACILITY_MAP.station)}>
                    <Train className="size-4" />
                  </div>
                </HtmlMarker>
              )}

              {/* Toll & access — nearest toll gate */}
              {showTollGate && data.nearest_toll && (
                <HtmlMarker
                  position={{ lat: data.nearest_toll.lat, lng: data.nearest_toll.lng }}
                  zIndex={20}
                  onClick={pick(data.nearest_toll)}
                >
                  <div className={markerClass(data.nearest_toll, FACILITY_MAP.toll_gate)}>
                    <Milestone className="size-4" />
                  </div>
                </HtmlMarker>
              )}

              {/* Red flags */}
              {showHazards &&
                (data.red_flags ?? []).map((f, i) => {
                  const config = DANGER_MAP[f.kind];
                  const Icon = config?.icon;
                  return (
                    <HtmlMarker key={`r${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={50} onClick={pick(f)}>
                      <div className={markerClass(f, config, !!f.critical)}>
                        {Icon ? <Icon className={f.critical ? "size-5" : "size-4"} /> : <Zap className="size-4" />}
                      </div>
                    </HtmlMarker>
                  );
                })}

              {/* Data gaps (only present when the payload carries them) */}
              {visibleLayers.includes("gaps") &&
                (data.gaps ?? []).map((f, i) => {
                  const isSelected = selectedEvidence === featureId(f);
                  return (
                    <HtmlMarker key={`g${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={45} onClick={pick(f)}>
                      <div
                        className={`map-emoji flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-zinc-400 bg-zinc-50 text-zinc-500 shadow-sm transition-all duration-200 hover:scale-125 hover:bg-zinc-100 ${
                          isSelected ? "ring-4 ring-brand-teal ring-offset-2 scale-110" : ""
                        }`}
                      >
                        <span className="font-sans text-xs font-bold">?</span>
                      </div>
                    </HtmlMarker>
                  );
                })}

              <ZoomControl />
            </Map>
          </APIProvider>
        )}

        {mapStatus !== "ready" && (
          <div className="absolute inset-0 z-[900] flex items-center justify-center bg-surface-soft/85 px-md backdrop-blur-sm">
            {mapStatus === "loading" ? (
              <div
                className="flex items-center gap-xs rounded-xl border border-border bg-card px-md py-sm text-body-sm-medium text-text-secondary shadow-raised"
                role="status"
              >
                <LoaderCircle className="size-4 animate-spin text-brand-teal motion-reduce:animate-none" aria-hidden />
                Memuat data peta…
              </div>
            ) : (
              <div className="max-w-sm rounded-xl border border-border bg-card p-md text-center shadow-raised" role="alert">
                <p className="text-body-sm-medium text-text-primary">Peta belum dapat dimuat</p>
                <p className="mt-xxs text-caption text-text-secondary">
                  Temuan tertulis tetap tersedia di panel analisis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* An empty layer is a finding too — say so instead of showing a blank canvas. */}
        {emptyTab && mapStatus === "ready" && (
          <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center px-4">
            <p className="max-w-sm rounded-xl border border-border/60 bg-card/95 px-md py-2 text-center text-caption font-medium text-text-secondary shadow-raised backdrop-blur-md">
              {EMPTY_TAB_NOTE[activeMapTab]}
            </p>
          </div>
        )}

        <MapLegend activeMapTab={activeMapTab} onOpenChange={setLegendOpen} />

        {/* Collapsed-assistant control over the map canvas */}
        {!assistantOpen && onToggleAssistant && (
          <div className={`absolute bottom-5 right-4 z-20 ${legendOpen ? "max-[479px]:hidden" : ""}`}>
            <AssistantPillV3 onOpen={onToggleAssistant} />
          </div>
        )}

        {/* Floating map navigation — centred over the canvas, shifted clear of the
            inspector while it is open so the two never overlap on desktop. */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4 ${
            selected ? "lg:pr-[22.25rem]" : ""
          }`}
        >
          <Tabs
            value={activeMapTab}
            onValueChange={(value) => onMapTabChange(value as MapTab)}
            className="pointer-events-auto w-fit max-w-full"
          >
            <TabsList
              aria-label="Lapisan bukti peta"
              className="h-auto min-h-0 flex-wrap justify-center gap-xs rounded-2xl border border-border/50 bg-card/95 p-1.5 shadow-raised backdrop-blur-md"
            >
              {MAP_TABS.map(({ key, label }) => {
                const count = tabCounts[key];
                const empty = count === 0;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    title={empty ? `${label} — tidak ada data untuk lokasi ini` : label}
                    className={`group h-11 min-h-11 shrink-0 rounded-full border border-transparent px-sm text-caption-bold text-text-secondary transition-[color,background-color,box-shadow,transform] duration-150 hover:bg-surface-soft hover:text-foreground active:scale-[0.96] data-[state=active]:border-b-0 data-[state=active]:border-transparent data-[state=active]:bg-brand-teal-deep data-[state=active]:text-text-on-dark ${
                      empty ? "opacity-45" : ""
                    }`}
                  >
                    {label}
                    {count !== null && (
                      <span className="ml-1 rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Evidence inspector — edge-anchored on desktop, full sheet on mobile */}
        {selected && (
          <MapInspector
            item={selected}
            route={selectedRoute}
            checked={!!checkedItems[selected.id]}
            onToggleChecked={() =>
              setCheckedItems((prev) => ({ ...prev, [selected.id]: !prev[selected.id] }))
            }
            onClose={() => onMarkerClick(null)}
          />
        )}
      </div>

      {/* Linked-evidence bar (map ↔ analysis). With nothing selected it is not dead space:
          it carries the headline spatial facts behind the score. */}
      <div className="shrink-0 border-t border-border bg-surface-soft/80 px-md py-sm pr-20 backdrop-blur-sm lg:pr-md">
        {selected ? (
          <div className="flex items-center gap-xs">
            <div className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border border-brand-green/30 bg-brand-green-soft text-brand-green-dark shadow-sm">
              <Link2 className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="text-caption-bold text-text-primary">Terhubung ke: {selected.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-text-tertiary">
                {selected.claim}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-xs">
            <div className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border border-brand-green/30 bg-brand-green-soft text-brand-green-dark shadow-sm">
              <MousePointerClick className="size-4" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-xs overflow-x-auto pb-0.5">
              <ResultChip label="Skor" value={`${rls.score !== null ? Math.round(rls.score) : "–"}/100`} accent={bandColor} />
              {rls.band_label && <ResultChip label="Band" value={rls.band_label} accent={bandColor} />}
              <ResultChip
                label="Banjir"
                value={data.flood ? `kelas ${data.flood.class}` : "belum tersedia"}
                muted={!data.flood}
              />
              {data.elevation && (
                <ResultChip
                  label="Elevasi"
                  value={`${Math.round(data.elevation.elevation_m)} m${
                    data.elevation.low_lying ? " · cekungan" : ""
                  }`}
                />
              )}
              {data.nearest_station && (
                <ResultChip
                  label="Stasiun"
                  value={
                    routes?.station
                      ? `${routes.station.distance_km} km · ${routes.station.duration_min} mnt`
                      : formatDistance(data.nearest_station.distance_km).replace("sekitar ", "")
                  }
                />
              )}
              {data.nearest_toll && (
                <ResultChip
                  label="Tol"
                  value={
                    routes?.toll
                      ? `${routes.toll.distance_km} km · ${routes.toll.duration_min} mnt`
                      : formatDistance(data.nearest_toll.distance_km).replace("sekitar ", "")
                  }
                />
              )}
              <ResultChip label="Fasilitas" value={String(data.facilities?.length ?? 0)} />
              <ResultChip label="Red flag" value={String(data.red_flags?.length ?? 0)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** One headline fact in the bar under the map. */
function ResultChip({
  label,
  value,
  accent,
  muted = false,
}: {
  label: string;
  value: string;
  accent?: string;
  muted?: boolean;
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-card px-2 py-1 text-[11px] shadow-xs">
      <span className="font-medium text-text-tertiary">{label}</span>
      <span
        className={`font-bold ${muted ? "text-text-tertiary" : "text-text-primary"}`}
        style={accent && !muted ? { color: accent } : undefined}
      >
        {value}
      </span>
    </span>
  );
}

function MapInspector({
  item,
  route,
  checked,
  onToggleChecked,
  onClose,
}: {
  item: EvidenceItem;
  route: RouteLeg | null;
  checked: boolean;
  onToggleChecked: () => void;
  onClose: () => void;
}) {
  const confLabel = CONFIDENCE[item.confidence]?.label ?? "Perlu validasi";
  const confColor = CONFIDENCE_STYLE[item.confidence] ?? CONFIDENCE_STYLE.perlu_validasi;
  const position = item.position;

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-start justify-between border-b border-border bg-[#001e2b] p-md text-white">
        <div className="min-w-0 flex-1 pr-2">
          <span className="block font-sans text-[9px] font-bold uppercase tracking-widest text-brand-teal/80">
            {item.categoryLabel}
          </span>
          <h3 className="mt-0.5 truncate font-sans text-body-sm font-bold leading-tight text-white">
            {item.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Tutup detail temuan"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 select-text flex-col gap-md overflow-y-auto p-md">
        {position && item.feature && (
          <a
            href={gmapsUrl(position.lat, position.lng)}
            target="_blank"
            rel="noreferrer"
            title="Buka di Google Maps"
            className="relative block shrink-0 overflow-hidden rounded-xl border border-border/40 shadow-sm"
          >
            <img
              src={streetViewUrl(position.lat, position.lng)}
              alt={`Street View ${item.title}`}
              className="h-32 w-full bg-surface-soft object-cover"
              loading="lazy"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-xs">
              <span className="font-sans text-[10px] font-semibold text-white/95">Klik untuk Street View ↗</span>
            </div>
          </a>
        )}

        <div className="flex flex-col gap-1">
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted">Temuan</span>
          <p className="font-sans text-body-xs font-bold leading-relaxed text-text-primary">{item.claim}</p>
        </div>

        {item.distanceKm !== null && item.distanceKm > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Jarak &amp; presisi
            </span>
            <p className="font-sans text-body-xs font-semibold text-text-primary">
              {formatDistance(item.distanceKm)} dari rumah kandidat (garis lurus)
            </p>
            {route && (
              <div className="mt-1 rounded-lg border border-brand-teal/25 bg-brand-teal-soft/40 p-2">
                <p className="font-sans text-body-xs font-bold text-brand-teal-deep">
                  Rute jalan: {route.distance_km} km · {route.duration_min} menit berkendara
                </p>
                <p className="mt-0.5 font-sans text-[10px] leading-snug text-text-secondary">
                  Estimasi Google Routes saat ini (lalu lintas diperhitungkan). Angka riset di atas
                  memakai jarak garis lurus, jadi jalur nyata bisa jauh lebih panjang.
                </p>
              </div>
            )}
          </div>
        )}

        {item.evidence.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Sumber &amp; tanggal data
            </span>
            <div className="flex flex-col gap-xxs">
              {item.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between font-sans text-body-xs font-semibold text-text-primary"
                >
                  <span className="truncate">
                    {ev.source_title}
                    {ev.accessed_at ? ` (${ev.accessed_at})` : ""}
                  </span>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[44px] shrink-0 items-center text-micro font-bold text-brand-teal hover:underline"
                    >
                      Link ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Kepercayaan bukti
          </span>
          <span
            className={`inline-flex items-center gap-1 self-start rounded-md border px-2 py-0.5 font-sans text-[10px] font-bold ${confColor}`}
          >
            <span className="size-1.5 shrink-0 rounded-full bg-current" />
            {confLabel}
          </span>
        </div>

        {item.limitation && (
          <div className="flex flex-col gap-1 rounded-r-md border-l-2 border-slate-300 bg-slate-50 p-2.5">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Keterbatasan data
            </span>
            <p className="font-sans text-body-xs font-semibold leading-relaxed text-slate-600">{item.limitation}</p>
          </div>
        )}

        {item.validationAction && (
          <div className="mt-xs flex flex-col gap-1.5 border-t border-border/40 pt-md">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-teal-deep">
              Langkah lapangan
            </span>
            <button
              onClick={onToggleChecked}
              className={`flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border p-md text-left font-sans transition-all hover:bg-slate-50 ${
                checked ? "border-brand-green/30 bg-[#00ed64]/10 text-brand-green-dark" : "border-border bg-white"
              }`}
            >
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-all ${
                  checked ? "border-brand-teal-mid bg-brand-teal-mid text-white" : "border-slate-300 bg-white"
                }`}
              >
                {checked && (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className={`font-sans text-body-xs font-semibold leading-relaxed ${
                  checked ? "text-slate-400 line-through decoration-slate-300" : "text-text-primary"
                }`}
              >
                {item.validationAction}
              </span>
            </button>
          </div>
        )}
      </div>

      {position && (
        <div className="shrink-0 border-t border-border bg-slate-50 p-md">
          <a
            href={gmapsUrl(position.lat, position.lng)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-1 rounded-xl border border-brand-teal-deep bg-white px-3 py-2.5 text-center font-sans text-caption-bold font-bold text-brand-teal-deep shadow-sm transition-all duration-200 hover:bg-brand-teal-soft"
          >
            Navigasi di Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="absolute bottom-0 right-0 top-0 z-30 hidden w-85 flex-col border-l border-border bg-white shadow-raised animate-in slide-in-from-right duration-250 lg:flex">
        {content}
      </div>
      <div className="fixed inset-0 z-[2000] flex flex-col bg-white animate-in slide-in-from-bottom duration-250 lg:hidden">
        {content}
      </div>
    </>
  );
}
