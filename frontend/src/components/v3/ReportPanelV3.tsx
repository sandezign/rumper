import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Milestone,
  Route,
  ShoppingCart,
  Stethoscope,
  TrainFront,
  Trees,
  Waves,
} from "lucide-react";
import type { LegacyCategory, LegacyFinding, MapData, LegacyReport } from "@/lib/api";
import { bandHex, CAT_LABEL } from "@/lib/risk";

/** Map layers controlled from this panel — mirrors the map's view/overlay set. */
export type LayerKey = "flood" | "redflags" | "commute" | "facilities" | "toll";
export type ActiveLayers = Record<LayerKey, boolean>;

export const CAT_TO_LAYER: Record<string, LayerKey> = {
  banjir: "flood",
  commute: "commute",
  akses: "toll",
  fasilitas: "facilities",
  lingkungan: "redflags",
};

const CAT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  banjir: Waves,
  commute: TrainFront,
  akses: Route,
  fasilitas: ShoppingCart,
  lingkungan: Trees,
};

/** Playground metric chips per category (Figma: "Berjarak ~150m", "Zona Sedang", …). */
const CAT_METRIC: Record<string, string> = {
  banjir: "Zona Sedang",
  commute: "47–55 mnt",
  akses: "~1.88 km",
  fasilitas: "≤ 1.62 km",
  lingkungan: "Berjarak ~550m",
};

function categoryBarColor(s: number | null): string {
  if (s === null) return "#94a3b8";
  if (s <= 39) return "#ef4444";
  if (s <= 69) return "#f59e0b";
  return "#0ea5e9";
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        on ? "bg-indigo-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function CountChip({ n }: { n: number }) {
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 border border-border/60">
      {n}
    </span>
  );
}

/* ────────────────────────── Tab: Overview ────────────────────────── */

function ScoreRing({ score, band }: { score: number | null; band: string | null }) {
  const color = bandHex(band);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-16 shrink-0">
      {/* explicit width/height + viewBox keep the ring centered even if CSS sizing changes */}
      <svg width="64" height="64" viewBox="0 0 64 64" className="block size-full -rotate-90">
        <circle cx="32" cy="32" r={r} className="fill-none stroke-slate-100" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          className="fill-none transition-all duration-500 ease-out"
          strokeWidth="5"
          stroke={color}
          strokeDasharray={`${c}`}
          strokeDashoffset={`${c * (1 - (score ?? 0) / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[19px] font-bold text-text-primary">{score !== null ? Math.round(score) : "–"}</span>
        <span className="text-[10px] font-semibold text-text-tertiary mt-0.5">/100</span>
      </div>
    </div>
  );
}

function PropertyCard({ report }: { report: LegacyReport }) {
  return (
    <section className="rounded-xl border border-border bg-card p-md shadow-subtle">
      <div className="flex items-start justify-between gap-md">
        <div className="min-w-0">
          <h1 className="text-heading-5 font-bold text-text-primary leading-snug">
            {report.property.name?.split(",")[0] || "Lokasi Kandidat"}
          </h1>
          <p className="mt-xxs text-caption text-text-secondary leading-relaxed">
            {report.property.formatted_address?.replace(", Indonesia", "")}
          </p>
        </div>
        <ScoreRing score={report.rls_score} band={report.band} />
      </div>

      {/* LegacyCategory score bars */}
      <div className="mt-md flex flex-col gap-sm">
        {report.categories.map((c) => (
          <div key={c.category} className="flex items-center gap-sm">
            <span className="w-[76px] shrink-0 text-caption text-text-secondary">{CAT_LABEL[c.category] ?? c.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${c.score ?? 0}%`, background: categoryBarColor(c.score) }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-caption font-semibold text-text-secondary">
              {c.score !== null ? `${c.score}%` : "–"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskChip({ critical }: { critical: boolean }) {
  return critical ? (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-rose-50 px-2.5 py-1 text-micro font-semibold text-rose-700">
      <span className="size-1.5 rounded-full bg-rose-500" aria-hidden /> Risiko tinggi
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 px-2.5 py-1 text-micro font-semibold text-amber-700">
      <span className="size-1.5 rounded-full bg-amber-500" aria-hidden /> Perlu perhatian
    </span>
  );
}

function OverviewTab({ report, onOpenFinding }: { report: LegacyReport; onOpenFinding: (f: LegacyFinding) => void }) {
  const [expanded, setExpanded] = useState(false);
  const priority = useMemo(() => {
    const flat = report.categories.flatMap((c) => c.findings.map((f) => ({ f, catLabel: c.label })));
    const flags = flat.filter((x) => x.f.is_red_flag);
    flags.sort((a, b) => Number(b.f.is_critical) - Number(a.f.is_critical));
    return flags;
  }, [report]);

  const summary = report.summary;
  const clamped = !expanded && summary.length > 220 ? summary.slice(0, 220).trimEnd() + "…" : summary;

  return (
    <div className="flex flex-col gap-md">
      <PropertyCard report={report} />

      {/* Disclaimer banner */}
      <div
        role="note"
        className="flex items-start gap-sm rounded-xl border border-[rgba(245,166,35,0.25)] bg-semantic-warning-bg p-md"
      >
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgba(245,166,35,0.3)] text-caption-bold text-semantic-warning-text">
          !
        </span>
        <p className="text-body-sm text-semantic-warning-text">
          Analisis ini disusun otomatis berdasarkan agregasi data sekunder.
        </p>
      </div>

      <section>
        <h2 className="text-heading-5 font-bold text-text-primary">Overview</h2>
        <div className="mt-sm rounded-xl border border-border bg-card p-md shadow-subtle">
          <p className="text-body-sm text-text-secondary leading-relaxed">{clamped}</p>
          {summary.length > 220 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-xs inline-flex items-center gap-1 text-body-sm-medium font-bold text-text-primary hover:underline cursor-pointer"
            >
              {expanded ? "Sembunyikan" : "Selengkapnya"}
              <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
            </button>
          )}
        </div>
      </section>

      {priority.length > 0 && (
        <section className="flex flex-col gap-sm">
          <div className="flex items-center gap-xs">
            <h2 className="text-micro-uppercase text-text-secondary font-bold tracking-wider">Temuan Prioritas</h2>
            <CountChip n={priority.length} />
          </div>
          {priority.map(({ f, catLabel }, i) => (
            <article
              key={i}
              className="flex flex-col gap-xs rounded-xl border border-border bg-card p-md shadow-subtle cursor-pointer hover:border-border-strong transition-colors"
              onClick={() => onOpenFinding(f)}
            >
              <RiskChip critical={f.is_critical} />
              <h3 className="text-body-medium font-bold text-text-primary">{catLabel}</h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">{f.claim}</p>
            </article>
          ))}
        </section>
      )}

      <p className="text-micro text-text-tertiary leading-relaxed pb-md">{report.disclaimer}</p>
    </div>
  );
}

/* ────────────────────────── Tab: Evidence Risk ────────────────────────── */

type EviRow = { f: LegacyFinding; cat: LegacyCategory };

function EvidenceRow({
  row,
  layerOn,
  onToggleLayer,
  onOpenFinding,
}: {
  row: EviRow;
  layerOn: boolean;
  onToggleLayer: () => void;
  onOpenFinding: (f: LegacyFinding) => void;
}) {
  const [open, setOpen] = useState(false);
  const { f, cat } = row;
  const Icon = CAT_ICON[cat.category] ?? Waves;
  const severity = f.is_critical ? "Alert" : f.is_red_flag ? "Warning" : "Info";
  const severityCls =
    severity === "Alert"
      ? "bg-rose-50 text-rose-700"
      : severity === "Warning"
        ? "bg-amber-100/80 text-amber-800"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="border-b border-border/60 last:border-0">
      {/* div, not button: the layer Toggle nests inside and buttons can't nest */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
        className="flex w-full items-center gap-sm py-sm text-left cursor-pointer group"
      >
        <Icon className="size-5 shrink-0 text-indigo-500" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-body-sm-medium font-bold text-text-primary">{cat.label}</span>
        <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          {CAT_METRIC[cat.category] ?? "—"}
        </span>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${severityCls}`}>{severity}</span>
        <Toggle on={layerOn} onChange={onToggleLayer} label={`Layer peta ${cat.label}`} />
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-text-tertiary" aria-hidden />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-text-tertiary group-hover:text-text-secondary" aria-hidden />
        )}
      </div>

      {open && (
        <div className="pb-md pl-8 pr-sm flex flex-col gap-xs fade-up">
          <h4 className="text-body-sm-medium font-bold text-text-primary">{f.claim.split(".")[0]}.</h4>
          <p className="text-caption text-text-secondary leading-relaxed">
            {f.limitation || cat.rationale}
          </p>
          <button
            onClick={() => onOpenFinding(f)}
            className="inline-flex items-center gap-1 self-start text-caption-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Lihat Detail Checklist <ArrowRight className="size-3.5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

function EvidenceTab({
  report,
  activeLayers,
  onToggleLayer,
  onOpenFinding,
}: {
  report: LegacyReport;
  activeLayers: ActiveLayers;
  onToggleLayer: (k: LayerKey) => void;
  onOpenFinding: (f: LegacyFinding) => void;
}) {
  const rows = useMemo<EviRow[]>(
    () => report.categories.flatMap((cat) => cat.findings.map((f) => ({ f, cat }))),
    [report],
  );
  return (
    <div className="flex flex-col">
      <p className="pb-sm text-caption text-text-tertiary">
        Aktifkan layer peta lewat sakelar. Klik baris untuk detail temuan.
      </p>
      {rows.map((row, i) => {
        const key = CAT_TO_LAYER[row.cat.category];
        return (
          <EvidenceRow
            key={i}
            row={row}
            layerOn={key ? activeLayers[key] : false}
            onToggleLayer={() => key && onToggleLayer(key)}
            onOpenFinding={onOpenFinding}
          />
        );
      })}
    </div>
  );
}

/* ────────────────────────── Tab: Nearby Facilities ────────────────────────── */

interface FacilityGroup {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconCls: string;
  layer: LayerKey;
  items: { name: string; distance_km: number; kind: string }[];
}

function proximityLabel(km: number): { label: string; cls: string } {
  if (km <= 0.5) return { label: "Sangat Dekat", cls: "text-emerald-600" };
  if (km <= 1.5) return { label: "Dekat", cls: "text-blue-600" };
  return { label: "Cukup Jauh", cls: "text-amber-600" };
}

function FacilityGroupRow({
  group,
  layerOn,
  onToggleLayer,
}: {
  group: FacilityGroup;
  layerOn: boolean;
  onToggleLayer: () => void;
}) {
  const [open, setOpen] = useState(false);
  const nearest = Math.min(...group.items.map((i) => i.distance_km));
  const prox = proximityLabel(nearest);
  const Icon = group.icon;

  return (
    <div className="border-b border-border/60 last:border-0">
      {/* div, not button: the layer Toggle nests inside and buttons can't nest */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
        className="flex w-full items-center gap-sm py-sm text-left cursor-pointer group"
      >
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${group.iconCls}`}>
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-xs">
            <span className="truncate text-body-sm-medium font-bold text-text-primary">{group.label}</span>
            <span className="text-caption font-bold text-indigo-600">{group.items.length}</span>
          </span>
          <span className={`text-micro font-semibold ${prox.cls}`}>
            {prox.label} · terdekat {nearest} km
          </span>
        </span>
        <Toggle on={layerOn} onChange={onToggleLayer} label={`Layer peta ${group.label}`} />
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-text-tertiary" aria-hidden />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-text-tertiary group-hover:text-text-secondary" aria-hidden />
        )}
      </div>

      {open && (
        <div className="pb-sm pl-11 pr-sm flex flex-col fade-up">
          {group.items
            .slice()
            .sort((a, b) => a.distance_km - b.distance_km)
            .map((it) => (
              <div key={it.name} className="flex items-center justify-between gap-sm py-1.5">
                <span className="min-w-0 truncate text-caption text-text-secondary">{it.name}</span>
                <span className="shrink-0 text-caption font-semibold text-text-tertiary">{it.distance_km} km</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function FacilitiesTab({
  mapData,
  activeLayers,
  onToggleLayer,
}: {
  mapData: MapData;
  activeLayers: ActiveLayers;
  onToggleLayer: (k: LayerKey) => void;
}) {
  const groups = useMemo<FacilityGroup[]>(() => {
    const byKind = (kinds: string[]) =>
      mapData.facilities
        .filter((f) => kinds.includes(f.kind))
        .map((f) => ({ name: f.name, distance_km: f.distance_km, kind: f.kind }));

    const transport = [mapData.nearest_station, mapData.nearest_toll]
      .filter((f): f is NonNullable<typeof f> => !!f)
      .map((f) => ({ name: f.name, distance_km: f.distance_km, kind: f.kind }));

    return [
      {
        key: "kesehatan",
        label: "Kesehatan",
        icon: Stethoscope,
        iconCls: "bg-rose-50 text-rose-600",
        layer: "facilities" as const,
        items: byKind(["hospital", "clinic", "pharmacy"]),
      },
      {
        key: "pendidikan",
        label: "Pendidikan",
        icon: GraduationCap,
        iconCls: "bg-indigo-50 text-indigo-600",
        layer: "facilities" as const,
        items: byKind(["school"]),
      },
      {
        key: "belanja",
        label: "Belanja Harian",
        icon: ShoppingCart,
        iconCls: "bg-amber-50 text-amber-600",
        layer: "facilities" as const,
        items: byKind(["market", "supermarket"]),
      },
      {
        key: "transportasi",
        label: "Stasiun & Tol",
        icon: Milestone,
        iconCls: "bg-cyan-50 text-cyan-600",
        layer: "commute" as const,
        items: transport,
      },
    ].filter((g) => g.items.length > 0);
  }, [mapData]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex flex-col">
      <p className="pb-sm text-caption text-text-tertiary">
        {total} fasilitas dalam radius ±3 km. Aktifkan layer peta lewat sakelar; klik baris untuk rincian.
      </p>
      {groups.map((g) => (
        <FacilityGroupRow
          key={g.key}
          group={g}
          layerOn={activeLayers[g.layer]}
          onToggleLayer={() => onToggleLayer(g.layer)}
        />
      ))}
    </div>
  );
}

/* ────────────────────────── Panel shell with tabs ────────────────────────── */

export default function ReportPanelV3({
  report,
  mapData,
  activeLayers,
  onToggleLayer,
  onOpenFinding,
}: {
  report: LegacyReport;
  mapData: MapData;
  activeLayers: ActiveLayers;
  onToggleLayer: (k: LayerKey) => void;
  onOpenFinding: (f: LegacyFinding) => void;
}) {
  const [tab, setTab] = useState<"overview" | "evidence" | "facilities">("overview");

  const evidenceCount = report.categories.reduce((n, c) => n + c.findings.length, 0);
  const facilityCount =
    mapData.facilities.length + (mapData.nearest_station ? 1 : 0) + (mapData.nearest_toll ? 1 : 0);

  const tabs = [
    { key: "overview" as const, label: "Overview", count: null },
    { key: "evidence" as const, label: "Evidence Risk", count: evidenceCount },
    { key: "facilities" as const, label: "Nearby Facilities", count: facilityCount },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      {/* Underline tab bar */}
      <div className="flex shrink-0 items-center gap-lg border-b border-border px-md overflow-x-auto" role="tablist">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-xs py-sm text-body-sm-medium whitespace-nowrap cursor-pointer transition-colors ${
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

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface px-md py-md">
        {tab === "overview" && <OverviewTab report={report} onOpenFinding={onOpenFinding} />}
        {tab === "evidence" && (
          <EvidenceTab
            report={report}
            activeLayers={activeLayers}
            onToggleLayer={onToggleLayer}
            onOpenFinding={onOpenFinding}
          />
        )}
        {tab === "facilities" && (
          <FacilitiesTab mapData={mapData} activeLayers={activeLayers} onToggleLayer={onToggleLayer} />
        )}
      </div>
    </div>
  );
}
