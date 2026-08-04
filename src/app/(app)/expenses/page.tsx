import {
  Briefcase,
  DollarSign,
  Package,
  Pill,
  Receipt,
  Wheat,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  EXPENSE_CATEGORY_LABELS,
  listExpensesForUser,
  type ExpenseCategory,
  type ExpenseCategoryTotal,
  type ExpenseWithHive,
} from "@/lib/expenses";
import { listHivesForUser } from "@/lib/hives";
import { formatCurrency, formatDate } from "@/lib/utils";

const categoryMeta: Record<
  ExpenseCategory,
  { icon: typeof Package; color: string }
> = {
  equipment: {
    icon: Package,
    color: "text-honey-700 bg-honey-100",
  },
  treatments: {
    icon: Pill,
    color: "text-crimson-700 bg-crimson-100",
  },
  feed: {
    icon: Wheat,
    color: "text-meadow-800 bg-meadow-100",
  },
  administrative: {
    icon: Briefcase,
    color: "text-hive-700 bg-wax-200",
  },
  other: {
    icon: Receipt,
    color: "text-hive-600 bg-wax-100",
  },
};

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let expenses: ExpenseWithHive[] = [];
  let byCategory: ExpenseCategoryTotal[] = [];
  let ytdTotal = 0;
  let hives: { id: string; name: string }[] = [];
  let loadError: string | null = null;

  if (user) {
    try {
      const [expenseResult, hiveResult] = await Promise.all([
        listExpensesForUser(user.id),
        listHivesForUser(user.id),
      ]);
      expenses = expenseResult.expenses;
      byCategory = expenseResult.byCategory;
      ytdTotal = expenseResult.ytdTotal;
      hives = hiveResult.hives.map((hive) => ({
        id: hive.id,
        name: hive.name,
      }));
    } catch (err) {
      loadError =
        err instanceof Error ? err.message : "Failed to load expenses.";
      if (
        /relation .* does not exist|Could not find the table/i.test(loadError)
      ) {
        loadError =
          "Expenses table is missing. In the Supabase SQL Editor, run supabase/migrations/20260804010000_ensure_expenses.sql (or the full initial schema), then refresh.";
      }
    }
  }

  const highlightCategories = byCategory.filter((row) =>
    ["equipment", "treatments", "feed"].includes(row.category)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Financial Tracking"
        title="Expenses"
        description="Track apiary operating costs — equipment, treatments, feed, and overhead — with optional per-hive allocation."
        actions={<AddExpenseDialog hives={hives} />}
      />

      {loadError && (
        <div className="mb-6 rounded-xl border border-crimson-300/40 bg-crimson-50 px-4 py-3 text-sm text-crimson-800">
          {loadError}
        </div>
      )}

      <Card className="fade-up-delay-1 mb-8 border-honey-300/40 bg-gradient-to-br from-honey-50 to-wax-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-honey-700" />
            YTD Operating Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-4xl font-bold text-hive-900">
            {formatCurrency(ytdTotal)}
          </p>
          <p className="mt-1 text-sm text-hive-600">
            {expenses.length === 0
              ? "No expenses logged yet this year"
              : `${expenses.length} expense${expenses.length === 1 ? "" : "s"} this year`}
          </p>
        </CardContent>
      </Card>

      <div className="fade-up-delay-2 mb-8 grid gap-4 sm:grid-cols-3">
        {highlightCategories.map(({ category, amount }) => {
          const meta = categoryMeta[category];
          const Icon = meta.icon;
          return (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-hive-600">
                  {EXPENSE_CATEGORY_LABELS[category]}
                </CardTitle>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold text-hive-900">
                  {formatCurrency(amount)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loadError && expenses.length === 0 ? (
        <Card className="border-dashed border-honey-400/40 bg-honey-50/50">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-honey-500/15">
              <DollarSign className="h-6 w-6 text-honey-700" />
            </div>
            <p className="font-display text-lg font-semibold text-hive-900">
              No expenses yet
            </p>
            <p className="max-w-sm text-sm text-hive-600">
              Add a purchase here, or log expenses from Quick Log during an
              inspection. Totals will show up on this page.
            </p>
            <AddExpenseDialog hives={hives} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-wax-300/70 bg-wax-50/80 text-xs uppercase tracking-wide text-hive-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Hive</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-wax-200/80 last:border-0"
                    >
                      <td className="px-4 py-3 text-hive-700">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-4 py-3 font-medium text-hive-900">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="muted">
                          {EXPENSE_CATEGORY_LABELS[expense.category]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-hive-600">
                        {expense.hive?.name ?? "Apiary-wide"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-hive-900">
                        {formatCurrency(Number(expense.amount))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteExpenseButton expenseId={expense.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
