import type { Enums } from "@/types/database";

export const SPLIT_TYPE_OPTIONS: {
  value: Enums<"split_type">;
  label: string;
}[] = [
  { value: "walk_away", label: "Walk-away split" },
  { value: "nuc", label: "Nuc split" },
  { value: "combine", label: "Combine colonies" },
  { value: "swarm_caught", label: "Swarm caught" },
  { value: "other", label: "Other split / swarm" },
];

const splitLabels: Record<Enums<"split_type">, string> = {
  walk_away: "Walk-away split",
  nuc: "Nuc split",
  combine: "Combine",
  swarm_caught: "Swarm caught",
  other: "Split / swarm",
};

export function formatSplitLog(
  splitType: Enums<"split_type"> | null,
  destination: string | null
): string | null {
  if (!splitType) return null;
  const label = splitLabels[splitType];
  const dest = destination?.trim();
  return dest ? `${label} → ${dest}` : label;
}
