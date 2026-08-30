import type { Enums } from "@/types/database";

export const MITE_METHOD_OPTIONS: {
  value: Enums<"mite_method">;
  label: string;
  countLabel: string;
}[] = [
  {
    value: "alcohol_wash",
    label: "Alcohol wash",
    countLabel: "Mites per 100 bees",
  },
  {
    value: "sugar_roll",
    label: "Sugar roll",
    countLabel: "Mites per 100 bees",
  },
  {
    value: "sticky_board",
    label: "Sticky board",
    countLabel: "Mite count (24 hr board)",
  },
];

const methodLabels: Record<Enums<"mite_method">, string> = {
  alcohol_wash: "Alcohol wash",
  sugar_roll: "Sugar roll",
  sticky_board: "Sticky board",
};

export function formatMiteCountLine(
  count: number,
  method: Enums<"mite_method"> | null
): string {
  const label = method ? methodLabels[method] : "Quick Log";
  if (method === "sticky_board") {
    return `Mites (${label}): ${count}`;
  }
  return `Mites (${label}): ${count} per 100 bees`;
}
