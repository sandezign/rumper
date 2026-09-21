import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, MessageSquare, LayoutGrid, Map as MapIcon, User as UserIcon } from "lucide-react";
import JourneyHeader from "@/features/areas/components/JourneyHeader";
import { useCommerce } from "@/features/commerce/useCommerce";
import AdvisorDrawer from "@/features/workspace/AdvisorDrawer";
import ReportMap, { ReportMapProvider } from "@/features/workspace/ReportMap";
import ResearchLoading from "@/components/ResearchLoading";
import type { ResearchProgress } from "@/components/AssistantRail";
import { FactorList, RingkasanCard, STEPS, StepTabs, type StepId } from "@/features/workspace/parts";
import {
  LockedStage, RedFlagStrip, Tahap02Evidence, Tahap03Perjalanan, Tahap04Checklist,
  Tahap05Fasilitas,
} from "@/features/workspace/stages";
import {
  ApiError, getCheck, getConversation, getFloodAreas, getMap, watchResearch,
  type FloodArea, type MapData, type Report,
} from "@/lib/api";
import { unlinkConversation } from "@/features/areas/shortlist";
import { ALL_GROUP_IDS } from "@/features/workspace/facilityGroups";
import { useEntitlement } from "@/lib/entitlements";

/** `/app/c/:threadId` — the 5-step location workspace on the revamped UI (docs/18 Wave 1).
 *
 *  Renders the real Mini Check: `GET /api/checks/{intake_id}` for the report and `/map` for
 *  the spatial payload. Nothing here is mocked — the score, band, factor scores, confidence
 *  labels and disclaimer all come from the deterministic engine. */
export default function LocationWorkspace() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [floodArea, setFloodArea] = useState<FloodArea | null>(null);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<StepId>("ringkasan");
  // Single source of truth for the paywall (docs/18 GAP-12). Production has no provider, so
  // this is `false` for everyone until `GET /api/entitlements` lands.
  const { unlocked } = useEntitlement();
  const [mapFull, setMapFull] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("banjir");
  const [assistantSeed, setAssistantSeed] = useState<string | null>(null);
  const [assistantTopic, setAssistantTopic] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [visibleGroups, setVisibleGroups] = useState<Set<string>>(() => new Set(ALL_GROUP_IDS));
  const sections = useRef<Partial<Record<StepId, HTMLDivElement | null>>>({});
  const scrolling = useRef(false);

  const commerce = useCommerce({
    propertyName: report?.property.name ?? report?.property.formatted_address ?? undefined,
    onUnlocked: () => setStep("faktor-risiko"),
  });
  const openUpgrade = commerce.openUpgrade;

  /** A stage's "Tanya AI" opens the advisor on that stage's topic, question pre-filled. */
  const askAi = useCallback((prompt: string, topic?: string) => {
    setAssistantSeed(prompt);
    setAssistantTopic(topic ?? null);
    setAssistantOpen(true);
  }, []);

  const toggleGroup = useCallback((id: string) => {
    setVisibleGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  /** Opening a facility group frames it on the map — and switches its layer back on, since
   *  framing pins the buyer has hidden would show them an empty patch of map. */
  const openFacilityGroup = useCallback((id: string | null) => {
    setOpenGroup(id);
    if (id) setVisibleGroups((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  /** Tabs scroll rather than swap: the five Tahap are one document, so the buyer keeps the
   *  thread between the score and the evidence under it. The map follows `step` too. */
  const goToStep = useCallback((id: StepId) => {
    setStep(id);
    const el = sections.current[id];
    if (!el) return;
    scrolling.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { scrolling.current = false; }, 600);
  }, []);

  // Scroll-spy: whichever section owns the top of the viewport is the active step.
  useEffect(() => {
    if (!report) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrolling.current) return;
        /* Pick the section whose top sits nearest the band, not the one with the smallest
           top: a tall stage scrolled far above has a hugely negative top and would win
           forever — which is why opening Tahap 03 left the map still framed on Tahap 02. */
        const band = window.innerHeight * 0.18;
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            Math.abs(a.boundingClientRect.top - band) - Math.abs(b.boundingClientRect.top - band))[0];
        if (!best) return;
        const id = (best.target as HTMLElement).dataset.section as StepId | undefined;
        if (id) setStep(id);
      },
      { rootMargin: "-18% 0px -60% 0px", threshold: 0 },
    );
    Object.values(sections.current).forEach((el) => el && observer.observe(el));

    // The bottom-most stage sits below the observer band once the page can scroll no
    // further, so it could never become active by scrolling. Treat "at the end" as
    // selecting the last stage.
    const onScroll = () => {
      if (scrolling.current) return;
      const atEnd = window.innerHeight + window.scrollY >= document.body.offsetHeight - 24;
      if (atEnd) setStep(STEPS[STEPS.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [report, unlocked]);

  const load = useCallback(async (intakeId: string) => {
    setIntakeId(intakeId);
    const [check, map, flood] = await Promise.all([
      getCheck(intakeId),
      getMap(intakeId).catch(() => null),
      // Scoped to this intake: the workspace draws only the location it is showing.
      getFloodAreas(intakeId).then((r) => r.areas[0] ?? null).catch(() => null),
    ]);
    setFloodArea(flood);
    if (check.status === "done") { setReport(check.report); setProgress(null); }
    else if (check.status === "failed") {
      // A failed audit is not a report. Drop the link so the hub offers "Analisis" again
      // instead of an entry that bounces the buyer straight back to this error.
      if (threadId) unlinkConversation(threadId);
      setError(check.error);
    }
    if (map) setMapData(map);
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    let stop: (() => void) | undefined;
    (async () => {
      try {
        const convo = await getConversation(threadId);
        if (!convo.intake_id) { setError("Percakapan ini belum punya analisis lokasi."); return; }
        await load(convo.intake_id);
        if (convo.job_status && convo.job_status !== "done") {
          // Server-owned progress, rendered verbatim (docs/05) — never faked client-side.
          stop = watchResearch(
            convo.intake_id,
            // Pass the whole server-owned progress through: `ResearchLoading` renders the
            // named step cards from `step`/`total`, which the bare spinner was discarding.
            (p) => setProgress({ active: true, step: p.step, total: p.total,
                                 pct: p.pct, label: p.label }),
            () => load(convo.intake_id!),
          );
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          // The audit is gone server-side (deleted, or a `make reset-user-data`) while the
          // client still had it linked. Forget the link so the hub stops offering it.
          unlinkConversation(threadId);
          setError("Analisis ini sudah tidak ada. Mulai lagi dari peta wilayah.");
        } else {
          setError("Gagal memuat laporan. Coba muat ulang halaman.");
        }
      }
    })();
    return () => stop?.();
  }, [threadId, load]);

  // Research in flight → the existing full-screen loader (orbit + named step cards + meter).
  // The revamp reference has no equivalent screen, and a bare spinner discards the step and
  // label the backend already reports. It owns the viewport, as in the legacy workspace.
  if (!report && !error && progress) return <ResearchLoading research={progress} />;

  return (
    <ReportMapProvider>
    <div className="min-h-screen antialiased" style={{ backgroundColor: "#F4F7F8" }}>
      <div className="sticky top-0 z-50 flex w-full flex-col">
        <JourneyHeader onUpgrade={() => openUpgrade()} />
      </div>

      {/* Before the first poll returns there is no step to name yet. */}
      {!report && !error && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-6 text-center">
          <Loader2 size={22} className="animate-spin text-[#0F2B38]" />
          <p className="text-sm font-semibold text-slate-700">Memuat laporan…</p>
        </div>
      )}

      {error && (
        <div className="flex min-h-[70vh] items-center justify-center p-6">
          <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-slate-900">{error}</p>
            <button onClick={() => navigate("/app/areas")}
                    className="mt-4 min-h-[40px] rounded-full bg-[#00ED64] px-5 text-xs font-extrabold text-[#001E2B] cursor-pointer">
              Kembali ke Peta Wilayah
            </button>
          </div>
        </div>
      )}

      {report && (
        <>
          {/* mobile */}
          <div className="flex flex-col pb-20 lg:hidden">
            <div className="sticky top-[52px] z-30 border-b border-slate-200/80 bg-[#F4F7F8]/95 px-4 py-2 shadow-xs backdrop-blur-md">
              <StepTabs active={step} unlocked={unlocked} onSelect={goToStep} onLocked={() => openUpgrade()} />
            </div>
            {/* The map is not desktop-only furniture: it is the evidence for whichever stage
                is open, so mobile gets it inline under the tabs rather than not at all. */}
            {mapData && (
              <div className="px-4 pt-4">
                <div className="h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <ReportMap data={mapData} intakeId={intakeId ?? undefined} floodArea={floodArea}
                             focus={step} focusGroup={step === "fasilitas" ? openGroup : null}
                             visibleGroups={visibleGroups} fullscreen={mapFull}
                             onToggleFullscreen={() => setMapFull((f) => !f)} embedded />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 p-4">
              {(() => {
                const ref = (id: StepId) => (el: HTMLDivElement | null) => { sections.current[id] = el; };
                const stage = (id: StepId, node: React.ReactNode, offset: number) => (
                  <div key={id} data-section={id} ref={ref(id)} style={{ scrollMarginTop: offset }}
                       /* The map reframes per stage, so which stage is "current" must be
                          readable at a glance rather than inferred from scroll position. */
                       className={`rounded-2xl transition-all duration-300 sm:rounded-[26px] ${
                         step === id
                           ? "ring-2 ring-[#0F2B38]/25 ring-offset-2 ring-offset-[#F4F7F8]"
                           : "ring-0"
                       }`}>
                    {node}
                  </div>
                );
                return STEPS.map((s) => {
                  const locked = !unlocked && s.id !== "ringkasan";
                  if (locked) return stage(s.id, <LockedStage step={s.id} onUpgrade={() => openUpgrade()} />, 112);
                  switch (s.id) {
                    case "ringkasan":
                      return stage(s.id, (
                        <div className="flex flex-col gap-4">
                          <RingkasanCard report={report} onAsk={askAi} />
                          <RedFlagStrip report={report}
                                        onOpen={() => goToStep("faktor-risiko")} />
                          <FactorList categories={report.categories}
                                      onSelect={(c) => { setActiveCategory(c); goToStep("faktor-risiko"); }} />
                        </div>
                      ), 112);
                    case "faktor-risiko":
                      return stage(s.id, <Tahap02Evidence report={report} active={activeCategory}
                                                          onSelectCategory={setActiveCategory} onAsk={askAi} />, 112);
                    case "perjalanan":
                      return stage(s.id, <Tahap03Perjalanan intakeId={intakeId ?? undefined} map={mapData} onAsk={askAi} />, 112);
                    case "checklist":
                      return stage(s.id, <Tahap04Checklist report={report} onAsk={askAi} />, 112);
                    case "fasilitas":
                      return stage(s.id, <Tahap05Fasilitas map={mapData} openGroup={openGroup} visibleGroups={visibleGroups}
                                                        onOpenGroup={openFacilityGroup} onToggleGroup={toggleGroup}
                                                        onAsk={askAi} />, 112);
                  }
                });
              })()}
            </div>
          </div>

          {/* desktop: 50/50, analysis left, map sticky right */}
          <div className="hidden items-start gap-5 px-5 py-5 lg:flex">
            <div className="flex flex-col" style={{ width: "50%", minWidth: 0 }}>
              <div className="sticky top-[52px] z-40 mb-2 min-w-0 bg-[#F4F7F8] pb-2 pt-3 pr-3 xl:pr-5">
                <div className="flex min-w-0 items-center justify-between gap-1.5">
                  <StepTabs active={step} unlocked={unlocked} onSelect={goToStep} onLocked={() => openUpgrade()} />
                  <button type="button" onClick={() => setAssistantOpen(true)}
                          className="inline-flex min-h-[36px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#3B66FF] bg-white px-3.5 py-1.5 text-xs font-bold text-[#3B66FF] shadow-2xs transition-all hover:bg-blue-50/80 active:scale-[0.96] cursor-pointer">
                    <MessageSquare size={14} />Tanya Asisten
                  </button>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                {(() => {
                const ref = (id: StepId) => (el: HTMLDivElement | null) => { sections.current[id] = el; };
                const stage = (id: StepId, node: React.ReactNode, offset: number) => (
                  <div key={id} data-section={id} ref={ref(id)} style={{ scrollMarginTop: offset }}
                       /* The map reframes per stage, so which stage is "current" must be
                          readable at a glance rather than inferred from scroll position. */
                       className={`rounded-2xl transition-all duration-300 sm:rounded-[26px] ${
                         step === id
                           ? "ring-2 ring-[#0F2B38]/25 ring-offset-2 ring-offset-[#F4F7F8]"
                           : "ring-0"
                       }`}>
                    {node}
                  </div>
                );
                return STEPS.map((s) => {
                  const locked = !unlocked && s.id !== "ringkasan";
                  if (locked) return stage(s.id, <LockedStage step={s.id} onUpgrade={() => openUpgrade()} />, 184);
                  switch (s.id) {
                    case "ringkasan":
                      return stage(s.id, (
                        <div className="flex flex-col gap-4">
                          <RingkasanCard report={report} onAsk={askAi} />
                          <RedFlagStrip report={report}
                                        onOpen={() => goToStep("faktor-risiko")} />
                          <FactorList categories={report.categories}
                                      onSelect={(c) => { setActiveCategory(c); goToStep("faktor-risiko"); }} />
                        </div>
                      ), 184);
                    case "faktor-risiko":
                      return stage(s.id, <Tahap02Evidence report={report} active={activeCategory}
                                                          onSelectCategory={setActiveCategory} onAsk={askAi} />, 184);
                    case "perjalanan":
                      return stage(s.id, <Tahap03Perjalanan intakeId={intakeId ?? undefined} map={mapData} onAsk={askAi} />, 184);
                    case "checklist":
                      return stage(s.id, <Tahap04Checklist report={report} onAsk={askAi} />, 184);
                    case "fasilitas":
                      return stage(s.id, <Tahap05Fasilitas map={mapData} openGroup={openGroup} visibleGroups={visibleGroups}
                                                        onOpenGroup={openFacilityGroup} onToggleGroup={toggleGroup}
                                                        onAsk={askAi} />, 184);
                  }
                });
              })()}
              </div>
            </div>

            <div className="sticky top-[72px] self-start" style={{ width: "50%", minWidth: 0 }}>
                {mapData ? (
                  <ReportMap data={mapData} intakeId={intakeId ?? undefined} floodArea={floodArea}
                             focus={step} focusGroup={step === "fasilitas" ? openGroup : null}
                             visibleGroups={visibleGroups} fullscreen={mapFull}
                             onToggleFullscreen={() => setMapFull((f) => !f)} />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs font-medium text-slate-500">
                    Peta belum tersedia untuk lokasi ini.
                  </div>
                )}
            </div>
          </div>

          <nav className="fixed inset-x-0 bottom-0 z-[60] flex h-[60px] items-center justify-around border-t border-[#E2E8F0] bg-white px-2 lg:hidden"
               style={{ boxShadow: "0 -4px 16px rgba(0,30,43,0.08)" }}>
            {([[LayoutGrid, "Workspace", true, () => goToStep("ringkasan")],
              [MapIcon, "Peta", false, () => setMapFull(true)],
              [MessageSquare, "Advisor", false, () => setAssistantOpen(true)],
              [UserIcon, "Profil", false, () => navigate("/app/account")]] as const).map(
              ([Icon, label, on, onTap]) => {
                const I = Icon as typeof LayoutGrid;
                return (
                  <button key={String(label)} type="button" aria-label={String(label)}
                          onClick={onTap as (() => void) | undefined}
                          className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl py-1 transition-all hover:bg-slate-50 active:scale-95">
                    <I size={20} stroke={on ? "#0F2B38" : "#64748B"} strokeWidth={on ? 2.2 : 1.8} />
                    <span className="text-[11px] leading-none"
                          style={{ color: on ? "#0F2B38" : "#64748B", fontWeight: on ? 700 : 500 }}>
                      {String(label)}
                    </span>
                  </button>
                );
              })}
          </nav>
        </>
      )}

      {commerce.modals}
      {threadId && (
        <AdvisorDrawer
          conversationId={threadId}
          open={assistantOpen}
          report={report}
          seed={assistantSeed}
          initialTopic={assistantTopic}
          onClose={() => { setAssistantOpen(false); setAssistantSeed(null); }}
          // A cited category is only useful if tapping it goes somewhere: close the
          // advisor and land on the risk-factor step of the report.
          onOpenCategory={(c) => { setAssistantOpen(false); setActiveCategory(c); goToStep("faktor-risiko"); }}
        />
      )}
    </div>
    </ReportMapProvider>
  );
}
