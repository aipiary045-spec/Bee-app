import Link from "next/link";
import { ChevronRight, Hexagon, AlertCircle, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SummaryCardsProps {
  activeHives: number;
  totalHives: number;
  attentionCount: number;
}

export function SummaryCards({
  activeHives,
  totalHives,
  attentionCount,
}: SummaryCardsProps) {
  const health =
    totalHives === 0
      ? "—"
      : attentionCount === 0
        ? "Good"
        : attentionCount <= 2
          ? "Watch"
          : "Needs work";

  const stats = [
    {
      href: "/hives",
      label: "Active Hives",
      value: String(activeHives),
      subtext: totalHives === 0 ? "Add your first colony" : `of ${totalHives} total`,
      icon: Hexagon,
      accent: "text-honey-800 bg-honey-200/70",
      wash: "from-honey-100/80 to-transparent",
    },
    {
      href: "/hives",
      label: "Needs Attention",
      value: String(attentionCount),
      subtext: attentionCount === 1 ? "open flag" : "open flags",
      icon: AlertCircle,
      accent: "text-crimson-700 bg-crimson-100",
      wash: "from-crimson-100/70 to-transparent",
    },
    {
      href: "/hives",
      label: "Apiary Health",
      value: health,
      subtext:
        totalHives === 0
          ? "No colonies yet"
          : `${Math.max(0, Math.round(((totalHives - attentionCount) / totalHives) * 100))}% looking steady`,
      icon: HeartPulse,
      accent: "text-meadow-800 bg-meadow-100",
      wash: "from-meadow-100/80 to-transparent",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className="surface-panel group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-honey-400/50 hover:shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]"
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.wash}`}
          />
          <div className="relative flex items-start justify-between">
            <p className="text-sm font-medium text-hive-600">{stat.label}</p>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-hive-400 transition-transform group-hover:translate-x-0.5 group-hover:text-honey-700" />
            </div>
          </div>
          <div className="relative mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-hive-900">
              {stat.value}
            </span>
            {stat.label === "Apiary Health" && health === "Good" && (
              <Badge variant="success">Stable</Badge>
            )}
          </div>
          <p className="relative mt-1.5 text-xs text-hive-500">{stat.subtext}</p>
        </Link>
      ))}
    </div>
  );
}
