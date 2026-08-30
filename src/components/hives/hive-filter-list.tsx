"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { HiveCard } from "@/components/hives/hive-card";
import { Input } from "@/components/ui/input";
import {
  HIVE_FILTER_OPTIONS,
  groupAlertsByHiveId,
  hiveMatchesFilter,
  type HiveFilterKey,
} from "@/lib/hive-filters";
import { cn } from "@/lib/utils";
import type { Hive } from "@/lib/hives";
import type { HiveAlert } from "@/lib/alerts";
import type { HiveHealthTone } from "@/lib/hive-health";

interface HiveFilterListProps {
  hives: Hive[];
  alerts: HiveAlert[];
  hiveHealth: Record<string, HiveHealthTone>;
}

export function HiveFilterList({
  hives,
  alerts,
  hiveHealth,
}: HiveFilterListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HiveFilterKey>("all");
  const alertsByHive = useMemo(() => groupAlertsByHiveId(alerts), [alerts]);

  const visible = hives.filter((hive) =>
    hiveMatchesFilter(hive, filter, alertsByHive, search)
  );

  return (
    <div>
      <div className="fade-up-delay-1 mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hive-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search hives…"
            className="pl-9"
            aria-label="Search hives"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {HIVE_FILTER_OPTIONS.map((option) => {
            const active = filter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "border-honey-500 bg-honey-500/15 text-honey-800"
                    : "border-wax-300/70 bg-wax-50/70 text-hive-600 hover:border-honey-400/60 hover:text-hive-800"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-wax-300/70 bg-wax-50/50 px-4 py-8 text-center text-sm text-hive-500">
          No hives match this filter.
        </p>
      ) : (
        <div className="stagger-in grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((hive) => (
            <HiveCard
              key={hive.id}
              hive={hive}
              healthTone={hiveHealth[hive.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
