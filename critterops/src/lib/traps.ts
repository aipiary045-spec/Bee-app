export const TRAP_TYPES = [
  "live_box",
  "leghold",
  "body_grip",
  "snare",
  "one_way_door",
  "exclusion_material",
] as const;

export const TRAP_STATUSES = [
  "in_stock",
  "deployed",
  "needs_check",
  "captured",
  "pulled",
  "retired",
] as const;

const CHECK_WINDOW_MS = 24 * 60 * 60 * 1000;

export function hoursSinceCheck(lastCheckedAt: Date | null | undefined, now = new Date()) {
  if (!lastCheckedAt) return Number.POSITIVE_INFINITY;
  return (now.getTime() - lastCheckedAt.getTime()) / (60 * 60 * 1000);
}

export function trapNeedsCheck(
  status: string,
  lastCheckedAt: Date | null | undefined,
  now = new Date()
) {
  if (status !== "deployed" && status !== "needs_check" && status !== "captured") {
    return false;
  }
  return hoursSinceCheck(lastCheckedAt, now) >= 24;
}

export function nextCheckDue(lastCheckedAt: Date | null | undefined) {
  if (!lastCheckedAt) return new Date();
  return new Date(lastCheckedAt.getTime() + CHECK_WINDOW_MS);
}

export function trapLabel(serialNumber: string, locationNote?: string | null, species?: string | null) {
  const bits = [serialNumber];
  if (locationNote) bits.push(locationNote);
  if (species) bits.push(species);
  return bits.join(" · ");
}
