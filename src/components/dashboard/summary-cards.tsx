import { Hexagon, AlertCircle, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Active Hives",
    value: "24",
    subtext: "of 26 total",
    icon: Hexagon,
    accent: "text-honey-600 bg-honey-100",
  },
  {
    label: "Needs Attention",
    value: "3",
    subtext: "urgent flags",
    icon: AlertCircle,
    accent: "text-crimson-600 bg-crimson-100",
  },
  {
    label: "Apiary Health",
    value: "Good",
    subtext: "82% colonies thriving",
    icon: HeartPulse,
    accent: "text-meadow-600 bg-meadow-100",
  },
];

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-hive-600">
              {stat.label}
            </CardTitle>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.accent}`}
            >
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-hive-900">
                {stat.value}
              </span>
              {stat.label === "Apiary Health" && (
                <Badge variant="success">Stable</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-hive-500">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
