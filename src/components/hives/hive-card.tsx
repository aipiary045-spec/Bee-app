import Link from "next/link";
import { ClipboardList, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HiveStackEditor } from "@/components/hives/hive-stack-editor";
import { YardHive } from "@/components/yard/yard-hive";
import { formatSuperInventory, hiveSuperInventory } from "@/lib/supers";
import { hiveHealthToneClass } from "@/lib/hive-health";
import { cn } from "@/lib/utils";
import type { Hive } from "@/lib/hives";
import type { HiveHealthTone } from "@/lib/hive-health";

function statusVariant(status: Hive["status"]) {
  if (status === "active") return "success" as const;
  if (status === "deadout") return "danger" as const;
  return "muted" as const;
}

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
  return (
    <article
      className={cn(
        "lift-card surface-panel flex h-full flex-col overflow-hidden rounded-2xl hover:border-honey-400/50 hover:shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]",
        hiveHealthToneClass(healthTone),
        className
      )}
    >
      <Link href={`/hives/${hive.id}`} className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-hive-900">
              {hive.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={statusVariant(hive.status)}>{hive.status}</Badge>
              <Badge variant="default">{hive.frame_count} frames</Badge>
              <Badge variant="default">{formatSuperInventory(hiveSuperInventory(hive))}</Badge>
            </div>
            {hive.notes?.trim() && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-hive-600">
                {hive.notes.trim()}
              </p>
            )}
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
      <div className="border-t border-wax-300/50 px-3 py-3">
        <HiveStackEditor hive={hive} compact />
      </div>
      <div className="grid grid-cols-3 border-t border-wax-300/50">
        <Link
          href={`/hives/${hive.id}`}
          className="px-2 py-2.5 text-center text-xs font-semibold text-hive-700 transition-colors hover:bg-honey-50/80 hover:text-honey-800"
        >
          Details
        </Link>
        <Link
          href={`/hives/${hive.id}/qr`}
          className="inline-flex items-center justify-center gap-1 border-l border-wax-300/50 px-2 py-2.5 text-center text-xs font-semibold text-hive-700 transition-colors hover:bg-honey-50/80 hover:text-honey-800"
        >
          <QrCode className="h-3.5 w-3.5" />
          Tag
        </Link>
        <Link
          href={`/inspect?hive=${hive.id}`}
          className="inline-flex items-center justify-center gap-1 border-l border-wax-300/50 bg-honey-500/10 px-2 py-2.5 text-center text-xs font-semibold text-honey-800 transition-colors hover:bg-honey-500/20"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Log
        </Link>
      </div>
    </article>
  );
}
