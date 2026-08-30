export const QUEEN_AGE_WARNING_MONTHS = 18;

export function queenAgeMonths(
  introducedDate: string,
  today: Date = new Date()
): number {
  const [year, month, day] = introducedDate.split("-").map(Number);
  if (!year || !month || !day) return 0;
  const introduced = new Date(year, month - 1, day);
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const months =
    (now.getFullYear() - introduced.getFullYear()) * 12 +
    (now.getMonth() - introduced.getMonth());
  return introduced.getDate() > now.getDate() ? Math.max(0, months - 1) : months;
}

export function formatQueenAge(introducedDate: string, today?: Date): string {
  const months = queenAgeMonths(introducedDate, today);
  if (months < 1) return "Less than 1 month";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (remainder === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years}y ${remainder}mo`;
}

export function isQueenAging(
  introducedDate: string | null,
  today: Date = new Date()
): boolean {
  if (!introducedDate) return false;
  return queenAgeMonths(introducedDate, today) >= QUEEN_AGE_WARNING_MONTHS;
}

export function shouldUpdateQueenIntroduced(
  status: string
): boolean {
  return status === "replaced" || status === "laying" || status === "marked";
}

const MARK_YEAR_DIGITS: Record<string, number[]> = {
  white: [1, 6],
  yellow: [2, 7],
  red: [3, 8],
  green: [4, 9],
  blue: [5, 0],
};

export function inferQueenMarkYear(
  markColor: string,
  referenceYear: number = new Date().getFullYear()
): number | null {
  const digits = MARK_YEAR_DIGITS[markColor];
  if (!digits) return null;

  let best: number | null = null;
  for (let year = referenceYear; year >= referenceYear - 9; year -= 1) {
    if (digits.includes(year % 10)) {
      best = year;
      break;
    }
  }
  return best;
}

export function formatQueenMarkYear(
  markColor: string,
  referenceYear?: number
): string | null {
  const year = inferQueenMarkYear(markColor, referenceYear);
  return year ? `Marked for ${year}` : null;
}
