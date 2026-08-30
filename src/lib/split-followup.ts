import { daysSince } from "./alerts";
import { formatSplitLog } from "./splits";
import type { Enums } from "@/types/database";

export const SPLIT_FOLLOWUP_DAYS = 14;

export type SplitFollowupInspection = {
  id: string;
  hiveId: string;
  hiveName: string;
  date: string;
  splitType: Enums<"split_type">;
  splitDestination: string | null;
};

const followupTypes = new Set(["nuc", "walk_away", "swarm_caught"]);

export function needsSplitFollowup(
  splitType: Enums<"split_type"> | null
): boolean {
  return splitType != null && followupTypes.has(splitType);
}

export function buildSplitFollowupAlerts(
  inspections: SplitFollowupInspection[],
  today: Date = new Date()
) {
  const alerts = [];

  for (const row of inspections) {
    if (!needsSplitFollowup(row.splitType)) continue;
    const days = daysSince(row.date, today);
    if (days < SPLIT_FOLLOWUP_DAYS) continue;

    const label = formatSplitLog(row.splitType, row.splitDestination);
    alerts.push({
      id: `${row.id}-split-followup`,
      hiveId: row.hiveId,
      hiveName: row.hiveName,
      kind: "split_followup" as const,
      severity: days >= SPLIT_FOLLOWUP_DAYS + 7 ? ("danger" as const) : ("warning" as const),
      message: row.splitDestination
        ? `Follow up on ${label} (${days} days ago)`
        : `Split follow-up due — ${label ?? "check the split"} (${days} days ago)`,
      href: `/inspect?hive=${row.hiveId}`,
    });
  }

  return alerts.sort((a, b) => a.hiveName.localeCompare(b.hiveName));
}
