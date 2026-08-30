import Link from "next/link";
import { CalendarDays, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { isTreatmentOverdue } from "@/lib/treatments";

export type TreatmentCalendarItem = {
  id: string;
  hiveId: string;
  hiveName: string;
  productName: string;
  startDate: string;
  endDate: string | null;
  status: "planned" | "in_progress" | "completed";
};

interface TreatmentCalendarProps {
  treatments: TreatmentCalendarItem[];
}

export function TreatmentCalendar({ treatments }: TreatmentCalendarProps) {
  return (
    <Card className="fade-up-delay-2 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-honey-700" />
          Treatment calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {treatments.length === 0 ? (
          <p className="text-sm text-hive-500">
            No open treatments in this yard right now.
          </p>
        ) : (
          <ul className="divide-y divide-wax-300/60">
            {treatments.map((row) => {
              const overdue = isTreatmentOverdue(row.status, row.endDate);
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-hive-900">
                      <Link
                        href={`/hives/${row.hiveId}#treatments`}
                        className="hover:text-honey-700"
                      >
                        {row.hiveName}
                      </Link>
                      <span className="mx-2 text-hive-400">·</span>
                      {row.productName}
                    </p>
                    <p className="text-xs text-hive-500">
                      Started {formatDate(row.startDate)}
                      {row.endDate
                        ? ` · due ${formatDate(row.endDate)}`
                        : " · no end date"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        overdue
                          ? "danger"
                          : row.status === "in_progress"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {overdue
                        ? "Overdue"
                        : row.status === "in_progress"
                          ? "In progress"
                          : "Planned"}
                    </Badge>
                    <FlaskConical className="h-4 w-4 text-hive-400" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
