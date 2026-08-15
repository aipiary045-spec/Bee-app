export const BROOD_SCORES = {
  none: 0,
  poor: 1,
  spotty: 2,
  fair: 3,
  good: 4,
  excellent: 5,
} as const;

export type BroodPattern = keyof typeof BROOD_SCORES;

export function isBroodPattern(value: string | null | undefined): value is BroodPattern {
  return Boolean(value && value in BROOD_SCORES);
}

export function broodScore(pattern: string | null | undefined): number | null {
  if (!isBroodPattern(pattern)) return null;
  return BROOD_SCORES[pattern];
}

export function broodScoreLabel(score: number): string {
  const entry = (Object.entries(BROOD_SCORES) as [BroodPattern, number][]).find(
    ([, value]) => value === score
  );
  if (!entry) return String(score);
  return entry[0].replace("_", " ");
}

export function shortChartDate(dateISO: string): string {
  const parts = dateISO.split("-");
  if (parts.length !== 3) return dateISO;
  return `${Number(parts[1])}/${Number(parts[2])}`;
}
