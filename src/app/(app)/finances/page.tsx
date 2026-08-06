import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Scale,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { AddRevenueDialog } from "@/components/finances/add-revenue-dialog";
import { DeleteRevenueButton } from "@/components/finances/delete-revenue-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expense-catalog";
import { REVENUE_CATEGORY_LABELS } from "@/lib/revenue-catalog";
import {
  getFinancesSummaryForUser,
  type FinancesSummary,
} from "@/lib/finances";
import { listHivesForUser } from "@/lib/hives";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function FinancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let summary: FinancesSummary = {
    ytdRevenue: 0,
    ytdExpenses: 0,
    ytdProfit: 0,
    revenues: [],
    expenses: [],
    activity: [],
  };
  let hives: { id: string; name: string }[] = [];
  let loadError: string | null = null;

  if (user) {
    try {
      const [financeResult, hiveResult] = await Promise.all([
        getFinancesSummaryForUser(user.id),
        listHivesForUser(user.id),
      ]);
      summary = financeResult;
      hives = hiveResult.hives.map((hive) => ({
        id: hive.id,
        name: hive.name,
      }));
    } catch (err) {
      loadError =
        err instanceof Error ? err.message : "Failed to load finances.";
      if (
        /relation .* does not exist|Could not find the table/i.test(loadError)
      ) {
        loadError =
          "Finances tables are missing. In the Supabase SQL Editor, run supabase/migrations/20260804010000_ensure_expenses.sql and supabase/migrations/20260805000000_revenues.sql, then refresh.";
      }
    }
  }

  const profitPositive = summary.ytdProfit >= 0;
  const hasActivity = summary.activity.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Yard ledger"
        title="Finances"
        description="Track income and costs across the apiary — honey sales, nucs, treatments, feed — and see season profit at a glance."
        actions={
          <div className="flex flex-wrap gap-2">
            <AddRevenueDialog hives={hives} />
            <AddExpenseDialog hives={hives} />
          </div>
        }
      />

      {loadError && (
        <div className="mb-6 rounded-xl border border-crimson-300/40 bg-crimson-50 px-4 py-3 text-sm text-crimson-800">
          {loadError}
        </div>
      )}

      <div className="fade-up-delay-1 mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-meadow-400/30 bg-gradient-to-br from-meadow-100/60 to-wax-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-hive-600">
              YTD Revenue
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-meadow-100 text-meadow-800">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-hive-900">
              {formatCurrency(summary.ytdRevenue)}
            </p>
            <p className="mt-1 text-xs text-hive-500">
              {summary.revenues.length} income entr
              {summary.revenues.length === 1 ? "y" : "ies"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-honey-300/40 bg-gradient-to-br from-honey-50 to-wax-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-hive-600">
              YTD Expenses
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-honey-100 text-honey-800">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-hive-900">
              {formatCurrency(summary.ytdExpenses)}
            </p>
            <p className="mt-1 text-xs text-hive-500">
              {summary.expenses.length} cost entr
              {summary.expenses.length === 1 ? "y" : "ies"}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border-wax-300/50",
            profitPositive
              ? "bg-gradient-to-br from-meadow-100/50 to-wax-50"
              : "bg-gradient-to-br from-crimson-100/50 to-wax-50"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-hive-600">
              YTD Profit
            </CardTitle>
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                profitPositive
                  ? "bg-meadow-100 text-meadow-800"
                  : "bg-crimson-100 text-crimson-800"
              )}
            >
              <Scale className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "font-display text-3xl font-bold",
                profitPositive ? "text-meadow-800" : "text-crimson-800"
              )}
            >
              {formatCurrency(summary.ytdProfit)}
            </p>
            <p className="mt-1 text-xs text-hive-500">Revenue minus expenses</p>
          </CardContent>
        </Card>
      </div>

      {!loadError && !hasActivity ? (
        <Card className="border-dashed border-honey-400/40 bg-honey-50/50">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-honey-500/15">
              <DollarSign className="h-6 w-6 text-honey-700" />
            </div>
            <p className="font-display text-lg font-semibold text-hive-900">
              No finances logged yet
            </p>
            <p className="max-w-md text-sm text-hive-600">
              Add a honey sale or other income, and log purchases here or from
              Quick Log. Profit updates as you go.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <AddRevenueDialog hives={hives} />
              <AddExpenseDialog hives={hives} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="fade-up-delay-2 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent income</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {summary.revenues.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-hive-500">
                  No revenue this year yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="border-b border-wax-300/70 bg-wax-50/80 text-xs uppercase tracking-wide text-hive-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Amount
                        </th>
                        <th className="px-4 py-3 font-medium text-right"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.revenues.map((revenue) => (
                        <tr
                          key={revenue.id}
                          className="border-b border-wax-200/80 last:border-0"
                        >
                          <td className="px-4 py-3 text-hive-700">
                            {formatDate(revenue.date)}
                          </td>
                          <td className="px-4 py-3 font-medium text-hive-900">
                            {revenue.description}
                            <span className="mt-0.5 block text-xs font-normal text-hive-500">
                              {revenue.hive?.name ?? "Apiary-wide"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="success">
                              {REVENUE_CATEGORY_LABELS[revenue.category]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-meadow-800">
                            +{formatCurrency(Number(revenue.amount))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DeleteRevenueButton revenueId={revenue.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent costs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {summary.expenses.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-hive-500">
                  No expenses this year yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="border-b border-wax-300/70 bg-wax-50/80 text-xs uppercase tracking-wide text-hive-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Amount
                        </th>
                        <th className="px-4 py-3 font-medium text-right"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.expenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-wax-200/80 last:border-0"
                        >
                          <td className="px-4 py-3 text-hive-700">
                            {formatDate(expense.date)}
                          </td>
                          <td className="px-4 py-3 font-medium text-hive-900">
                            {expense.description}
                            <span className="mt-0.5 block text-xs font-normal text-hive-500">
                              {expense.hive?.name ?? "Apiary-wide"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="muted">
                              {EXPENSE_CATEGORY_LABELS[expense.category]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-hive-900">
                            −{formatCurrency(Number(expense.amount))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DeleteExpenseButton expenseId={expense.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
