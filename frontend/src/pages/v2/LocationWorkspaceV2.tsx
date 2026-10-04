import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageSquare, LayoutGrid, Map as MapIcon, User as UserIcon, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import JourneyHeaderV2 from "@/features/areas/components/JourneyHeaderV2";
import { useCommerce } from "@/features/commerce/useCommerce";
import AdvisorDrawer from "@/features/workspace/AdvisorDrawer";
import ReportMap, { ReportMapProvider } from "@/features/workspace/ReportMap";
import { FactorList, RingkasanCard, STEPS, StepTabs, type StepId } from "@/features/workspace/parts";
import {
  LockedStage, RedFlagStrip, Tahap02Evidence, Tahap03Perjalanan, Tahap04Checklist,
  Tahap05Fasilitas,
} from "@/features/workspace/stages";
import {
  getCheck, getConversation, getFloodAreas, getMap,
  type FloodArea, type MapData, type Report,
} from "@/lib/api";
import { ALL_GROUP_IDS } from "@/features/workspace/facilityGroups";
import { mockReport, mockMapData, mockFloodArea } from "@/features/workspace/data/mockReport";

/** `/v2/workspace` & `/v2/workspace/:threadId` — V2 Unified Core Analysis Workspace */
export default function LocationWorkspaceV2() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const areaParam = searchParams.get("area");
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [floodArea, setFloodArea] = useState<FloodArea | null>(null);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [step, setStep] = useState<StepId>("ringkasan");
  const unlocked = true; // Always unlocked in V2 dev/preview mode

  const [mapFull, setMapFull] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("banjir");
  const [assistantSeed, setAssistantSeed] = useState<string | null>(null);
  const [assistantTopic, setAssistantTopic] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [visibleGroups, setVisibleGroups] = useState<Set<string>>(() => new Set(ALL_GROUP_IDS));
  const sections = useRef<Partial<Record<StepId, HTMLDivElement | null>>>({});
  const scrolling = useRef(false);

  // Initialize report with customized mock or fetch live if threadId is valid
  useEffect(() => {
    let cancelled = false;
    if (threadId) {
      (async () => {
        try {
          const convo = await getConversation(threadId);
          if (convo.intake_id) {
            setIntakeId(convo.intake_id);
            const [chk, mp, fld] = await Promise.all([
              getCheck(convo.intake_id).catch(() => null),
              getMap(convo.intake_id).catch(() => null),
              getFloodAreas(convo.intake_id).then((r) => r.areas[0] ?? null).catch(() => null),
            ]);
            if (!cancelled && chk && chk.status === "done") {
              setReport(chk.report);
              setMapData(mp);
              setFloodArea(fld);
              return;
            }
          }
        } catch {
          // Fallback to sample report
        }
      })();
    }

    // Default or fallback to rich mock data
    const customReport: Report = {
      ...mockReport,
      property: {
        ...mockReport.property,
        name: areaParam ? `Area ${areaParam}` : mockReport.property.name,
        formatted_address: areaParam ? `${areaParam}, Jabodetabek` : mockReport.property.formatted_address,
      },
    };
    setReport(customReport);
    setMapData(mockMapData);
    setFloodArea(mockFloodArea);

    return () => { cancelled = true; };
  }, [threadId, areaParam]);

  const commerce = useCommerce({
    propertyName: report?.property.name ?? report?.property.formatted_address ?? undefined,
    onUnlocked: () => setStep("faktor-risiko"),
  });
  const openUpgrade = commerce.openUpgrade;

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

  const openFacilityGroup = useCallback((id: string | null) => {
    setOpenGroup(id);
    if (id) setVisibleGroups((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const goToStep = useCallback((id: StepId) => {
    setStep(id);
    const el = sections.current[id];
    if (!el) return;
    scrolling.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { scrolling.current = false; }, 600);
  }, []);

  useEffect(() => {
    if (!report) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrolling.current) return;
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

    const onScroll = () => {
      if (scrolling.current) return;
      const atEnd = window.innerHeight + window.scrollY >= document.body.offsetHeight - 24;
      if (atEnd) setStep(STEPS[STEPS.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [report, unlocked]);

  const activeReport = useMemo(() => report ?? mockReport, [report]);

  return (
    <ReportMapProvider>
      <div className="min-h-screen antialiased flex flex-col" style={{ backgroundColor: "#F4F7F8" }}>
        <div className="sticky top-0 z-50 flex w-full flex-col">
          <JourneyHeaderV2 onUpgrade={() => openUpgrade()} />
        </div>

        {/* Workspace Quick Context Bar */}
        <div className="bg-white border-b border-[#E1E5E8] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#E9F5EF] text-[#00684A] shrink-0">
              <ShieldCheck size={16} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#001E2B] truncate">
                {activeReport.property.name || activeReport.property.formatted_address}
              </h2>
              <p className="text-[11px] text-[#5C6C7A] truncate">
                {activeReport.property.formatted_address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9F5EF] text-[#004F38] text-xs font-bold border border-[#318266]/20">
              <CheckCircle2 size={13} className="text-[#00B545]" />
              {activeReport.recommendation_label}
            </span>
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#001E2B] text-white text-xs font-bold hover:bg-[#0F2B38] transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles size={13} className="text-[#00ED64]" />
              <span>Tanya Advisor AI</span>
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex flex-col pb-20 lg:hidden">
          <div className="sticky top-[52px] z-30 border-b border-slate-200/80 bg-[#F4F7F8]/95 px-4 py-2 shadow-xs backdrop-blur-md">
            <StepTabs active={step} unlocked={unlocked} onSelect={goToStep} onLocked={() => openUpgrade()} />
          </div>

          {mapData && (
            <div className="px-4 pt-4">
              <div className="h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <ReportMap
                  data={mapData}
                  intakeId={intakeId ?? undefined}
                  floodArea={floodArea}
                  focus={step}
                  focusGroup={step === "fasilitas" ? openGroup : null}
                  visibleGroups={visibleGroups}
                  fullscreen={mapFull}
                  onToggleFullscreen={() => setMapFull((f) => !f)}
                  embedded
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 p-4">
            {(() => {
              const ref = (id: StepId) => (el: HTMLDivElement | null) => { sections.current[id] = el; };
              const stage = (id: StepId, node: React.ReactNode, offset: number) => (
                <div
                  key={id}
                  data-section={id}
                  ref={ref(id)}
                  style={{ scrollMarginTop: offset }}
                  className={`rounded-2xl transition-all duration-300 sm:rounded-[26px] ${
                    step === id ? "ring-2 ring-[#0F2B38]/25 ring-offset-2 ring-offset-[#F4F7F8]" : "ring-0"
                  }`}
                >
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
                        <RingkasanCard report={activeReport} onAsk={askAi} />
                        <RedFlagStrip report={activeReport} onOpen={() => goToStep("faktor-risiko")} />
                        <FactorList categories={activeReport.categories} onSelect={(c) => { setActiveCategory(c); goToStep("faktor-risiko"); }} />
                      </div>
                    ), 112);
                  case "faktor-risiko":
                    return stage(s.id, <Tahap02Evidence report={activeReport} active={activeCategory} onSelectCategory={setActiveCategory} onAsk={askAi} />, 112);
                  case "perjalanan":
                    return stage(s.id, <Tahap03Perjalanan intakeId={intakeId ?? undefined} map={mapData} onAsk={askAi} />, 112);
                  case "checklist":
                    return stage(s.id, <Tahap04Checklist report={activeReport} onAsk={askAi} />, 112);
                  case "fasilitas":
                    return stage(s.id, <Tahap05Fasilitas map={mapData} openGroup={openGroup} visibleGroups={visibleGroups} onOpenGroup={openFacilityGroup} onToggleGroup={toggleGroup} onAsk={askAi} />, 112);
                }
              });
            })()}
          </div>
        </div>

        {/* Desktop View: 50/50 Split */}
        <div className="hidden items-start gap-5 px-5 py-4 lg:flex flex-1">
          <div className="flex flex-col" style={{ width: "50%", minWidth: 0 }}>
            <div className="sticky top-[106px] z-40 mb-3 min-w-0 bg-[#F4F7F8] pb-2 pt-1 pr-3 xl:pr-5">
              <div className="flex min-w-0 items-center justify-between gap-1.5">
                <StepTabs active={step} unlocked={unlocked} onSelect={goToStep} onLocked={() => openUpgrade()} />
                <button
                  type="button"
                  onClick={() => setAssistantOpen(true)}
                  className="inline-flex min-h-[36px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#3B66FF] bg-white px-3.5 py-1.5 text-xs font-bold text-[#3B66FF] shadow-2xs transition-all hover:bg-blue-50/80 active:scale-[0.96] cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>Tanya Asisten</span>
                </button>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4 pb-12">
              {(() => {
                const ref = (id: StepId) => (el: HTMLDivElement | null) => { sections.current[id] = el; };
                const stage = (id: StepId, node: React.ReactNode, offset: number) => (
                  <div
                    key={id}
                    data-section={id}
                    ref={ref(id)}
                    style={{ scrollMarginTop: offset }}
                    className={`rounded-2xl transition-all duration-300 sm:rounded-[26px] ${
                      step === id ? "ring-2 ring-[#0F2B38]/25 ring-offset-2 ring-offset-[#F4F7F8]" : "ring-0"
                    }`}
                  >
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
                          <RingkasanCard report={activeReport} onAsk={askAi} />
                          <RedFlagStrip report={activeReport} onOpen={() => goToStep("faktor-risiko")} />
                          <FactorList categories={activeReport.categories} onSelect={(c) => { setActiveCategory(c); goToStep("faktor-risiko"); }} />
                        </div>
                      ), 184);
                    case "faktor-risiko":
                      return stage(s.id, <Tahap02Evidence report={activeReport} active={activeCategory} onSelectCategory={setActiveCategory} onAsk={askAi} />, 184);
                    case "perjalanan":
                      return stage(s.id, <Tahap03Perjalanan intakeId={intakeId ?? undefined} map={mapData} onAsk={askAi} />, 184);
                    case "checklist":
                      return stage(s.id, <Tahap04Checklist report={activeReport} onAsk={askAi} />, 184);
                    case "fasilitas":
                      return stage(s.id, <Tahap05Fasilitas map={mapData} openGroup={openGroup} visibleGroups={visibleGroups} onOpenGroup={openFacilityGroup} onToggleGroup={toggleGroup} onAsk={askAi} />, 184);
                  }
                });
              })()}
            </div>
          </div>

          {/* Sticky Map Column */}
          <div className="sticky top-[106px] self-start" style={{ width: "50%", minWidth: 0, height: "calc(100vh - 120px)" }}>
            {mapData ? (
              <ReportMap
                data={mapData}
                intakeId={intakeId ?? undefined}
                floodArea={floodArea}
                focus={step}
                focusGroup={step === "fasilitas" ? openGroup : null}
                visibleGroups={visibleGroups}
                fullscreen={mapFull}
                onToggleFullscreen={() => setMapFull((f) => !f)}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs font-medium text-slate-500 rounded-3xl bg-white border border-slate-200">
                Peta sedang dipersiapkan...
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav
          className="fixed inset-x-0 bottom-0 z-[60] flex h-[60px] items-center justify-around border-t border-[#E2E8F0] bg-white px-2 lg:hidden"
          style={{ boxShadow: "0 -4px 16px rgba(0,30,43,0.08)" }}
        >
          {([[LayoutGrid, "Workspace", true, () => goToStep("ringkasan")],
            [MapIcon, "Peta", false, () => setMapFull(true)],
            [MessageSquare, "Advisor", false, () => setAssistantOpen(true)],
            [UserIcon, "Prioritas", false, () => navigate("/v2/onboarding")]] as const).map(
            ([Icon, label, on, onTap]) => {
              const I = Icon as typeof LayoutGrid;
              return (
                <button
                  key={String(label)}
                  type="button"
                  aria-label={String(label)}
                  onClick={onTap as (() => void) | undefined}
                  className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl py-1 transition-all hover:bg-slate-50 active:scale-95"
                >
                  <I size={20} stroke={on ? "#0F2B38" : "#64748B"} strokeWidth={on ? 2.2 : 1.8} />
                  <span
                    className="text-[11px] leading-none"
                    style={{ color: on ? "#0F2B38" : "#64748B", fontWeight: on ? 700 : 500 }}
                  >
                    {String(label)}
                  </span>
                </button>
              );
            }
          )}
        </nav>

        {commerce.modals}
        <AdvisorDrawer
          conversationId={threadId || "v2-preview-demo"}
          open={assistantOpen}
          report={activeReport}
          seed={assistantSeed}
          initialTopic={assistantTopic}
          onClose={() => { setAssistantOpen(false); setAssistantSeed(null); }}
          onOpenCategory={(c) => { setAssistantOpen(false); setActiveCategory(c); goToStep("faktor-risiko"); }}
        />
      </div>
    </ReportMapProvider>
  );
}
