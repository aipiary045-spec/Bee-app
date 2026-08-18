import type { Enums, Tables } from "@/types/database";

export type InspectionLog = Tables<"inspections">;

export type InspectionSummaryInput = Pick<
  InspectionLog,
  | "queen_sighted"
  | "mite_count_per_100"
  | "action_fed"
  | "action_split"
  | "action_treatment"
  | "medium_added"
  | "medium_removed"
  | "shallow_added"
  | "shallow_removed"
  | "supers_added"
  | "supers_removed"
  | "super_count_after"
>;

export type InspectionFieldOption<T extends string> = {
  value: T;
  label: string;
};

export const WEATHER_OPTIONS = [
  "Sunny",
  "Partly Cloudy",
  "Cloudy",
  "Windy",
  "Light Rain",
  "Overcast",
] as const;

export const QUEEN_SIGHTED_OPTIONS: InspectionFieldOption<
  Enums<"queen_sighted">
>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "uncertain", label: "Uncertain" },
];

export const QUEEN_MARK_OPTIONS: InspectionFieldOption<
  Enums<"queen_mark_color">
>[] = [
  { value: "unmarked", label: "Unmarked" },
  { value: "white", label: "White" },
  { value: "yellow", label: "Yellow" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
];

export const EGGS_LARVAE_OPTIONS: InspectionFieldOption<
  Enums<"eggs_larvae_status">
>[] = [
  { value: "eggs_and_larvae", label: "Eggs & Larvae" },
  { value: "eggs_only", label: "Eggs Only" },
  { value: "larvae_only", label: "Larvae Only" },
  { value: "none_observed", label: "None Seen" },
];

export const BROOD_OPTIONS: InspectionFieldOption<Enums<"brood_pattern">>[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "spotty", label: "Spotty" },
  { value: "poor", label: "Poor" },
  { value: "none", label: "None" },
];

export const TEMPERAMENT_OPTIONS: InspectionFieldOption<
  Enums<"temperament">
>[] = [
  { value: "calm", label: "Calm" },
  { value: "moderate", label: "Moderate" },
  { value: "defensive", label: "Nervous" },
  { value: "aggressive", label: "Aggressive" },
];

export const STORE_OPTIONS: InspectionFieldOption<Enums<"store_level">>[] = [
  { value: "empty", label: "Empty" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "good", label: "Good" },
  { value: "full", label: "Full" },
];

export const PEST_OPTIONS: InspectionFieldOption<Enums<"pest_disease">>[] = [
  { value: "none", label: "None" },
  { value: "varroa", label: "Varroa" },
  { value: "chalkbrood", label: "Chalkbrood" },
  { value: "foulbrood_suspect", label: "Foulbrood?" },
  { value: "wax_moth", label: "Wax Moth" },
  { value: "ants", label: "Ants" },
  { value: "other", label: "Other" },
];

export type ParsedInspectionNumbers =
  | {
      ok: true;
      temperatureF: number | null;
      miteCountPer100: number | null;
      mediumAdded: number;
      mediumRemoved: number;
      shallowAdded: number;
      shallowRemoved: number;
    }
  | { ok: false; error: string };

export type MiteSyncPlan =
  | { type: "none" }
  | { type: "insert"; count: number; date: string }
  | { type: "update"; count: number; date: string }
  | { type: "delete" };

export function optionLabel<T extends string>(
  options: InspectionFieldOption<T>[],
  value: T | null | undefined
): string {
  if (!value) return "—";
  return options.find((option) => option.value === value)?.label ?? value;
}

export function formatInspectionTime(
  value: string | null | undefined
): string {
  if (!value) return "";
  return value.slice(0, 5);
}

function formatSuperCount(count: number): string {
  return count === 1 ? "1 super" : `${count} supers`;
}

function formatSuperChange(added: number, removed: number): string {
  if (added > 0 && removed > 0) {
    return `Added ${added}, removed ${removed}`;
  }
  if (added > 0) {
    return added === 1 ? "Added 1 super" : `Added ${added} supers`;
  }
  if (removed > 0) {
    return removed === 1 ? "Removed 1 super" : `Removed ${removed} supers`;
  }
  return "No super change";
}

function typedBoxPart(
  count: number,
  verb: "Added" | "Pulled",
  type: "medium" | "shallow"
): string | null {
  if (count <= 0) return null;
  const label = count === 1 ? `1 ${type}` : `${count} ${type}`;
  return `${verb} ${label}`;
}

function formatTypedSuperChange(inspection: InspectionSummaryInput): string {
  const parts = [
    typedBoxPart(inspection.medium_added ?? 0, "Added", "medium"),
    typedBoxPart(inspection.shallow_added ?? 0, "Added", "shallow"),
    typedBoxPart(inspection.medium_removed ?? 0, "Pulled", "medium"),
    typedBoxPart(inspection.shallow_removed ?? 0, "Pulled", "shallow"),
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : "No super change";
}

export function inspectionSummary(inspection: InspectionSummaryInput): string {
  const parts: string[] = [];
  const typed = formatTypedSuperChange(inspection);
  if (typed !== "No super change") {
    parts.push(typed);
    if (inspection.super_count_after != null) {
      parts.push(`now ${formatSuperCount(inspection.super_count_after)}`);
    }
  } else {
    const added = inspection.supers_added ?? 0;
    const removed = inspection.supers_removed ?? 0;
    if (added > 0 || removed > 0) {
      parts.push(formatSuperChange(added, removed));
      if (inspection.super_count_after != null) {
        parts.push(`now ${formatSuperCount(inspection.super_count_after)}`);
      }
    }
  }
  if (inspection.action_fed) parts.push("Fed");
  if (inspection.action_split) parts.push("Split");
  if (inspection.action_treatment) parts.push("Treated");
  if (inspection.queen_sighted === "yes") parts.push("Queen seen");
  if (inspection.mite_count_per_100 != null) {
    parts.push(`${inspection.mite_count_per_100} mites / 100`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Inspection logged";
}

export function filterLogsByHive<T extends { hive_id: string }>(
  logs: T[],
  hiveId: string | null | undefined
): T[] {
  const selected = hiveId?.trim();
  if (!selected) return logs;
  return logs.filter((log) => log.hive_id === selected);
}

export function groupLogsByDate<T extends { date: string }>(
  logs: T[]
): { date: string; logs: T[] }[] {
  const groups: { date: string; logs: T[] }[] = [];
  for (const log of logs) {
    const last = groups[groups.length - 1];
    if (last && last.date === log.date) {
      last.logs.push(log);
    } else {
      groups.push({ date: log.date, logs: [log] });
    }
  }
  return groups;
}

export function parseCount(value: string, label: string): number | { error: string } {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  const count = Number(trimmed);
  if (!Number.isInteger(count) || count < 0) {
    return { error: `Enter a whole number for ${label}.` };
  }
  return count;
}

export function parseInspectionNumbers(input: {
  temperatureF: string;
  miteCountPer100: string;
  mediumAdded: string | number;
  mediumRemoved: string | number;
  shallowAdded: string | number;
  shallowRemoved: string | number;
}): ParsedInspectionNumbers {
  const temperatureF =
    input.temperatureF.trim() === "" ? null : Number(input.temperatureF);
  if (temperatureF !== null && Number.isNaN(temperatureF)) {
    return { ok: false, error: "Enter a valid temperature." };
  }

  const miteCountPer100 =
    input.miteCountPer100.trim() === ""
      ? null
      : Number(input.miteCountPer100);
  if (
    miteCountPer100 !== null &&
    (Number.isNaN(miteCountPer100) || miteCountPer100 < 0)
  ) {
    return { ok: false, error: "Enter a valid mite count (0 or greater)." };
  }

  const mediumAdded = parseCount(String(input.mediumAdded), "medium added");
  if (typeof mediumAdded === "object") return { ok: false, error: mediumAdded.error };
  const mediumRemoved = parseCount(
    String(input.mediumRemoved),
    "medium pulled"
  );
  if (typeof mediumRemoved === "object") {
    return { ok: false, error: mediumRemoved.error };
  }
  const shallowAdded = parseCount(String(input.shallowAdded), "shallow added");
  if (typeof shallowAdded === "object") {
    return { ok: false, error: shallowAdded.error };
  }
  const shallowRemoved = parseCount(
    String(input.shallowRemoved),
    "shallow pulled"
  );
  if (typeof shallowRemoved === "object") {
    return { ok: false, error: shallowRemoved.error };
  }

  return {
    ok: true,
    temperatureF,
    miteCountPer100,
    mediumAdded,
    mediumRemoved,
    shallowAdded,
    shallowRemoved,
  };
}

export function miteCountFromCheck(
  checked: boolean,
  count: string
): { ok: true; value: string } | { ok: false; error: string } {
  if (!checked) return { ok: true, value: "" };
  const trimmed = count.trim();
  if (trimmed === "") {
    return { ok: false, error: "Enter the mite count per 100 bees." };
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed) || parsed < 0) {
    return { ok: false, error: "Enter a valid mite count (0 or greater)." };
  }
  return { ok: true, value: trimmed };
}

export function miteCountSyncPlan(input: {
  nextCount: number | null;
  date: string;
  hasLinkedRow: boolean;
}): MiteSyncPlan {
  if (input.nextCount === null) {
    return input.hasLinkedRow ? { type: "delete" } : { type: "none" };
  }
  if (input.hasLinkedRow) {
    return { type: "update", count: input.nextCount, date: input.date };
  }
  return { type: "insert", count: input.nextCount, date: input.date };
}

export function shouldKeepQueenLog(
  queenSighted: Enums<"queen_sighted"> | null | undefined,
  queenMarkColor: Enums<"queen_mark_color"> | null | undefined
): boolean {
  return queenSighted === "yes" || queenMarkColor !== "unmarked";
}

export function resolveQueenSighted(
  inspection: Pick<InspectionLog, "queen_sighted" | "queen_spotted">
): Enums<"queen_sighted"> {
  if (inspection.queen_sighted) return inspection.queen_sighted;
  return inspection.queen_spotted ? "yes" : "no";
}

export function weatherSelectOptions(current: string | null | undefined): string[] {
  const weather = current?.trim() || "Sunny";
  return WEATHER_OPTIONS.includes(weather as (typeof WEATHER_OPTIONS)[number])
    ? [...WEATHER_OPTIONS]
    : [...WEATHER_OPTIONS, weather];
}
