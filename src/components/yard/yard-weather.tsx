"use client";

import Link from "next/link";
import { type LocalWeather } from "@/lib/weather";

interface YardWeatherProps {
  weather: LocalWeather | null;
  yardLocation?: string | null;
}

export function YardWeather({ weather, yardLocation }: YardWeatherProps) {
  const town = yardLocation?.trim() ?? "";

  return (
    <div className="pointer-events-none absolute left-3 top-2.5 z-10 max-w-[11rem]">
      {weather ? (
        <p className="truncate text-[13px] font-semibold leading-tight text-hive-900 [text-shadow:0_1px_2px_rgba(255,253,248,0.85)]">
          <span className="font-display text-[15px] font-bold">
            {weather.temperatureF}°
          </span>{" "}
          {weather.condition}
        </p>
      ) : town ? (
        <p className="text-[11px] font-medium leading-snug text-hive-800 [text-shadow:0_1px_2px_rgba(255,253,248,0.85)]">
          No reading for {town}.
        </p>
      ) : yardLocation !== undefined ? (
        <p className="text-[11px] font-medium leading-snug text-hive-800 [text-shadow:0_1px_2px_rgba(255,253,248,0.85)]">
          Add this yard&apos;s town in{" "}
          <Link
            href="/settings#yard"
            className="pointer-events-auto font-semibold text-honey-800 underline decoration-honey-400/70 underline-offset-2"
          >
            Settings
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
