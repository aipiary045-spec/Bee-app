export const MITE_THRESHOLD_PER_100 = 3;
export const INSPECTION_OVERDUE_DAYS = 14;

export type AlertSeverity = "danger" | "warning";
export type AlertKind =
  | "deadout"
  | "mites"
  | "disease"
  | "queen"
  | "overdue"
  | "never_inspected";

export type HiveAlert = {
  id: string;
  hiveId: string;
  hiveName: string;
  kind: AlertKind;
  severity: AlertSeverity;
  message: string;
  href: string;
};

export type AlertHive = {
  id: string;
  name: string;
  status: "active" | "inactive" | "deadout";
};

export type AlertInspection = {
  hiveId: string;
  date: string;
  queenSighted: "yes" | "no" | "uncertain" | null;
  miteCountPer100: number | null;
  pestsDiseases: string | null;
};

export function daysSince(dateISO: string, today: Date = new Date()): number {
  const [year, month, day] = dateISO.split("-").map(Number);
  if (!year || !month || !day) return 0;
  const from = new Date(year, month - 1, day);
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((now.getTime() - from.getTime()) / 86_400_000);
}

export function groupInspectionsByHive(
  inspections: AlertInspection[]
): Map<string, AlertInspection[]> {
  const grouped = new Map<string, AlertInspection[]>();
  const sorted = [...inspections].sort((a, b) => b.date.localeCompare(a.date));
  for (const inspection of sorted) {
    const list = grouped.get(inspection.hiveId) ?? [];
    list.push(inspection);
    grouped.set(inspection.hiveId, list);
  }
  return grouped;
}

function diseaseMessage(pest: string): string | null {
  switch (pest) {
    case "foulbrood_suspect":
      return "Foulbrood suspect — isolate and confirm before treating";
    case "chalkbrood":
      return "Chalkbrood observed on the last visit";
    case "wax_moth":
      return "Wax moth observed on the last visit";
    case "ants":
      return "Ants observed on the last visit";
    case "other":
      return "Pest or disease flagged on the last visit";
    default:
      return null;
  }
}

export function buildHiveAlerts(
  hives: AlertHive[],
  inspections: AlertInspection[],
  today: Date = new Date()
): HiveAlert[] {
  const byHive = groupInspectionsByHive(inspections);
  const alerts: HiveAlert[] = [];

  for (const hive of hives) {
    const recent = byHive.get(hive.id) ?? [];
    const latest = recent[0];

    if (hive.status === "deadout") {
      alerts.push({
        id: `${hive.id}-deadout`,
        hiveId: hive.id,
        hiveName: hive.name,
        kind: "deadout",
        severity: "danger",
        message: "Marked deadout — clean, combine, or close the record",
        href: `/hives/${hive.id}`,
      });
      continue;
    }

    if (hive.status !== "active") continue;

    if (!latest) {
      alerts.push({
        id: `${hive.id}-never`,
        hiveId: hive.id,
        hiveName: hive.name,
        kind: "never_inspected",
        severity: "warning",
        message: "No inspection logged yet",
        href: `/inspect?hive=${hive.id}`,
      });
      continue;
    }

    const overdueDays = daysSince(latest.date, today);
    if (overdueDays >= INSPECTION_OVERDUE_DAYS) {
      alerts.push({
        id: `${hive.id}-overdue`,
        hiveId: hive.id,
        hiveName: hive.name,
        kind: "overdue",
        severity: "warning",
        message: `Overdue inspection — ${overdueDays} days since last check`,
        href: `/inspect?hive=${hive.id}`,
      });
    }

    if (
      latest.miteCountPer100 != null &&
      latest.miteCountPer100 >= MITE_THRESHOLD_PER_100
    ) {
      const count = Number.isInteger(latest.miteCountPer100)
        ? String(latest.miteCountPer100)
        : latest.miteCountPer100.toFixed(1);
      alerts.push({
        id: `${hive.id}-mites`,
        hiveId: hive.id,
        hiveName: hive.name,
        kind: "mites",
        severity: "danger",
        message: `Mite count ${count} per 100 — treatment recommended`,
        href: `/hives/${hive.id}#mites`,
      });
    }

    const disease = latest.pestsDiseases
      ? diseaseMessage(latest.pestsDiseases)
      : null;
    if (disease) {
      alerts.push({
        id: `${hive.id}-disease`,
        hiveId: hive.id,
        hiveName: hive.name,
        kind: "disease",
        severity:
          latest.pestsDiseases === "foulbrood_suspect" ? "danger" : "warning",
        message: disease,
        href: `/hives/${hive.id}#inspections`,
      });
    }

    const lastTwo = recent.slice(0, 2);
    if (
      lastTwo.length >= 2 &&
      lastTwo.every((visit) => visit.queenSighted && visit.queenSighted !== "yes")
    ) {
      alerts.push({
        id: `${hive.id}-queen`,
        hiveId: hive.id,
        hiveName: hive.name,
        kind: "queen",
        severity: "warning",
        message: "Queen not spotted in last 2 inspections",
        href: `/inspect?hive=${hive.id}`,
      });
    }
  }

  const rank: Record<AlertSeverity, number> = { danger: 0, warning: 1 };
  return alerts.sort((a, b) => {
    const bySeverity = rank[a.severity] - rank[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return a.hiveName.localeCompare(b.hiveName);
  });
}

export function uniqueHiveCount(alerts: HiveAlert[]): number {
  return new Set(alerts.map((alert) => alert.hiveId)).size;
}
