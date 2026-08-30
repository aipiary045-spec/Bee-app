import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportSeasonButton } from "@/components/dashboard/export-season-button";
import {
  buildSeasonComparison,
  formatSeasonDelta,
  type SeasonMetricDelta,
} from "@/lib/season-compare";
import type { SeasonSnapshot } from "@/lib/season-snapshot";
import { cn } from "@/lib/utils";

interface SeasonSnapshotCardProps {
  snapshot: SeasonSnapshot;
  priorSnapshot?: SeasonSnapshot | null;
}

export function SeasonSnapshotCard({
  snapshot,
  priorSnapshot = null,
}: SeasonSnapshotCardProps) {
  const comparison = buildSeasonComparison(snapshot, priorSnapshot);

  return (
    <Card className="fade-up-delay-2 mb-6 border-honey-400/25 bg-gradient-to-br from-wax-50 to-honey-50/60">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-honey-700" />
            {snapshot.year} season snapshot
          </CardTitle>
          <ExportSeasonButton snapshot={snapshot} comparison={comparison} />
        </div>
        {priorSnapshot ? (
          <p className="text-sm text-hive-600">
            Compared with {priorSnapshot.year}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {comparison.map((metric) => (
            <MetricStat key={metric.key} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricStat({ metric }: { metric: SeasonMetricDelta }) {
  const value =
    metric.current == null
      ? "—"
      : metric.key === "harvestLbs"
        ? `${metric.current} lbs`
        : String(metric.current);

  return (
    <div className="rounded-xl border border-wax-300/60 bg-wax-50/70 px-4 py-3">
      <p className="text-xs text-hive-500">{metric.label}</p>
      <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
        {value}
      </p>
      {metric.prior != null ? (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            metric.delta == null || metric.delta === 0
              ? "text-hive-500"
              : metric.improved
                ? "text-meadow-700"
                : "text-crimson-700"
          )}
        >
          <DeltaIcon delta={metric.delta} improved={metric.improved} />
          {formatSeasonDelta(metric.delta)} vs {metric.prior}
        </p>
      ) : (
        <p className="mt-1 text-xs text-hive-400">No prior-year data</p>
      )}
    </div>
  );
}

function DeltaIcon({
  delta,
  improved,
}: {
  delta: number | null;
  improved: boolean | null;
}) {
  if (delta == null || delta === 0) {
    return <ArrowRight className="h-3 w-3" />;
  }
  if (improved) {
    return <ArrowUpRight className="h-3 w-3" />;
  }
  return <ArrowDownRight className="h-3 w-3" />;
}
