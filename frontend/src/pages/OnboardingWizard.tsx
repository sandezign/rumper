import { useNavigate } from "react-router-dom";
import ResponsiveWizardShell from "@/features/onboarding/wizard/ResponsiveWizardShell";

/** `/app/start` — the revamped 9-screen priority wizard (docs/18 Wave 1, PRD-11).
 *
 *  Replaces the previous 7-step chat-style onboarding as the *entry* of the journey. It
 *  produces the durable Buyer Priority Profile; the property address and the remaining
 *  intake fields are collected in the next steps, which still drive the existing
 *  research pipeline. */
export default function OnboardingWizard() {
  const navigate = useNavigate();
  return (
    <ResponsiveWizardShell
      onComplete={() => navigate("/app/areas")}
      onCancel={() => navigate("/")}
    />
  );
}
