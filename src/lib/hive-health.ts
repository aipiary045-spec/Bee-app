import type { AlertSeverity, HiveAlert } from "./alerts";

export type HiveHealthTone = "danger" | "warning" | "steady";

export function hiveHealthById(
  alerts: HiveAlert[]
): Record<string, HiveHealthTone> {
  const map: Record<string, HiveHealthTone> = {};

  for (const alert of alerts) {
    const current = map[alert.hiveId];
    if (alert.severity === "danger") {
      map[alert.hiveId] = "danger";
      continue;
    }
    if (current !== "danger") {
      map[alert.hiveId] = "warning";
    }
  }

  return map;
}

export function hiveHealthToneClass(tone: HiveHealthTone | undefined): string {
  switch (tone) {
    case "danger":
      return "ring-2 ring-crimson-500/80 shadow-[0_0_0_4px_rgba(220,38,38,0.12)]";
    case "warning":
      return "ring-2 ring-honey-500/80 shadow-[0_0_0_4px_rgba(217,119,6,0.12)]";
    case "steady":
      return "ring-2 ring-meadow-500/50 shadow-[0_0_0_4px_rgba(34,197,94,0.08)]";
    default:
      return "";
  }
}

export function worstHiveHealth(
  tones: Record<string, HiveHealthTone>
): AlertSeverity | null {
  const values = Object.values(tones);
  if (values.includes("danger")) return "danger";
  if (values.includes("warning")) return "warning";
  return null;
}

export function hiveHealthForYard(
  hives: { id: string; status: string }[],
  alerts: HiveAlert[]
): Record<string, HiveHealthTone> {
  const tones = hiveHealthById(alerts);
  for (const hive of hives) {
    if (hive.status === "active" && !tones[hive.id]) {
      tones[hive.id] = "steady";
    }
  }
  return tones;
}
