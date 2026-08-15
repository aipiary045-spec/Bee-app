"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { FlyingBees } from "@/components/motion/flying-bees";
import { YardHive, type YardHiveData } from "@/components/yard/yard-hive";
import { cn } from "@/lib/utils";

interface YardSceneProps {
  hives: YardHiveData[];
  empty?: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export function YardScene({
  hives,
  empty,
  className,
  interactive = true,
}: YardSceneProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-meadow-400/30 shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#8ec8ef] via-[#d7eef6] to-[#7bb85a] dark:from-[#1b2438] dark:via-[#2a2618] dark:to-[#2d4a24]" />
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

      {hives.length === 0 ? (
        <div className="relative px-6 py-16">{empty}</div>
      ) : (
        <div className="relative flex min-h-[22rem] items-end gap-5 overflow-x-auto px-6 pb-3 pt-20 sm:gap-8 sm:px-10">
          {hives.map((hive, index) => {
            const stack = (
              <YardHive
                hive={hive}
                size="md"
                className="hive-bob"
                style={{ animationDelay: `${index * 0.35}s` }}
              />
            );
            return (
              <div key={hive.id} className="flex shrink-0 flex-col items-center gap-2">
                {interactive ? (
                  <Link
                    href={`/hives/${hive.id}`}
                    className="rounded-xl outline-none ring-honey-400/50 transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2"
                    aria-label={`${hive.name}, ${hive.status}`}
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
      )}

      <div
        className="relative h-10 bg-gradient-to-b from-[#5a9a3a] via-[#4a7a2e] to-[#3a5c22] dark:from-[#355224] dark:to-[#1a2a14]"
        aria-hidden
      >
        <div className="grass-sway absolute inset-x-0 -top-3 h-6 bg-[radial-gradient(ellipse_at_center,_#6aaa44_40%,_transparent_70%)] opacity-80" />
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
  return (
    <div className="relative overflow-hidden rounded-2xl border border-meadow-400/25">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#b9dff2] via-[#e7f4d8] to-[#7bb85a] dark:from-[#243044] dark:via-[#2a2618] dark:to-[#2d4a24]" />
      <div className="relative flex items-end gap-4 overflow-x-auto px-4 pb-2 pt-10">
        {hives.map((hive) => {
          const selected = hive.id === selectedId;
          return (
            <button
              key={hive.id}
              type="button"
              onClick={() => onSelect(hive.id)}
              className={cn(
                "shrink-0 rounded-xl px-1 pb-1 pt-2 outline-none transition-shadow",
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
      <div
        className="relative h-6 bg-gradient-to-b from-[#5a9a3a] to-[#3a5c22] dark:from-[#355224] dark:to-[#1a2a14]"
        aria-hidden
      />
    </div>
  );
}
