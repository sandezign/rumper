import { APIProvider, InfoWindow, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  MapPin,
  MousePointerClick,
} from "lucide-react";
import type { MapData, MapFeature } from "@/lib/api";
import { bandHex, CAT_LABEL } from "@/lib/risk";

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

interface MockFindingDetails {
  claim: string;
  evidence: { source_title: string; url: string | null; accessed_at: string; kind: string }[];
  confidence: "data_kuat" | "data_sedang" | "perlu_validasi";
  limitation: string;
  validation_action: string;
  is_red_flag: boolean;
  is_critical: boolean;
}

const MOCK_FINDINGS_LOOKUP: Record<string, MockFindingDetails> = {
  sutet_tower: {
    claim: "Terdeteksi jalur SUTET 150kV berjarak ~350 meter dari properti kandidat.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: "https://www.openstreetmap.org", accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Akurasi data OpenStreetMap berasal dari kontribusi komunitas dan koordinat tiang SUTET sekunder.",
    validation_action: "Lakukan pengecekan visual jarak bebas kabel transmisi teratas dari atap rumah kandidat.",
    is_red_flag: true,
    is_critical: false,
  },
  industrial: {
    claim: "Pabrik Tekstil Pekayon berjarak ~850 meter di sebelah utara properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "perlu_validasi",
    limitation: "Kondisi polusi udara, asap, dan kebisingan bergantung pada arah angin serta jam operasional aktif pabrik.",
    validation_action: "Tanyakan kepada tetangga terdekat atau pengurus RT setempat mengenai aroma bau limbah/asap di malam hari.",
    is_red_flag: true,
    is_critical: false,
  },
  hospital: {
    claim: "Akses cepat ke RS Hermina Galaxy yang berjarak ~0.48 km.",
    evidence: [{ source_title: "Database Foursquare & OSM", url: null, accessed_at: "2026-06", kind: "database" }],
    confidence: "data_kuat",
    limitation: "Skor hanya menghitung keberadaan fisik bangunan, bukan kualitas layanan medis nyata atau ketersediaan dokter spesialis.",
    validation_action: "Kunjungi UGD RS Hermina Galaxy untuk memastikan layanan gawat darurat beroperasi 24 jam penuh.",
    is_red_flag: false,
    is_critical: false,
  },
  station: {
    claim: "Stasiun Bekasi terdekat berjarak ~2.05 km dari lokasi properti.",
    evidence: [{ source_title: "Google Maps Routing API", url: null, accessed_at: "2026-06", kind: "api" }],
    confidence: "perlu_validasi",
    limitation: "Jarak garis lurus tidak memperhitungkan macet total di persimpangan jalan penghubung pada jam sibuk pagi.",
    validation_action: "Lakukan uji jalan dari rumah ke stasiun pada hari kerja (Senin-Jumat) antara pukul 07.30 - 08.15 WIB.",
    is_red_flag: false,
    is_critical: false,
  },
  toll_gate: {
    claim: "Gerbang Tol Bekasi Barat 1 berjarak ~1.88 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Akses menuju gerbang tol sering mengalami kemacetan parah pada sore hari jam pulang kantor.",
    validation_action: "Uji waktu tempuh nyata dari lokasi rumah kandidat menuju gerbang tol pada jam sibuk.",
    is_red_flag: false,
    is_critical: false,
  },
  home: {
    claim: "Skor kelayakan lokasi 54/100 (Hati-hati). Berada di area cekungan elevasi mikro (-0.6 m vs sekitar).",
    evidence: [{ source_title: "InaRISK BNPB & ASTER GDEM", url: "https://inarisk.bnpb.go.id", accessed_at: "2026-06", kind: "government" }],
    confidence: "data_sedang",
    limitation: "Model elevasi digital memiliki grid resolusi 30 meter horisontal yang tidak merekam tanggul lokal buatan pengembang.",
    validation_action: "Pastikan fondasi bangunan utama ditinggikan minimal 60 cm dari ketinggian aspal jalan depan rumah.",
    is_red_flag: false,
    is_critical: true,
  },
  clinic: {
    claim: "Klinik Pratama Galaxy berjarak ~0.19 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Klinik pratama biasanya memiliki fasilitas terbatas dan tidak selalu memiliki dokter jaga 24 jam.",
    validation_action: "Verifikasi jam operasional klinik terdekat untuk pertolongan pertama.",
    is_red_flag: false,
    is_critical: false,
  },
  pharmacy: {
    claim: "Apotek K-24 Galaxy berjarak ~0.22 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Meskipun jaringan waralaba K-24 terkenal buka 24 jam, persediaan obat spesifik bisa kosong.",
    validation_action: "Pastikan apotek terdekat ini beroperasi penuh 24 jam untuk kebutuhan obat darurat.",
    is_red_flag: false,
    is_critical: false,
  },
  school: {
    claim: "SMA Negeri 12 Bekasi berjarak ~1.62 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Sistem zonasi sekolah negeri dapat berubah setiap tahun ajaran baru.",
    validation_action: "Cek aturan zonasi terbaru untuk memastikan kelayakan pendaftaran sekolah anak Anda.",
    is_red_flag: false,
    is_critical: false,
  },
  market: {
    claim: "Pasar Fresh Market Galaxy berjarak ~0.67 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Akses jalan menuju pasar di pagi hari sering mengalami hambatan lalu lintas lokal.",
    validation_action: "Cek kemudahan parkir dan akses jalan di sekitar pasar pada jam sibuk pagi.",
    is_red_flag: false,
    is_critical: false,
  },
  supermarket: {
    claim: "Superindo Grand Galaxy berjarak ~0.04 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Sangat dekat sehingga ada potensi kebisingan parkir kendaraan pengunjung bagi rumah di blok terdepan.",
    validation_action: "Cek apakah ada kebisingan atau getaran bongkar muat barang di supermarket di malam hari.",
    is_red_flag: false,
    is_critical: false,
  },
  landfill: {
    claim: "Terdeteksi area pengolahan sampah/TPS liar dalam radius ~550 meter.",
    evidence: [{ source_title: "Laporan Pengaduan Warga", url: null, accessed_at: "2026-06", kind: "social" }],
    confidence: "data_sedang",
    limitation: "Tingkat bau tidak sedap bertambah parah pada musim hujan dengan arah angin ke arah barat properti.",
    validation_action: "Verifikasi aroma udara komplek di sore hari saat musim hujan.",
    is_red_flag: true,
    is_critical: false,
  },
  cemetery: {
    claim: "Terdapat area pemakaman berjarak ~300 meter.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Estetika lingkungan sekitar bisa terpengaruh bagi calon pembeli tertentu.",
    validation_action: "Cek apakah jalur akses utama menuju rumah melewati depan pemakaman.",
    is_red_flag: true,
    is_critical: false,
  },
  rail_point: {
    claim: "Terdeteksi rel kereta api aktif dalam radius ~800 meter.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "perlu_validasi",
    limitation: "Kebisingan dan getaran kereta bervariasi tergantung pada frekuensi perjalanan dan kepadatan bangunan sekitar.",
    validation_action: "Cek tingkat kebisingan di dalam rumah saat kereta KRL/Logistik melintas.",
    is_red_flag: true,
    is_critical: false,
  }
};

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e3f2fd" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f9fbfa" }],
  },
];

const COVERAGE_RADIUS_M = 3000;

const MOCK_FLOOD_POLYGON = [
  { lat: -6.2680, lng: 106.9720 },
  { lat: -6.2650, lng: 106.9750 },
  { lat: -6.2660, lng: 106.9780 },
  { lat: -6.2710, lng: 106.9790 },
  { lat: -6.2730, lng: 106.9750 },
  { lat: -6.2710, lng: 106.9720 },
];

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
      map,
      paths,
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeWeight: 1.5,
      fillColor: color,
      fillOpacity,
      clickable: false,
    });
    return () => polygon.setMap(null);
  }, [map, paths, color, fillOpacity]);
  return null;
}

interface Selected {
  lat: number;
  lng: number;
  title: string;
  body: string;
  kind?: string;
  distance_km?: number;
  ingested_at?: string;
  critical?: boolean;
}

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

const streetViewUrl = (lat: number, lng: number) =>
  `https://maps.googleapis.com/maps/api/streetview?size=440x220&location=${lat},${lng}&fov=90&key=${MAPS_KEY}`;
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
        className="inline-flex items-center gap-xs rounded-xl bg-white/95 backdrop-blur-md px-sm py-2 text-caption-bold shadow-raised border border-border/80 hover:bg-surface-soft transition-all duration-200 font-sans"
      >
        <Layers className="size-4 text-brand-teal" /> Legenda
      </button>
    );
  }

  const legendChip = (Icon: React.ComponentType<any>, colorClass: string, bgClass: string) => (
    <span className={`map-emoji !h-6 !w-6 shrink-0 border shadow-none transition-transform hover:scale-105 ${bgClass} ${colorClass}`}>
      <Icon className="size-3" />
    </span>
  );

  return (
    <div className="w-64 rounded-xl bg-white/95 backdrop-blur-md p-md text-caption shadow-preview border border-border/50 transition-all duration-300 font-sans">
      <div className="flex items-center justify-between pb-xs border-b border-border/40">
        <p className="text-body-sm-medium font-semibold text-text-primary flex items-center gap-xxs font-sans">
          <Layers className="size-3.5 text-brand-teal" /> Legenda
        </p>
        <button onClick={() => setOpen(false)} className="rounded-lg p-xxs text-text-tertiary hover:bg-surface-soft hover:text-text-secondary transition-colors" aria-label="Tutup legenda">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="mt-xs flex flex-col gap-xs text-text-secondary">
        <div className="flex items-center gap-xs">
          <span className="size-4 shrink-0 rounded-full border-2" style={{ borderColor: bandColor, background: `${bandColor}15` }} />
          <span className="text-micro font-medium leading-snug">
            Zona ±3 km (5–10 mnt)
            {bandLabel ? <> — <span className="font-bold" style={{ color: bandColor }}>{bandLabel}</span></> : null}
          </span>
        </div>
        {hasFlood && (
          <div className="flex items-center gap-xs">
            <span className="size-4 shrink-0 rounded-full border-2 border-blue-500 bg-blue-500/10" />
            <span className="text-micro font-medium leading-snug">Konteks banjir InaRISK (±1 km)</span>
          </div>
        )}
        <div className="flex items-center gap-xs">
          <span className="map-pin !h-6 !w-6 shrink-0 border border-surface-canvas/20 shadow-sm flex items-center justify-center bg-brand-teal-deep rounded-full">
            <Home className="size-3 text-white" />
          </span>
          <span className="text-micro font-medium">Rumah Kandidat</span>
        </div>
        
        <div className="h-px bg-border/40 my-xxs" />
        
        <div className="flex items-start gap-xs">
          <div className="flex gap-1 shrink-0 mt-0.5">
            {legendChip(Hospital, "text-rose-600", "bg-rose-50 border-rose-200")}
            {legendChip(School, "text-indigo-600", "bg-indigo-50 border-indigo-200")}
          </div>
          <div className="flex flex-col">
            <span className="text-micro font-medium text-text-primary">Fasilitas Esensial</span>
            <span className="text-[10px] text-text-tertiary">RS, Klinik, Sekolah, Pasar, Supermarket</span>
          </div>
        </div>

        <div className="flex items-start gap-xs">
          <div className="flex gap-1 shrink-0 mt-0.5">
            {legendChip(Train, "text-violet-600", "bg-violet-50 border-violet-200")}
            {legendChip(Milestone, "text-cyan-600", "bg-cyan-50 border-cyan-200")}
          </div>
          <div className="flex flex-col">
            <span className="text-micro font-medium text-text-primary">Stasiun &amp; Tol</span>
            <span className="text-[10px] text-text-tertiary">Akses transportasi dan jalan bebas hambatan</span>
          </div>
        </div>

        <div className="flex items-start gap-xs">
          <div className="flex gap-1 shrink-0 mt-0.5">
            {legendChip(Factory, "text-slate-600", "bg-slate-50 border-slate-300")}
            <span className="map-emoji !h-6 !w-6 shrink-0 border border-red-300 bg-red-50 text-red-600 animate-pulse">
              <Zap className="size-3" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-micro font-medium text-text-primary">Red Flags (Ring = Kritis)</span>
            <span className="text-[10px] text-text-tertiary">SUTET, Pembuangan, Industri, Rel, Kuburan</span>
          </div>
        </div>
      </div>
      <p className="mt-sm border-t border-border/30 pt-xs text-[10px] text-slate-500 text-center font-semibold leading-none">
        OSM Warehouse · InaRISK BNPB · Google Maps
      </p>
    </div>
  );
}

function DynamicLegend({ 
  activeLayers 
}: { 
  activeLayers: { flood: boolean; transit: boolean; akses: boolean; kebisingan: boolean } 
}) {
  const hasActive = Object.values(activeLayers).some(Boolean);
  if (!hasActive) return null;

  return (
    <div className="absolute top-20 right-4 z-10 w-56 rounded-xl bg-white/95 backdrop-blur-md p-sm text-caption shadow-raised border border-border/50 transition-all duration-300 animate-in fade-in duration-200 font-sans">
      <p className="text-body-sm-medium font-bold text-text-primary mb-xs pb-xxs border-b border-border/40 flex items-center gap-1 font-sans">
        <Layers className="size-3.5 text-brand-teal" /> Info Layer Aktif
      </p>
      
      <div className="flex flex-col gap-xs font-sans">
        {activeLayers.flood && (
          <div className="flex flex-col gap-xxs">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Potensi Banjir (InaRISK)</span>
            <div className="flex gap-1 items-center mt-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Rendah</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">Sedang</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-700 border border-red-100">Tinggi</span>
            </div>
          </div>
        )}

        {activeLayers.transit && (
          <div className="flex flex-col gap-xxs border-t border-border/30 pt-xs">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Walkability Radius</span>
            <div className="flex flex-col gap-0.5 text-[10px] text-text-secondary mt-1">
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-violet-600/30 border border-violet-600" />
                <span>500m — Sangat Dekat (~5 mnt)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-violet-600/20 border border-violet-600/60" />
                <span>1.0 km — Cukup Dekat (~10 mnt)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-violet-600/10 border border-violet-600/30" />
                <span>2.0 km — Jangkauan KRL (~20 mnt)</span>
              </div>
            </div>
          </div>
        )}

        {activeLayers.akses && (
          <div className="flex flex-col gap-xxs border-t border-border/30 pt-xs">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Akses Jalan Tol</span>
            <p className="text-[10px] text-text-secondary mt-1 leading-normal font-medium">
              Radius ±1.88 km ke Gerbang Tol terdekat. Kepadatan lalu lintas tinggi pada jam sibuk.
            </p>
          </div>
        )}

        {activeLayers.kebisingan && (
          <div className="flex flex-col gap-xxs border-t border-border/30 pt-xs">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Kebisingan / Red Flags</span>
            <div className="flex flex-col gap-0.5 text-[10px] text-text-secondary mt-1">
              <div className="flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center bg-amber-50 border border-amber-200 text-amber-700 rounded text-[8px] font-bold">⚡</span>
                <span>Jalur SUTET ~350m (Aman)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center bg-slate-50 border border-slate-300 text-slate-700 rounded text-[8px] font-bold">🏭</span>
                <span>Kawasan Pabrik ~850m</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryColor(s: number | null): string {
  if (s === null) return "#94a3b8"; // neutral slate
  if (s <= 39) return "#ef4444"; // red-500
  if (s <= 69) return "#f59e0b"; // orange-500
  return "#0ea5e9"; // soft blue/teal
}

export default function MapPanelV2({ 
  data, 
  onClose,
  activeLayers = { flood: false, transit: false, akses: false, kebisingan: false },
  onToggleLayer = () => {}
}: { 
  data: MapData; 
  onClose?: () => void;
  activeLayers?: { flood: boolean; transit: boolean; akses: boolean; kebisingan: boolean };
  onToggleLayer?: (key: "flood" | "transit" | "akses" | "kebisingan") => void;
}) {
  const { property, rls } = data;
  const bandColor = bandHex(rls.band);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "facilities" | "redflags">("all");
  const [showEvidenceGap, setShowEvidenceGap] = useState(false);
  
  // Local state for checking off validation steps on the map (syncing checklists)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    // Default checked ones for playground visual representation
    return {
      hospital: true,
      pharmacy: true,
    };
  });

  const center = { lat: property.lat, lng: property.lng };

  const pick = (f: MapFeature, label: string) => () =>
    setSelected({
      lat: f.lat,
      lng: f.lng,
      title: f.name || label,
      body: `${label} · ~${f.distance_km} km` + (f.ingested_at ? ` · Data OSM (${f.ingested_at})` : ""),
      kind: f.kind,
      distance_km: f.distance_km,
      ingested_at: f.ingested_at,
      critical: f.critical,
    });

  // Filters based on layer tab selection
  const showFacilities = activeTab === "all" || activeTab === "facilities";
  const showRedFlags = activeTab === "all" || activeTab === "redflags";

  // Checklist counts mapping directly to the mock items rendered on this specific map
  const totalChecklist = 11; // home + 6 facilities + 2 logistics + 2 red flags
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const percentCompleted = Math.round((completedCount / totalChecklist) * 100);

  return (
    <div className="flex h-full flex-col bg-card overflow-hidden">
      {/* Premium Header Dashboard */}
      <div className="shrink-0 border-b border-border bg-white px-md py-sm shadow-subtle z-20">
        <div className="flex items-start justify-between gap-md">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-xs">
              <span className="text-micro-uppercase text-text-muted font-bold tracking-widest bg-surface-soft px-2 py-0.5 rounded-md">
                Bukti Lokasi Spasial
              </span>
              {rls.band_label && (
                <span 
                  className="text-micro font-semibold px-2 py-0.5 rounded-md"
                  style={{ color: bandColor, backgroundColor: `${bandColor}12` }}
                >
                  {rls.band_label}
                </span>
              )}
            </div>
            <h2 className="mt-xs truncate text-body-medium font-bold text-text-primary flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0 text-brand-teal" />
              {property.name || "Lokasi Kandidat"}
            </h2>
            <p className="mt-0.5 truncate text-caption text-text-tertiary font-medium">
              {property.formatted_address}
            </p>
          </div>

          <div className="flex items-center gap-sm shrink-0">
            {/* Circular score gauge */}
            <div className="relative flex items-center justify-center">
              <svg className="size-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  className="stroke-surface-soft fill-none"
                  strokeWidth="4"
                />
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
                <span className="text-body-sm-medium font-bold text-text-primary">
                  {rls.score !== null ? Math.round(rls.score) : "–"}
                </span>
                <span className="text-[9px] text-text-tertiary font-bold -mt-0.5">RLS</span>
              </div>
            </div>

            {onClose && (
              <button 
                onClick={onClose} 
                className="rounded-xl p-2 text-text-tertiary hover:bg-surface-soft hover:text-text-secondary transition-all md:hidden border border-transparent hover:border-border/60" 
                aria-label="Tutup peta"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {/* Category breakdown bar indicators */}
        <div className="mt-sm pt-xs border-t border-border/40 grid grid-cols-5 gap-xs">
          {Object.entries(data.category_scores).map(([cat, s]) => (
            <div key={cat} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-text-tertiary truncate leading-none">
                {CAT_LABEL[cat] ?? cat}
              </span>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-soft shadow-inner relative">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${s ?? 0}%`, background: getCategoryColor(s) }} 
                />
              </div>
              <span className="text-[10px] font-bold text-text-secondary mt-0.5">
                {s !== null ? `${s}%` : "–"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map viewport container */}
      <div className="relative min-h-0 flex-1 bg-surface-soft">
        <APIProvider apiKey={MAPS_KEY} language="id" region="ID">
          <Map
            defaultCenter={center}
            defaultZoom={14}
            styles={MAP_STYLES}
            gestureHandling="greedy"
            disableDefaultUI={true}
            zoomControl={true}
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={false}
            clickableIcons={false}
            className="h-full w-full"
          >
            {/* Risk rings */}
            <MapCircle center={center} radius={COVERAGE_RADIUS_M} color={bandColor} fillOpacity={0.05} />
            {data.flood && data.flood.class !== "rendah" && (
              <MapCircle center={center} radius={1000} color="#3b82f6" fillOpacity={0.06} />
            )}

            {/* Conditionally Render Walkability Circles (Transit Layer active) */}
            {activeLayers.transit && (
              <>
                <MapCircle center={center} radius={500} color="#8b5cf6" fillOpacity={0.04} stroke={true} />
                <MapCircle center={center} radius={1000} color="#8b5cf6" fillOpacity={0.02} stroke={true} />
                <MapCircle center={center} radius={2000} color="#8b5cf6" fillOpacity={0.01} stroke={true} />
              </>
            )}

            {/* Conditionally Render Flood Contours (InaRISK overlay) */}
            {activeLayers.flood && (
              <MapPolygon paths={MOCK_FLOOD_POLYGON} color="#3b82f6" fillOpacity={0.25} />
            )}

            {/* Candidate Property Pin */}
            <HtmlMarker
              position={center}
              zIndex={100}
              onClick={() =>
                setSelected({
                  lat: property.lat, lng: property.lng,
                  title: property.name || "Lokasi Kandidat",
                  body:
                    `Skor RLS ${rls.score !== null ? Math.round(rls.score) : "–"} (${rls.band_label}). ` +
                    `${rls.recommendation_label || ""}.` +
                    (data.flood ? ` InaRISK Banjir: kelas ${data.flood.class} (indeks ${data.flood.index}).` : "") +
                    (data.elevation
                      ? ` Elevasi ${data.elevation.elevation_m}m (${data.elevation.relative_m}m vs rata-rata sekitar` +
                        (data.elevation.low_lying ? " — area cekungan ⚠️)" : ")")
                      : ""),
                  kind: "home",
                })
              }
            >
              <div className="map-pin scale-105 shadow-raised hover:scale-110 transition-transform cursor-pointer flex items-center justify-center bg-brand-teal-deep rounded-full text-white border-2 border-white size-10">
                <Home className="size-5" />
              </div>
            </HtmlMarker>

            {/* Facilities layer */}
            {showFacilities && data.facilities.map((f, i) => {
              const config = FACILITY_MAP[f.kind];
              const mockFinding = MOCK_FINDINGS_LOOKUP[f.kind];
              const confidence = mockFinding?.confidence || "data_kuat";
              
              // Dynamic border styling based on confidence
              let borderStyles = "";
              if (confidence === "perlu_validasi") {
                borderStyles = "border-dashed border-2 border-amber-500 animate-pulse";
              } else if (confidence === "data_sedang") {
                borderStyles = "border-2 border-amber-300";
              } else {
                borderStyles = config ? config.border : "border-border";
              }

              return (
                <HtmlMarker key={`f${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={10} onClick={pick(f, f.kind)}>
                  <div className={`map-emoji border transition-all duration-200 hover:scale-125 shadow-raised hover:z-30 cursor-pointer size-8 ${borderStyles} ${config ? `${config.bg} ${config.color}` : "bg-white text-foreground"}`}>
                    {config ? <config.icon className="size-4" /> : "📌"}
                  </div>
                </HtmlMarker>
              );
            })}

            {/* Logistics - Toll gates & Stations */}
            {showFacilities && ([
              [data.nearest_toll, "Gerbang tol", "toll_gate"] as const,
              [data.nearest_station, "Stasiun", "station"] as const,
            ].map(
              ([f, label, kind], i) => {
                if (!f) return null;
                const config = FACILITY_MAP[kind];
                const mockFinding = MOCK_FINDINGS_LOOKUP[kind];
                const confidence = mockFinding?.confidence || "data_kuat";
                
                let borderStyles = "";
                if (confidence === "perlu_validasi") {
                  borderStyles = "border-dashed border-2 border-amber-500 animate-pulse";
                } else if (confidence === "data_sedang") {
                  borderStyles = "border-2 border-amber-300";
                } else {
                  borderStyles = config ? config.border : "border-border";
                }

                return (
                  <HtmlMarker key={`t${i}`} position={{ lat: f.lat, lng: f.lng }} zIndex={20} onClick={pick(f, label)}>
                    <div className={`map-emoji border transition-all duration-200 hover:scale-125 shadow-raised hover:z-30 cursor-pointer size-8 ${borderStyles} ${config ? `${config.bg} ${config.color}` : "bg-white text-foreground"}`}>
                      {config ? <config.icon className="size-4" /> : "📌"}
                    </div>
                  </HtmlMarker>
                );
              }
            ))}

            {/* Red flags / Hazards layer */}
            {showRedFlags && data.red_flags.map((f, i) => {
              const config = DANGER_MAP[f.kind];
              const mockFinding = MOCK_FINDINGS_LOOKUP[f.kind];
              const confidence = mockFinding?.confidence || "data_kuat";
              
              let borderStyles = "";
              if (f.critical) {
                borderStyles = "critical border-2 border-red-500 bg-red-100/90 text-red-600 animate-pulse size-9";
              } else if (confidence === "perlu_validasi") {
                borderStyles = "danger border-dashed border-2 border-amber-500 animate-pulse";
              } else if (confidence === "data_sedang") {
                borderStyles = "danger border-2 border-amber-400";
              } else {
                borderStyles = config ? config.border : "border-border";
              }

              return (
                <HtmlMarker
                  key={`r${i}`}
                  position={{ lat: f.lat, lng: f.lng }}
                  zIndex={50}
                  onClick={pick(f, (f.label ?? f.kind) + (f.critical ? " — KRITIS" : ""))}
                >
                  <div className={`map-emoji border transition-all duration-200 hover:scale-125 shadow-raised hover:z-40 cursor-pointer size-8 ${borderStyles} ${config ? `${config.bg} ${config.color}` : ""}`}>
                    {config ? <config.icon className={f.critical ? "size-5" : "size-4"} /> : "⚠️"}
                  </div>
                </HtmlMarker>
              );
            })}

            {/* Structured Trust Popover (Module A + C + D) */}
            {selected && (() => {
              const mockFinding = MOCK_FINDINGS_LOOKUP[selected.kind || ""] || (selected.kind === "home" ? MOCK_FINDINGS_LOOKUP.home : null);
              const confidence = mockFinding?.confidence || "data_kuat";
              
              // Get confidence color and label
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
                <InfoWindow 
                  position={{ lat: selected.lat, lng: selected.lng }} 
                  onCloseClick={() => setSelected(null)}
                >
                  <div className="w-80 overflow-hidden rounded-xl bg-white text-caption select-text font-sans shadow-overlay">
                    {/* Street view header for POIs */}
                    {selected.kind !== "home" && (
                      <a href={gmapsUrl(selected.lat, selected.lng)} target="_blank" rel="noreferrer" title="Buka di Google Maps" className="block relative">
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

                    {/* Popover content */}
                    <div className="p-md flex flex-col gap-sm">
                      {/* Title & Red Flag badge */}
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

                      {/* Custom mock details structured layout */}
                      {mockFinding ? (
                        <div className="flex flex-col gap-sm">
                          {/* Claim (Temuan) */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-sans">Claim / Temuan</span>
                            <p className="text-xs text-text-primary font-medium leading-relaxed font-sans">
                              {mockFinding.claim}
                            </p>
                          </div>

                          {/* Confidence layer */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-sans">Kepercayaan Bukti</span>
                            <span className={`inline-flex self-start items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border font-sans ${confColor}`}>
                              <span className="size-1.5 rounded-full bg-current shrink-0" />
                              {confLabel}
                            </span>
                          </div>

                          {/* Limitation */}
                          {mockFinding.limitation && (
                            <div className="flex flex-col gap-1 border-l-2 border-slate-300 bg-slate-50 p-2 rounded-r-md">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-sans">Keterbatasan Data</span>
                              <p className="text-[11px] text-slate-600 leading-normal font-medium font-sans">
                                {mockFinding.limitation}
                              </p>
                            </div>
                          )}

                          {/* Validation Action Checklist */}
                          {mockFinding.validation_action && (
                            <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal-deep font-sans">Langkah Lapangan</span>
                              <button
                                onClick={() => {
                                  setCheckedItems(prev => ({
                                    ...prev,
                                    [selected.kind || ""]: !prev[selected.kind || ""]
                                  }));
                                }}
                                className="flex items-start gap-2 text-left rounded-lg bg-surface-feature/70 border border-brand-green/20 p-2 hover:bg-surface-feature transition-all font-sans"
                              >
                                <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-all ${
                                  isChecked 
                                    ? "border-brand-teal-mid bg-brand-teal-mid text-white" 
                                    : "border-border-strong bg-white"
                                }`}>
                                  {isChecked && (
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                                <span className={`text-[11px] leading-relaxed font-semibold font-sans ${
                                  isChecked ? "text-brand-green-dark line-through decoration-brand-green-dark/40" : "text-text-primary"
                                }`}>
                                  {mockFinding.validation_action}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary font-sans">
                          {selected.body}
                        </p>
                      )}

                      <div className="h-px bg-border/40" />

                      <div className="flex items-center gap-xs">
                        <a
                          href={gmapsUrl(selected.lat, selected.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-teal-deep px-3 py-2 text-center text-micro font-bold text-white hover:bg-brand-teal transition-all duration-200 shadow-sm font-sans"
                        >
                          Navigasi di Google Maps ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              );
            })()}
          </Map>
        </APIProvider>

        {/* Bottom Left Controls (Selector + Legend stacked) */}
        <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2 items-start pointer-events-auto">
          {/* Interactive Layer selector + Simulation controls */}
          <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-raised border border-border/50 p-1 gap-1 w-32">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-sm py-1.5 text-micro font-semibold rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-brand-teal-deep text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-soft hover:text-text-primary"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab("facilities")}
              className={`px-sm py-1.5 text-micro font-semibold rounded-lg transition-all ${
                activeTab === "facilities"
                  ? "bg-brand-teal-deep text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-soft hover:text-text-primary"
              }`}
            >
              Fasilitas
            </button>
            <button
              onClick={() => setActiveTab("redflags")}
              className={`px-sm py-1.5 text-micro font-semibold rounded-lg transition-all ${
                activeTab === "redflags"
                  ? "bg-brand-teal-deep text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-soft hover:text-text-primary"
              }`}
            >
              Red Flags
            </button>
            
            <div className="h-px bg-border/40 my-0.5" />
            
            {/* Simulation Toggle for Evidence Gaps */}
            <button
              onClick={() => setShowEvidenceGap(prev => !prev)}
              className={`px-sm py-1.5 text-micro font-bold rounded-lg border transition-all ${
                showEvidenceGap
                  ? "bg-amber-600 text-white border-transparent"
                  : "text-amber-700 bg-amber-50/80 border-amber-200 hover:bg-amber-100"
              }`}
            >
              Simulasi Gap
            </button>
          </div>

          {/* Legend Panel overlay */}
          <Legend bandColor={bandColor} bandLabel={rls.band_label} hasFlood={!!data.flood && data.flood.class !== "rendah"} />
        </div>

        {/* Floating Dynamic Legend Panel (Right Edge Overlay) */}
        <DynamicLegend activeLayers={activeLayers} />

        {/* Floating Checklist Progress Tracker (Module D) */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-xs rounded-xl bg-white/95 backdrop-blur-md p-2.5 shadow-raised border border-border/50">
          <div className="flex flex-col gap-1 min-w-[130px]">
            <div className="flex justify-between items-center text-micro font-bold text-text-primary">
              <span className="flex items-center gap-1">🎯 Validasi</span>
              <span>{completedCount}/{totalChecklist}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-0.5">
              <div 
                className="h-full bg-brand-green transition-all duration-300" 
                style={{ width: `${percentCompleted}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Horizontal Row of Map Quick-Toggles (Top bar alignment) */}
        <div className="absolute top-4 left-[200px] z-10 flex gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-raised border border-border/50">
          {[
            { key: "flood", label: "Banjir" },
            { key: "transit", label: "Transit" },
            { key: "akses", label: "Akses" },
            { key: "kebisingan", label: "Kebisingan" },
          ].map(({ key, label }) => {
            const isActive = activeLayers[key as keyof typeof activeLayers];
            return (
              <button
                key={key}
                onClick={() => onToggleLayer(key as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-micro font-bold transition-all shadow-sm border ${
                  isActive
                    ? "bg-brand-teal-deep text-white border-transparent"
                    : "bg-white/60 hover:bg-slate-100/80 text-text-secondary border-border/40"
                }`}
              >
                {isActive ? (
                  <span className="flex size-3 items-center justify-center text-[10px] font-bold text-white">✓</span>
                ) : (
                  <span className="size-1.5 rounded-full bg-slate-400" />
                )}
                {label}
              </button>
            );
          })}
        </div>



        {/* Evidence Gap floating warning alert card (Module C) */}
        {showEvidenceGap && (
          <div className="absolute top-20 left-4 right-4 z-10 rounded-xl bg-amber-50 border-2 border-amber-200 p-md text-caption shadow-raised animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-xs items-start">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 font-bold text-xs mt-0.5">!</span>
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 text-body-sm-medium leading-none mb-1 font-sans">
                  ⚠️ Data Belum Cukup (Evidence Gap)
                </h4>
                <p className="text-amber-800 leading-normal text-xs font-medium font-sans">
                  Sistem tidak menemukan data historis banjir di kelurahan ini. Peta di bawah mungkin tampak bebas banjir, namun <strong>bukan jaminan lokasi aman</strong>. Wajib lakukan survei langsung ke warga sekitar.
                </p>
              </div>
              <button 
                onClick={() => setShowEvidenceGap(false)} 
                className="text-amber-600 hover:text-amber-900 transition-colors shrink-0 ml-xxs"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styled linked-evidence bar (tethering map data to reports) */}
      <div className="shrink-0 border-t border-border bg-surface-soft/80 backdrop-blur-sm px-md py-sm">
        <div className="flex items-center gap-xs">
          <div className={`relative flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-green-soft border border-brand-green/30 text-brand-green-dark shadow-sm ${!selected ? "animate-pulse" : ""}`}>
            {selected ? <Link2 className="size-4" aria-hidden /> : <MousePointerClick className="size-4" aria-hidden />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-caption-bold text-text-primary truncate">
              {selected ? `Terhubung ke: ${selected.title.replace(/_/g, " ")}` : "Bukti Spasial Tertaut"}
            </p>
            <p className="text-[11px] text-text-tertiary truncate mt-0.5 leading-none font-medium">
              {selected ? (MOCK_FINDINGS_LOOKUP[selected.kind || ""]?.claim || selected.body) : "Pilih titik di peta untuk menghubungkan data spasial dengan temuan riset."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
