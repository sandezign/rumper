import { useEffect, useRef, useState } from "react";
import { googleLoginToken } from "@/lib/api";
import type { User } from "@/lib/api";

interface TokenClient {
  requestAccessToken: () => void;
}
interface TokenResponse {
  access_token?: string;
  error?: string;
}
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
            error_callback?: (err: { type?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onLogin: (u: User) => void;
  disabled?: boolean;
  className?: string;
  variant?: "dark" | "light" | "outline";
  label?: string;
}

/** Google Sign-In Button with Apple-grade tactile feedback and responsive states. */
export default function GoogleSignInButton({
  onLogin,
  disabled = false,
  className = "",
  variant = "dark",
  label,
}: GoogleSignInButtonProps) {
  const clientRef = useRef<TokenClient | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const onLoginRef = useRef(onLogin);
  onLoginRef.current = onLogin;

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    let cancelled = false;
    function init() {
      if (cancelled || !window.google?.accounts?.oauth2) return;
      clientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (resp) => {
          setBusy(false);
          if (!resp.access_token) {
            if (resp.error && resp.error !== "access_denied") alert("Login gagal. Coba lagi.");
            return;
          }
          try {
            onLoginRef.current(await googleLoginToken(resp.access_token));
          } catch {
            alert("Login gagal. Coba lagi.");
          }
        },
        error_callback: () => setBusy(false),
      });
      setReady(true);
    }
    if (window.google?.accounts?.oauth2) init();
    else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  function signIn() {
    if (!clientRef.current || busy || disabled) return;
    setBusy(true);
    clientRef.current.requestAccessToken();
  }

  const defaultLabel = variant === "dark" ? "Masuk dengan Google" : "Daftar dengan Google";
  const displayLabel = label ?? defaultLabel;

  const variantStyles = {
    dark: "bg-[#001E2B] text-white hover:bg-[#002D40] active:bg-[#00141D] border border-white/10 shadow-sm",
    light: "bg-white text-[#001E2B] hover:bg-[#F4F7F6] active:bg-[#EAEFEF] border border-[#CBD5E1] shadow-xs",
    outline: "bg-transparent text-[#001E2B] hover:bg-black/5 active:bg-black/10 border border-[#CBD5E1]",
  };

  const isDisabled = !ready || busy || disabled;

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={isDisabled}
      className={`group relative flex h-12 w-full min-h-[48px] cursor-pointer items-center justify-center gap-3 rounded-full px-6 font-sans text-[15px] font-bold tracking-tight transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ED64] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 ${
        variantStyles[variant]
      } ${className}`}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white shadow-2xs">
        <svg viewBox="0 0 48 48" className="size-4 shrink-0" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      </span>
      <span>{busy ? "Menghubungkan…" : displayLabel}</span>
    </button>
  );
}
