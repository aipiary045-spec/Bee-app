import { listExpensesForUser, type ExpenseWithHive } from "@/lib/expenses";
import { listRevenuesForUser, type RevenueWithHive } from "@/lib/revenues";

export type FinanceActivity =
  | { kind: "expense"; id: string; date: string; createdAt: string; row: ExpenseWithHive }
  | { kind: "revenue"; id: string; date: string; createdAt: string; row: RevenueWithHive };

export type FinancesSummary = {
  ytdRevenue: number;
  ytdExpenses: number;
  ytdProfit: number;
  revenues: RevenueWithHive[];
  expenses: ExpenseWithHive[];
  activity: FinanceActivity[];
};

export async function getFinancesSummaryForUser(
  userId: string
): Promise<FinancesSummary> {
  const [expenseResult, revenueResult] = await Promise.all([
    listExpensesForUser(userId),
    listRevenuesForUser(userId),
  ]);

  const ytdRevenue = revenueResult.ytdTotal;
  const ytdExpenses = expenseResult.ytdTotal;
  const ytdProfit = ytdRevenue - ytdExpenses;

  const activity: FinanceActivity[] = [
    ...expenseResult.expenses.map((row) => ({
      kind: "expense" as const,
      id: row.id,
      date: row.date,
      createdAt: row.created_at,
      row,
    })),
    ...revenueResult.revenues.map((row) => ({
      kind: "revenue" as const,
      id: row.id,
      date: row.date,
      createdAt: row.created_at,
      row,
    })),
  ].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return {
    ytdRevenue,
    ytdExpenses,
    ytdProfit,
    revenues: revenueResult.revenues,
    expenses: expenseResult.expenses,
    activity,
  };
}
