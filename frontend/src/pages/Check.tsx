import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Home, Loader2 } from "lucide-react";
import { getCheck, inflateReport } from "@/lib/api";
import type { CheckResponse } from "@/lib/api";
import { AnalysisWorkspace } from "@/components/analysis/AnalysisWorkspace";

/** Operations standalone Mini Check (docs/09). Reuses the workspace analysis region. */
export default function Check() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let stop = false;
    async function poll() {
      try {
        const res = await getCheck(id!);
        if (stop) return;
        setState(res);
        if (res.status === "pending" || res.status === "running") setTimeout(poll, 4000);
      } catch (err) {
        if (!stop) setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    }
    poll();
    return () => {
      stop = true;
    };
  }, [id]);

  const pending = !error && (!state || state.status === "pending" || state.status === "running");

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-md md:px-2xl">
        <Link to="/" className="flex items-center gap-xs" aria-label="Rumper — beranda">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-brand-teal-deep">
            <Home className="size-5" aria-hidden />
          </span>
          <span className="text-body-medium text-foreground">Rumper</span>
        </Link>
        <p className="text-caption text-text-tertiary">Cek Risiko Lokasi Sebelum DP</p>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {error && (
          <div className="mx-auto max-w-[28rem] p-md">
            <div className="rounded-lg bg-semantic-danger-bg p-xl text-body-sm text-semantic-danger-text">
              {error}{" "}
              <Link to="/form" className="font-semibold underline">Kembali ke formulir</Link>
            </div>
          </div>
        )}

        {pending && (
          <div className="flex h-full flex-col items-center justify-center gap-sm px-xl text-center">
            <Loader2 className="size-6 animate-spin text-brand-green-dark" aria-hidden />
            <p className="text-heading-5 text-foreground">Deep research lokasi sedang berjalan…</p>
            <p className="max-w-[24rem] text-body-sm text-text-secondary">
              {(state && (state.status === "running" || state.status === "pending") && state.progress?.label) ||
                "Menyiapkan riset…"}{" "}
              Biasanya 2–4 menit.
            </p>
          </div>
        )}

        {!error && state?.status === "failed" && (
          <div className="mx-auto max-w-[28rem] p-md">
            <div className="rounded-lg bg-semantic-danger-bg p-xl text-body-sm text-semantic-danger-text">
              {state.error}{" "}
              <Link to="/form" className="font-semibold underline">Kembali ke formulir</Link>
            </div>
          </div>
        )}

        {!error && state?.status === "done" && (
          <div className="mx-auto h-full max-w-[42rem]">
            <AnalysisWorkspace report={inflateReport(state.report)} />
          </div>
        )}
      </div>
    </div>
  );
}
