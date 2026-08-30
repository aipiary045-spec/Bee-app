import { EXPENSE_CATEGORY_LABELS } from "@/lib/expense-catalog";
import { REVENUE_CATEGORY_LABELS } from "@/lib/revenue-catalog";
import type { FinanceActivity } from "@/lib/finances";
import { financeCsvRows } from "@/lib/finances-csv";

export { escapeCsv } from "@/lib/finances-csv";

export function financesToCsv(activity: FinanceActivity[]): string {
  const rows = activity.map((entry) => {
    const income = entry.kind === "revenue";
    const category =
      entry.kind === "revenue"
        ? REVENUE_CATEGORY_LABELS[entry.row.category]
        : EXPENSE_CATEGORY_LABELS[entry.row.category];
    return [
      entry.date,
      entry.row.hive?.name ?? "Apiary",
      income ? "Income" : "Expense",
      category,
      entry.row.description,
      income
        ? Number(entry.row.amount).toFixed(2)
        : `-${Number(entry.row.amount).toFixed(2)}`,
    ];
  });

  return financeCsvRows(rows);
}

export function financesCsvFilename(year = new Date().getFullYear()): string {
  return `apiary-finances-${year}.csv`;
}
