import Link from "next/link";
import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { formatQueenMarkYear } from "@/lib/queen-lifecycle";
import type { Enums } from "@/types/database";

export type QueenLogEntry = {
  id: string;
  date: string;
  status: Enums<"queen_status">;
  markColor: Enums<"queen_mark_color"> | null;
  notes: string | null;
};

const statusLabels: Record<Enums<"queen_status">, string> = {
  marked: "Marked queen",
  virgin: "Virgin queen",
  laying: "Laying queen",
  cell_check: "Queen cells checked",
  replaced: "Queen replaced",
};

const markLabels: Record<Enums<"queen_mark_color">, string> = {
  white: "White mark",
  yellow: "Yellow mark",
  red: "Red mark",
  green: "Green mark",
  blue: "Blue mark",
  unmarked: "Unmarked",
};

interface QueenTimelineProps {
  entries: QueenLogEntry[];
  hiveId: string;
}

export function QueenTimeline({ entries, hiveId }: QueenTimelineProps) {
  return (
    <Card id="queen" className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-honey-700" />
            Queen timeline
          </span>
          <Link
            href={`/inspect?hive=${hiveId}`}
            className="text-xs font-semibold text-honey-700 hover:text-honey-600"
          >
            Log sighting →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-hive-500">
            No queen sightings logged yet. Mark a queen in Quick Log to start the
            timeline.
          </p>
        ) : (
          <ul className="divide-y divide-wax-300/60">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-hive-900">
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-sm text-hive-600">
                    {statusLabels[entry.status]}
                    {entry.markColor && entry.markColor !== "unmarked"
                      ? ` · ${markLabels[entry.markColor]}`
                      : ""}
                  </p>
                  {entry.notes && (
                    <p className="mt-1 text-xs text-hive-500">{entry.notes}</p>
                  )}
                </div>
                {entry.markColor && entry.markColor !== "unmarked" && (
                  <Badge variant="default">
                    {[
                      markLabels[entry.markColor],
                      formatQueenMarkYear(
                        entry.markColor,
                        Number(entry.date.slice(0, 4))
                      ),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
