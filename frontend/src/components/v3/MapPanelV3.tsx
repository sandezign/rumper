import { APIProvider, InfoWindow, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Factory,
  Flag,
  Home,
  Hospital,
  Milestone,
  Minus,
  Pill,
  Plus,
  School,
  ShoppingCart,
  Skull,
  Stethoscope,
  Store,
  Train,
  TrainFront,
  Trash2,
  Waves,
  Zap,
} from "lucide-react";
import type { MapData, MapFeature } from "@/lib/api";
import { bandHex } from "@/lib/risk";
import { MOCK_FINDINGS_LOOKUP } from "./mapMockFindings";
import type { ActiveLayers, LayerKey } from "./ReportPanelV3";

export type MapView = "overview" | "redflags" | "commute" | "facilities" | "toll";

export const MAP_VIEWS: { key: MapView; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "redflags", label: "Red Flags" },
  { key: "commute", label: "Commute" },
  { key: "facilities", label: "Facilities" },
  { key: "toll", label: "Toll & Access" },
];

const LAYER_CHIPS: { key: LayerKey; label: string; icon: React.ComponentType<{ className?: string }>; cls: string }[] = [
  { key: "flood", label: "Flood overlay", icon: Waves, cls: "bg-red-50 text-red-600" },
  { key: "redflags", label: "Red Flags", icon: Flag, cls: "bg-rose-50 text-rose-600" },
  { key: "commute", label: "Commute", icon: TrainFront, cls: "bg-indigo-50 text-indigo-600" },
  { key: "facilities", label: "Facilities", icon: Building2, cls: "bg-blue-50 text-blue-600" },
  { key: "toll", label: "Tol & Access", icon: Milestone, cls: "bg-purple-50 text-purple-600" },
];

const FACILITY_MAP: Record<string, { icon: React.ComponentType<any>; color: string; bg: string; border: string }> = {
  hospital: { icon: Hospital, color: "text-rose-600", bg: "bg-rose-50/90", border: "border-rose-200" },
  clinic: { icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50/90", border: "border-blue-200" },
  pharmacy: { icon: Pill, color: "text-emerald-600", bg: "bg-emerald-50/90", border: "border-emerald-200" },
  school: { icon: School, color: "text-indigo-600", bg: "bg-indigo-50/90", border: "border-indigo-200" },
  market: { icon: Store, color: "text-amber-600", bg: "bg-amber-50/90", border: "border-amber-200" },
  supermarket: { icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50/90", border: "border-orange-200" },
  station: { icon: Train, color: "text-violet-600", bg: "bg-violet-50/90", border: "border-violet-200" },
  toll_gate: { icon: Milestone, color: "text-cyan-600", bg: "bg-cyan-50/90", border: "border-cyan-200" },
};

const DANGER_MAP: Record<string, { icon: React.ComponentType<any>; color: string; bg: string; border: string }> = {
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

const MOCK_FLOOD_POLYGON = [
  { lat: -6.268, lng: 106.972 },
  { lat: -6.265, lng: 106.975 },
  { lat: -6.266, lng: 106.978 },
  { lat: -6.271, lng: 106.979 },
  { lat: -6.273, lng: 106.975 },
  { lat: -6.271, lng: 106.972 },
];

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

const streetViewUrl = (lat: number, lng: number) =>
  `https://maps.googleapis.com/maps/api/streetview?size=440x220&location=${lat},${lng}&fov=90&key=${MAPS_KEY}`;
const gmapsUrl = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/* ────────────────────────── Map primitives ────────────────────────── */

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

function MapCircle({ center, radius, color, fillOpacity, stroke = true }: {
  center: { lat: number; lng: number };
  radius: number;
  color: string;
  fillOpacity: number;
  stroke?: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      map, center, radius,
      strokeColor: color, strokeOpacity: stroke ? 0.6 : 0, strokeWeight: 1.5,
      fillColor: color, fillOpacity,
      clickable: false,
    });
    return () => circle.setMap(null);
  }, [map, center.lat, center.lng, radius, color, fillOpacity, stroke]);
  return null;
}

function MapPolygon({ paths, color, fillOpacity }: {
  paths: { lat: number; lng: number }[];
  color: string;
  fillOpacity: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const polygon = new google.maps.Polygon({
      map, paths,
      strokeColor: color, strokeOpacity: 0.7, strokeWeight: 1.5,
      fillColor: color, fillOpacity,
      clickable: false,
    });
    return () => polygon.setMap(null);
  }, [map, paths, color, fillOpacity]);
  return null;
}

/** Custom +/- zoom control (bottom-right, per Figma). */
function ZoomControl() {
  const map = useMap();
  const zoomBy = (d: number) => () => {
    if (!map) return;
    map.setZoom((map.getZoom() ?? 14) + d);
  };
  return (
    <div className="absolute bottom-6 right-4 z-10 flex flex-col overflow-hidden rounded-xl bg-white shadow-raised border border-border/60">
      <button
        onClick={zoomBy(1)}
        className="flex size-11 items-center justify-center text-text-secondary hover:bg-surface-soft hover:text-text-primary transition-colors cursor-pointer border-b border-border/60"
        aria-label="Perbesar peta"
      >
        <Plus className="size-4" aria-hidden />
      </button>
      <button
        onClick={zoomBy(-1)}
        className="flex size-11 items-center justify-center text-text-secondary hover:bg-surface-soft hover:text-text-primary transition-colors cursor-pointer"
        aria-label="Perkecil peta"
      >
        <Minus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/* ────────────────────────── Overlay chrome ────────────────────────── */

function ViewTabs({ view, onViewChange }: { view: MapView; onViewChange: (v: MapView) => void }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="absolute top-3 left-3 z-10 flex items-center gap-xs">
        <button
          onClick={() => setCollapsed(false)}
          className="flex size-8 items-center justify-center rounded-full bg-white shadow-raised border border-border/60 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Tampilkan tab peta"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
        <span className="inline-flex items-center gap-xs rounded-full bg-white px-md py-1.5 shadow-raised border-2 border-[#00ed64]/70 text-body-sm-medium font-bold text-text-primary">
          {MAP_VIEWS.find((v) => v.key === view)?.label}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute top-0 inset-x-0 z-10">
      <div className="flex items-center justify-between gap-xs bg-white/75 backdrop-blur-md px-lg py-2 shadow-subtle">
        {MAP_VIEWS.map((v) => {
          const active = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => onViewChange(v.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-xs rounded-full px-md py-1.5 text-body-sm-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-white font-bold text-text-primary shadow-raised border-2 border-[#00ed64]/70"
                  : "text-text-secondary hover:text-text-primary border-2 border-transparent"
              }`}
            >
              {active ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-brand-teal-deep">
                  <span className="size-1.5 rounded-full bg-[#00ed64]" />
                </span>
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
              {v.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setCollapsed(true)}
        className="ml-lg mt-1.5 flex size-7 items-center justify-center rounded-full bg-white shadow-raised border border-border/60 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        aria-label="Sembunyikan tab peta"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function ViewLegend({ view, bandColor, bandLabel, hasFlood }: {
  view: MapView;
  bandColor: string;
  bandLabel: string | null;
  hasFlood: boolean;
}) {
  return (
    <div className="w-60 rounded-xl bg-white/95 backdrop-blur-md p-sm shadow-raised border border-border/50 font-sans">
      <p className="text-caption-bold text-text-primary">{MAP_VIEWS.find((v) => v.key === view)?.label}</p>
      <div className="mt-xs flex flex-col gap-xs text-text-secondary">
        <div className="flex items-start gap-xs">
          <span className="mt-0.5 size-4 shrink-0 rounded-full border-2" style={{ borderColor: bandColor }} />
          <span className="text-micro font-medium leading-snug">
            {bandLabel && <span className="block font-bold" style={{ color: bandColor }}>{bandLabel}</span>}
            Zona ±3 km (5–10 mnt)
          </span>
        </div>
        {hasFlood && (
          <div className="flex items-center gap-xs">
            <span className="size-4 shrink-0 rounded-full border-2 border-blue-500" />
            <span className="text-micro font-medium">Range banjir (±1 km)</span>
          </div>
        )}
        <div className="flex items-center gap-xs">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-teal-deep">
            <Home className="size-3 text-white" />
          </span>
          <span className="text-micro font-medium">Rumah Kandidat</span>
        </div>
      </div>
      <p className="mt-xs border-t border-border/40 pt-xs text-[10px] text-text-tertiary font-medium">
        Sources: Google Maps · InaRISK BNPB
      </p>
    </div>
  );
}

const FLOOD_SCALE: { color: string; label: string }[] = [
  { color: "#22c55e", label: "Sangat rendah (0–20%)" },
  { color: "#84cc16", label: "Rendah (20–40%)" },
  { color: "#eab308", label: "Sedang (40–60%)" },
  { color: "#f97316", label: "Tinggi (60–80%)" },
  { color: "#ef4444", label: "Sangat tinggi (80–100%)" },
];

function FloodLegend() {
  return (
    <div className="w-60 rounded-xl bg-white/95 backdrop-blur-md p-sm shadow-raised border border-border/50 font-sans">
      <p className="text-caption-bold text-text-primary flex items-center gap-xs">
        <Waves className="size-3.5 text-blue-500" aria-hidden /> Flood overlay
      </p>
      <div className="mt-xs flex flex-col gap-1.5">
        {FLOOD_SCALE.map((s) => (
          <div key={s.label} className="flex items-center gap-xs">
            <span className="size-3 shrink-0 rounded-[3px]" style={{ background: s.color }} />
            <span className="text-micro font-medium text-text-secondary">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayerChips({ activeLayers, onToggleLayer }: {
  activeLayers: ActiveLayers;
  onToggleLayer: (k: LayerKey) => void;
}) {
  return (
    <div className="absolute bottom-6 inset-x-0 z-10 flex justify-center pointer-events-none">
      <div className="flex flex-wrap items-center justify-center gap-xs px-md pointer-events-auto">
        {LAYER_CHIPS.map(({ key, label, icon: Icon, cls }) => {
          const on = activeLayers[key];
          return (
            <button
              key={key}
              onClick={() => onToggleLayer(key)}
              aria-pressed={on}
              className={`inline-flex items-center gap-xs rounded-full bg-white py-1 pl-1 pr-sm text-caption font-semibold shadow-raised transition-all duration-200 cursor-pointer border ${
                on ? "border-[#00ed64]/70 text-text-primary" : "border-border/60 text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className={`flex size-6 items-center justify-center rounded-full ${cls}`}>
                <Icon className="size-3.5" aria-hidden />
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────── Main panel ────────────────────────── */

interface Selected {
  lat: number;
  lng: number;
  title: string;
  body: string;
  kind?: string;
  distance_km?: number;
  critical?: boolean;
}

export default function MapPanelV3({
  data,
  view,
  onViewChange,
  activeLayers,
  onToggleLayer,
}: {
  data: MapData;
  view: MapView;
  onViewChange: (v: MapView) => void;
  activeLayers: ActiveLayers;
  onToggleLayer: (k: LayerKey) => void;
}) {
  const { property, rls } = data;
  const bandColor = bandHex(rls.band);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const center = { lat: property.lat, lng: property.lng };
  const hasFlood = !!data.flood && data.flood.class !== "rendah";

  // A marker family shows when its view is active, in Overview, or via layer chips.
  const showFacilities = view === "overview" || view === "facilities" || activeLayers.facilities;
  const showRedFlags = view === "overview" || view === "redflags" || activeLayers.redflags;
  const showStation = view === "overview" || view === "commute" || activeLayers.commute;
  const showToll = view === "overview" || view === "toll" || activeLayers.toll;

  const pick = (f: MapFeature, label: string) => () =>
    setSelected({
      lat: f.lat,
      lng: f.lng,
      title: f.name || label,
      body: `${label} · ~${f.distance_km} km`,
      kind: f.kind,
      distance_km: f.distance_km,
      critical: f.critical,
    });

  const markerCls = (kind: string, critical?: boolean) => {
    const conf = MOCK_FINDINGS_LOOKUP[kind]?.confidence ?? "data_kuat";
    if (critical) return "critical border-2 border-red-500 bg-red-100/90 text-red-600 animate-pulse size-9";
    if (conf === "perlu_validasi") return "border-dashed border-2 border-amber-500";
    if (conf === "data_sedang") return "border-2 border-amber-300";
    return "";
  };

  return (
    <div className="relative h-full w-full bg-surface-soft">
      <APIProvider apiKey={MAPS_KEY} language="id" region="ID">
        <Map
          defaultCenter={center}
          defaultZoom={14}
          styles={MAP_STYLES}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
          clickableIcons={false}
          className="h-full w-full"
        >
          {/* Risk rings */}
          {/* stroke-only band ring per Figma — a fill tints the whole viewport */}
          <MapCircle center={center} radius={COVERAGE_RADIUS_M} color={bandColor} fillOpacity={0.015} />
          {hasFlood && <MapCircle center={center} radius={1000} color="#3b82f6" fillOpacity={0.06} />}

          {/* Commute walkability rings */}
          {(view === "commute" || activeLayers.commute) && (
            <>
              <MapCircle center={center} radius={500} color="#8b5cf6" fillOpacity={0.04} />
              <MapCircle center={center} radius={1000} color="#8b5cf6" fillOpacity={0.02} />
              <MapCircle center={center} radius={2000} color="#8b5cf6" fillOpacity={0.01} />
            </>
          )}

          {/* Flood contours (InaRISK overlay) */}
          {activeLayers.flood && <MapPolygon paths={MOCK_FLOOD_POLYGON} color="#3b82f6" fillOpacity={0.25} />}

          {/* Candidate property pin */}
          <HtmlMarker
            position={center}
            zIndex={100}
            onClick={() =>
              setSelected({
                lat: property.lat,
                lng: property.lng,
                title: property.name || "Lokasi Kandidat",
                body: `Skor RLS ${rls.score !== null ? Math.round(rls.score) : "–"} (${rls.band_label}).`,
                kind: "home",
              })
            }
          >
            <div className="map-pin scale-105 shadow-raised hover:scale-110 transition-transform cursor-pointer flex items-center justify-center bg-brand-teal-deep rounded-full text-white border-2 border-white size-10">
              <Home className="size-5" />
            </div>
          </HtmlMarker>

          {/* Facilities */}
          {showFacilities &&
            data.facilities.map((f, i) => {
              const config = FACILITY_MAP[f.kind];
              return (
                <HtmlMarker key={`f${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={10} onClick={pick(f, f.kind)}>
                  <div
                    className={`map-emoji border transition-all duration-200 hover:scale-125 shadow-raised hover:z-30 cursor-pointer size-8 ${markerCls(f.kind) || config?.border || "border-border"} ${config ? `${config.bg} ${config.color}` : "bg-white text-foreground"}`}
                  >
                    {config ? <config.icon className="size-4" /> : "📌"}
                  </div>
                </HtmlMarker>
              );
            })}

          {/* Station & toll */}
          {([
            [data.nearest_station, "Stasiun", showStation] as const,
            [data.nearest_toll, "Gerbang tol", showToll] as const,
          ]).map(([f, label, show], i) => {
            if (!f || !show) return null;
            const config = FACILITY_MAP[f.kind];
            return (
              <HtmlMarker key={`t${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={20} onClick={pick(f, label)}>
                <div
                  className={`map-emoji border transition-all duration-200 hover:scale-125 shadow-raised hover:z-30 cursor-pointer size-8 ${markerCls(f.kind) || config?.border || "border-border"} ${config ? `${config.bg} ${config.color}` : "bg-white text-foreground"}`}
                >
                  {config ? <config.icon className="size-4" /> : "📌"}
                </div>
              </HtmlMarker>
            );
          })}

          {/* Red flags */}
          {showRedFlags &&
            data.red_flags.map((f, i) => {
              const config = DANGER_MAP[f.kind];
              return (
                <HtmlMarker
                  key={`r${i}`}
                  position={{ lat: f.lat, lng: f.lng }}
                  zIndex={50}
                  onClick={pick(f, (f.label ?? f.kind) + (f.critical ? " — KRITIS" : ""))}
                >
                  <div
                    className={`map-emoji border transition-all duration-200 hover:scale-125 shadow-raised hover:z-40 cursor-pointer size-8 ${markerCls(f.kind, f.critical) || config?.border || "border-border"} ${config ? `${config.bg} ${config.color}` : ""}`}
                  >
                    {config ? <config.icon className={f.critical ? "size-5" : "size-4"} /> : "⚠️"}
                  </div>
                </HtmlMarker>
              );
            })}

          {/* Structured trust dialog */}
          {selected &&
            (() => {
              const mockFinding = MOCK_FINDINGS_LOOKUP[selected.kind || ""] || null;
              const confidence = mockFinding?.confidence || "data_kuat";

              let confLabel = "Data Kuat (High)";
              let confColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
              if (confidence === "data_sedang") {
                confLabel = "Data Sedang (Medium)";
                confColor = "text-amber-700 bg-amber-50 border-amber-200";
              } else if (confidence === "perlu_validasi") {
                confLabel = "Perlu Validasi (Low)";
                confColor = "text-rose-700 bg-rose-50 border-rose-200";
              }

              const isChecked = !!checkedItems[selected.kind || ""];

              return (
                <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
                  <div className="w-80 overflow-hidden rounded-xl bg-white text-caption select-text font-sans shadow-overlay">
                    {selected.kind !== "home" && (
                      <a
                        href={gmapsUrl(selected.lat, selected.lng)}
                        target="_blank"
                        rel="noreferrer"
                        title="Buka di Google Maps"
                        className="block relative"
                      >
                        <img
                          src={streetViewUrl(selected.lat, selected.lng)}
                          alt={`Street View ${selected.title}`}
                          className="h-28 w-full object-cover bg-surface-soft"
                          loading="lazy"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent flex items-end p-xs">
                          <span className="text-[10px] text-white/95 font-semibold font-sans">Klik untuk Street View ↗</span>
                        </div>
                      </a>
                    )}

                    <div className="p-md flex flex-col gap-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-xxs">
                          <h3 className="text-body-sm-medium font-bold text-text-primary capitalize leading-tight font-sans">
                            {selected.title.replace(/_/g, " ")}
                          </h3>
                          {selected.critical && (
                            <span className="shrink-0 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse font-sans">
                              Kritis
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted font-medium font-sans">
                          Radius: ~{selected.distance_km ?? "0"} km dari rumah kandidat
                        </p>
                      </div>

                      <div className="h-px bg-border/40" />

                      {mockFinding ? (
                        <div className="flex flex-col gap-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-sans">Claim / Temuan</span>
                            <p className="text-xs text-text-primary font-medium leading-relaxed font-sans">{mockFinding.claim}</p>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-sans">Kepercayaan Bukti</span>
                            <span className={`inline-flex self-start items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border font-sans ${confColor}`}>
                              <span className="size-1.5 rounded-full bg-current shrink-0" />
                              {confLabel}
                            </span>
                          </div>

                          {mockFinding.limitation && (
                            <div className="flex flex-col gap-1 border-l-2 border-slate-300 bg-slate-50 p-2 rounded-r-md">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-sans">Keterbatasan Data</span>
                              <p className="text-[11px] text-slate-600 leading-normal font-medium font-sans">{mockFinding.limitation}</p>
                            </div>
                          )}

                          {mockFinding.validation_action && (
                            <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal-deep font-sans">Langkah Lapangan</span>
                              <button
                                onClick={() =>
                                  setCheckedItems((prev) => ({
                                    ...prev,
                                    [selected.kind || ""]: !prev[selected.kind || ""],
                                  }))
                                }
                                className="flex items-start gap-2 text-left rounded-lg bg-surface-feature/70 border border-brand-green/20 p-2 hover:bg-surface-feature transition-all font-sans"
                              >
                                <span
                                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-all ${
                                    isChecked ? "border-brand-teal-mid bg-brand-teal-mid text-white" : "border-border-strong bg-white"
                                  }`}
                                >
                                  {isChecked && (
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                                <span
                                  className={`text-[11px] leading-relaxed font-semibold font-sans ${
                                    isChecked ? "text-brand-green-dark line-through decoration-brand-green-dark/40" : "text-text-primary"
                                  }`}
                                >
                                  {mockFinding.validation_action}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary font-sans">{selected.body}</p>
                      )}

                      <a
                        href={gmapsUrl(selected.lat, selected.lng)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-brand-teal-deep px-3 py-2.5 text-center text-micro font-bold text-white hover:bg-brand-teal transition-all duration-200 shadow-sm font-sans"
                      >
                        Navigasi di Google Maps ↗
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              );
            })()}

        </Map>
        <ZoomControl />
      </APIProvider>

      {/* Top view tabs */}
      <ViewTabs view={view} onViewChange={onViewChange} />

      {/* Right-side legends */}
      <div className="absolute top-16 right-4 z-10 flex flex-col gap-xs items-end">
        <ViewLegend view={view} bandColor={bandColor} bandLabel={rls.band_label} hasFlood={hasFlood} />
        {activeLayers.flood && <FloodLegend />}
      </div>

      {/* Bottom layer quick-toggles */}
      <LayerChips activeLayers={activeLayers} onToggleLayer={onToggleLayer} />
    </div>
  );
}
