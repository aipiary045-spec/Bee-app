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

import { env } from "@/lib/env";

export const DEFAULT_LOCATION = env.defaultLocation;
export const DEFAULT_LAT = env.defaultLat;
export const DEFAULT_LON = env.defaultLon;

export function getSeasonalForagingAdvice(month: number): string {
  const advice: Record<number, string> = {
    0: "Winter cluster — minimal disturbance. Check food stores on warm days above 50°F.",
    1: "Late winter — prepare for spring buildup. Monitor pollen patties if needed.",
    2: "Early spring — first inspections. Watch for swarm cells as nectar flows begin.",
    3: "Spring bloom — peak foraging in many yards. Add supers as brood expands.",
    4: "Late spring — swarm season peak. Monitor space and queen cells weekly.",
    5: "Summer solstice — honey flow active. Give ventilation on hot days.",
    6: "Mid-summer — harvest early honey. Mite counts matter before fall buildup.",
    7: "Late summer — robbing risk increases. Reduce entrances, treat for varroa.",
    8: "Early fall — late nectar flows. Final mite treatment window for many regions.",
    9: "Fall — consolidate weak colonies. Leave enough stores for winter.",
    10: "Late fall — wrap or insulate if your winters call for it. Mouse guards on.",
    11: "Winter — disturb the cluster as little as you can. Check weight on mild days.",
  };
  return advice[month] ?? "Monitor colony health and local forage conditions.";
}
