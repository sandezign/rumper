import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Map as MapIcon, List, MapPin, Clock, Mountain, Bookmark, X }
  from "lucide-react";
import LocationDataLoadingScreen from "@/features/areas/components/LocationDataLoadingScreen";
import JourneyHeaderV2 from "@/features/areas/components/JourneyHeaderV2";
import EvaluatePropertyModal from "@/features/areas/components/EvaluatePropertyModal";
import DaftarAksesibelView from "@/features/areas/components/DaftarAksesibelView";
import AreaCardCarousel, { type CarouselFilter } from "@/features/areas/components/AreaCardCarousel";
import AreaDetailDrawer from "@/features/areas/components/AreaDetailDrawer";
import UnlockAreaQuotaModal from "@/features/areas/components/UnlockAreaQuotaModal";
import RecalibrateLocationModal from "@/features/areas/components/RecalibrateLocationModal";
import AreasMap, { CATEGORY_DOT } from "@/features/areas/components/AreasMap";
import { initialCuratedAreas, type CuratedArea as ViewArea } from "@/features/areas/data/mockCuratedAreas";
import { fetchAreas, shortAnchorLabel, type AreasResponse, type FitCategory, type CuratedArea as ApiArea } from "@/features/areas/api";
import { toViewAreas } from "@/features/areas/adapt";
import { CATEGORY_LABEL as CATEGORY_TEXT, TO_API_CATEGORY, TO_VIEW_CATEGORY } from "@/features/areas/labels";
import { getReports, getShortlist, toggleShortlisted }
  from "@/features/areas/shortlist";
import { loadProfile } from "@/lib/profile";
import { intakeSeedFromProfile, loadWizard, saveWizard } from "@/lib/wizard";
import { geocodePlace, getFloodAreas, placesAutocomplete } from "@/lib/api";
import type { FloodArea } from "@/lib/api";
import { useEntitlement } from "@/lib/entitlements";
import { useCommerce } from "@/features/commerce/useCommerce";

type View = "peta" | "daftar";
const CATEGORY_ORDER: FitCategory[] = ["strong_fit", "interesting_tradeoff", "challenge_assumptions"];

function mockAreasResponseFromInitial(): AreasResponse {
  const converted: ApiArea[] = initialCuratedAreas.map((a) => ({
    id: a.id,
    name: a.name,
    region: a.region,
    category: a.category === "strong-fit" ? "strong_fit" : a.category === "interesting-tradeoff" ? "interesting_tradeoff" : "challenge_assumptions",
    category_label: a.categoryLabel,
    centroid: { lat: a.latLng[0], lng: a.latLng[1] },
    commute: {
      minutes: a.commuteMinutes,
      mode: a.commuteMode.toLowerCase().includes("tol") ? "drive" : "transit",
      distance_km: 18,
      transfers: 0,
      polyline: null,
      departure_window: "07:00–08:00",
    },
    elevation: {
      elevation_m: parseInt(a.elevationDpl, 10) || 28,
      relative_m: 12,
      low_lying: false,
      method: "dem_lidar",
    },
    flood: {
      index: 0.2,
      class: a.elevationScore === "Tinggi" ? "Rendah" : "Sedang",
      resolution_note: "InaRISK BNPB: Risiko Terkendali",
    },
    transit: [
      {
        type: "krl",
        label: a.commuteMode,
        distance_km: 0.8,
        headway_min: 10,
      },
    ],
    facilities: {
      transit: 2,
      hospital: 1,
      school: 3,
      market: 2,
      park: 1,
    },
    fit_reasons: [{ key: "cocok", text: a.cocokReason }],
    tradeoffs: [{ key: "tradeoff", text: a.tradeoffReason }],
    unknowns: [],
    dealbreaker_conflicts: [],
  }));

  return {
    meta: {
      counts: {
        strong_fit: converted.filter((c) => c.category === "strong_fit").length,
        interesting_tradeoff: converted.filter((c) => c.category === "interesting_tradeoff").length,
        challenge_assumptions: converted.filter((c) => c.category === "challenge_assumptions").length,
      },
      commute_tolerance_min: 60,
      sources: ["Routes API", "InaRISK", "OSM"],
      geometry_note: "Centroid representatif",
    },
    anchor: {
      lat: -6.215,
      lng: 106.82,
      label: "Sudirman, Jakarta Pusat",
    },
    areas: converted,
  };
}

/** `/v2/areas` — Alternative Curated Areas & Map Explorer */
export default function AreasHubV2() {
  const navigate = useNavigate();
  const [loaderDone, setLoaderDone] = useState(false);
  const [data, setData] = useState<AreasResponse | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [view, setView] = useState<View>("peta");
  const [shortlist, setShortlist] = useState<Set<string>>(() => getShortlist());
  const [reports] = useState<Record<string, string>>(() => getReports());
  const { locationLimit } = useEntitlement();
  const analysedCount = Object.keys(reports).length;
  const commerce = useCommerce({
    auditedCount: analysedCount,
    onOpenArchive: () => navigate("/v2/onboarding"),
  });
  const { openUpgrade } = commerce;
  const [floodAreas, setFloodAreas] = useState<FloodArea[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  type Filter = FitCategory | "shortlist" | null;
  const [filter, setFilter] = useState<Filter>(null);
  const [drawerArea, setDrawerArea] = useState<ViewArea | null>(null);
  const [unlockArea, setUnlockArea] = useState<ViewArea | null>(null);
  const [layers] = useState({ radius: true, transit: true });
  const [search, setSearch] = useState("");

  const profile = loadProfile();
  const anchor = profile?.anchors.find((a) => a.type === "primary");
  const anchorLabel = anchor?.label;

  useEffect(() => {
    if (!profile || profile.status !== "confirmed" || !anchorLabel || !anchor?.placeId || !profile.commuteToleranceMinutes) {
      setProfileError("Lengkapi tujuan aktivitas dan batas komuter sebelum melihat area.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const hits = await placesAutocomplete(anchorLabel).catch(() => []);
        const selected = hits.find((hit) => hit.place_id === anchor.placeId);
        const geo = await geocodePlace(selected?.description ?? anchorLabel);
        const res = await fetchAreas({
          anchorLat: geo.lat,
          anchorLng: geo.lng,
          anchorLabel: shortAnchorLabel(anchorLabel),
          toleranceMin: profile.commuteToleranceMinutes,
          dealbreakers: profile?.signals?.selectedFriction === "flood-access" ? ["flood_safety"] : [],
        });

        if (cancelled) return;
        setData(res);
        setActiveId(res.areas[0]?.id ?? null);
      } catch {
        if (!cancelled) setProfileError("Area belum dapat dimuat. Periksa tujuan aktivitasmu lalu coba lagi.");
      }
    })();
    return () => { cancelled = true; };
  }, [anchor?.placeId, anchorLabel, profile?.commuteToleranceMinutes, profile?.signals?.selectedFriction, profile?.status]);

  useEffect(() => {
    let cancelled = false;
    getFloodAreas()
      .then((r) => { if (!cancelled) setFloodAreas(r.areas); })
      .catch(() => { if (!cancelled) setFloodAreas([]); });
    return () => { cancelled = true; };
  }, []);

  const reportedFloodAreas = useMemo(
    () => floodAreas.filter((a) => a.id in reports),
    [floodAreas, reports],
  );

  const viewAreas = useMemo(
    () => (data ? toViewAreas(data, shortlist) : initialCuratedAreas),
    [data, shortlist],
  );

  const filtered = useMemo(() => {
    let all = data?.areas ?? mockAreasResponseFromInitial().areas;
    if (filter === "shortlist") all = all.filter((a) => shortlist.has(a.id));
    else if (filter) all = all.filter((a) => a.category === filter);
    const q = search.trim().toLowerCase();
    return q ? all.filter((a) => `${a.name} ${a.region}`.toLowerCase().includes(q)) : all;
  }, [data, filter, shortlist, search]);

  const filteredView = useMemo(
    () => viewAreas.filter((v) => filtered.some((a) => a.id === v.id)),
    [viewAreas, filtered],
  );

  const toggleShortlist = useCallback((id: string) => {
    setShortlist(toggleShortlisted(id));
  }, []);

  const carouselFilter: CarouselFilter =
    filter === null ? "all" : filter === "shortlist" ? "shortlisted" : TO_VIEW_CATEGORY[filter];

  const setCarouselFilter = useCallback((f: CarouselFilter) => {
    setFilter(f === "all" ? null : f === "shortlisted" ? "shortlist" : TO_API_CATEGORY[f]);
  }, []);

  const [evaluating, setEvaluating] = useState<ViewArea | null>(null);
  const [recalibrateOpen, setRecalibrateOpen] = useState(false);

  /** Direct action to enter workspace */
  const onAreaAction = useCallback((area: ViewArea) => {
    const conv = reports[area.id];
    if (conv) {
      navigate(`/v2/workspace/${conv}`);
      return;
    }
    // Direct workspace route with area preloaded
    navigate(`/v2/workspace?area=${encodeURIComponent(area.name)}`);
  }, [reports, navigate]);

  const startEvaluation = useCallback((area: ViewArea) => {
    const p = loadProfile();
    saveWizard({ ...loadWizard(), area: area.name, ...(p ? intakeSeedFromProfile(p) : {}) });
    setEvaluating(area);
  }, []);

  if (!loaderDone) {
    return (
      <LocationDataLoadingScreen
        userFriction={profile?.signals?.selectedFrictionLabel}
        onComplete={() => setLoaderDone(true)}
      />
    );
  }

  if (profileError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-6 text-center">
        <MapPin className="mx-auto text-[#00684A]" size={36} aria-hidden="true" />
        <h1 className="text-2xl font-black text-[#001E2B]">Preferensi belum siap</h1>
        <p className="text-sm leading-relaxed text-[#5C6C7A]">{profileError}</p>
        <button type="button" onClick={() => navigate("/v2/onboarding")} className="min-h-12 rounded-full bg-[#00ED64] px-5 font-extrabold text-[#001E2B]">Lengkapi preferensi</button>
      </main>
    );
  }

  const counts = data?.meta.counts ?? { strong_fit: 3, interesting_tradeoff: 2, challenge_assumptions: 1 };
  const carouselCounts: Record<CarouselFilter, number> = {
    all: data?.areas.length ?? initialCuratedAreas.length,
    "strong-fit": counts.strong_fit ?? 0,
    "interesting-tradeoff": counts.interesting_tradeoff ?? 0,
    "challenge-assumptions": counts.challenge_assumptions ?? 0,
    shortlisted: shortlist.size,
  };
  const active = data?.areas.find((a) => a.id === activeId) ?? data?.areas[0] ?? null;
  const activeView = viewAreas.find((v) => v.id === activeId) ?? viewAreas[0] ?? null;

  const filterPill = (
    key: Filter, label: string, count: number, dot?: string, bookmark?: boolean,
  ) => {
    const on = filter === key;
    return (
      <button
        key={String(key)}
        type="button"
        onClick={() => setFilter(on ? null : key)}
        className={`min-h-[36px] px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer active:scale-[0.96] whitespace-nowrap flex items-center gap-2 ${
          on
            ? "bg-[#001E2B] text-white border border-[#001E2B] shadow-2xs"
            : "bg-white text-[#334155] border border-[#CBD5E1] hover:bg-slate-100/80"
        }`}
      >
        {bookmark && <Bookmark size={13} className="text-[#00ED64] fill-[#00ED64]" />}
        {dot && <span className="w-2 h-2 rounded-full" style={{ background: dot }} />}
        <span>{label} (<span className="tabular-nums">{count}</span>)</span>
      </button>
    );
  };

  const filterBar = (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none touch-pan-x scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
      {filterPill(null, "Semua", data?.areas.length ?? initialCuratedAreas.length)}
      {CATEGORY_ORDER.map((c) => filterPill(c, CATEGORY_TEXT[c], counts[c] ?? 0, CATEGORY_DOT[c]))}
      {filterPill("shortlist", "Area Tersimpan", shortlist.size, undefined, true)}
    </div>
  );

  const tab = (id: View, label: string, Icon: typeof MapIcon, badge?: number) => (
    <button
      key={id}
      type="button"
      onClick={() => setView(id)}
      className={`flex-1 sm:flex-initial justify-center min-h-[44px] sm:min-h-[36px] px-4 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-[0.96] whitespace-nowrap ${
        view === id
          ? "bg-[#001E2B] text-white border border-[#001E2B] shadow-2xs"
          : "bg-white sm:bg-transparent text-[#475569] border border-[#CBD5E1] hover:bg-slate-100/80"
      }`}
    >
      <Icon size={14} className={view === id ? "text-[#00ED64]" : "text-[#94A3B8]"} />
      <span>{label}</span>
      {badge ? (
        <span className="ml-0.5 rounded-full bg-[#00ED64] px-1.5 py-0.5 text-[10px] font-black tabular-nums text-[#001E2B] shadow-2xs">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="h-screen h-[100dvh] max-h-screen bg-[#F4F7F8] text-[#001E2B] flex flex-col overflow-hidden antialiased font-sans relative">
      <JourneyHeaderV2
        variant="areas"
        onUpgrade={() => openUpgrade()}
        onRecurate={() => navigate("/v2/onboarding")}
        onOpenRecalibrate={() => setRecalibrateOpen(true)}
      />

      {/* Sub-header matching Image 1 & 2 */}
      <div className="shrink-0 bg-white border-b border-[#E1E5E8] px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 shadow-xs z-20">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight [text-wrap:balance]">
              Peta Rekomendasi Wilayah
            </h1>
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#00684A] border border-[#00ED64]/40 shrink-0">
              Jabodetabek
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-medium hidden sm:block">
            Dikelompokkan berdasarkan keselarasan kompromi hidup nyata, bukan skor fiktif.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto bg-[#F4F7F8] sm:bg-transparent p-1 sm:p-0 rounded-full sm:rounded-none border border-[#E1E5E8] sm:border-none shrink-0 overflow-x-auto scrollbar-none">
          {tab("peta", "Peta Interaktif", MapIcon)}
          {tab("daftar", "Daftar Area", List, shortlist.size || undefined)}
        </div>
      </div>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative z-0">
        {view === "peta" ? (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left rail (matches Image 2 sidebar) */}
            <aside className="hidden lg:flex lg:w-[380px] xl:w-[410px] bg-white border-r border-[#E1E5E8] flex-col h-full shrink-0 z-10 shadow-xs overflow-hidden">
              <div className="shrink-0 p-3.5 sm:p-4 border-b border-[#E1E5E8] bg-[#F8FAFC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                    KESESUAIAN WILAYAH
                  </span>
                  <span className="text-[11px] text-[#64748B] font-bold">
                    {data?.areas.length ?? initialCuratedAreas.length} Wilayah
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORY_ORDER.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilter(filter === c ? null : c)}
                      className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer active:scale-[0.97] ${
                        filter === c
                          ? "bg-[#001E2B] border-[#001E2B] text-white shadow-xs"
                          : "bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="size-2 rounded-full" style={{ background: CATEGORY_DOT[c] }} />
                        <span className="text-[10px] font-black">{counts[c] ?? 0}</span>
                      </div>
                      <span className="text-[10.5px] font-bold block mt-1 leading-tight truncate">
                        {CATEGORY_TEXT[c]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable list of compact corridor cards */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {filtered.map((a) => {
                  const on = a.id === activeId;
                  const viewArea = viewAreas.find((v) => v.id === a.id);
                  return (
                    <div
                      key={a.id}
                      onClick={() => setActiveId(a.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 select-none relative ${
                        on
                          ? "border-[#001E2B] bg-[#F8FAFC] shadow-sm ring-2 ring-[#001E2B]/10"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {on && <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#00ED64] rounded-r-full" />}
                      <div className="flex items-center justify-between pl-1">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                              style={{ background: "#F8FAFC", borderColor: `${CATEGORY_DOT[a.category]}4d` }}>
                          <span className="size-1.5 rounded-full shrink-0" style={{ background: CATEGORY_DOT[a.category] }} />
                          <span className="text-[#334155]">{a.category_label}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleShortlist(a.id); }}
                          title={shortlist.has(a.id) ? "Tersimpan di shortlist" : "Simpan ke shortlist"}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            shortlist.has(a.id)
                              ? "text-[#00ED64] bg-[#001E2B]"
                              : "text-[#94A3B8] hover:text-[#001E2B] hover:bg-[#F1F5F9]"
                          }`}
                        >
                          <Bookmark size={13} className={shortlist.has(a.id) ? "fill-[#00ED64]" : ""} />
                        </button>
                      </div>

                      <div className="pl-1">
                        <h4 className="text-sm font-black text-[#1E293B] leading-tight">{a.name}</h4>
                        <span className="text-[11px] text-[#64748B] font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-[#00ED64]" />{a.region}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F1F5F9] text-[#64748B] pl-1">
                        <span className="font-bold text-[#1E293B] flex items-center gap-1">
                          <Clock size={12} className="text-[#94A3B8]" />
                          {a.commute ? `~${a.commute.minutes} Menit` : "—"}
                        </span>
                        {viewArea?.priceRange && (
                          <span className="font-semibold text-[#1E293B] text-[11px]">
                            {viewArea.priceRange}
                          </span>
                        )}
                        <span className="text-[#00684A] font-bold bg-[#E9F5EF] px-1.5 py-0.5 rounded border border-[#318266]/20 flex items-center gap-1">
                          <Mountain size={11} className="text-[#00684A]" />
                          {a.elevation ? `${Math.round(a.elevation.elevation_m)} mdpl` : "?"}
                        </span>
                      </div>

                      {on && (
                        <div className="flex items-center gap-2 border-t border-[#E2E8F0] pt-2 animate-fadeIn">
                          <button type="button"
                                  onClick={(e) => { e.stopPropagation(); if (activeView) setDrawerArea(activeView); }}
                                  className="flex-1 cursor-pointer rounded-full bg-[#F1F5F9] px-3 py-1.5 text-center text-xs font-bold text-[#334155] transition-all hover:bg-[#E2E8F0] active:scale-95">
                            Detail Area
                          </button>
                          <button type="button"
                                  onClick={(e) => { e.stopPropagation(); if (activeView) onAreaAction(activeView); }}
                                  className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-full bg-[#001E2B] px-3 py-1.5 text-center text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#0F2B38] active:scale-95">
                            <span>Evaluasi</span>
                            <ArrowRight size={12} className="text-[#00ED64]" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sticky Sidebar Footer */}
              <div className="shrink-0 p-3 px-4 border-t border-[#E1E5E8] bg-[#F8FAFC] flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#00ED64]" />
                  Sintesis BNPB & BIG 2024
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 border border-[#E2E8F0] text-[10.5px] font-bold text-[#334155] shadow-2xs">
                  {data?.areas.length ?? 8} Area Terverifikasi
                </span>
              </div>
            </aside>

            {/* Map Canvas */}
            <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-slate-100">
              <AreasMap
                floodAreas={reportedFloodAreas}
                anchor={data?.anchor ?? { lat: -6.215, lng: 106.82, label: "Sudirman" }}
                areas={filtered}
                activeId={activeId}
                layers={layers}
                onSelect={setActiveId}
                query={search}
                onQuery={setSearch}
              />

              {/* Mobile Carousel */}
              <div className="lg:hidden">
                <AreaCardCarousel
                  areas={filteredView}
                  selectedAreaId={activeId}
                  filter={carouselFilter}
                  counts={carouselCounts}
                  reports={reports}
                  busyId={null}
                  onSelectArea={setActiveId}
                  onFilterChange={setCarouselFilter}
                  onToggleBookmark={toggleShortlist}
                  onOpenDrawer={setDrawerArea}
                  onEvaluate={onAreaAction}
                />
              </div>

              {/* Desktop Floating Card on Map (Matches Image 2) */}
              {active && activeView && (
                <div className="hidden lg:block absolute top-16 left-6 z-20 w-[290px] bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E2E8F0] shadow-[0_12px_28px_rgba(0,30,43,0.16)] p-3.5 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 bg-[#F8FAFC]"
                          style={{ borderColor: `${CATEGORY_DOT[active.category]}4d` }}>
                      <span className="size-1.5 rounded-full" style={{ background: CATEGORY_DOT[active.category] }} />
                      <span className="text-[#334155]">{active.category_label}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveId(null)}
                      className="text-[#94A3B8] hover:text-[#1E293B] p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1E293B]">{active.name}</h3>
                    <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-[#00ED64]" />
                      {active.region}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#1E293B] pt-2 border-t border-[#F1F5F9]">
                    <span>{activeView.priceRange}</span>
                    <span className="flex items-center gap-1 text-[#64748B] text-[11px]">
                      <Clock size={11} className="text-[#94A3B8]" />
                      {active.commute ? `~${active.commute.minutes} Menit` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDrawerArea(activeView)}
                      className="flex-1 py-1.5 px-3 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-bold text-[#334155] text-center cursor-pointer active:scale-95 transition-all"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => onAreaAction(activeView)}
                      className="flex-1 py-1.5 px-3 rounded-full bg-[#001E2B] hover:bg-[#0F2B38] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
                    >
                      <span>Evaluasi</span>
                      <ArrowRight size={12} className="text-[#00ED64]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 md:p-6 max-w-7xl 2xl:max-w-[1536px] mx-auto w-full">
            <div className="mb-6 w-full overflow-hidden">{filterBar}</div>
            <div>
              <DaftarAksesibelView
                areas={filteredView}
                reports={reports}
                busyId={null}
                onToggleBookmark={toggleShortlist}
                onOpenDrawer={setDrawerArea}
                onEvaluateArea={onAreaAction}
              />
            </div>
          </div>
        )}
      </main>

      <AreaDetailDrawer
        isOpen={drawerArea !== null}
        area={drawerArea}
        onClose={() => setDrawerArea(null)}
        onSelectForEvaluation={(a) => { setDrawerArea(null); onAreaAction(a); }}
      />
      {commerce.modals}
      <UnlockAreaQuotaModal
        isOpen={unlockArea !== null}
        area={unlockArea}
        remainingQuota={Math.max(0, locationLimit - analysedCount)}
        totalQuota={locationLimit}
        onClose={() => setUnlockArea(null)}
        onConfirm={(a) => { setUnlockArea(null); startEvaluation(a); }}
      />
      <RecalibrateLocationModal
        isOpen={recalibrateOpen}
        onClose={() => setRecalibrateOpen(false)}
        onConfirm={() => {
          setRecalibrateOpen(false);
          navigate("/v2/onboarding");
        }}
      />
      <EvaluatePropertyModal
        areaName={evaluating?.name ?? ""}
        centroid={
          evaluating
            ? data?.areas.find((a) => a.id === evaluating.id)?.centroid ?? null
            : null
        }
        open={evaluating !== null}
        onClose={() => setEvaluating(null)}
        onStarted={(conversationId) => {
          navigate(`/v2/workspace/${conversationId}`);
        }}
      />
    </div>
  );
}
