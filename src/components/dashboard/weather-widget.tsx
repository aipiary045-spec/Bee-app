import { CloudSun, Droplets, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_LOCATION, getSeasonalForagingAdvice } from "@/lib/utils";
import { formatWeatherClock, type LocalWeather } from "@/lib/weather";

interface WeatherWidgetProps {
  weather: LocalWeather | null;
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  const month = new Date().getMonth();
  const foragingAdvice = getSeasonalForagingAdvice(month);

  return (
    <Card className="relative h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-honey-200/40 via-transparent to-meadow-100/30" />
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              Yard weather
            </p>
            <CardTitle className="mt-2 flex items-center gap-2 text-xl">
              <CloudSun className="h-5 w-5 text-honey-600" />
              {weather?.location ?? DEFAULT_LOCATION}
            </CardTitle>
            {weather ? (
              <p className="mt-1 text-sm text-hive-600">
                {weather.condition} · {formatWeatherClock(weather.observedAt)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-hive-600">Live reading unavailable</p>
            )}
          </div>
          <div className="text-right">
            {weather ? (
              <>
                <p className="font-display text-5xl font-bold leading-none tracking-tight text-hive-900">
                  {weather.temperatureF}°
                </p>
                <p className="mt-1 text-xs text-hive-500">Fahrenheit</p>
              </>
            ) : (
              <p className="font-display text-3xl font-bold text-hive-500">—</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-wax-300/50 bg-wax-50/70 px-3 py-2.5 text-sm text-hive-700">
            <Wind className="h-4 w-4 text-honey-700" />
            <span>{weather ? `${weather.windSpeedMph} mph` : "—"}</span>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-wax-300/50 bg-wax-50/70 px-3 py-2.5 text-sm text-hive-700">
            <Droplets className="h-4 w-4 text-honey-700" />
            <span>{weather ? `${weather.humidity}%` : "—"}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-honey-300/45 bg-gradient-to-br from-honey-50 to-wax-100/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-honey-700">
            Seasonal foraging
          </p>
          <p className="mt-2 text-sm leading-relaxed text-hive-700">
            {foragingAdvice}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
