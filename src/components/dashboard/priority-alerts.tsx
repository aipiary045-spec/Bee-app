import { AlertTriangle, Crown, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: "1",
    hive: "Hive 7",
    message: "Mite count 4.2% — treatment recommended",
    severity: "danger" as const,
    icon: ShieldAlert,
  },
  {
    id: "2",
    hive: "Hive 3",
    message: "Queen not spotted in last 2 inspections",
    severity: "warning" as const,
    icon: Crown,
  },
  {
    id: "3",
    hive: "Hive 12",
    message: "Overdue inspection — 18 days since last check",
    severity: "warning" as const,
    icon: AlertTriangle,
  },
];

export function PriorityAlertsBar() {
  if (alerts.length === 0) return null;

  return (
    <div className="surface-panel overflow-hidden rounded-2xl border-crimson-300/35">
      <div className="flex items-center gap-3 border-b border-crimson-200/40 bg-gradient-to-r from-crimson-50 via-honey-50 to-wax-100 px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crimson-100 text-crimson-700">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <span className="font-display text-base font-semibold text-crimson-900">
          Priority Alerts
        </span>
        <Badge variant="danger">{alerts.length} urgent</Badge>
      </div>
      <div className="divide-y divide-wax-300/35">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-honey-50/40"
          >
            <alert.icon
              className={
                alert.severity === "danger"
                  ? "h-4 w-4 shrink-0 text-crimson-600"
                  : "h-4 w-4 shrink-0 text-honey-700"
              }
            />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-hive-900">{alert.hive}</span>
              <span className="mx-2 text-hive-400">·</span>
              <span className="text-sm text-hive-700">{alert.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
