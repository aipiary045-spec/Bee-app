import { CloudSun, Droplets, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_LOCATION, getSeasonalForagingAdvice } from "@/lib/utils";

interface WeatherWidgetProps {
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  condition?: string;
}

export function WeatherWidget({
  temperature = 78,
  windSpeed = 8,
  humidity = 52,
  condition = "Partly Cloudy",
}: WeatherWidgetProps) {
  const month = new Date().getMonth();
  const foragingAdvice = getSeasonalForagingAdvice(month);

  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100L0 84L0 50L28 66L56 50L56 84L28 100Z' fill='%23B8860B'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 100px",
        }}
      />
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-honey-600" />
              {DEFAULT_LOCATION}
            </CardTitle>
            <p className="mt-1 text-sm text-hive-600">{condition}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-bold text-hive-900">
              {temperature}°
            </p>
            <p className="text-xs text-hive-500">Fahrenheit</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-sm text-hive-700">
            <Wind className="h-4 w-4 text-hive-500" />
            <span>{windSpeed} mph</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-hive-700">
            <Droplets className="h-4 w-4 text-hive-500" />
            <span>{humidity}% humidity</span>
          </div>
        </div>
        <div className="rounded-lg border border-honey-300/40 bg-honey-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">
            Seasonal Foraging
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-hive-700">
            {foragingAdvice}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
