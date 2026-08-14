import Link from "next/link";
import { AlertTriangle, ChevronRight, Crown, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Hive } from "@/lib/hives";

const sampleAlerts = [
  {
    id: "1",
    hiveName: "Hive 7",
    message: "Mite count 4.2% — treatment recommended",
    severity: "danger" as const,
    icon: ShieldAlert,
  },
  {
    id: "2",
    hiveName: "Hive 3",
    message: "Queen not spotted in last 2 inspections",
    severity: "warning" as const,
    icon: Crown,
  },
  {
    id: "3",
    hiveName: "Hive 12",
    message: "Overdue inspection — 18 days since last check",
    severity: "warning" as const,
    icon: AlertTriangle,
  },
];

interface PriorityAlertsBarProps {
  hives?: Pick<Hive, "id" | "name">[];
}

export function PriorityAlertsBar({ hives = [] }: PriorityAlertsBarProps) {
  if (sampleAlerts.length === 0) return null;

  return (
    <div className="surface-panel overflow-hidden rounded-2xl border-crimson-300/35">
      <div className="flex items-center gap-3 border-b border-crimson-200/40 bg-gradient-to-r from-crimson-50 via-honey-50 to-wax-100 px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crimson-100 text-crimson-700">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <span className="font-display text-base font-semibold text-crimson-900">
          Priority Alerts
        </span>
        <Badge variant="danger">{sampleAlerts.length} urgent</Badge>
      </div>
      <div className="divide-y divide-wax-300/35">
        {sampleAlerts.map((alert) => {
          const match = hives.find(
            (hive) => hive.name.toLowerCase() === alert.hiveName.toLowerCase()
          );
          const href = match ? `/hives/${match.id}` : "/hives";
          return (
            <Link
              key={alert.id}
              href={href}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-honey-50/70"
            >
              <alert.icon
                className={
                  alert.severity === "danger"
                    ? "h-4 w-4 shrink-0 text-crimson-600"
                    : "h-4 w-4 shrink-0 text-honey-700"
                }
              />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-hive-900">{alert.hiveName}</span>
                <span className="mx-2 text-hive-400">·</span>
                <span className="text-sm text-hive-700">{alert.message}</span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-hive-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
