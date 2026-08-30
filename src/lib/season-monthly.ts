const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type MonthlySeasonPoint = {
  month: number;
  label: string;
  visits: number;
  harvestLbs: number;
};

export function emptyMonthlyBuckets(): { visits: number[]; harvestLbs: number[] } {
  return {
    visits: Array.from({ length: 12 }, () => 0),
    harvestLbs: Array.from({ length: 12 }, () => 0),
  };
}

export function monthIndexFromDate(date: string): number | null {
  const month = Number(date.slice(5, 7));
  if (!Number.isFinite(month) || month < 1 || month > 12) return null;
  return month - 1;
}

export function buildMonthlySeasonPoints(
  visitsByMonth: number[],
  harvestByMonth: number[]
): MonthlySeasonPoint[] {
  return MONTH_LABELS.map((label, index) => ({
    month: index + 1,
    label,
    visits: visitsByMonth[index] ?? 0,
    harvestLbs: Math.round((harvestByMonth[index] ?? 0) * 10) / 10,
  }));
}

export function peakMonth(
  points: MonthlySeasonPoint[],
  field: "visits" | "harvestLbs"
): MonthlySeasonPoint | null {
  const best = points.reduce<MonthlySeasonPoint | null>((winner, point) => {
    if (!winner || point[field] > winner[field]) return point;
    return winner;
  }, null);
  return best && best[field] > 0 ? best : null;
}
