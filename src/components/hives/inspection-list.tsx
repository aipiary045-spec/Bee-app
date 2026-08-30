"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DeleteInspectionButton } from "@/components/hives/delete-inspection-button";
import {
  formatInspectionLogLines,
  formatInspectionLogPreview,
  formatVisitTime,
} from "@/lib/inspection-log";
import { cn, formatDate } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Inspection = Tables<"inspections">;

interface InspectionListProps {
  inspections: Inspection[];
}

export function InspectionList({ inspections }: InspectionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <ul className="divide-y divide-wax-300/60">
      {inspections.map((inspection) => {
        const expanded = expandedId === inspection.id;
        const logLines = formatInspectionLogLines(inspection);
        const dateLabel = formatDate(inspection.date);
        const time = formatVisitTime(inspection.inspection_time);

        return (
          <li key={inspection.id} className="py-2 first:pt-0 last:pb-0">
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => toggle(inspection.id)}
                aria-expanded={expanded}
                className="min-w-0 flex-1 rounded-xl px-2 py-2 text-left transition-colors hover:bg-wax-50/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-hive-900">
                      {dateLabel}
                      {time && (
                        <span className="font-normal text-hive-500">
                          {" "}
                          · {time}
                        </span>
                      )}
                    </p>
                    {!expanded && (
                      <p className="mt-1 truncate text-sm text-hive-500">
                        {formatInspectionLogPreview(inspection)}
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 text-hive-400 transition-transform",
                      expanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                </div>

                {expanded && (
                  <div className="mt-2">
                    <ul className="space-y-1">
                      {logLines.map((line, index) => (
                        <li
                          key={`${inspection.id}-${index}`}
                          className="text-sm leading-relaxed text-hive-600"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                    {inspection.notes && (
                      <p className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-wax-300/60 bg-wax-50/70 px-3 py-2 text-sm leading-relaxed text-hive-700">
                        {inspection.notes}
                      </p>
                    )}
                  </div>
                )}
              </button>
              <DeleteInspectionButton
                inspectionId={inspection.id}
                dateLabel={dateLabel}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
