import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isSwarmSeason } from "@/lib/swarm-risk";

interface SwarmRiskSummaryProps {
  highRiskCount: number;
  month?: number;
}

export function SwarmRiskSummary({
  highRiskCount,
  month = new Date().getMonth(),
}: SwarmRiskSummaryProps) {
  if (!isSwarmSeason(month) && highRiskCount === 0) return null;

  return (
    <p className="fade-up-delay-1 mb-4 flex items-start gap-2 text-sm leading-relaxed text-hive-700">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-honey-700" />
      <span>
        {isSwarmSeason(month)
          ? "Peak swarm months — check for queen cells and give the colony room."
          : "Queen cells were logged recently. Keep an eye on space and brood."}
        {highRiskCount > 0 ? (
          <Badge variant="warning" className="ml-2 align-middle">
            {highRiskCount} hive{highRiskCount === 1 ? "" : "s"}
          </Badge>
        ) : null}
      </span>
    </p>
  );
}
