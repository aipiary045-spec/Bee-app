import type { HiveAlert } from "@/lib/alerts";

export type HiveFilterKey =
  | "all"
  | "attention"
  | "steady"
  | "deadout"
  | "overdue"
  | "mites"
  | "queen"
  | "treatment";

export type HiveFilterInput = {
  id: string;
  name: string;
  status: "active" | "inactive" | "deadout";
};

export const HIVE_FILTER_OPTIONS: { key: HiveFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "attention", label: "Needs attention" },
  { key: "steady", label: "Steady" },
  { key: "overdue", label: "Overdue visit" },
  { key: "mites", label: "Mites" },
  { key: "queen", label: "Queen" },
  { key: "treatment", label: "Treatment" },
  { key: "deadout", label: "Deadout" },
];

export function groupAlertsByHiveId(
  alerts: HiveAlert[]
): Map<string, HiveAlert[]> {
  const map = new Map<string, HiveAlert[]>();
  for (const alert of alerts) {
    const list = map.get(alert.hiveId) ?? [];
    list.push(alert);
    map.set(alert.hiveId, list);
  }
  return map;
}

export function hiveMatchesFilter(
  hive: HiveFilterInput,
  filter: HiveFilterKey,
  alertsByHive: Map<string, HiveAlert[]>,
  search: string
): boolean {
  const query = search.trim().toLowerCase();
  if (query && !hive.name.toLowerCase().includes(query)) {
    return false;
  }

  const alerts = alertsByHive.get(hive.id) ?? [];
  const kinds = new Set(alerts.map((alert) => alert.kind));

  switch (filter) {
    case "all":
      return true;
    case "attention":
      return alerts.length > 0;
    case "steady":
      return hive.status === "active" && alerts.length === 0;
    case "deadout":
      return hive.status === "deadout";
    case "overdue":
      return kinds.has("overdue") || kinds.has("never_inspected");
    case "mites":
      return kinds.has("mites");
    case "queen":
      return kinds.has("queen");
    case "treatment":
      return kinds.has("treatment");
    default:
      return true;
  }
}
