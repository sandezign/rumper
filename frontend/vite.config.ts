import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type ProxyOptions } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  // Where the dev server proxies /api. Default: local backend (full-stack dev).
  // Set VITE_API_PROXY to a deployed origin (e.g. https://rumper.web.app) to run the
  // frontend on its own against a remote API — see README "Frontend only" mode.
  const apiTarget = env.VITE_API_PROXY || "http://localhost:8000";
  const remote = /^https:/i.test(apiTarget);

  const apiProxy: ProxyOptions = { target: apiTarget, changeOrigin: remote, secure: remote };

  // Targeting a deployed API from http://localhost needs two dev-only fixups so the session
  // behaves same-origin. Both trigger only when VITE_API_PROXY points at an https origin and
  // never affect prod:
  //   1. Rewrite the request Origin to the target so the backend's CSRF Origin check passes
  //      (the prod prod-origin is always allowed via its own Host) — works against the
  //      deployed API as-is, no FRONTEND_ORIGIN/redeploy change required.
  //   2. Strip `Secure` (and downgrade SameSite=None) on Set-Cookie + drop the Domain, so the
  //      browser stores the remote https API's session cookie over http://localhost.
  if (remote) {
    apiProxy.cookieDomainRewrite = "";
    apiProxy.configure = (proxy) => {
      proxy.on("proxyReq", (proxyReq) => {
        proxyReq.setHeader("origin", apiTarget);
        proxyReq.removeHeader("referer");
      });
      proxy.on("proxyRes", (proxyRes) => {
        const cookies = proxyRes.headers["set-cookie"];
        if (cookies) {
          proxyRes.headers["set-cookie"] = cookies.map((c: string) =>
            c.replace(/;\s*Secure/gi, "").replace(/;\s*SameSite=None/gi, "; SameSite=Lax"),
          );
        }
      });
    };
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      proxy: { "/api": apiProxy },
    },
    build: {
      outDir: "../backend/static",
      emptyOutDir: true,
    },
  };
});
