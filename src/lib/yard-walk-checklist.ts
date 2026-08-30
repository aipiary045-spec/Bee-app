import type { HiveAlert } from "./alerts.ts";
import { daysSince } from "./alerts.ts";

export type YardWalkItem = {
  id: string;
  hiveId: string;
  hiveName: string;
  message: string;
  severity: "danger" | "warning";
  href: string;
};

export type YardWalkTreatment = {
  id: string;
  hiveId: string;
  hiveName: string;
  productName: string;
  endDate: string | null;
  status: "planned" | "in_progress" | "completed";
};

export function buildYardWalkChecklist(
  hives: { id: string; name: string }[],
  alerts: HiveAlert[],
  treatments: YardWalkTreatment[],
  today: Date = new Date()
): YardWalkItem[] {
  const hiveOrder = new Map(hives.map((hive, index) => [hive.id, index]));
  const items: YardWalkItem[] = [];
  const seen = new Set<string>();

  for (const alert of alerts) {
    if (alert.kind === "deadout") continue;
    const key = `${alert.hiveId}-${alert.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      id: alert.id,
      hiveId: alert.hiveId,
      hiveName: alert.hiveName,
      message: alert.message,
      severity: alert.severity,
      href: alert.href,
    });
  }

  for (const treatment of treatments) {
    if (treatment.status === "completed" || !treatment.endDate) continue;
    const days = daysSince(treatment.endDate, today);
    if (days > 0) continue;

    const key = `${treatment.hiveId}-treatment-open`;
    if (seen.has(key)) continue;
    seen.add(key);

    const dueIn = -days;
    items.push({
      id: `${treatment.id}-pull`,
      hiveId: treatment.hiveId,
      hiveName: treatment.hiveName,
      message:
        dueIn === 0
          ? `${treatment.productName} pull due today`
          : `${treatment.productName} pull due in ${dueIn} day${dueIn === 1 ? "" : "s"}`,
      severity: dueIn === 0 ? "warning" : "warning",
      href: `/hives/${treatment.hiveId}#treatments`,
    });
  }

  const rank = { danger: 0, warning: 1 };
  return items.sort((a, b) => {
    const byHive =
      (hiveOrder.get(a.hiveId) ?? 999) - (hiveOrder.get(b.hiveId) ?? 999);
    if (byHive !== 0) return byHive;
    return rank[a.severity] - rank[b.severity];
  });
}
