"use client";

import Link from "next/link";
import { formatWeatherClock, type LocalWeather } from "@/lib/weather";

interface YardWeatherProps {
  weather: LocalWeather | null;
  yardLocation?: string | null;
}

export function YardWeather({ weather, yardLocation }: YardWeatherProps) {
  const town = yardLocation?.trim() ?? "";

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[13.5rem]">
      <div className="rounded-2xl border border-wax-200/90 bg-wax-50/95 px-2.5 py-1.5 shadow-sm dark:border-honey-400/20 dark:bg-[#1c1610]/95">
        {weather ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-hive-900">
              <span className="font-display text-lg font-bold">
                {weather.temperatureF}°
              </span>{" "}
              {weather.condition}
            </p>
            <p className="truncate text-[11px] leading-tight text-hive-700">
              {weather.location}
              {weather.observedAt
                ? ` · ${formatWeatherClock(weather.observedAt)}`
                : ""}
            </p>
          </div>
        ) : town ? (
          <p className="text-[11px] font-medium leading-snug text-hive-800">
            No reading for {town}.
          </p>
        ) : yardLocation !== undefined ? (
          <p className="text-[11px] font-medium leading-snug text-hive-800">
            Add this yard&apos;s town in{" "}
            <Link
              href="/settings#yard"
              className="pointer-events-auto font-semibold text-honey-800 underline decoration-honey-400/70 underline-offset-2"
            >
              Settings
            </Link>
            .
          </p>
        ) : (
          <p className="text-[11px] font-medium leading-snug text-hive-800">
            Weather is quiet.
          </p>
        )}
      </div>
    </div>
  );
}
