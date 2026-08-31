import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportSeasonButton } from "@/components/dashboard/export-season-button";
import {
  buildSeasonComparison,
  formatSeasonDelta,
  hasMeaningfulPriorSeason,
  type SeasonMetricDelta,
} from "@/lib/season-compare";
import type { SeasonSnapshot } from "@/lib/season-snapshot";
import { cn } from "@/lib/utils";

interface SeasonSnapshotCardProps {
  snapshot: SeasonSnapshot;
  priorSnapshot?: SeasonSnapshot | null;
  embedded?: boolean;
}

export function SeasonSnapshotCard({
  snapshot,
  priorSnapshot = null,
  embedded = false,
}: SeasonSnapshotCardProps) {
  const comparable = hasMeaningfulPriorSeason(priorSnapshot);
  const comparison = buildSeasonComparison(
    snapshot,
    comparable ? priorSnapshot : null
  );

  const body = (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-hive-900">
            <BarChart3 className="h-4 w-4 text-honey-700" />
            {snapshot.year} season
          </h3>
          {comparable && priorSnapshot ? (
            <p className="mt-1 text-sm text-hive-600">
              Compared with {priorSnapshot.year}
            </p>
          ) : null}
        </div>
        <ExportSeasonButton snapshot={snapshot} comparison={comparison} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {comparison.map((metric) => (
          <MetricStat key={metric.key} metric={metric} showDelta={comparable} />
        ))}
      </div>
    </>
  );

  if (embedded) return <div>{body}</div>;

  return (
    <Card className="fade-up-delay-2 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="sr-only">{snapshot.year} season</CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

function MetricStat({
  metric,
  showDelta,
}: {
  metric: SeasonMetricDelta;
  showDelta: boolean;
}) {
  const value =
    metric.current == null
      ? "—"
      : metric.key === "harvestLbs"
        ? `${metric.current} lbs`
        : String(metric.current);

  return (
    <div className="rounded-xl border border-wax-300/50 bg-white px-3 py-3 sm:px-4">
      <p className="text-xs text-hive-500">{metric.label}</p>
      <p className="font-display mt-1 text-xl font-semibold text-hive-900 sm:text-2xl">
        {value}
      </p>
      {showDelta && metric.prior != null ? (
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
      ) : null}
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
