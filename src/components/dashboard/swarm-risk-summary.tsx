import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="fade-up-delay-1 mb-6 border-honey-400/30 bg-gradient-to-br from-honey-50/80 to-wax-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-honey-700" />
          Swarm season watch
          {highRiskCount > 0 && (
            <Badge variant="warning">{highRiskCount} hive{highRiskCount === 1 ? "" : "s"}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-hive-700">
          {isSwarmSeason(month)
            ? "Peak swarm months — check for queen cells and give the colony room."
            : "Queen cells were logged recently. Keep an eye on space and brood."}
        </p>
      </CardContent>
    </Card>
  );
}
