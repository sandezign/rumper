import { Navigate } from "react-router-dom";
import { hasConfirmedProfile } from "@/lib/profile";

/** `/app` — journey router. A buyer without a confirmed priority profile starts at the
 *  wizard; a returning buyer goes straight to the curated-areas hub. */
export default function AppEntry() {
  return <Navigate to={hasConfirmedProfile() ? "/app/areas" : "/app/start"} replace />;
}
