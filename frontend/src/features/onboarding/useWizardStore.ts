import { useCallback, useEffect, useState } from "react";
import {
  type BuyerPriorityProfile,
  type HouseholdType,
  type ScenarioChoice,
  type WorkPattern,
  loadProfile,
  newProfileId,
  saveProfile,
} from "@/lib/profile";

export type { HouseholdType, ScenarioChoice, WorkPattern };

export interface WizardFormData {
  householdType: HouseholdType;
  workPattern: WorkPattern;
  mainAnchor: string;
  secondAnchor: string;
  /** Google `place_id` for each anchor — the stable identifier, storable indefinitely
   *  under the Maps terms (docs/10 §5.3), so commute origins resolve without re-geocoding. */
  mainAnchorPlaceId?: string;
  secondAnchorPlaceId?: string;
  budgetPreset: string;
  budgetMin: number; // millions, e.g. 600
  budgetMax: number; // millions, e.g. 1800
  selectedCorridors: string[];
  /** Stable option id (mapping key). */
  selectedFriction?: string;
  /** Display copy at the time of choosing — for showing back, never for mapping. */
  selectedFrictionLabel?: string;
  relatesToEmpathy?: boolean;
  scenarioResponses: Record<string, ScenarioChoice>;
}

/** Neutral starting positions for form controls only.
 *
 *  The Figma prototype also pre-filled `selectedFriction` and `selectedCorridors` so the
 *  demo looked complete. We deliberately don't: showing a choice the buyer never made
 *  breaks PRD-11 principle 1 ("confirmed, not assumed") and would seed the profile with
 *  answers we then explain back to them as their own priorities. */
export const initialWizardData: WizardFormData = {
  householdType: "pasangan",
  workPattern: "hybrid",
  mainAnchor: "",
  secondAnchor: "",
  budgetPreset: "800-1200",
  budgetMin: 600,
  budgetMax: 1800,
  selectedCorridors: [],
  selectedFriction: undefined,
  selectedFrictionLabel: undefined,
  scenarioResponses: {},
};

const FIRST_PARAM_STAGE = 6; // stages 1..5 are narrative; 6 hosts parameter steps 1..4
const LAST_PARAM_STEP = 4;

function formDataFromProfile(p: BuyerPriorityProfile | null): WizardFormData {
  let searchCorridor = "";
  try {
    searchCorridor = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
  } catch {}
  if (!p) {
    return {
      ...initialWizardData,
      selectedCorridors: searchCorridor ? [searchCorridor] : [],
    };
  }
  const primary = p.anchors.find((a) => a.type === "primary");
  const secondary = p.anchors.find((a) => a.type === "secondary");
  const corridors = [...p.preferredCorridors];
  if (searchCorridor && !corridors.includes(searchCorridor)) {
    corridors.unshift(searchCorridor);
  }
  return {
    ...initialWizardData,
    householdType: p.householdType,
    workPattern: p.workPattern,
    mainAnchor: primary?.label ?? "",
    secondAnchor: secondary?.label ?? "",
    mainAnchorPlaceId: primary?.placeId,
    secondAnchorPlaceId: secondary?.placeId,
    budgetMin: p.budget.minMillions,
    budgetMax: p.budget.maxMillions,
    selectedCorridors: corridors,
    selectedFriction: p.signals?.selectedFriction,
    selectedFrictionLabel: p.signals?.selectedFrictionLabel,
    scenarioResponses: p.signals?.scenarioResponses ?? {},
  };
}

export function useWizardState() {
  const [flowStage, setFlowStage] = useState(1); // 1..6
  const [parameterStep, setParameterStep] = useState(1); // 1..4, used when flowStage === 6
  const [formData, setFormData] = useState<WizardFormData>(() =>
    formDataFromProfile(loadProfile()),
  );
  const [isCompleted, setIsCompleted] = useState(false);

  // Persist the draft as the buyer moves, so a reload or an accidental close mid-wizard
  // doesn't discard their answers (PRD-11 FR-1107).
  useEffect(() => {
    const existing = loadProfile();
    if (existing?.status === "confirmed") return; // never downgrade a confirmed profile
    saveProfile(toProfile(formData, existing?.id, "draft"));
  }, [formData]);

  const updateFormData = useCallback((fields: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  const setScenarioResponse = useCallback((scenarioId: string, choice: ScenarioChoice) => {
    setFormData((prev) => ({
      ...prev,
      scenarioResponses: { ...prev.scenarioResponses, [scenarioId]: choice },
    }));
  }, []);

  const clearScenarioResponse = useCallback((scenarioId: string) => {
    setFormData((prev) => {
      const nextResponses = { ...prev.scenarioResponses };
      delete nextResponses[scenarioId];
      return { ...prev, scenarioResponses: nextResponses };
    });
  }, []);

  const toggleCorridor = useCallback((corridor: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCorridors: prev.selectedCorridors.includes(corridor)
        ? prev.selectedCorridors.filter((c) => c !== corridor)
        : [...prev.selectedCorridors, corridor],
    }));
  }, []);

  // The prototype called setParameterStep from inside the setFlowStage updater. An impure
  // updater double-fires under React StrictMode (which this app enables in main.tsx), so
  // the wizard could skip a step. Branch on current state instead.
  const nextStage = useCallback(() => {
    if (flowStage < FIRST_PARAM_STAGE) {
      setFlowStage(flowStage + 1);
      return;
    }
    if (parameterStep < LAST_PARAM_STEP) setParameterStep(parameterStep + 1);
    else setIsCompleted(true);
  }, [flowStage, parameterStep]);

  const prevStage = useCallback(() => {
    if (flowStage === FIRST_PARAM_STAGE && parameterStep > 1) setParameterStep(parameterStep - 1);
    else setFlowStage((s) => Math.max(1, s - 1));
  }, [flowStage, parameterStep]);

  const skipToParameterSetup = useCallback(() => {
    setFlowStage(FIRST_PARAM_STAGE);
    setParameterStep(1);
  }, []);

  const goToFlowStage = useCallback((stage: number) => {
    if (stage < 1 || stage > FIRST_PARAM_STAGE) return;
    setFlowStage(stage);
    if (stage < FIRST_PARAM_STAGE) setParameterStep(1);
  }, []);

  const goToParameterStep = useCallback((step: number) => {
    if (step < 1 || step > LAST_PARAM_STEP) return;
    setFlowStage(FIRST_PARAM_STAGE);
    setParameterStep(step);
  }, []);

  /** Mark the profile confirmed — the buyer finished the wizard. */
  const confirmProfile = useCallback((): BuyerPriorityProfile => {
    const p = toProfile(formData, loadProfile()?.id, "confirmed");
    saveProfile(p);
    return p;
  }, [formData]);

  return {
    flowStage,
    parameterStep,
    formData,
    isCompleted,
    updateFormData,
    setScenarioResponse,
    clearScenarioResponse,
    toggleCorridor,
    nextStage,
    prevStage,
    skipToParameterSetup,
    goToFlowStage,
    goToParameterStep,
    confirmProfile,
  };
}

function toProfile(
  d: WizardFormData,
  id: string | undefined,
  status: "draft" | "confirmed",
): BuyerPriorityProfile {
  return {
    id: id ?? newProfileId(),
    schemaVersion: 1,
    status,
    householdType: d.householdType,
    workPattern: d.workPattern,
    anchors: [
      ...(d.mainAnchor
        ? [{ label: d.mainAnchor, type: "primary" as const, placeId: d.mainAnchorPlaceId }]
        : []),
      ...(d.secondAnchor
        ? [{ label: d.secondAnchor, type: "secondary" as const, placeId: d.secondAnchorPlaceId }]
        : []),
    ],
    budget: { minMillions: d.budgetMin, maxMillions: d.budgetMax },
    preferredCorridors: d.selectedCorridors,
    signals: {
      selectedFriction: d.selectedFriction,
      selectedFrictionLabel: d.selectedFrictionLabel,
      scenarioResponses: d.scenarioResponses,
    },
    // Weighted priorities stay empty until the PRD-11 §10 scenario→priority mapping is
    // approved (docs/18 GAP-02). We keep the raw signals above instead of inventing weights.
    priorities: [],
    updatedAt: new Date().toISOString(),
  };
}
