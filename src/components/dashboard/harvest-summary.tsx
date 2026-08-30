import Link from "next/link";
import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type HarvestSummaryData = {
  totalLbs: number;
  pullCount: number;
  hiveCount: number;
  topHive?: { id: string; name: string; lbs: number };
};

interface HarvestSummaryProps {
  summary: HarvestSummaryData;
}

export function HarvestSummary({ summary }: HarvestSummaryProps) {
  return (
    <Card className="fade-up-delay-2 mb-6 border-meadow-400/30 bg-gradient-to-br from-meadow-100/40 to-wax-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-meadow-800" />
          Harvest this season
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary.pullCount === 0 ? (
          <p className="text-sm text-hive-500">
            No honey pulls logged yet this year.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-wax-300/60 bg-wax-50/70 px-4 py-3">
              <p className="text-xs text-hive-500">Total pulled</p>
              <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                {summary.totalLbs} lbs
              </p>
            </div>
            <div className="rounded-xl border border-wax-300/60 bg-wax-50/70 px-4 py-3">
              <p className="text-xs text-hive-500">Pulls logged</p>
              <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                {summary.pullCount}
              </p>
              <p className="mt-1 text-xs text-hive-500">
                across {summary.hiveCount} hive
                {summary.hiveCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-xl border border-wax-300/60 bg-wax-50/70 px-4 py-3">
              <p className="text-xs text-hive-500">Top hive</p>
              {summary.topHive ? (
                <>
                  <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                    {summary.topHive.lbs} lbs
                  </p>
                  <Link
                    href={`/hives/${summary.topHive.id}#harvest`}
                    className="mt-1 inline-block text-xs font-semibold text-honey-700 hover:text-honey-600"
                  >
                    {summary.topHive.name} →
                  </Link>
                </>
              ) : (
                <p className="mt-1 text-sm text-hive-500">—</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
