import { APIProvider, InfoWindow, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Info,
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
} from "lucide-react";
import type { MapData, MapFeature } from "@/lib/api";
import { bandHex, CAT_LABEL, scoreHex } from "@/lib/risk";

const FACILITY_MAP: Record<
  string,
  { icon: React.ComponentType<any>; color: string; bg: string }
> = {
  hospital: { icon: Hospital, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  clinic: { icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  pharmacy: { icon: Pill, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  school: { icon: School, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  market: { icon: Store, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  supermarket: { icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  station: { icon: Train, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  toll_gate: { icon: Milestone, color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" },
};

const DANGER_MAP: Record<
  string,
  { icon: React.ComponentType<any>; color: string; bg: string }
> = {
  sutet_tower: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50 border-amber-300" },
  landfill: { icon: Trash2, color: "text-red-600", bg: "bg-red-50 border-red-300" },
  industrial: { icon: Factory, color: "text-slate-600", bg: "bg-slate-50 border-slate-300" },
  cemetery: { icon: Skull, color: "text-zinc-600", bg: "bg-zinc-50 border-zinc-300" },
  rail_point: { icon: Train, color: "text-red-600", bg: "bg-red-50 border-red-300" },
};

// hide Google's own POIs (hotels, cafes, ...) — the map shows OUR data only
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
];

const COVERAGE_RADIUS_M = 3000; // ±3 km ≈ 5–10 menit berkendara

/** HTML marker via OverlayView — raster maps don't support AdvancedMarker. */
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
      strokeColor: color, strokeOpacity: stroke ? 0.7 : 0, strokeWeight: 1.5,
      fillColor: color, fillOpacity,
      clickable: false,
    });
    return () => circle.setMap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center.lat, center.lng, radius, color, fillOpacity, stroke]);
  return null;
}

interface Selected {
  lat: number;
  lng: number;
  title: string;
  body: string;
}

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

const streetViewUrl = (lat: number, lng: number) =>
  `https://maps.googleapis.com/maps/api/streetview?size=440x180&location=${lat},${lng}&fov=90&key=${MAPS_KEY}`;
const gmapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

function Legend({ bandColor, bandLabel, hasFlood }: {
  bandColor: string;
  bandLabel: string | null;
  hasFlood: boolean;
}) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-6 left-3 z-10 inline-flex items-center gap-xxs rounded-full bg-surface-overlay px-sm py-xs text-caption-bold shadow-[var(--shadow-raised)]"
      >
        <Info className="size-3.5" aria-hidden /> Legenda
      </button>
    );
  }
  const legendChip = (Icon: React.ComponentType<any>, colorClass: string, bgClass: string = "bg-surface-canvas border-border") => (
    <span className={`map-emoji !h-5 !w-5 shrink-0 border border-border/80 shadow-none ${bgClass} ${colorClass}`}>
      <Icon className="size-2.5" />
    </span>
  );
  return (
    <div className="absolute bottom-6 left-3 z-10 w-56 rounded-xl bg-surface-overlay p-sm text-caption shadow-[var(--shadow-preview)]">
      <div className="flex items-center justify-between">
        <p className="text-caption-bold text-foreground">Legenda</p>
        <button onClick={() => setOpen(false)} className="rounded-full p-xxs text-text-tertiary hover:bg-surface-soft" aria-label="Tutup legenda">
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
      <div className="mt-xs flex flex-col gap-xs text-text-secondary">
        <div className="flex items-center gap-xs">
          <span className="size-4 shrink-0 rounded-full border-2" style={{ borderColor: bandColor, background: `${bandColor}22` }} />
          <span>
            Zona ±3 km (5–10 mnt berkendara)
            {bandLabel ? <> — <b style={{ color: bandColor }}>{bandLabel}</b></> : null}
          </span>
        </div>
        {hasFlood && (
          <div className="flex items-center gap-xs">
            <span className="size-4 shrink-0 rounded-full border-2 border-[#3b82f6] bg-[#3b82f6]/10" />
            <span>Konteks banjir InaRISK (±1 km)</span>
          </div>
        )}
        <div className="flex items-center gap-xs">
          <span className="map-pin !h-5 !w-5 shrink-0 border border-surface-canvas/20 shadow-none">
            <Home className="size-2.5 text-white" />
          </span>
          <span>Rumah kandidat</span>
        </div>
        <div className="flex items-center gap-xxs">
          {legendChip(Hospital, "text-rose-600", "bg-rose-50 border-rose-200")}
          {legendChip(School, "text-indigo-600", "bg-indigo-50 border-indigo-200")}
          {legendChip(Store, "text-amber-600", "bg-amber-50 border-amber-200")}
          {legendChip(Pill, "text-emerald-600", "bg-emerald-50 border-emerald-200")}
          <span className="ml-xxs">Fasilitas esensial</span>
        </div>
        <div className="flex items-center gap-xxs">
          {legendChip(Train, "text-violet-600", "bg-violet-50 border-violet-200")}
          {legendChip(Milestone, "text-cyan-600", "bg-cyan-50 border-cyan-200")}
          <span className="ml-xxs">Stasiun &amp; pintu tol</span>
        </div>
        <div className="flex items-center gap-xxs">
          {legendChip(Factory, "text-slate-600", "bg-slate-50 border-slate-300")}
          {legendChip(Zap, "text-amber-600", "bg-amber-50 border-amber-300")}
          <span className="ml-xxs">Red flag <b className="text-semantic-danger-text">(ring = kritis)</b></span>
        </div>
      </div>
      <p className="mt-xs border-t border-border pt-xs text-micro text-text-tertiary">
        Data: OSM warehouse · InaRISK BNPB · Google
      </p>
    </div>
  );
}

/** Map workspace region (docs/14). Spatial evidence only; the report/findings live in the
 *  analysis region. A linked-evidence bar ties the selected marker back to the analysis. */
export default function MapPanel({ data, onClose }: { data: MapData; onClose?: () => void }) {
  const { property, rls } = data;
  const bandColor = bandHex(rls.band);
  const [selected, setSelected] = useState<Selected | null>(null);
  const center = { lat: property.lat, lng: property.lng };

  const pick = (f: MapFeature, label: string) => () =>
    setSelected({
      lat: f.lat, lng: f.lng,
      title: f.name || label,
      body: `${label} · ~${f.distance_km} km` + (f.ingested_at ? ` · OSM warehouse, data ${f.ingested_at}` : ""),
    });

  return (
    <div className="flex h-full flex-col bg-card">
      {/* header strip */}
      <div className="shrink-0 border-b border-border px-md py-sm">
        <div className="flex items-center justify-between gap-sm">
          <div className="min-w-0">
            <p className="text-micro-uppercase text-text-tertiary">Bukti lokasi</p>
            <p className="truncate text-body-sm-medium text-foreground">{property.name || "Lokasi kandidat"}</p>
            <p className="truncate text-caption text-text-tertiary">{property.formatted_address}</p>
          </div>
          <div className="flex items-center gap-xs">
            <span className="rounded-full px-sm py-xxs text-body-sm-medium text-white" style={{ background: bandColor }}>
              {rls.score !== null ? Math.round(rls.score) : "–"}
            </span>
            {onClose && (
              <button onClick={onClose} className="rounded-full p-xxs text-text-tertiary hover:bg-surface-soft md:hidden" aria-label="Tutup peta">
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
        <div className="mt-xxs flex items-center gap-xs text-caption">
          <span className="font-semibold" style={{ color: bandColor }}>{rls.band_label}</span>
          {rls.recommendation_label && (
            <>
              <span className="text-text-tertiary">·</span>
              <span className="text-text-secondary">{rls.recommendation_label}</span>
            </>
          )}
        </div>
        <div className="mt-xs flex gap-xs">
          {Object.entries(data.category_scores).map(([cat, s]) => (
            <div key={cat} className="flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-soft">
                <div className="h-full rounded-full" style={{ width: `${s ?? 0}%`, background: scoreHex(s) }} />
              </div>
              <p className="mt-0.5 text-center text-micro text-text-tertiary">{CAT_LABEL[cat] ?? cat} {s ?? "–"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* map */}
      <div className="relative min-h-0 flex-1">
        <APIProvider apiKey={MAPS_KEY} language="id" region="ID">
          <Map
            defaultCenter={center}
            defaultZoom={13}
            styles={MAP_STYLES}
            gestureHandling="greedy"
            disableDefaultUI={false}
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={false}
            clickableIcons={false}
            className="h-full w-full"
          >
            <MapCircle center={center} radius={COVERAGE_RADIUS_M} color={bandColor} fillOpacity={0.08} />
            {data.flood && data.flood.class !== "rendah" && (
              <MapCircle center={center} radius={1000} color="#3b82f6" fillOpacity={0.08} />
            )}

            <HtmlMarker
              position={center}
              zIndex={100}
              onClick={() =>
                setSelected({
                  lat: property.lat, lng: property.lng,
                  title: property.name || "Lokasi kandidat",
                  body:
                    `Skor ${rls.score !== null ? Math.round(rls.score) : "–"} — ${rls.band_label}. ` +
                    `${rls.recommendation_label}.` +
                    (data.flood ? ` InaRISK banjir: kelas ${data.flood.class} (${data.flood.index}).` : "") +
                    (data.elevation
                      ? ` Elevasi ${data.elevation.elevation_m} m (${data.elevation.relative_m} m vs sekitar` +
                        (data.elevation.low_lying ? " — cekungan ⚠️)" : ")")
                      : ""),
                })
              }
            >
              <div className="map-pin">
                <Home className="size-4.5 text-white" />
              </div>
            </HtmlMarker>

            {data.facilities.map((f, i) => {
              const config = FACILITY_MAP[f.kind];
              return (
                <HtmlMarker key={`f${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={10} onClick={pick(f, f.kind)}>
                  <div className={`map-emoji border transition-all hover:scale-110 ${config ? `${config.bg} ${config.color}` : "bg-white border-border text-foreground"}`}>
                    {config ? <config.icon className="size-3.5" /> : "📌"}
                  </div>
                </HtmlMarker>
              );
            })}
            {[
              [data.nearest_toll, "Gerbang tol", "toll_gate"] as const,
              [data.nearest_station, "Stasiun", "station"] as const,
            ].map(
              ([f, label, kind], i) => {
                if (!f) return null;
                const config = FACILITY_MAP[kind];
                return (
                  <HtmlMarker key={`t${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={20} onClick={pick(f, label)}>
                    <div className={`map-emoji border transition-all hover:scale-110 ${config ? `${config.bg} ${config.color}` : "bg-white border-border text-foreground"}`}>
                      {config ? <config.icon className="size-3.5" /> : "📌"}
                    </div>
                  </HtmlMarker>
                );
              }
            )}
            {data.red_flags.map((f, i) => {
              const config = DANGER_MAP[f.kind];
              return (
                <HtmlMarker
                  key={`r${i}`}
                  position={{ lat: f.lat, lng: f.lng }}
                  zIndex={50}
                  onClick={pick(f, (f.label ?? f.kind) + (f.critical ? " — KRITIS" : ""))}
                >
                  <div className={`map-emoji border transition-all hover:scale-110 ${f.critical ? "critical" : "danger"} ${config ? `${config.bg} ${config.color}` : ""}`}>
                    {config ? <config.icon className={f.critical ? "size-4.5" : "size-3.5"} /> : "⚠️"}
                  </div>
                </HtmlMarker>
              );
            })}

            {selected && (
              <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
                <div className="w-60 text-caption">
                  <a href={gmapsUrl(selected.lat, selected.lng)} target="_blank" rel="noreferrer" title="Buka di Google Maps">
                    <img
                      src={streetViewUrl(selected.lat, selected.lng)}
                      alt={`Street View ${selected.title}`}
                      className="h-26 w-full object-cover"
                      loading="lazy"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  </a>
                  <div className="px-sm pb-sm pt-xs">
                    <p className="text-body-sm-medium text-foreground">{selected.title}</p>
                    <p className="mt-0.5 text-text-secondary">{selected.body}</p>
                    <a
                      href={gmapsUrl(selected.lat, selected.lng)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-xs inline-block rounded-full bg-brand-teal-deep px-sm py-xs font-semibold text-white no-underline"
                    >
                      Buka di Google Maps ↗
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        <Legend bandColor={bandColor} bandLabel={rls.band_label} hasFlood={!!data.flood && data.flood.class !== "rendah"} />
      </div>

      {/* linked-evidence bar (map ↔ finding) */}
      <div className="shrink-0 border-t border-border bg-surface-soft px-md py-sm">
        <p className="flex items-center gap-xs text-caption-bold text-foreground">
          <Link2 className="size-3.5 shrink-0 text-brand-green-dark" aria-hidden />
          {selected ? `Terhubung ke: ${selected.title}` : "Bukti tertaut"}
        </p>
        <p className="mt-0.5 text-caption text-text-tertiary">
          {selected ? selected.body : "Pilih titik di peta untuk melihat bukti yang sama dengan temuan."}
        </p>
      </div>
    </div>
  );
}
