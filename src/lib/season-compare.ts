import type { SeasonSnapshot } from "./season-snapshot";

export type SeasonMetricKey =
  | "inspectionCount"
  | "treatmentCount"
  | "splitCount"
  | "harvestLbs"
  | "avgMitePer100";

export type SeasonMetricDelta = {
  key: SeasonMetricKey;
  label: string;
  current: number | null;
  prior: number | null;
  delta: number | null;
  improved: boolean | null;
};

const METRICS: { key: SeasonMetricKey; label: string; lowerIsBetter?: boolean }[] = [
  { key: "inspectionCount", label: "Visits logged" },
  { key: "treatmentCount", label: "Treatments" },
  { key: "splitCount", label: "Splits / swarms" },
  { key: "harvestLbs", label: "Honey pulled (lbs)" },
  { key: "avgMitePer100", label: "Avg mites / 100", lowerIsBetter: true },
];

function metricValue(
  snapshot: SeasonSnapshot,
  key: SeasonMetricKey
): number | null {
  const value = snapshot[key];
  return typeof value === "number" ? value : null;
}

export function buildSeasonComparison(
  current: SeasonSnapshot,
  prior: SeasonSnapshot | null
): SeasonMetricDelta[] {
  return METRICS.map(({ key, label, lowerIsBetter }) => {
    const currentValue = metricValue(current, key);
    const priorValue = prior ? metricValue(prior, key) : null;
    const delta =
      currentValue != null && priorValue != null
        ? Math.round((currentValue - priorValue) * 10) / 10
        : null;
    let improved: boolean | null = null;
    if (delta != null && delta !== 0) {
      improved = lowerIsBetter ? delta < 0 : delta > 0;
    }
    return {
      key,
      label,
      current: currentValue,
      prior: priorValue,
      delta,
      improved,
    };
  });
}

export function formatSeasonDelta(delta: number | null): string {
  if (delta == null) return "—";
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function hasMeaningfulPriorSeason(
  prior: SeasonSnapshot | null | undefined
): boolean {
  if (!prior) return false;
  return (
    prior.inspectionCount > 0 ||
    prior.treatmentCount > 0 ||
    prior.splitCount > 0 ||
    prior.harvestLbs > 0 ||
    prior.avgMitePer100 != null
  );
}
