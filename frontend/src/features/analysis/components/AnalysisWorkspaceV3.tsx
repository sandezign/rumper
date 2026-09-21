import type { LegacyReport } from "@/lib/api";
import type { EvidenceIndex } from "@/features/analysis/evidence";
import { OverviewPanelV3 } from "./OverviewPanelV3";
import { EvidencePanelV3 } from "./EvidencePanelV3";
import { FacilitiesPanelV3 } from "./FacilitiesPanelV3";

export type AnalysisTab = "overview" | "evidence" | "facilities";

interface AnalysisWorkspaceV3Props {
  report: LegacyReport;
  index: EvidenceIndex;
  activeAnalysisTab: AnalysisTab;
  onAnalysisTabChange: (tab: AnalysisTab) => void;
  selectedEvidence: string | null;
  onSelectEvidence: (evidenceId: string | null) => void;
  visibleLayers: string[];
  onToggleLayer: (layer: string) => void;
  activeFacilityCategory: string | null;
  onSelectFacilityCategory: (category: string | null) => void;
}

/** Count pill on the tab bar (matches the /dev/map-platform report panel). */
function CountChip({ n }: { n: number }) {
  return (
    <span className="flex size-5 items-center justify-center rounded-full border border-border/60 bg-slate-100 text-[11px] font-bold text-slate-600">
      {n}
    </span>
  );
}

export function AnalysisWorkspaceV3({
  report,
  index,
  activeAnalysisTab,
  onAnalysisTabChange,
  selectedEvidence,
  onSelectEvidence,
  visibleLayers,
  onToggleLayer,
  activeFacilityCategory,
  onSelectFacilityCategory,
}: AnalysisWorkspaceV3Props) {
  const tabs: { key: AnalysisTab; label: string; count: number | null }[] = [
    { key: "overview", label: "Overview", count: null },
    { key: "evidence", label: "Evidence Risk", count: index.evidenceCount },
    { key: "facilities", label: "Nearby Facilities", count: index.facilityCount },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Underline tab bar with count chips */}
      <div
        className="flex shrink-0 items-center gap-lg overflow-x-auto border-b border-border bg-card px-md"
        role="tablist"
      >
        {tabs.map((t) => {
          const active = activeAnalysisTab === t.key;
          return (
            <button
              key={t.key}
              id={`analysis-tab-${t.key}`}
              role="tab"
              aria-selected={active}
              aria-controls="analysis-tabpanel"
              onClick={() => onAnalysisTabChange(t.key)}
              className={`relative flex cursor-pointer items-center gap-xs whitespace-nowrap py-sm text-body-sm-medium transition-colors ${
                active ? "font-bold text-text-primary" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {t.label}
              {t.count != null && <CountChip n={t.count} />}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-text-primary" />}
            </button>
          );
        })}
      </div>

      <div
        id="analysis-tabpanel"
        role="tabpanel"
        aria-labelledby={`analysis-tab-${activeAnalysisTab}`}
        className="min-h-0 flex-1 overflow-y-auto px-xl py-lg"
      >
        {activeAnalysisTab === "overview" && (
          <OverviewPanelV3
            report={report}
            index={index}
            onCheckEvidence={() => onAnalysisTabChange("evidence")}
            onSelectFinding={(id) => {
              onAnalysisTabChange("evidence");
              onSelectEvidence(id);
            }}
          />
        )}

        {activeAnalysisTab === "evidence" && (
          <EvidencePanelV3
            index={index}
            activeLayers={visibleLayers}
            onToggleLayer={onToggleLayer}
            selectedEvidence={selectedEvidence}
            onSelectEvidence={onSelectEvidence}
          />
        )}

        {activeAnalysisTab === "facilities" && (
          <FacilitiesPanelV3
            groups={index.facilityGroups}
            activeCategory={activeFacilityCategory}
            onSelectCategory={onSelectFacilityCategory}
            selectedEvidence={selectedEvidence}
            onSelectEvidence={onSelectEvidence}
          />
        )}
      </div>
    </div>
  );
}
