export const MAX_SUPERS = 12;

export type SuperType = "medium" | "shallow";

export type SuperInventory = {
  medium: number;
  shallow: number;
};

export type SuperVisitChange = {
  mediumAdded: number;
  mediumRemoved: number;
  shallowAdded: number;
  shallowRemoved: number;
};

export type SuperChangeResult =
  | { ok: true; next: number }
  | { ok: false; error: string };

export type TypedSuperChangeResult =
  | { ok: true; next: SuperInventory; total: number }
  | { ok: false; error: string };

export function clampSuperCount(count: number): number {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.min(MAX_SUPERS, Math.trunc(count)));
}

export function emptySuperChange(): SuperVisitChange {
  return {
    mediumAdded: 0,
    mediumRemoved: 0,
    shallowAdded: 0,
    shallowRemoved: 0,
  };
}

export function totalSupers(inventory: SuperInventory): number {
  return clampSuperCount(inventory.medium) + clampSuperCount(inventory.shallow);
}

export function hiveSuperInventory(hive: {
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

export function splitSuperDelta(delta: number): {
  added: number;
  removed: number;
} {
  const whole = Number.isFinite(delta) ? Math.trunc(delta) : 0;
  if (whole > 0) return { added: whole, removed: 0 };
  if (whole < 0) return { added: 0, removed: -whole };
  return { added: 0, removed: 0 };
}

export function applySuperChange(
  current: number,
  added: number,
  removed: number
): SuperChangeResult {
  if (!Number.isInteger(current) || current < 0) {
    return { ok: false, error: "Current super count is invalid." };
  }
  if (!Number.isInteger(added) || added < 0 || !Number.isInteger(removed) || removed < 0) {
    return { ok: false, error: "Super changes must be whole numbers of 0 or more." };
  }
  if (added > MAX_SUPERS || removed > MAX_SUPERS) {
    return {
      ok: false,
      error: `A hive can have at most ${MAX_SUPERS} supers.`,
    };
  }

  const next = current + added - removed;
  if (next < 0) {
    return {
      ok: false,
      error: "Cannot remove more supers than the hive currently has.",
    };
  }
  if (next > MAX_SUPERS) {
    return {
      ok: false,
      error: `A hive can have at most ${MAX_SUPERS} supers.`,
    };
  }
  return { ok: true, next };
}

function isWholeCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function applyTypedSuperChange(
  current: SuperInventory,
  change: SuperVisitChange
): TypedSuperChangeResult {
  if (!isWholeCount(current.medium) || !isWholeCount(current.shallow)) {
    return { ok: false, error: "Current super counts are invalid." };
  }
  if (
    !isWholeCount(change.mediumAdded) ||
    !isWholeCount(change.mediumRemoved) ||
    !isWholeCount(change.shallowAdded) ||
    !isWholeCount(change.shallowRemoved)
  ) {
    return { ok: false, error: "Super changes must be whole numbers of 0 or more." };
  }
  if (
    change.mediumAdded > MAX_SUPERS ||
    change.mediumRemoved > MAX_SUPERS ||
    change.shallowAdded > MAX_SUPERS ||
    change.shallowRemoved > MAX_SUPERS
  ) {
    return {
      ok: false,
      error: `A hive can have at most ${MAX_SUPERS} supers.`,
    };
  }
  if (change.mediumRemoved > current.medium) {
    return {
      ok: false,
      error: "Cannot pull more medium supers than the hive currently has.",
    };
  }
  if (change.shallowRemoved > current.shallow) {
    return {
      ok: false,
      error: "Cannot pull more shallow supers than the hive currently has.",
    };
  }

  const next = {
    medium: current.medium + change.mediumAdded - change.mediumRemoved,
    shallow: current.shallow + change.shallowAdded - change.shallowRemoved,
  };
  const total = next.medium + next.shallow;
  if (total > MAX_SUPERS) {
    return {
      ok: false,
      error: `A hive can have at most ${MAX_SUPERS} supers.`,
    };
  }
  return { ok: true, next, total };
}

export function nextInventory(
  current: SuperInventory,
  change: SuperVisitChange
): SuperInventory {
  const result = applyTypedSuperChange(current, change);
  return result.ok ? result.next : current;
}

export function canAddSuper(
  current: SuperInventory,
  change: SuperVisitChange
): boolean {
  const preview = nextInventory(current, change);
  return preview.medium + preview.shallow < MAX_SUPERS;
}

export function canRemoveSuper(
  current: SuperInventory,
  change: SuperVisitChange,
  type: SuperType
): boolean {
  const remaining =
    type === "medium"
      ? current.medium - change.mediumRemoved
      : current.shallow - change.shallowRemoved;
  return remaining > 0;
}

export function nextSuperCount(current: number, delta: number): number {
  const { added, removed } = splitSuperDelta(delta);
  const result = applySuperChange(clampSuperCount(current), added, removed);
  return result.ok ? result.next : clampSuperCount(current);
}

export function formatSuperCount(count: number): string {
  const safe = clampSuperCount(count);
  return safe === 1 ? "1 super" : `${safe} supers`;
}

export function formatSuperTypeCount(count: number, type: SuperType): string {
  const safe = clampSuperCount(count);
  const label = type === "medium" ? "medium" : "shallow";
  return safe === 1 ? `1 ${label}` : `${safe} ${label}`;
}

export function formatSuperInventory(inventory: SuperInventory): string {
  const medium = clampSuperCount(inventory.medium);
  const shallow = clampSuperCount(inventory.shallow);
  if (medium === 0 && shallow === 0) return "0 supers";
  if (shallow === 0) return formatSuperTypeCount(medium, "medium");
  if (medium === 0) return formatSuperTypeCount(shallow, "shallow");
  return `${formatSuperTypeCount(medium, "medium")} · ${formatSuperTypeCount(shallow, "shallow")}`;
}

export function formatSuperChange(added: number, removed: number): string {
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

function changePart(count: number, verb: "Added" | "Pulled", type: SuperType): string | null {
  if (count <= 0) return null;
  return `${verb} ${formatSuperTypeCount(count, type)}`;
}

export function formatTypedSuperChange(change: SuperVisitChange): string {
  const parts = [
    changePart(change.mediumAdded, "Added", "medium"),
    changePart(change.shallowAdded, "Added", "shallow"),
    changePart(change.mediumRemoved, "Pulled", "medium"),
    changePart(change.shallowRemoved, "Pulled", "shallow"),
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : "No super change";
}

export function hasSuperChange(change: SuperVisitChange): boolean {
  return (
    change.mediumAdded > 0 ||
    change.mediumRemoved > 0 ||
    change.shallowAdded > 0 ||
    change.shallowRemoved > 0
  );
}
