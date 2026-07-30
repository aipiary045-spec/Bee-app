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
    <div className="overflow-hidden rounded-xl border border-crimson-300/40 bg-gradient-to-r from-crimson-50 via-amber-50 to-wax-100">
      <div className="flex items-center gap-3 border-b border-crimson-200/40 px-4 py-2.5">
        <AlertTriangle className="h-4 w-4 text-crimson-600" />
        <span className="text-sm font-semibold text-crimson-900">
          Priority Alerts
        </span>
        <Badge variant="danger">{alerts.length} urgent</Badge>
      </div>
      <div className="divide-y divide-wax-300/40">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/40"
          >
            <alert.icon
              className={
                alert.severity === "danger"
                  ? "h-4 w-4 shrink-0 text-crimson-600"
                  : "h-4 w-4 shrink-0 text-amber-600"
              }
            />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-hive-900">{alert.hive}</span>
              <span className="mx-2 text-hive-400">·</span>
              <span className="text-sm text-hive-700">{alert.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
