// One vocabulary for facility grouping, shared by the Tahap 05 list and the map.
//
// The list's show/hide switches and the map's pins have to agree on what "Kesehatan" means,
// or a toggle silently hides nothing. Both read this table.

export interface FacilityGroup {
  id: string;
  label: string;
  /** OSM kinds the warehouse reports for this group. */
  kinds: string[];
  tint: string;
  border: string;
  ink: string;
}

export const FACILITY_GROUPS: FacilityGroup[] = [
  { id: "kesehatan", label: "Kesehatan", kinds: ["hospital", "clinic", "pharmacy"],
    tint: "#FFF1F2", border: "rgba(254,202,202,0.6)", ink: "#E11D48" },
  { id: "pendidikan", label: "Pendidikan", kinds: ["school", "kindergarten", "university", "college"],
    tint: "#EEF2FF", border: "rgba(198,210,255,0.6)", ink: "#615FFF" },
  { id: "belanja", label: "Belanja harian", kinds: ["market", "supermarket", "convenience", "mall"],
    tint: "#FFFBEB", border: "rgba(254,230,133,0.6)", ink: "#FE9A00" },
  { id: "transit", label: "Stasiun & akses", kinds: ["station", "toll", "bus_stop", "terminal"],
    tint: "#E0F2FE", border: "rgba(186,230,253,0.6)", ink: "#0092B8" },
];

const BY_KIND = new Map<string, FacilityGroup>(
  FACILITY_GROUPS.flatMap((g) => g.kinds.map((k) => [k, g] as const)),
);

export const OTHER_GROUP: FacilityGroup = {
  id: "lainnya", label: "Lainnya", kinds: [],
  tint: "#F1F5F9", border: "rgba(203,213,225,0.6)", ink: "#64748B",
};

export function groupOf(kind: string): FacilityGroup {
  return BY_KIND.get(kind) ?? OTHER_GROUP;
}

/** Every group id, so a "show all" default is exhaustive without hard-coding the list. */
export const ALL_GROUP_IDS = [...FACILITY_GROUPS.map((g) => g.id), OTHER_GROUP.id];
