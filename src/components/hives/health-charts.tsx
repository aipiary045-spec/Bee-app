"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MITE_THRESHOLD_PER_100 } from "@/lib/alerts";
import { broodScoreLabel, shortChartDate } from "@/lib/health";

export type ChartPoint = {
  date: string;
  value: number;
  label?: string;
};

interface HealthChartsProps {
  mites: ChartPoint[];
  brood: ChartPoint[];
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-wax-300/70 bg-wax-50/40 text-sm text-hive-500">
      {message}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  suffix,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  suffix?: string;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-wax-300/70 bg-wax-50 px-3 py-2 text-xs text-hive-800 shadow-sm dark:bg-[#241c10]">
      <p className="font-medium">{shortChartDate(point.date)}</p>
      <p>
        {point.label ?? point.value}
        {suffix}
      </p>
    </div>
  );
}

export function HealthCharts({ mites, brood }: HealthChartsProps) {
  const miteData = [...mites].reverse();
  const broodData = [...brood].reverse();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-honey-700">
          Mites / 100
        </p>
        {miteData.length < 2 ? (
          <EmptyChart message="Need two mite counts to draw a trend." />
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miteData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,184,120,0.35)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortChartDate}
                  tick={{ fontSize: 11, fill: "#8a7a64" }}
                />
                <YAxis
                  allowDecimals
                  tick={{ fontSize: 11, fill: "#8a7a64" }}
                  domain={[0, "auto"]}
                />
                <Tooltip content={<ChartTooltip suffix=" / 100" />} />
                <ReferenceLine
                  y={MITE_THRESHOLD_PER_100}
                  stroke="#c94a3a"
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#c4730f"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#c4730f" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-honey-700">
          Brood pattern
        </p>
        {broodData.length < 2 ? (
          <EmptyChart message="Need two brood scores to draw a trend." />
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={broodData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,184,120,0.35)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortChartDate}
                  tick={{ fontSize: 11, fill: "#8a7a64" }}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickFormatter={(value) => broodScoreLabel(Number(value)).slice(0, 4)}
                  tick={{ fontSize: 11, fill: "#8a7a64" }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4a7a3a"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#4a7a3a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
