export const ACTIVE_YARD_COOKIE = "apiary-active-yard";

export type YardChoice = {
  id: string;
  name: string;
  location: string;
};

export function resolveActiveApiary<T extends { id: string }>(
  yards: T[],
  requestedId?: string | null
): T | null {
  if (yards.length === 0) return null;
  if (requestedId) {
    const match = yards.find((yard) => yard.id === requestedId);
    if (match) return match;
  }
  return yards[0] ?? null;
}

export function yardSkyClass(condition?: string | null): string {
  const key = (condition ?? "").toLowerCase();
  if (key.includes("rain")) {
    return "from-[#6f8498] via-[#c5d0d4] to-[#5a7a48] dark:from-[#1a2430] dark:via-[#243040] dark:to-[#24361c]";
  }
  if (key.includes("overcast") || key === "cloudy") {
    return "from-[#9aa8b4] via-[#d5dde0] to-[#6a9a4a] dark:from-[#222830] dark:via-[#2a3038] dark:to-[#2d4a24]";
  }
  if (key.includes("partly") || key.includes("wind")) {
    return "from-[#7eb4d8] via-[#d3e6ef] to-[#7bb85a] dark:from-[#1b2838] dark:via-[#2a2618] dark:to-[#2d4a24]";
  }
  return "from-[#8ec8ef] via-[#d7eef6] to-[#7bb85a] dark:from-[#1b2438] dark:via-[#2a2618] dark:to-[#2d4a24]";
}

export function toYardChoice(yard: {
  id: string;
  name: string;
  location?: string | null;
}): YardChoice {
  return {
    id: yard.id,
    name: yard.name,
    location: yard.location?.trim() ?? "",
  };
}
