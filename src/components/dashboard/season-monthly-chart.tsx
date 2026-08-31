"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlySeasonPoint } from "@/lib/season-monthly";
import { peakMonth } from "@/lib/season-monthly";

interface SeasonMonthlyChartProps {
  year: number;
  points: MonthlySeasonPoint[];
  embedded?: boolean;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: MonthlySeasonPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-wax-300/70 bg-wax-50 px-3 py-2 text-xs text-hive-800 shadow-sm dark:bg-[#241c10]">
      <p className="font-medium">{point.label}</p>
      <p>{point.visits} visits</p>
      <p>{point.harvestLbs} lbs pulled</p>
    </div>
  );
}

export function SeasonMonthlyChart({
  year,
  points,
  embedded = false,
}: SeasonMonthlyChartProps) {
  const busiest = peakMonth(points, "visits");
  const bestHarvest = peakMonth(points, "harvestLbs");
  const hasActivity = points.some(
    (point) => point.visits > 0 || point.harvestLbs > 0
  );

  const body = (
    <>
      <div className="mb-3">
        <h3 className="font-display text-base font-semibold text-hive-900">
          {year} yard rhythm
        </h3>
        <p className="text-sm text-hive-600">
          Visits by month
          {busiest ? ` · busiest ${busiest.label}` : ""}
          {bestHarvest ? ` · top pull ${bestHarvest.label}` : ""}
        </p>
      </div>
      {!hasActivity ? (
        <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-wax-300/70 bg-white/60 text-sm text-hive-500">
          Log a few visits and harvests to see your season shape.
        </div>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,184,120,0.35)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#8a7a64" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#8a7a64" }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="visits"
                fill="#d4921c"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );

  if (embedded) return <div>{body}</div>;

  return (
    <Card className="fade-up-delay-2 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="sr-only">{year} yard rhythm</CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
