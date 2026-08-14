export const MAX_SUPERS = 12;

export type SuperChangeResult =
  | { ok: true; next: number }
  | { ok: false; error: string };

export function clampSuperCount(count: number): number {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.min(MAX_SUPERS, Math.trunc(count)));
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

export function nextSuperCount(current: number, delta: number): number {
  const { added, removed } = splitSuperDelta(delta);
  const result = applySuperChange(clampSuperCount(current), added, removed);
  return result.ok ? result.next : clampSuperCount(current);
}

export function formatSuperCount(count: number): string {
  const safe = clampSuperCount(count);
  return safe === 1 ? "1 super" : `${safe} supers`;
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
