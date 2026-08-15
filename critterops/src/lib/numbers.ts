export function nextNumber(prefix: string, existing: string[]) {
  const max = existing.reduce((highest, value) => {
    const match = value.match(/(\d+)$/);
    const n = match ? Number(match[1]) : 0;
    return Math.max(highest, n);
  }, 1000);
  return `${prefix}-${max + 1}`;
}
