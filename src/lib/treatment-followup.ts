import { addDaysISO } from "./treatments";
import { daysSince } from "./alerts";

export type MiteRetestTreatment = {
  id: string;
  hiveId: string;
  productName: string;
  miteRetestDueDate: string;
  completedAt: string | null;
};

export function buildPostTreatmentMiteAlerts(
  hives: { id: string; name: string }[],
  treatments: MiteRetestTreatment[],
  lastMiteDateByHive: Map<string, string>,
  today: Date = new Date()
) {
  const names = new Map(hives.map((hive) => [hive.id, hive.name]));
  const alerts = [];

  for (const treatment of treatments) {
    const hiveName = names.get(treatment.hiveId);
    if (!hiveName) continue;

    const lastMite = lastMiteDateByHive.get(treatment.hiveId);
    if (
      lastMite &&
      treatment.completedAt &&
      lastMite >= treatment.completedAt.slice(0, 10)
    ) {
      continue;
    }

    const overdueDays = daysSince(treatment.miteRetestDueDate, today);
    alerts.push({
      id: `${treatment.id}-mite-retest`,
      hiveId: treatment.hiveId,
      hiveName,
      kind: "mite_retest" as const,
      severity: overdueDays > 0 ? ("danger" as const) : ("warning" as const),
      message:
        overdueDays > 0
          ? `${treatment.productName} — mite retest overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`
          : `${treatment.productName} — mite retest due ${overdueDays === 0 ? "today" : `in ${-overdueDays} day${-overdueDays === 1 ? "" : "s"}`}`,
      href: `/inspect?hive=${treatment.hiveId}`,
    });
  }

  return alerts;
}

export function miteRetestDueDate(
  completedDateISO: string,
  daysAfter: number
): string {
  return addDaysISO(completedDateISO, daysAfter);
}
