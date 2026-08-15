export const HIVE_STACKS_START = "<!--hive-stacks:";
export const HIVE_STACKS_END = "-->";
const MAX_SUPERS = 12;

export type SuperInventory = {
  medium: number;
  shallow: number;
};

export type HiveStackMap = Record<string, SuperInventory>;

function clampSuperCount(count: number): number {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.min(MAX_SUPERS, Math.trunc(count)));
}

function inventoryFromHive(hive: {
  super_count?: number | null;
  medium_count?: number | null;
  shallow_count?: number | null;
}): SuperInventory {
  const medium = hive.medium_count;
  const shallow = hive.shallow_count;
  if (typeof medium === "number" && typeof shallow === "number") {
    return {
      medium: clampSuperCount(medium),
      shallow: clampSuperCount(shallow),
    };
  }
  return {
    medium: clampSuperCount(hive.super_count ?? 0),
    shallow: 0,
  };
}

export function isMissingColumnError(
  error: { message?: string } | string | null | undefined
): boolean {
  const message = typeof error === "string" ? error : error?.message ?? "";
  return (
    /column .* does not exist/i.test(message) ||
    /Could not find the ['"][^'"]+['"] column/i.test(message) ||
    /Could not find the .+ column of/i.test(message)
  );
}

export function parseHiveStacksFromDescription(description: string | null | undefined): {
  text: string;
  stacks: HiveStackMap;
} {
  if (!description) return { text: "", stacks: {} };

  const start = description.indexOf(HIVE_STACKS_START);
  if (start === -1) return { text: description, stacks: {} };

  const end = description.indexOf(HIVE_STACKS_END, start);
  if (end === -1) return { text: description, stacks: {} };

  const json = description.slice(start + HIVE_STACKS_START.length, end);
  const stacks: HiveStackMap = {};
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [hiveId, value] of Object.entries(parsed)) {
        if (!value || typeof value !== "object") continue;
        const row = value as { medium?: unknown; shallow?: unknown };
        stacks[hiveId] = {
          medium: clampSuperCount(Number(row.medium ?? 0)),
          shallow: clampSuperCount(Number(row.shallow ?? 0)),
        };
      }
    }
  } catch {
    // Keep the visible description even if the hidden payload is corrupt.
  }

  const text = (
    description.slice(0, start) + description.slice(end + HIVE_STACKS_END.length)
  ).trim();
  return { text, stacks };
}

export function writeHiveStacksToDescription(
  text: string,
  stacks: HiveStackMap
): string {
  const cleaned: HiveStackMap = {};
  for (const [hiveId, inventory] of Object.entries(stacks)) {
    if (!hiveId) continue;
    const medium = clampSuperCount(inventory.medium);
    const shallow = clampSuperCount(inventory.shallow);
    if (medium === 0 && shallow === 0) continue;
    cleaned[hiveId] = { medium, shallow };
  }

  const base = text.trim();
  if (Object.keys(cleaned).length === 0) return base;

  const payload = `${HIVE_STACKS_START}${JSON.stringify(cleaned)}${HIVE_STACKS_END}`;
  return base ? `${base}\n${payload}` : payload;
}

export function resolveHiveInventory(
  hive: {
    id?: string;
    super_count?: number | null;
    medium_count?: number | null;
    shallow_count?: number | null;
  },
  sidecar?: SuperInventory | null
): SuperInventory {
  const fromColumns = inventoryFromHive(hive);
  if (fromColumns.medium > 0 || fromColumns.shallow > 0) {
    return fromColumns;
  }
  if (sidecar) {
    return {
      medium: clampSuperCount(sidecar.medium),
      shallow: clampSuperCount(sidecar.shallow),
    };
  }
  return fromColumns;
}

export function withResolvedStack<
  T extends {
    id: string;
    super_count?: number | null;
    medium_count?: number | null;
    shallow_count?: number | null;
  },
>(hive: T, stacks: HiveStackMap): T & {
  super_count: number;
  medium_count: number;
  shallow_count: number;
} {
  const inventory = resolveHiveInventory(hive, stacks[hive.id]);
  return {
    ...hive,
    medium_count: inventory.medium,
    shallow_count: inventory.shallow,
    super_count: inventory.medium + inventory.shallow,
  };
}

export function attachStacksToHives<
  T extends {
    id: string;
    super_count?: number | null;
    medium_count?: number | null;
    shallow_count?: number | null;
  },
>(
  apiary: { description?: string | null },
  hives: T[]
): Array<
  T & {
    super_count: number;
    medium_count: number;
    shallow_count: number;
  }
> {
  const { stacks } = parseHiveStacksFromDescription(apiary.description);
  return hives.map((hive) => withResolvedStack(hive, stacks));
}
