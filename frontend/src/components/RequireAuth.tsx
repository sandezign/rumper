import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { me, type User } from "@/lib/api";
import AuthModal from "./AuthModal";

type Status = "loading" | "in" | "out";

function useAuthStatus(): [Status, (s: Status) => void] {
  const [status, setStatus] = useState<Status>("loading");
  useEffect(() => {
    let alive = true;
    me()
      .then(() => alive && setStatus("in"))
      .catch(() => alive && setStatus("out"));
    return () => {
      alive = false;
    };
  }, []);
  return [status, setStatus];
}

function AuthSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-brand-green-dark" aria-hidden />
    </div>
  );
}

/** Auth gate for /app* routes.
 *
 *  Signing in happens *in place* (PRD-13 §4 Module 1: verified auth before the wizard) so a
 *  deep link into the journey survives the gate instead of bouncing through /login and back.
 *  The gated page is not rendered behind the modal — an unauthenticated render would fire a
 *  screenful of 401s — so the backdrop is a plain shell until auth succeeds. Dismissing falls
 *  back to the full /login page, which stays the entry point for direct visits. */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useAuthStatus();

  const onLogin = useCallback((_u: User) => setStatus("in"), [setStatus]);

  if (status === "loading") return <AuthSpinner />;

  if (status === "out") {
    return (
      <div className="min-h-screen bg-[#001E2B]">
        <AuthModal
          open
          onLogin={onLogin}
          onClose={() =>
            navigate("/login", { replace: true, state: { from: location.pathname + location.search } })
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}

/** Auth pages (/login, /register): a signed-in user is sent to the app instead. */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const [status] = useAuthStatus();
  if (status === "loading") return <AuthSpinner />;
  if (status === "in") return <Navigate to="/app" replace />;
  return <>{children}</>;
}
