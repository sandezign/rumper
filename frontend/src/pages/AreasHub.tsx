import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Map as MapIcon, List, MapPin, Clock, Mountain, Bookmark, AlertTriangle }
  from "lucide-react";
import LocationDataLoadingScreen from "@/features/areas/components/LocationDataLoadingScreen";
import JourneyHeader from "@/features/areas/components/JourneyHeader";
import EvaluatePropertyModal from "@/features/areas/components/EvaluatePropertyModal";
import DaftarAksesibelView from "@/features/areas/components/DaftarAksesibelView";
import AreaCardCarousel, { type CarouselFilter } from "@/features/areas/components/AreaCardCarousel";
import AreaDetailDrawer from "@/features/areas/components/AreaDetailDrawer";
import UnlockAreaQuotaModal from "@/features/areas/components/UnlockAreaQuotaModal";
import AreasMap, { CATEGORY_DOT } from "@/features/areas/components/AreasMap";
import type { CuratedArea as ViewArea } from "@/features/areas/data/mockCuratedAreas";
import { fetchAreas, shortAnchorLabel, type AreasResponse, type FitCategory } from "@/features/areas/api";
import { toViewAreas } from "@/features/areas/adapt";
import { CATEGORY_LABEL as CATEGORY_TEXT, TO_API_CATEGORY, TO_VIEW_CATEGORY } from "@/features/areas/labels";
import { getReports, getShortlist, linkReport, reconcileReports, seedShortlist, toggleShortlisted }
  from "@/features/areas/shortlist";
import { loadProfile } from "@/lib/profile";
import { intakeSeedFromProfile, loadWizard, saveWizard, wizardToIntake } from "@/lib/wizard";
import { ApiError, createConversationFromIntake, geocodePlace, getFloodAreas, listConversations, placesAutocomplete } from "@/lib/api";
import type { FloodArea } from "@/lib/api";
import { canRecurate, useEntitlement } from "@/lib/entitlements";
import { useCommerce } from "@/features/commerce/useCommerce";

type View = "peta" | "daftar";

const CATEGORY_ORDER: FitCategory[] = ["strong_fit", "interesting_tradeoff", "challenge_assumptions"];


/** `/app/areas` — synthesis loader, then the corridor hub (PRD-12, docs/21).
 *
 *  Corridor facts are real: commute from the Routes API at Monday 07:00 WIB, elevation and
 *  flood class from the cached hazard providers, facility counts from the OSM warehouse. */
export default function AreasHub() {
  const navigate = useNavigate();
  const [loaderDone, setLoaderDone] = useState(false);
  const [data, setData] = useState<AreasResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("peta");
  const [shortlist, setShortlist] = useState<Set<string>>(() => getShortlist());
  const [reports, setReports] = useState<Record<string, string>>(() => getReports());
  const [autoBusy, setAutoBusy] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { locationLimit } = useEntitlement();
  const analysedCount = Object.keys(reports).length;
  const commerce = useCommerce({
    auditedCount: analysedCount,
    onOpenArchive: () => navigate("/app/account"),
  });
  const { openUpgrade, openZeroQuota } = commerce;
  const [floodAreas, setFloodAreas] = useState<FloodArea[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  type Filter = FitCategory | "shortlist" | null;
  const [filter, setFilter] = useState<Filter>(null);
  const [drawerArea, setDrawerArea] = useState<ViewArea | null>(null);
  const [unlockArea, setUnlockArea] = useState<ViewArea | null>(null);
  const [layers] = useState({ radius: true, transit: true });
  const [search, setSearch] = useState("");

  const profile = loadProfile();
  const anchorLabel = profile?.anchors.find((a) => a.type === "primary")?.label ?? "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // The profile stores the anchor's label + place_id, not its coordinates; resolve
        // through the same Places endpoint the wizard used. When `GET /api/profile` lands,
        // the backend resolves it and this round-trip disappears (docs/21 §3).
        if (!anchorLabel) {
          setError("Titik aktivitas belum diatur. Selesaikan dulu Prioritas Saya.");
          return;
        }
        // The link map outlives the server (localStorage, GAP-06). Drop anything pointing
        // at a conversation that no longer exists, or cards offer reports that 404.
        const live = await listConversations().catch(() => []);
        if (!cancelled) setReports(reconcileReports(live.map((c) => c.id)));

        const hits = await placesAutocomplete(anchorLabel).catch(() => []);
        const geo = await geocodePlace(hits[0]?.description ?? anchorLabel);
        const res = await fetchAreas({
          anchorLat: geo.lat, anchorLng: geo.lng, anchorLabel: shortAnchorLabel(anchorLabel),
          toleranceMin: 60,
          dealbreakers: profile?.signals?.selectedFriction === "flood-access"
            ? ["flood_safety"] : [],
        });
        if (cancelled) return;
        setData(res);
        setActiveId(res.areas[0]?.id ?? null);

        // Curation *is* the saving step: every fitting corridor is shortlisted once per
        // profile (docs/18 GAP-06). Free and instant — no research runs here.
        const seeded = seedShortlist(res.areas, profile?.id ?? "anon", { force: reloadKey > 0 });
        if (seeded) setShortlist(new Set(seeded));

        // …and exactly one report is generated, so the buyer lands on something real.
        // Deliberately one, not all of them: a deep-research run consumes a large share of
        // the daily token cap (docs/13 §4), so firing three would 402 partway and take ~9
        // minutes. The rest are generated on demand from the shortlist.
        await maybeGenerateFirst(res);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError && e.status === 401
            ? "Sesi berakhir. Silakan masuk lagi."
            : "Gagal memuat rekomendasi wilayah. Coba lagi sebentar.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [anchorLabel, reloadKey]);

  /** Re-run curation against the current profile.
   *
   *  A paid capability: a fresh run recomputes every corridor (16 Routes calls + a batched
   *  LLM pass, docs/21 §6) and re-seeds the shortlist, which spends location quota. On the
   *  free trial there is nothing to charge against, so the upgrade drawer is shown instead
   *  of silently doing it. */
  const recurate = useCallback(() => {
    if (!canRecurate()) { openUpgrade(); return; }
    setData(null);
    setError(null);
    setLoaderDone(false);
    setReloadKey((k) => k + 1);
  }, [openUpgrade]);

  // Boundaries are pre-ingested weekly (`make ingest-boundaries`) so this costs no external
  // call — but the map only draws the corridors the buyer has actually analysed. A polygon
  // on an un-analysed corridor would imply a flood assessment nobody paid a location quota
  // for, and there is no report behind it to open.
  useEffect(() => {
    let cancelled = false;
    getFloodAreas()
      .then((r) => { if (!cancelled) setFloodAreas(r.areas); })
      .catch(() => { if (!cancelled) setFloodAreas([]); });
    return () => { cancelled = true; };
  }, []);

  /** Only corridors with a generated report — matches the location-quota model. */
  const reportedFloodAreas = useMemo(
    () => floodAreas.filter((a) => a.id in reports),
    [floodAreas, reports],
  );

  const viewAreas = useMemo(
    () => (data ? toViewAreas(data, shortlist) : []),
    [data, shortlist],
  );
  const filtered = useMemo(() => {
    let all = data?.areas ?? [];
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

  /* The docked carousel speaks the view vocabulary ("strong-fit", "shortlisted"); the hub
     filter speaks the API's. Convert at the boundary rather than storing both. */
  const carouselFilter: CarouselFilter =
    filter === null ? "all" : filter === "shortlist" ? "shortlisted" : TO_VIEW_CATEGORY[filter];

  const setCarouselFilter = useCallback((f: CarouselFilter) => {
    setFilter(f === "all" ? null : f === "shortlisted" ? "shortlist" : TO_API_CATEGORY[f]);
  }, []);

  const [evaluating, setEvaluating] = useState<ViewArea | null>(null);

  /** Generate the first corridor report right after curation, if none exists yet.
   *  Ranked strong_fit first so the auto-generated one is the best match. */
  const maybeGenerateFirst = useCallback(async (res: AreasResponse) => {
    if (Object.keys(getReports()).length > 0) return;      // already have one
    const best =
      res.areas.find((a) => a.category === "strong_fit") ??
      res.areas.find((a) => a.category === "interesting_tradeoff");
    if (!best) return;
    setAutoBusy(best.id);
    try {
      const p = loadProfile();
      const draft = {
        ...loadWizard(),
        area: best.name,
        // The corridor itself is the subject: this is an *area* Mini Check, refined later
        // by a property-level one. geocode_smart resolves a named kawasan (docs/12).
        property: `${best.name}, ${best.region}`,
        ...(p ? intakeSeedFromProfile(p) : {}),
      };
      saveWizard(draft);
      const conv = await createConversationFromIntake(wizardToIntake(draft));
      linkReport(best.id, conv.conversation_id);
      setReports(getReports());
      setShortlist(getShortlist());
    } catch {
      // Quota exhausted or geocoding failed — the hub still works, the corridor just has
      // no report yet and the card falls back to "Evaluasi Rumah Ini".
    } finally {
      setAutoBusy(null);
    }
  }, []);

  /** Analysed corridors open their existing report; the rest go through the quota modal —
   *  unless there is no quota left, in which case the zero-quota interception explains the
   *  options instead of the unlock modal promising one the buyer does not have (PRD-13 §4
   *  Module 4). Curation already produced the first report, so that card never re-runs. */
  const onAreaAction = useCallback((area: ViewArea) => {
    const conv = reports[area.id];
    if (conv) { navigate(`/app/c/${conv}`); return; }
    if (analysedCount >= locationLimit) { openZeroQuota(); return; }
    setUnlockArea(area);
  }, [reports, navigate, analysedCount, locationLimit, openZeroQuota]);

  /** Quota confirmed → stay in the journey and ask only for the address. The wizard's
   *  answers are pushed into the intake draft here so the next step submits a complete
   *  payload (docs/17 §3b). */
  const startEvaluation = useCallback((area: ViewArea) => {
    const p = loadProfile();
    saveWizard({ ...loadWizard(), area: area.name, ...(p ? intakeSeedFromProfile(p) : {}) });
    setEvaluating(area);
  }, []);

  if (!loaderDone || (!data && !error)) {
    return (
      <LocationDataLoadingScreen
        userFriction={profile?.signals?.selectedFrictionLabel}
        onComplete={() => setLoaderDone(true)}
      />
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F4F7F8]">
        <JourneyHeader
          variant="areas"
          onUpgrade={() => openUpgrade()}
          onZeroQuota={openZeroQuota}
          onRecurate={recurate}
        />
        <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm rounded-3xl border border-[#E1E5E8] bg-white p-6 text-center">
          <AlertTriangle size={20} className="mx-auto mb-2 text-[#D4A017]" />
          <p className="text-sm font-semibold text-[#001E2B]">{error}</p>
          <button type="button" onClick={() => navigate("/app/start")}
                  className="mt-4 min-h-[40px] rounded-full bg-[#00ED64] px-5 text-xs font-extrabold text-[#001E2B]">
            Kembali ke Prioritas Saya
          </button>
          </div>
        </div>
      </div>
    );
  }

  const counts = data!.meta.counts;
  const carouselCounts: Record<CarouselFilter, number> = {
    all: data!.areas.length,
    "strong-fit": counts.strong_fit ?? 0,
    "interesting-tradeoff": counts.interesting_tradeoff ?? 0,
    "challenge-assumptions": counts.challenge_assumptions ?? 0,
    shortlisted: shortlist.size,
  };
  const active = data!.areas.find((a) => a.id === activeId) ?? null;
  const activeView = viewAreas.find((v) => v.id === activeId) ?? null;

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
            ? "bg-[#0F2B38] text-white border border-[#0F2B38] shadow-2xs"
            : "bg-transparent text-[#3D4F5B] border border-[#C1CCD6] hover:bg-slate-100/80"
        }`}
      >
        {bookmark && <Bookmark size={13} className="text-[#00B545] fill-[#00B545]" />}
        {dot && <span className="w-2 h-2 rounded-full" style={{ background: dot }} />}
        <span>{label} (<span className="tabular-nums">{count}</span>)</span>
      </button>
    );
  };

  const filterBar = (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none touch-pan-x scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
      {filterPill(null, "Semua", data?.areas.length ?? 0)}
      {CATEGORY_ORDER.map((c) => filterPill(c, CATEGORY_TEXT[c], counts[c] ?? 0, CATEGORY_DOT[c]))}
      {filterPill("shortlist", "Area Tersimpan", shortlist.size, undefined, true)}
    </div>
  );

  const tab = (id: View, label: string, Icon: typeof MapIcon, badge?: number) => (
    <button
      key={id}
      type="button"
      onClick={() => setView(id)}
      className={`flex-1 sm:flex-initial justify-center min-h-[44px] sm:min-h-[36px] px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.96] whitespace-nowrap ${
        view === id
          ? "bg-[#0F2B38] text-white border border-[#0F2B38] shadow-2xs"
          : "bg-white sm:bg-transparent text-[#3D4F5B] border border-[#C1CCD6] hover:bg-slate-100/80"
      }`}
    >
      <Icon size={14} className={view === id ? "text-[#00ED64]" : "text-[#7C8C9A]"} />
      <span>{label}</span>
      {badge ? (
        <span className="ml-1 rounded-full bg-[#00ED64] px-1.5 py-0.5 text-[10px] font-black tabular-nums text-[#001E2B] shadow-2xs">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="h-screen h-[100dvh] max-h-screen bg-[#F4F7F8] text-[#001E2B] flex flex-col overflow-hidden antialiased font-sans relative">
      <JourneyHeader
          variant="areas"
          onUpgrade={() => openUpgrade()}
          onZeroQuota={openZeroQuota}
          onRecurate={recurate}
        />

      {/* Sub-header */}
      <div className="shrink-0 bg-white border-b border-[#E1E5E8] px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 shadow-xs z-20">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight [text-wrap:balance]">
              Peta Rekomendasi Wilayah
            </h1>
            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F4F7F8] text-[#5C6C7A] border border-[#E1E5E8] shrink-0">
              Jabodetabek
            </span>
          </div>
          <p className="text-xs text-[#5C6C7A] font-medium hidden sm:block">
            Dikelompokkan berdasarkan keselarasan kompromi hidup nyata, bukan skor fiktif.
          </p>
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-[#F4F7F8] sm:bg-transparent p-1 sm:p-0 rounded-full sm:rounded-none border border-[#E1E5E8] sm:border-none shrink-0 overflow-x-auto scrollbar-none">
          {tab("peta", "Peta Interaktif", MapIcon)}
          {tab("daftar", "Daftar Area", List, shortlist.size || undefined)}
          <span
            title="Lokasi yang sudah dianalisis dari kuota gratis"
            className="ml-auto sm:ml-1 shrink-0 inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#318266]/25 bg-[#E9F5EF] px-3 text-[11px] font-bold text-[#004F38]"
          >
            <span className="size-1.5 rounded-full bg-[#00B545]" />
            <span className="tabular-nums">
              Analisis {analysedCount}/{locationLimit}
            </span>
          </span>
        </div>
      </div>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative z-0">
        {view === "peta" ? (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left rail */}
            <aside className="hidden lg:flex lg:w-[380px] xl:w-[420px] bg-white border-r border-[#E1E5E8] flex-col h-full shrink-0 z-10 shadow-xs overflow-hidden">
              <div className="shrink-0 p-3.5 sm:p-4 border-b border-[#E1E5E8] bg-[#F9FBFA] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7C8C9A]">
                    Kategori Keselarasan (Non-Ranking)
                  </span>
                  <span className="text-[11px] text-[#5C6C7A] font-semibold">
                    {data!.areas.length} Wilayah
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
                          ? "bg-[#001E2B] border-[#001E2B] text-white"
                          : "bg-white border-[#C1CCD6] text-[#3D4F5B] hover:bg-[#F4F7F6]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="size-2 rounded-full" style={{ background: CATEGORY_DOT[c] }} />
                        <span className="text-[10px] font-black">{counts[c] ?? 0}</span>
                      </div>
                      <span className="text-[11px] font-bold block mt-1 leading-tight truncate">
                        {CATEGORY_TEXT[c]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-xs font-medium text-[#7C8C9A]">
                    Tidak ada koridor yang cocok dengan pencarian.
                  </p>
                )}
                {filtered.map((a) => {
                  const on = a.id === activeId;
                  return (
                    <div
                      key={a.id}
                      onClick={() => setActiveId(a.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 select-none relative ${
                        on
                          ? "border-[#001E2B] bg-[#FBFDFC] shadow-sm ring-2 ring-[#001E2B]/10"
                          : "border-[#E1E5E8] bg-white hover:border-[#A8B8C6] hover:bg-[#F9FBFA]"
                      }`}
                    >
                      {on && <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#00ED64] rounded-r-full" />}
                      <div className="flex items-center justify-between pl-1">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                              style={{ background: "#F4F7F8", borderColor: `${CATEGORY_DOT[a.category]}4d` }}>
                          <span className="size-1.5 rounded-full shrink-0" style={{ background: CATEGORY_DOT[a.category] }} />
                          <span>{a.category_label}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleShortlist(a.id); }}
                          title={shortlist.has(a.id) ? "Tersimpan di shortlist" : "Simpan ke shortlist"}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            shortlist.has(a.id)
                              ? "text-[#00ED64] bg-[#001E2B]"
                              : "text-[#A8B3BC] hover:text-[#001E2B] hover:bg-[#F4F7F6]"
                          }`}
                        >
                          <Bookmark size={13} className={shortlist.has(a.id) ? "fill-[#00ED64]" : ""} />
                        </button>
                      </div>
                      <div className="pl-1">
                        <h4 className="text-sm font-extrabold leading-tight">{a.name}</h4>
                        <span className="text-[11px] text-[#7C8C9A] font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-[#7C8C9A]" />{a.region}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F0F4F6] text-[#5C6C7A] pl-1">
                        <span className="font-extrabold text-[#001E2B] flex items-center gap-1">
                          <Clock size={12} className="text-[#7C8C9A]" />
                          {a.commute ? `~${a.commute.minutes} Menit` : "Belum tersedia"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {reports[a.id] && (
                            <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#001E2B] text-[#00ED64]">
                              Laporan siap
                            </span>
                          )}
                          <span className="text-[#00684A] font-bold bg-[#E9F5EF] px-1.5 py-0.5 rounded border border-[#318266]/20 flex items-center gap-1">
                            <Mountain size={11} className="text-[#00684A]" />
                            {a.elevation ? `${Math.round(a.elevation.elevation_m)} mdpl` : "?"}
                          </span>
                        </span>
                      </div>

                      {/* The selected corridor carries its actions inline, so choosing on the
                          map and acting on it are one gesture instead of two screens. */}
                      {on && (
                        <div className="flex items-center gap-2 border-t border-[#E1E5E8] pt-2 animate-fadeIn">
                          <button type="button"
                                  onClick={(e) => { e.stopPropagation(); if (activeView) setDrawerArea(activeView); }}
                                  className="flex-1 cursor-pointer rounded-full bg-[#F2F2F7] px-3 py-1.5 text-center text-xs font-semibold text-[#1C1C1E] transition-all hover:bg-[#E5E5EA] active:scale-95">
                            Detail Area
                          </button>
                          <button type="button" disabled={autoBusy === a.id}
                                  onClick={(e) => { e.stopPropagation(); if (activeView) onAreaAction(activeView); }}
                                  className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-full bg-[#001E2B] px-3 py-1.5 text-center text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#0F2B38] active:scale-95 disabled:opacity-60">
                            <span>{autoBusy === a.id ? "Menyiapkan…" : reports[a.id] ? "Buka Laporan" : "Evaluasi"}</span>
                            <ArrowRight size={12} className="text-[#00ED64]" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="shrink-0 px-4 py-2.5 bg-[#F9FBFA] border-t border-[#E1E5E8] flex items-center justify-between text-[11px] text-[#5C6C7A]">
                <div className="flex items-center gap-1.5 font-semibold text-[#001E2B]">
                  <span className="size-2 rounded-full bg-[#00ED64] animate-pulse shrink-0" />
                  <span>Routes API · InaRISK · OSM</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#E9F5EF] text-[#004F38] rounded-full border border-[#318266]/20">
                  {data!.areas.length} Koridor
                </span>
              </div>
            </aside>

            {/* Map */}
            <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-slate-100">
              <AreasMap
            floodAreas={reportedFloodAreas}
                anchor={data!.anchor}
                areas={filtered}
                activeId={activeId}
                layers={layers}
                onSelect={setActiveId}
                query={search}
                onQuery={setSearch}
              />

              {/* Below lg the inspector panel has nowhere to sit, so the peek carousel is the
                  inspector: it is two-way bound to the map selection. */}
              <div className="lg:hidden">
                <AreaCardCarousel
                  areas={filteredView}
                  selectedAreaId={activeId}
                  filter={carouselFilter}
                  counts={carouselCounts}
                  reports={reports}
                  busyId={autoBusy}
                  onSelectArea={setActiveId}
                  onFilterChange={setCarouselFilter}
                  onToggleBookmark={toggleShortlist}
                  onOpenDrawer={setDrawerArea}
                  onEvaluate={onAreaAction}
                />
              </div>

              {active && activeView && (
                <div className="hidden lg:block absolute bottom-4 left-4 z-20 w-[390px] max-w-md max-h-[calc(100%-80px)] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-3xl border border-[#E1E5E8] shadow-[0_16px_36px_rgba(0,30,43,0.14)] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                          style={{ background: "#F4F7F8", borderColor: `${CATEGORY_DOT[active.category]}4d` }}>
                      <span className="size-1.5 rounded-full" style={{ background: CATEGORY_DOT[active.category] }} />
                      {active.category_label}
                    </span>
                    <span className="text-xs text-[#5C6C7A] font-semibold flex items-center gap-1">
                      <MapPin size={12} className="text-[#7C8C9A]" />{active.region}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight [text-wrap:balance]">{active.name}</h3>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    {[
                      ["Komuter", active.commute ? `~${active.commute.minutes} Menit` : "?"],
                      ["Elevasi", active.elevation ? `${Math.round(active.elevation.elevation_m)} mdpl` : "?"],
                      ["Banjir", active.flood ? active.flood.class : "?"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-[#F4F7F8] p-2 sm:p-2.5 rounded-2xl border border-[#E1E5E8]">
                        <span className="text-[9px] font-bold uppercase text-[#7C8C9A]">{k}</span>
                        <span className="text-xs font-black mt-0.5 block tabular-nums">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2.5 rounded-2xl bg-[#E9F5EF] border border-[#318266]/20 text-[#003D2E] font-medium leading-snug">
                      <div className="font-bold text-[#004F38] mb-0.5">Mengapa Selaras:</div>
                      <p className="[text-wrap:pretty]">{active.fit_reasons[0]?.text}</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#FFF9E6] border border-[#D4A017]/20 text-[#523A00] font-medium leading-snug">
                      <div className="font-bold text-[#6E4E00] mb-0.5">Kompromi Nyata:</div>
                      <p className="[text-wrap:pretty]">{active.tradeoffs[0]?.text}</p>
                    </div>
                    {active.unknowns.map((u) => (
                      <div key={u.field} className="p-2.5 rounded-2xl bg-[#F4F7F8] border border-[#C1CCD6] text-[#3D4F5B] leading-snug">
                        <div className="font-bold text-[#5C6C7A] mb-0.5">Belum diketahui:</div>
                        <p>{u.text}{u.suggested_action ? ` ${u.suggested_action}` : ""}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 flex items-center justify-between gap-2.5 border-t border-[#F0F4F6]">
                    <button type="button" onClick={() => setDrawerArea(activeView)}
                            className="min-h-[40px] px-4 py-2 rounded-full border border-[#D7E1E5] text-xs font-bold text-[#5C6C7A] hover:bg-[#F4F7F6] hover:text-[#001E2B] transition-colors cursor-pointer">
                      Detail Koridor
                    </button>
                    <button
                      type="button"
                      disabled={autoBusy === active.id}
                      onClick={() => activeView && onAreaAction(activeView)}
                      className="min-h-[40px] flex-1 py-2 px-4 rounded-full bg-[#00ED64] hover:bg-[#00B545] text-[#001E2B] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {autoBusy === active.id
                        ? "Menyiapkan laporan…"
                        : reports[active.id]
                          ? "Buka Laporan Koridor"
                          : "Evaluasi Rumah Ini"}
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
                busyId={autoBusy}
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
          if (evaluating) linkReport(evaluating.id, conversationId);
          navigate(`/app/c/${conversationId}`);
        }}
      />
    </div>
  );
}
