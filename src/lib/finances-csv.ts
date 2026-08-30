export function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function financeCsvRows(
  rows: string[][]
): string {
  const header = ["Date", "Hive", "Flow", "Category", "Description", "Amount"];
  return [
    header.join(","),
    ...rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")),
  ].join("\n");
}
