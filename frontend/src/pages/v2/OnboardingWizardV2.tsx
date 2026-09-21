import { useNavigate } from "react-router-dom";
import VisualOnboardingShell from "@/features/onboarding/visual/VisualOnboardingShell";

/** `/v2/onboarding` & `/v2/start` — V2 Visual-First Onboarding flow.
 *  Low-text, high-visual tactile intake flow with radial arc slider,
 *  3D emotion cards, and desktop live radar preview. */
export default function OnboardingWizardV2() {
  const navigate = useNavigate();

  return (
    <VisualOnboardingShell
      onComplete={() => navigate("/v2/areas")}
      onCancel={() => navigate("/")}
    />
  );
}
