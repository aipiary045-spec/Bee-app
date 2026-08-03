import { Hexagon, AlertCircle, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Active Hives",
    value: "24",
    subtext: "of 26 total",
    icon: Hexagon,
    accent: "text-honey-800 bg-honey-200/70",
    wash: "from-honey-100/80 to-transparent",
  },
  {
    label: "Needs Attention",
    value: "3",
    subtext: "urgent flags",
    icon: AlertCircle,
    accent: "text-crimson-700 bg-crimson-100",
    wash: "from-crimson-100/70 to-transparent",
  },
  {
    label: "Apiary Health",
    value: "Good",
    subtext: "82% colonies thriving",
    icon: HeartPulse,
    accent: "text-meadow-800 bg-meadow-100",
    wash: "from-meadow-100/80 to-transparent",
  },
];

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]"
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.wash}`}
          />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-hive-600">
              {stat.label}
            </CardTitle>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}
            >
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-hive-900">
                {stat.value}
              </span>
              {stat.label === "Apiary Health" && (
                <Badge variant="success">Stable</Badge>
              )}
            </div>
            <p className="mt-1.5 text-xs text-hive-500">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
