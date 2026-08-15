import { createClient } from "@/lib/supabase/server";
import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/expense-catalog";
import { getActiveApiary } from "@/lib/hives";
import type { Tables } from "@/types/database";

export type Expense = Tables<"expenses">;
export type { ExpenseCategory };
export { EXPENSE_CATEGORY_LABELS };

export type ExpenseWithHive = Expense & {
  hive: { id: string; name: string } | null;
};

export type ExpenseCategoryTotal = {
  category: ExpenseCategory;
  amount: number;
  count: number;
};

export async function listExpensesForUser(userId: string): Promise<{
  apiaryId: string;
  expenses: ExpenseWithHive[];
  ytdTotal: number;
  byCategory: ExpenseCategoryTotal[];
}> {
  const apiary = await getActiveApiary(userId);
  const supabase = await createClient();
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const { data, error } = await supabase
    .from("expenses")
    .select("*, hive:hives(id, name)")
    .eq("apiary_id", apiary.id)
    .gte("date", yearStart)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const expenses = (data ?? []) as ExpenseWithHive[];
  const ytdTotal = expenses.reduce((sum, row) => sum + Number(row.amount), 0);

  const categoryMap = new Map<ExpenseCategory, ExpenseCategoryTotal>();
  for (const category of Object.keys(
    EXPENSE_CATEGORY_LABELS
  ) as ExpenseCategory[]) {
    categoryMap.set(category, { category, amount: 0, count: 0 });
  }

  for (const row of expenses) {
    const entry = categoryMap.get(row.category);
    if (!entry) continue;
    entry.amount += Number(row.amount);
    entry.count += 1;
  }

  return {
    apiaryId: apiary.id,
    expenses,
    ytdTotal,
    byCategory: Array.from(categoryMap.values()),
  };
}
