import type { Tables } from "@/types/database";
import {
  formatSuperChange,
  formatSuperCount,
  formatTypedSuperChange,
} from "@/lib/supers";

type Inspection = Tables<"inspections">;

const queenSightedLabels = {
  yes: "Queen seen",
  no: "Queen not seen",
  uncertain: "Queen uncertain",
} as const;

const queenMarkLabels = {
  white: "White mark",
  yellow: "Yellow mark",
  red: "Red mark",
  green: "Green mark",
  blue: "Blue mark",
  unmarked: "Unmarked",
} as const;

const eggsLarvaeLabels = {
  eggs_and_larvae: "Eggs and larvae",
  eggs_only: "Eggs only",
  larvae_only: "Larvae only",
  none_observed: "No eggs or larvae seen",
} as const;

const broodLabels = {
  excellent: "Brood: excellent",
  good: "Brood: good",
  fair: "Brood: fair",
  spotty: "Brood: spotty",
  poor: "Brood: poor",
  none: "Brood: none",
} as const;

const temperamentLabels = {
  calm: "Temperament: calm",
  moderate: "Temperament: moderate",
  defensive: "Temperament: nervous",
  aggressive: "Temperament: aggressive",
} as const;

const storeLabels = {
  empty: "empty",
  low: "low",
  moderate: "moderate",
  good: "good",
  full: "full",
} as const;

const pestLabels = {
  none: "Pests: none noted",
  varroa: "Pests: varroa",
  chalkbrood: "Pests: chalkbrood",
  foulbrood_suspect: "Pests: foulbrood suspect",
  wax_moth: "Pests: wax moth",
  ants: "Pests: ants",
  other: "Pests: other",
} as const;

export function formatVisitTime(time: string | null): string | null {
  if (!time) return null;
  const match = time.match(/^(\d{2}):(\d{2})/);
  if (!match) return time;
  const hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
}

function formatSuperVisit(inspection: Inspection): string | null {
  const typed = formatTypedSuperChange({
    mediumAdded: inspection.medium_added ?? 0,
    mediumRemoved: inspection.medium_removed ?? 0,
    shallowAdded: inspection.shallow_added ?? 0,
    shallowRemoved: inspection.shallow_removed ?? 0,
  });

  if (typed !== "No super change") {
    return inspection.super_count_after != null
      ? `${typed} · now ${formatSuperCount(inspection.super_count_after)}`
      : typed;
  }

  const added = inspection.supers_added ?? 0;
  const removed = inspection.supers_removed ?? 0;
  if (added === 0 && removed === 0) return null;

  const change = formatSuperChange(added, removed);
  return inspection.super_count_after != null
    ? `${change} · now ${formatSuperCount(inspection.super_count_after)}`
    : change;
}

export function formatInspectionVisitHeading(inspection: Inspection): string {
  const time = formatVisitTime(inspection.inspection_time);
  return time ? `${inspection.date} · ${time}` : inspection.date;
}

export function formatInspectionLogLines(inspection: Inspection): string[] {
  const lines: string[] = [];

  if (inspection.weather) {
    lines.push(
      inspection.temperature_f != null
        ? `Weather: ${inspection.weather} · ${inspection.temperature_f}°F`
        : `Weather: ${inspection.weather}`
    );
  } else if (inspection.temperature_f != null) {
    lines.push(`Temperature: ${inspection.temperature_f}°F`);
  }

  const superLine = formatSuperVisit(inspection);
  if (superLine) lines.push(superLine);

  if (inspection.queen_sighted) {
    lines.push(queenSightedLabels[inspection.queen_sighted]);
  }

  if (
    inspection.queen_mark_color &&
    inspection.queen_mark_color !== "unmarked"
  ) {
    lines.push(queenMarkLabels[inspection.queen_mark_color]);
  }

  if (inspection.eggs_larvae) {
    lines.push(eggsLarvaeLabels[inspection.eggs_larvae]);
  }

  if (inspection.brood_pattern) {
    lines.push(broodLabels[inspection.brood_pattern]);
  }

  if (inspection.temperament) {
    lines.push(temperamentLabels[inspection.temperament]);
  }

  if (inspection.honey_stores) {
    lines.push(`Honey stores: ${storeLabels[inspection.honey_stores]}`);
  }

  if (inspection.pollen_stores) {
    lines.push(`Pollen stores: ${storeLabels[inspection.pollen_stores]}`);
  }

  if (inspection.mite_count_per_100 != null) {
    lines.push(`Mites: ${inspection.mite_count_per_100} per 100 bees`);
  }

  if (inspection.pests_diseases && inspection.pests_diseases !== "none") {
    lines.push(pestLabels[inspection.pests_diseases]);
  }

  const actions: string[] = [];
  if (inspection.action_fed) actions.push("Fed");
  if (inspection.action_split) actions.push("Split");
  if (inspection.action_treatment) actions.push("Treated");
  if (actions.length > 0) {
    lines.push(`Actions: ${actions.join(", ")}`);
  }

  if (lines.length === 0) {
    lines.push("Inspection logged");
  }

  return lines;
}
