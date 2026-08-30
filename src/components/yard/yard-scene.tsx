"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { FlyingBees } from "@/components/motion/flying-bees";
import { YardHive, type YardHiveData } from "@/components/yard/yard-hive";
import { YardSlideDots, useYardSlide } from "@/components/yard/yard-slide-dots";
import { YardWeather } from "@/components/yard/yard-weather";
import { cn } from "@/lib/utils";
import { yardSkyClass } from "@/lib/yards";
import type { HiveHealthTone } from "@/lib/hive-health";
import type { LocalWeather } from "@/lib/weather";

interface YardSceneProps {
  hives: YardHiveData[];
  empty?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  weather?: LocalWeather | null;
  yardLocation?: string | null;
  showWeather?: boolean;
  hiveHealth?: Record<string, HiveHealthTone>;
}

export function YardScene({
  hives,
  empty,
  className,
  interactive = true,
  weather = null,
  yardLocation,
  showWeather = false,
  hiveHealth = {},
}: YardSceneProps) {
  const { scrollerRef, itemRefs, activeIndex, canSlide, hint, scrollToIndex } =
    useYardSlide(hives.length);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-meadow-400/30 shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-b",
          yardSkyClass(weather?.condition)
        )}
      />
      <div
        className="sun-rays pointer-events-none absolute -right-10 -top-10 h-44 w-44"
        aria-hidden
      />
      <div
        className="sun-pulse pointer-events-none absolute -right-4 top-5 h-16 w-16 rounded-full bg-[#ffe27a] shadow-[0_0_40px_12px_rgba(255,226,122,0.45)] dark:bg-[#f3ead8] dark:shadow-[0_0_28px_8px_rgba(243,234,216,0.2)]"
        aria-hidden
      />
      <div
        className="cloud-drift pointer-events-none absolute left-[8%] top-8 h-10 w-24 rounded-full bg-white/70 dark:bg-white/15"
        aria-hidden
      />
      <div
        className="cloud-drift pointer-events-none absolute left-[28%] top-14 h-8 w-16 rounded-full bg-white/55 dark:bg-white/10"
        style={{ animationDelay: "1.4s" }}
        aria-hidden
      />
      <div
        className="cloud-drift pointer-events-none absolute left-[58%] top-7 h-7 w-14 rounded-full bg-white/45 dark:bg-white/10"
        style={{ animationDelay: "2.8s" }}
        aria-hidden
      />
      <span
        className="pollen-drift pointer-events-none absolute left-[22%] top-[18%] h-1.5 w-1.5 rounded-full bg-[#ffe27a]/80"
        aria-hidden
      />
      <span
        className="pollen-drift pointer-events-none absolute left-[46%] top-[28%] h-1 w-1 rounded-full bg-white/80"
        style={{ animationDelay: "1.6s" }}
        aria-hidden
      />
      <span
        className="pollen-drift pointer-events-none absolute left-[70%] top-[16%] h-1.5 w-1.5 rounded-full bg-[#ffe27a]/70"
        style={{ animationDelay: "3.2s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[12%] top-10 h-16 w-24 rounded-full bg-[#5a8f3a]/80 dark:bg-[#3d5c2a]/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[18%] top-16 h-12 w-20 rounded-full bg-[#4f7d32]/90 dark:bg-[#355224]/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[22%] top-12 h-14 w-20 rounded-full bg-[#5a8f3a]/75 dark:bg-[#3d5c2a]/65"
        aria-hidden
      />
      <FlyingBees count={2} className="opacity-90" />
      {showWeather && (
        <YardWeather weather={weather} yardLocation={yardLocation} />
      )}

      {hives.length === 0 ? (
        <div className={cn("relative px-6 py-16", showWeather && "pt-12")}>{empty}</div>
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            className={cn(
              "relative flex min-h-[22rem] items-end gap-5 overflow-x-auto px-6 pb-3 sm:gap-8 sm:px-10",
              "hide-scrollbar snap-x snap-mandatory",
              showWeather ? "pt-12" : "pt-20"
            )}
          >
            {hives.map((hive, index) => {
              const healthTone = hiveHealth[hive.id];
              const stack = (
                <YardHive
                  hive={hive}
                  size="md"
                  healthTone={healthTone}
                  className="hive-bob"
                  style={{ animationDelay: `${index * 0.35}s` }}
                />
              );
              return (
                <div
                  key={hive.id}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className="flex shrink-0 snap-center flex-col items-center gap-2"
                >
                  {interactive ? (
                    <Link
                      href={`/hives/${hive.id}`}
                      className="rounded-xl outline-none ring-honey-400/50 transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2"
                      aria-label={`${hive.name}, ${hive.status}${
                        healthTone ? `, ${healthTone}` : ""
                      }`}
                    >
                      {stack}
                    </Link>
                  ) : (
                    <div>{stack}</div>
                  )}
                  {interactive ? (
                    <Link
                      href={`/inspect?hive=${hive.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-honey-500/40 bg-wax-50/80 px-2.5 py-1 text-[11px] font-semibold text-honey-800 backdrop-blur-sm hover:bg-honey-100"
                    >
                      <ClipboardList className="h-3 w-3" />
                      Log
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-honey-500/40 bg-wax-50/80 px-2.5 py-1 text-[11px] font-semibold text-honey-800">
                      <ClipboardList className="h-3 w-3" />
                      Log
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {canSlide && hint.moreLeft && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/15 to-transparent"
              aria-hidden
            />
          )}
          {canSlide && hint.moreRight && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/15 to-transparent"
              aria-hidden
            />
          )}
        </div>
      )}

      <div className="relative h-11 bg-gradient-to-b from-[#5a9a3a] via-[#4a7a2e] to-[#3a5c22] dark:from-[#355224] dark:to-[#1a2a14]">
        <div
          className="grass-sway pointer-events-none absolute inset-x-0 -top-3 h-6 bg-[radial-gradient(ellipse_at_center,_#6aaa44_40%,_transparent_70%)] opacity-80"
          aria-hidden
        />
        {canSlide && (
          <YardSlideDots
            labels={hives.map((hive) => hive.name)}
            activeIndex={activeIndex}
            onSelect={scrollToIndex}
            className="absolute inset-x-0 bottom-1.5 z-10 mx-auto"
          />
        )}
      </div>
    </div>
  );
}

interface YardPickerProps {
  hives: YardHiveData[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function YardPicker({ hives, selectedId, onSelect }: YardPickerProps) {
  const { scrollerRef, itemRefs, activeIndex, canSlide, scrollToIndex } =
    useYardSlide(hives.length);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-meadow-400/25">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#b9dff2] via-[#e7f4d8] to-[#7bb85a] dark:from-[#243044] dark:via-[#2a2618] dark:to-[#2d4a24]" />
      <div
        ref={scrollerRef}
        className="relative flex items-end gap-4 overflow-x-auto px-4 pb-2 pt-10 hide-scrollbar snap-x snap-mandatory"
      >
        {hives.map((hive, index) => {
          const selected = hive.id === selectedId;
          return (
            <button
              key={hive.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              onClick={() => onSelect(hive.id)}
              className={cn(
                "shrink-0 snap-center rounded-xl px-1 pb-1 pt-2 outline-none transition-shadow",
                selected && "bg-wax-50/50 ring-2 ring-honey-400 shadow-sm"
              )}
              aria-pressed={selected}
              aria-label={`Select ${hive.name}`}
            >
              <YardHive hive={hive} size="sm" selected={selected} />
            </button>
          );
        })}
      </div>
      <div className="relative h-8 bg-gradient-to-b from-[#5a9a3a] to-[#3a5c22] dark:from-[#355224] dark:to-[#1a2a14]">
        {canSlide && (
          <YardSlideDots
            labels={hives.map((hive) => hive.name)}
            activeIndex={activeIndex}
            onSelect={scrollToIndex}
            className="absolute inset-x-0 bottom-1 z-10 mx-auto"
          />
        )}
      </div>
    </div>
  );
}
