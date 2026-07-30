import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export const DEFAULT_LOCATION = process.env.NEXT_PUBLIC_DEFAULT_LOCATION ?? "Agra, OK";
export const DEFAULT_LAT = Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 35.8942);
export const DEFAULT_LON = Number(process.env.NEXT_PUBLIC_DEFAULT_LON ?? -96.8714);

export function getSeasonalForagingAdvice(month: number): string {
  const advice: Record<number, string> = {
    0: "Winter cluster — minimal disturbance. Check food stores on warm days above 50°F.",
    1: "Late winter — prepare for spring buildup. Monitor pollen patties if needed.",
    2: "Early spring — first inspections. Watch for swarm cells as nectar flows begin.",
    3: "Spring bloom — peak foraging in Oklahoma. Add supers as brood expands.",
    4: "Late spring — swarm season peak. Monitor space and queen cells weekly.",
    5: "Summer solstice — honey flow active. Ensure adequate ventilation in Oklahoma heat.",
    6: "Mid-summer — harvest early honey. Mite counts critical before fall buildup.",
    7: "Late summer — robbing risk increases. Reduce entrances, treat for varroa.",
    8: "Early fall — goldenrod and aster flows. Final mite treatment window.",
    9: "Fall — consolidate weak colonies. Ensure 60–80 lbs stores for winter.",
    10: "Late fall — wrap hives if needed. Mouse guards on all entrances.",
    11: "Winter prep complete — monitor weight monthly. Agra avg low: 28°F.",
  };
  return advice[month] ?? "Monitor colony health and local forage conditions.";
}
