import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  inflateReport,
  ApiError,
  createConversation,
  getCheck,
  getConversation,
  getMap,
  getRoutes,
  listConversations,
  me,
  sendMessageSSE,
  watchResearch,
} from "@/lib/api";
import type { ChatMessage, Convo, MapData, MapRoutes, LegacyReport, User } from "@/lib/api";
import { clearWizard } from "@/lib/wizard";
import { buildEvidenceIndex, type MapTab } from "@/features/analysis/evidence";
import AppShellV3 from "./AppShellV3";
import type { ResearchProgress } from "./AssistantRail";
import { AnalysisWorkspaceV3, type AnalysisTab } from "@/features/analysis/components/AnalysisWorkspaceV3";
import { AssistantColumnV3 } from "@/features/analysis/components/AssistantColumnV3";
import { AssistantPillV3 } from "@/components/v3/AssistantPanelV3";
import LoginModal from "./LoginModal";
import QuotaModal from "./QuotaModal";
import MapPanelV3 from "./MapPanelV3";
import ResearchLoading from "./ResearchLoading";

const WA_REVIEW = `https://wa.me/?text=${encodeURIComponent(
  "Halo Rumper, saya ingin lanjut tinjauan analis untuk Mini Check lokasi saya.",
)}`;

function AnalysisPending({ research }: { research: ResearchProgress | null }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-sm px-xl text-center">
      <Loader2 className="size-6 animate-spin text-brand-green-dark" aria-hidden />
      <p className="text-heading-5 text-foreground">Menyusun analisis lokasi…</p>
      <p className="max-w-[24rem] text-body-sm text-text-secondary">
        {research?.label || "Membaca data spasial, banjir, commute, akses, dan red flags."} Biasanya 2–4 menit.
      </p>
    </div>
  );
}

export default function Workspace() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const pendingText = useRef<string | null>(null);

  const [convos, setConvos] = useState<Convo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchProgress | null>(null);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [report, setReport] = useState<LegacyReport | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [routes, setRoutes] = useState<MapRoutes | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [quotaModal, setQuotaModal] = useState<{ open: boolean; resetsAt: string | null }>({
    open: false,
    resetsAt: null,
  });
  const [expectsAddress, setExpectsAddress] = useState(false);
  const stopWatch = useRef<(() => void) | null>(null);

  // ── V3 cross-panel state (analysis ↔ map ↔ assistant) ────────────────────────
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>("overview");
  const [activeMapTab, setActiveMapTab] = useState<MapTab>("overview");
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<string[]>([]);
  const [activeFacilityCategory, setActiveFacilityCategory] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(true);

  // Evidence index — the one derivation the analysis panels and the map both read.
  const index = useMemo(() => buildEvidenceIndex(report, mapData), [report, mapData]);

  useEffect(() => {
    me()
      .then(async (u) => {
        // Load convos BEFORE user so the openConvo effect (gated on `user`) sees the
        // conversation's state — lets it show the full-screen loader immediately when
        // reloading a still-"researching" audit, with no 3-column flash.
        const cs = await listConversations().catch(() => []);
        setConvos(cs);
        setUser(u);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && threadId && threadId !== activeId) {
      // Onboarding/intake submit navigates here with { research: true } so we open the
      // full-screen loader immediately instead of flashing the 3-column workspace.
      const hint = (location.state as { research?: boolean } | null)?.research === true;
      void openConvo(threadId, false, hint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, threadId]);

  // The assistant owns the screen while there is no report to read; once the Mini Check
  // lands it collapses to the pill so the analysis and map get the full width.
  useEffect(() => {
    setAssistantOpen(!report);
  }, [report]);

  const loadReportAndMap = useCallback(async (iid: string) => {
    try {
      const [check, map] = await Promise.all([getCheck(iid), getMap(iid)]);
      if (check.status === "done" && check.report) {
        setReport(inflateReport(check.report))  // legacy view (docs/05);
        setMapData(map);
      }
    } catch {
      /* map optional */
    }
    // Street routes are a separate, billable call — never block the report on them.
    getRoutes(iid)
      .then(setRoutes)
      .catch(() => setRoutes(null));
  }, []);

  const startWatching = useCallback(
    (iid: string) => {
      stopWatch.current?.();
      setResearch({ active: true, step: 1, total: 5, pct: 2, label: "" });
      stopWatch.current = watchResearch(
        iid,
        (p) =>
          setResearch({ active: true, step: Math.max(1, p.step), total: p.total, pct: p.pct, label: p.label }),
        async (status) => {
          if (status === "done") {
            // Load the report BEFORE clearing the loader so the full-screen loader hands
            // straight off to the workspace — no intermediate "pending" flash.
            await loadReportAndMap(iid);
            setResearch(null);
            setConvos((cs) => cs.map((c) => (c.intake_id === iid ? { ...c, state: "report_qa" } : c)));
          } else {
            setResearch(null);
            setMessages((ms) => [
              ...ms,
              { role: "assistant", content: "Riset gagal diproses. Coba kirim ulang alamat dengan pin Google Maps." },
            ]);
          }
        },
      );
    },
    [loadReportAndMap],
  );

  function resetWorkspaceView() {
    setActiveAnalysisTab("overview");
    setActiveMapTab("overview");
    setSelectedEvidence(null);
    setVisibleLayers([]);
    setActiveFacilityCategory(null);
  }

  async function openConvo(id: string, pushUrl = true, researchHint = false) {
    if (pushUrl) navigate(`/app/c/${id}`);
    stopWatch.current?.();
    setActiveId(id);
    setMessages([]);
    setReport(null);
    setMapData(null);
    setRoutes(null);
    setIntakeId(null);
    resetWorkspaceView();
    // Optimistically show the full-screen loader (not the workspace) while we load a
    // conversation we expect to be researching — kills the pre-loader flash.
    const known = convos.find((c) => c.id === id);
    const expectResearch = researchHint || known?.state === "researching";
    setResearch(expectResearch ? { active: true, step: 1, total: 5, pct: 2, label: "" } : null);
    const c = await getConversation(id);
    setMessages(c.messages);
    setIntakeId(c.intake_id);
    setExpectsAddress(c.expects === "address");
    if (c.intake_id && (c.job_status === "running" || c.job_status === "pending")) {
      startWatching(c.intake_id);
    } else {
      setResearch(null); // not (or no longer) researching — clear any optimistic loader
      if (c.intake_id && c.job_status === "done") await loadReportAndMap(c.intake_id);
    }
  }

  function newChat() {
    // "+" / new audit → start a fresh guided onboarding (location-home → wizard)
    clearWizard();
    navigate("/app");
    stopWatch.current?.();
    setActiveId(null);
    setMessages([]);
    setReport(null);
    setMapData(null);
    setRoutes(null);
    setResearch(null);
    setIntakeId(null);
    resetWorkspaceView();
  }

  async function send(text: string) {
    if (!user) {
      pendingText.current = text;
      setLoginOpen(true);
      return;
    }
    let convoId = activeId;
    try {
      if (!convoId) {
        const c = await createConversation(null);
        convoId = c.id;
        setActiveId(c.id);
        setConvos((cs) => [{ ...c, title: text.slice(0, 60) }, ...cs]);
        navigate(`/app/c/${c.id}`);
      }
      setMessages((ms) => [...ms, { role: "user", content: text }]);
      setThinking("Memahami pesan Anda…");
      const res = await sendMessageSSE(convoId, text, (label) => setThinking(label));
      setThinking(null);
      setMessages((ms) => [...ms, { role: "assistant", content: res.reply, suggestions: res.suggestions }]);
      setExpectsAddress(res.expects === "address");
      setUser((u) => (u ? { ...u, tokens_used_today: res.tokens_used_today, token_limit: res.token_limit } : u));
      setConvos((cs) => cs.map((c) => (c.id === convoId ? { ...c, state: res.state, intake_id: res.intake_id } : c)));
      if (res.research_started && res.intake_id) {
        setReport(null);
        setMapData(null);
        setRoutes(null);
        setIntakeId(res.intake_id);
        startWatching(res.intake_id);
      }
    } catch (e) {
      setThinking(null);
      if (e instanceof ApiError && e.status === 401) {
        pendingText.current = text;
        setLoginOpen(true);
        return;
      }
      const detail = e instanceof ApiError ? e.detail : null;
      if (detail && typeof detail === "object" && (detail as { code?: string }).code === "quota_exceeded") {
        const d = detail as { message: string; resets_at?: string };
        setQuotaModal({ open: true, resetsAt: d.resets_at ?? null });
        setMessages((ms) => [...ms, { role: "assistant", content: d.message }]);
        return;
      }
      const msg = typeof detail === "string" ? detail : "Terjadi kesalahan. Coba lagi.";
      setMessages((ms) => [...ms, { role: "assistant", content: msg }]);
    }
  }

  async function onLogin(u: User) {
    setUser(u);
    setLoginOpen(false);
    setConvos(await listConversations());
    const t = pendingText.current;
    pendingText.current = null;
    if (t) void send(t);
  }

  async function downloadPdf() {
    if (!intakeId || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/checks/${intakeId}/report.pdf`, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const d = body?.detail;
        alert(typeof d === "object" && d?.message ? d.message : "Gagal mengunduh laporan.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rumper-minicheck.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  // ── selection sync ───────────────────────────────────────────────────────────

  /** Selection made in the analysis column → focus the matching map layer/marker. */
  function selectEvidence(id: string | null) {
    setSelectedEvidence(id);
    if (!id) return;
    const item = index.byId.get(id);
    if (item) setActiveMapTab(item.mapTab);
  }

  /** Selection made on the map → surface the same evidence in the analysis column. */
  function handleMarkerClick(id: string | null) {
    setSelectedEvidence(id);
    if (!id) return;
    const item = index.byId.get(id);
    if (!item) return;
    setActiveMapTab(item.mapTab);
    if (!item.spatialOnly) setActiveAnalysisTab("evidence");
    else if (item.layerKey === "facilities") setActiveAnalysisTab("facilities");
  }

  function handleMapTabChange(tab: MapTab) {
    setActiveMapTab(tab);
    setSelectedEvidence(null);
    if (tab === "facilities") setActiveAnalysisTab("facilities");
    else if (tab !== "overview") setActiveAnalysisTab("evidence");
  }

  function handleSelectFacilityCategory(category: string | null) {
    setActiveFacilityCategory(category);
    if (category) setActiveMapTab("facilities");
  }

  function handleToggleLayer(layerId: string) {
    setVisibleLayers((prev) => (prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]));
  }

  const quotaExhausted = !!user && user.tokens_used_today >= user.token_limit;
  const firstRunLoading = !!research?.active && !report;

  const assistant = (
    <AssistantColumnV3
      messages={messages}
      thinking={thinking ?? (research?.active ? research.label || "Riset lokasi sedang berjalan…" : null)}
      placeholder={expectsAddress ? "Kirim alamat lengkap atau pin Google Maps…" : "Tanyakan sesuatu…"}
      disabled={!!thinking || quotaExhausted || !!research?.active}
      onClose={() => setAssistantOpen(false)}
      onSend={(t) => void send(t)}
    />
  );

  const modals = (
    <>
      {quotaModal.open && (
        <QuotaModal resetsAt={quotaModal.resetsAt} onClose={() => setQuotaModal({ open: false, resetsAt: null })} />
      )}
      {loginOpen && !user && <LoginModal onLogin={(u) => void onLogin(u)} onClose={() => setLoginOpen(false)} />}
    </>
  );

  // First-run: full-screen research loader (research-loading.html) until the report lands.
  if (firstRunLoading) {
    return (
      <>
        <ResearchLoading research={research} />
        {modals}
      </>
    );
  }

  return (
    <>
      <AppShellV3
        meta={
          report
            ? `Analisis properti · diperbarui ${new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`
            : null
        }
        user={user}
        convos={convos}
        activeId={activeId}
        onOpenConvo={(id) => void openConvo(id)}
        onNewAudit={newChat}
        assistant={assistant}
        assistantOpen={assistantOpen}
        analysis={
          <div className="relative h-full">
            {report ? (
              <AnalysisWorkspaceV3
                report={report}
                index={index}
                activeAnalysisTab={activeAnalysisTab}
                onAnalysisTabChange={setActiveAnalysisTab}
                selectedEvidence={selectedEvidence}
                onSelectEvidence={selectEvidence}
                visibleLayers={visibleLayers}
                onToggleLayer={handleToggleLayer}
                activeFacilityCategory={activeFacilityCategory}
                onSelectFacilityCategory={handleSelectFacilityCategory}
              />
            ) : (
              <AnalysisPending research={research} />
            )}
            {/* Reopen the assistant where the map's own pill is not reachable: while the
                report is still pending, and below `lg` where the map is an overlay. */}
            {!assistantOpen && (
              <div className={`absolute bottom-5 left-4 z-20 ${mapData ? "lg:hidden" : ""}`}>
                <AssistantPillV3 onOpen={() => setAssistantOpen(true)} />
              </div>
            )}
          </div>
        }
        map={
          mapData ? (
            <MapPanelV3
              data={mapData}
              index={index}
              routes={routes}
              activeMapTab={activeMapTab}
              onMapTabChange={handleMapTabChange}
              selectedEvidence={selectedEvidence}
              onMarkerClick={handleMarkerClick}
              visibleLayers={visibleLayers}
              activeFacilityCategory={activeFacilityCategory}
              assistantOpen={assistantOpen}
              onToggleAssistant={() => setAssistantOpen((v) => !v)}
            />
          ) : undefined
        }
        onExpertReview={() => window.open(WA_REVIEW, "_blank", "noopener")}
        onShare={report && intakeId ? () => void downloadPdf() : undefined}
        shareLabel="Unduh laporan"
        sharing={downloading}
      />
      {modals}
    </>
  );
}
