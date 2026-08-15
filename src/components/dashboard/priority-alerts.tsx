import Link from "next/link";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Crown,
  FlaskConical,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HiveAlert } from "@/lib/alerts";

const icons = {
  deadout: ShieldAlert,
  mites: Bug,
  disease: ShieldAlert,
  queen: Crown,
  overdue: AlertTriangle,
  never_inspected: ClipboardList,
  treatment: FlaskConical,
};

interface PriorityAlertsBarProps {
  alerts: HiveAlert[];
}

export function PriorityAlertsBar({ alerts }: PriorityAlertsBarProps) {
  if (alerts.length === 0) {
    return (
      <Link
        href="/hives"
        className="lift-card surface-panel flex items-center gap-3 rounded-2xl border-meadow-400/30 px-5 py-4 hover:border-honey-400/50 hover:bg-honey-50/40"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-meadow-100 text-meadow-800">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold text-hive-900">
            Yard looks steady
          </p>
          <p className="text-sm text-hive-600">
            No mite, queen, or overdue flags from the latest visits.
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-hive-400" />
      </Link>
    );
  }

  const urgent = alerts.filter((alert) => alert.severity === "danger").length;

  return (
    <div className="surface-panel overflow-hidden rounded-2xl border-crimson-300/35">
      <div className="flex items-center gap-3 border-b border-crimson-200/40 bg-gradient-to-r from-crimson-50 via-honey-50 to-wax-100 px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crimson-100 text-crimson-700">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <span className="font-display text-base font-semibold text-crimson-900">
          Priority alerts
        </span>
        <Badge variant={urgent > 0 ? "danger" : "warning"}>
          {alerts.length} open
        </Badge>
      </div>
      <div className="divide-y divide-wax-300/35">
        {alerts.map((alert) => {
          const Icon = icons[alert.kind];
          return (
            <Link
              key={alert.id}
              href={alert.href}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-honey-50/70"
            >
              <Icon
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
