"use client";

import Link from "next/link";
import { Droplets, Wind } from "lucide-react";
import { getSeasonalForagingAdvice } from "@/lib/utils";
import { formatWeatherClock, type LocalWeather } from "@/lib/weather";

interface YardWeatherProps {
  weather: LocalWeather | null;
  yardLocation?: string | null;
}

export function YardWeather({ weather, yardLocation }: YardWeatherProps) {
  const forage = getSeasonalForagingAdvice(new Date().getMonth());
  const town = yardLocation?.trim() ?? "";

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 max-w-sm">
      <div className="rounded-2xl bg-white/55 px-3 py-2.5 shadow-[0_8px_24px_-16px_rgba(42,36,31,0.55)] backdrop-blur-md dark:bg-[#1c1610]/70">
        {weather ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-3xl font-bold leading-none text-hive-900">
                {weather.temperatureF}°
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-hive-800">
                {weather.condition}
              </p>
              <p className="truncate text-xs text-hive-700">
                {weather.location} · {formatWeatherClock(weather.observedAt)}
              </p>
            </div>
            <div className="shrink-0 space-y-1 text-right text-xs font-medium text-hive-800">
              <p className="inline-flex items-center gap-1">
                <Wind className="h-3.5 w-3.5" />
                {weather.windSpeedMph} mph
              </p>
              <p className="inline-flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5" />
                {weather.humidity}%
              </p>
            </div>
          </div>
        ) : town ? (
          <p className="text-sm font-medium text-hive-800">
            Could not read weather for {town}.
          </p>
        ) : yardLocation !== undefined ? (
          <p className="text-sm font-medium text-hive-800">
            Add this yard&apos;s town in{" "}
            <Link
              href="/settings#yard"
              className="pointer-events-auto font-semibold text-honey-800 underline decoration-honey-400/70 underline-offset-2"
            >
              Settings
            </Link>
            . Weather follows the stand, not where you are.
          </p>
        ) : (
          <p className="text-sm font-medium text-hive-800">
            Weather is quiet right now.
          </p>
        )}
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-hive-700">
          {forage}
        </p>
      </div>
    </div>
  );
}
