import type { HiveAlert } from "./alerts";

export const DEFAULT_MITE_CHECK_INTERVAL_DAYS = 28;

export type MiteDueHive = {
  id: string;
  name: string;
  status: "active" | "inactive" | "deadout";
};

export function buildMiteDueAlerts(
  hives: MiteDueHive[],
  lastMiteDateByHive: Map<string, string>,
  intervalDays: number = DEFAULT_MITE_CHECK_INTERVAL_DAYS,
  today: Date = new Date()
): HiveAlert[] {
  const alerts: HiveAlert[] = [];

  for (const hive of hives) {
    if (hive.status !== "active") continue;
    const lastDate = lastMiteDateByHive.get(hive.id);
    if (!lastDate) {
      alerts.push({
        id: `${hive.id}-mite-due`,
        hiveId: hive.id,
        hiveName: hive.name,
        kind: "mite_due",
        severity: "warning",
        message: "No mite count on record — schedule a test",
        href: `/inspect?hive=${hive.id}`,
      });
      continue;
    }

    const [year, month, day] = lastDate.split("-").map(Number);
    const from = new Date(year, month - 1, day);
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.round((now.getTime() - from.getTime()) / 86_400_000);
    if (days < intervalDays) continue;

    alerts.push({
      id: `${hive.id}-mite-due`,
      hiveId: hive.id,
      hiveName: hive.name,
      kind: "mite_due",
      severity: days >= intervalDays + 7 ? "danger" : "warning",
      message: `Mite check overdue — last test ${days} days ago`,
      href: `/inspect?hive=${hive.id}`,
    });
  }

  return alerts.sort((a, b) => a.hiveName.localeCompare(b.hiveName));
}
