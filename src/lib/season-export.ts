import type { SeasonSnapshot } from "./season-snapshot";
import type { SeasonMetricDelta } from "./season-compare";

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function seasonToCsv(
  snapshot: SeasonSnapshot,
  comparison: SeasonMetricDelta[] = []
): string {
  const rows: string[][] = [
    ["Metric", `${snapshot.year} value`, "Prior year", "Change"],
  ];

  for (const metric of comparison) {
    rows.push([
      metric.label,
      formatValue(metric.current),
      formatValue(metric.prior),
      metric.delta == null ? "" : String(metric.delta),
    ]);
  }

  if (comparison.length === 0) {
    rows.push(
      ["Visits logged", String(snapshot.inspectionCount), "", ""],
      ["Treatments", String(snapshot.treatmentCount), "", ""],
      ["Splits / swarms", String(snapshot.splitCount), "", ""],
      ["Honey pulled (lbs)", String(snapshot.harvestLbs), "", ""],
      [
        "Avg mites / 100",
        snapshot.avgMitePer100 == null ? "" : String(snapshot.avgMitePer100),
        "",
        "",
      ]
    );
  }

  return rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
}

function formatValue(value: number | null): string {
  if (value == null) return "";
  return String(value);
}

export function seasonCsvFilename(year = new Date().getFullYear()): string {
  return `apiary-season-${year}.csv`;
}
