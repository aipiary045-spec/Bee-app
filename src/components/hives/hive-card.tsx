import Link from "next/link";
import { ClipboardList, Hexagon, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HiveStackEditor } from "@/components/hives/hive-stack-editor";
import { formatSuperInventory, hiveSuperInventory } from "@/lib/supers";
import { cn } from "@/lib/utils";
import type { Hive } from "@/lib/hives";

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
  >;
  className?: string;
}

export function HiveCard({ hive, className }: HiveCardProps) {
  return (
    <article
      className={cn(
        "surface-panel flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:border-honey-400/50 hover:shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]",
        className
      )}
    >
      <Link href={`/hives/${hive.id}`} className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-honey-500/15 ring-1 ring-honey-400/20">
            <Hexagon className="h-5 w-5 text-honey-700" />
          </div>
          <span
            className={`mt-1 h-2.5 w-2.5 rounded-full ${statusDot(hive.status)}`}
            aria-hidden
          />
        </div>
        <p className="font-display mt-3 text-lg font-semibold text-hive-900">
          {hive.name}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={statusVariant(hive.status)}>{hive.status}</Badge>
          <Badge variant="default">{hive.frame_count} frames</Badge>
          <Badge variant="default">{formatSuperInventory(hiveSuperInventory(hive))}</Badge>
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
