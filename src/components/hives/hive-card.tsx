import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { YardHive } from "@/components/yard/yard-hive";
import { formatSuperInventory, hiveSuperInventory } from "@/lib/supers";
import { hiveHealthToneClass } from "@/lib/hive-health";
import { cn } from "@/lib/utils";
import type { Hive } from "@/lib/hives";
import type { HiveHealthTone } from "@/lib/hive-health";

function statusDot(status: Hive["status"]) {
  if (status === "active") return "bg-meadow-600";
  if (status === "deadout") return "bg-crimson-500";
  return "bg-hive-500";
}

interface HiveCardProps {
  hive: Pick<
    Hive,
    | "id"
    | "name"
    | "status"
    | "frame_count"
    | "super_count"
    | "medium_count"
    | "shallow_count"
    | "notes"
  >;
  healthTone?: HiveHealthTone;
  className?: string;
}

export function HiveCard({ hive, healthTone, className }: HiveCardProps) {
  const inventory = hiveSuperInventory(hive);

  return (
    <article
      className={cn(
        "lift-card surface-panel flex h-full flex-col overflow-hidden rounded-2xl hover:border-honey-400/50 hover:shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]",
        hiveHealthToneClass(healthTone),
        className
      )}
    >
      <Link href={`/hives/${hive.id}`} className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-hive-900">
              {hive.name}
            </p>
            <p className="mt-0.5 text-xs text-hive-600">
              <span className="capitalize">{hive.status}</span>
              <span className="mx-1.5 text-hive-400">·</span>
              {formatSuperInventory(inventory)}
            </p>
          </div>
          <div className="relative shrink-0">
            <span
              className={`absolute -right-0.5 -top-0.5 z-10 h-2.5 w-2.5 rounded-full ${statusDot(hive.status)} ${hive.status === "active" ? "sun-pulse" : ""}`}
              aria-hidden
            />
            <YardHive hive={hive} size="sm" showLabel={false} />
          </div>
        </div>
      </Link>
      <div className="border-t border-wax-300/50">
        <Link
          href={`/inspect?hive=${hive.id}`}
          className="inline-flex w-full items-center justify-center gap-1 bg-honey-500/10 px-2 py-2 text-center text-xs font-semibold text-honey-800 transition-colors hover:bg-honey-500/20"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Log
        </Link>
      </div>
    </article>
  );
}
