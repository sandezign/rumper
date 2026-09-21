import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import AuthPage from "./components/AuthPage";
import Landing from "./components/Landing";
import LocationHome from "./components/LocationHome";
import Onboarding from "./components/Onboarding";
import OnboardingWizard from "./pages/OnboardingWizard";
import AppEntry from "./pages/AppEntry";
import AreasHub from "./pages/AreasHub";
import Account from "./components/Account";
import LocationWorkspace from "./pages/LocationWorkspace";
import RequireAuth, { GuestOnly } from "./components/RequireAuth";
import Check from "./pages/Check";
import Intake from "./pages/Intake";
import DevResearchLoading from "./pages/DevResearchLoading";
import NotFound from "./pages/NotFound";
import DevMapPlayground from "./pages/DevMapPlayground";
import DevMapPlaygroundV2 from "./pages/DevMapPlaygroundV2";
import OnboardingWizardV2 from "./pages/v2/OnboardingWizardV2";
import AreasHubV2 from "./pages/v2/AreasHubV2";
import LocationWorkspaceV2 from "./pages/v2/LocationWorkspaceV2";
import LandingV2 from "./pages/v2/LandingV2";

/** `/cek/:id` -> `/check/:id`, preserving the id (docs/09 §Route convention). */
function LegacyCheckRedirect() {
  const { id } = useParams();
  return <Navigate to={`/check/${id}`} replace />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="rumper-theme">
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* URLs are English (docs/09 §Route convention); on-screen copy stays id-ID. */}
            <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><AuthPage mode="register" /></GuestOnly>} />
            {/* revamped journey (docs/18 Wave 1): wizard -> location -> intake -> workspace */}
            <Route path="/app" element={<RequireAuth><AppEntry /></RequireAuth>} />
            <Route path="/app/start" element={<OnboardingWizard />} />
            <Route path="/start" element={<OnboardingWizard />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/app/areas" element={<RequireAuth><AreasHub /></RequireAuth>} />
            <Route path="/app/location" element={<RequireAuth><LocationHome /></RequireAuth>} />
            <Route path="/app/intake" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/app/account" element={<RequireAuth><Account /></RequireAuth>} />
            <Route path="/app/c/:threadId" element={<RequireAuth><LocationWorkspace /></RequireAuth>} />
            {/* V2 isolated end-to-end journey */}
            <Route path="/v2" element={<LandingV2 />} />
            <Route path="/v2/start" element={<OnboardingWizardV2 />} />
            <Route path="/v2/onboarding" element={<OnboardingWizardV2 />} />
            <Route path="/v2/areas" element={<AreasHubV2 />} />
            <Route path="/v2/workspace" element={<LocationWorkspaceV2 />} />
            <Route path="/v2/workspace/:threadId" element={<LocationWorkspaceV2 />} />
            <Route path="/v2/c/:threadId" element={<LocationWorkspaceV2 />} />

            {/* operations fallback: classic form + report view */}
            <Route path="/form" element={<Intake />} />
            <Route path="/check/:id" element={<Check />} />
            {/* legacy id-ID URLs — permanent redirects so shared links keep working */}
            <Route path="/masuk" element={<Navigate to="/login" replace />} />
            <Route path="/daftar" element={<Navigate to="/register" replace />} />
            <Route path="/app/mulai" element={<Navigate to="/app/start" replace />} />
            <Route path="/app/akun" element={<Navigate to="/app/account" replace />} />
            <Route path="/cek/:id" element={<LegacyCheckRedirect />} />
            {/* dev-only: design the first-run loader without triggering research */}
            {import.meta.env.DEV && (
              <>
                <Route path="/dev/research-loading" element={<DevResearchLoading />} />
                <Route path="/dev/map-platform" element={<DevMapPlayground />} />
                <Route path="/dev/map-platform-v2" element={<DevMapPlaygroundV2 />} />
              </>
            )}
            {/* catch-all: unknown URLs (incl. /dev/* in prod, typos) → 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
