import { DollarSign, Package, Pill, Wheat } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/components/layout/coming-soon-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const categoryPreview = [
  { icon: Package, label: "Equipment", amount: 1240, color: "text-honey-700 bg-honey-100" },
  { icon: Pill, label: "Treatments", amount: 385, color: "text-crimson-700 bg-crimson-100" },
  { icon: Wheat, label: "Feed", amount: 210, color: "text-meadow-800 bg-meadow-100" },
];

export default function ExpensesPage() {
  const total = categoryPreview.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Financial Tracking"
        title="Expenses"
        description="Track apiary operating costs — equipment, treatments, feed, and overhead — with optional per-hive allocation."
      />

      <Card className="fade-up-delay-1 mb-8 border-honey-300/40 bg-gradient-to-br from-honey-50 to-wax-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-honey-700" />
            YTD Operating Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-4xl font-bold text-hive-900">
            {formatCurrency(total)}
          </p>
          <p className="mt-1 text-sm text-hive-600">
            Preview totals — live expense queries coming next
          </p>
        </CardContent>
      </Card>

      <div className="fade-up-delay-2 mb-8 grid gap-4 sm:grid-cols-3">
        {categoryPreview.map(({ icon: Icon, label, amount, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-hive-600">
                {label}
              </CardTitle>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}
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
        ))}
      </div>

      <ComingSoonPanel
        icon={DollarSign}
        title="Expense Dashboard"
        description="Full cost tracking with category breakdowns, date filters, and the ability to assign hive-specific vs. apiary-wide overhead."
        features={[
          {
            title: "Category Breakdown",
            description: "Pie and bar charts for equipment, treatments, feed, and admin costs.",
          },
          {
            title: "Per-Hive Allocation",
            description: "Attribute a new queen or treatment to a specific colony.",
          },
          {
            title: "Season Comparison",
            description: "Compare year-over-year operating costs across harvest seasons.",
          },
          {
            title: "Export Ready",
            description: "CSV export for tax prep and beekeeping business records.",
          },
        ]}
      />
    </div>
  );
}
