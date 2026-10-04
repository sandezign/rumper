// Guided onboarding wizard state (kept in sessionStorage so it survives refresh / a login
// redirect) + the mapping from option labels to the backend intake payload.
import type { FromIntakePayload } from "./api";
import type { BuyerPriorityProfile } from "./profile";

export interface WizardAnswers {
  property?: string;
  /** Corridor chosen in the areas hub — context for the intake, not a substitute for the
   *  property address (docs/18 Wave 3). */
  area?: string;
  activity?: string;
  transport?: string;
  risks?: string[];
  timeline?: string;
  notes?: string;
  purpose?: string;
}

const KEY = "rumper_wizard";

export function loadWizard(): WizardAnswers {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
export function saveWizard(a: WizardAnswers) {
  sessionStorage.setItem(KEY, JSON.stringify(a));
}
export function clearWizard() {
  sessionStorage.removeItem(KEY);
}

const TRANSPORT: Record<string, string> = {
  "Mobil pribadi": "mobil",
  "Motor pribadi": "motor",
  "Ojek online": "motor",
  "Transportasi umum": "krl",
  Kombinasi: "campuran",
};
const RISK: Record<string, string> = {
  Banjir: "banjir",
  "Commute reliability": "commute",
  "Akses jalan": "akses",
  "Fasilitas keluarga": "fasilitas",
  "Lingkungan sekitar": "lingkungan",
};
const STAGE: Record<string, string> = {
  "Baru riset": "survey",
  "Survey terjadwal": "survey",
  "Booking fee pending": "nego",
  "Hampir bayar DP": "siap_dp",
  "Siap beli": "siap_dp",
};

export function wizardToIntake(a: WizardAnswers): FromIntakePayload {
  const concerns = (a.risks ?? []).map((r) => RISK[r]).filter(Boolean);
  const otherRisks = (a.risks ?? []).filter((r) => !RISK[r]); // e.g. "Investment potential"
  const noteParts = [
    a.notes && a.notes !== "Tidak ada catatan tambahan" ? a.notes : null,
    otherRisks.length ? `Prioritas lain: ${otherRisks.join(", ")}` : null,
  ].filter(Boolean) as string[];

  return {
    address_text: (a.property ?? "").trim(),
    workplace_text:
      a.activity && a.activity !== "Lewati dulu" ? a.activity : "Tidak ditentukan",
    transport_mode: (a.transport && TRANSPORT[a.transport]) || "campuran",
    concerns: concerns.length ? concerns : ["banjir", "commute", "akses", "fasilitas", "lingkungan"],
    concern_notes: noteParts.length ? noteParts.join(". ") : undefined,
    buying_stage: a.timeline ? STAGE[a.timeline] : undefined,
    purpose: a.purpose,
  };
}


// ─── Buyer profile → intake seed ──────────────────────────────────────────────
//
// What the /app/start wizard collects that the *existing* intake API can already carry.
// Mapping is by the option's stable id, never its label (labels are copy and change).
//
// Only frictions that name an actual risk category map to `concerns`. The rest
// ("pusing bandingin trade-off", "kebanyakan riset", "budget/KPR") are real problems but
// they are not one of the five scored categories, so they map to nothing and the backend's
// own default — research all five — applies. Narrowing the research because someone said
// "I'm overwhelmed" would be a worse outcome than researching everything.
const FRICTION_TO_RISKS: Record<string, string[]> = {
  "flood-access": ["Banjir", "Akses jalan"],
  "commute-discrepancy": ["Commute reliability"],
  "essential-facilities": ["Fasilitas keluarga", "Lingkungan sekitar"],
};

// `purpose` is a deliberate two-value field on the contract (docs/05; the same pair is
// pinned in prompts/chat_system.md), so a couple maps to the multi-person bucket rather
// than inventing a third value — `tinggal_pasangan` was rejected with 422 and blocked every
// "pasangan" household from ever generating a report.
//
// Nothing is lost by the collapse: the exact household type is carried verbatim in
// `concern_notes` ("Rumah tangga: pasangan"), so the researchers still distinguish a couple
// from a family with children.
const HOUSEHOLD_TO_PURPOSE: Record<string, string> = {
  single: "tinggal_sendiri",
  pasangan: "tinggal_keluarga",
  "keluarga-muda": "tinggal_keluarga",
};

const WORK_PATTERN_LABEL: Record<string, string> = {
  wfo: "kerja dari kantor tiap hari",
  hybrid: "hybrid (sebagian hari dari kantor)",
  remote: "kerja remote",
};

/** Fields from the confirmed profile that the current intake contract can carry.
 *  Everything the contract cannot express is listed in docs/17 §3b as an API gap — it is
 *  deliberately NOT crammed into free text beyond the short context note below. */
export function intakeSeedFromProfile(p: BuyerPriorityProfile): Partial<WizardAnswers> {
  const primary = p.anchors.find((a) => a.type === "primary")?.label;
  const secondary = p.anchors.find((a) => a.type === "secondary")?.label;
  const risks = p.signals?.selectedFriction
    ? FRICTION_TO_RISKS[p.signals.selectedFriction]
    : undefined;

  // Context the researchers can actually use when weighing findings.
  const notes = [
    HOUSEHOLD_TO_PURPOSE[p.householdType] ? `Rumah tangga: ${p.householdType}` : null,
    WORK_PATTERN_LABEL[p.workPattern] ? `Pola kerja: ${WORK_PATTERN_LABEL[p.workPattern]}` : null,
    secondary ? `Titik aktivitas kedua: ${secondary}` : null,
    p.budget?.maxMillions
      ? `Anggaran: Rp ${p.budget.minMillions}–${p.budget.maxMillions} juta`
      : null,
    p.preferredCorridors?.length ? `Koridor diminati: ${p.preferredCorridors.join(", ")}` : null,
  ].filter(Boolean) as string[];

  return {
    ...(primary ? { activity: primary } : {}),
    ...(risks ? { risks } : {}),
    ...(HOUSEHOLD_TO_PURPOSE[p.householdType]
      ? { purpose: HOUSEHOLD_TO_PURPOSE[p.householdType] }
      : {}),
    ...(notes.length ? { notes: notes.join(". ") } : {}),
  };
}
