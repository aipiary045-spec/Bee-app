"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  groupYardWalkByHive,
  type YardWalkItem,
} from "@/lib/yard-walk-checklist";

interface YardWalkChecklistProps {
  items: YardWalkItem[];
}

export function YardWalkChecklist({ items }: YardWalkChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const groups = groupYardWalkByHive(items);

  if (items.length === 0) {
    return (
      <p className="fade-up-delay-1 mb-6 flex items-center gap-2 text-sm text-hive-600">
        <ClipboardList className="h-4 w-4 text-meadow-800" />
        Yard looks steady — nothing flagged for today.
      </p>
    );
  }

  const doneCount = items.filter((item) => checked[item.id]).length;

  return (
    <Card className="fade-up-delay-1 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-honey-700" />
            Today
          </span>
          <span className="text-xs font-normal text-hive-500">
            {doneCount}/{items.length} done
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {groups.map((group) => {
            const groupDone = group.items.every((item) => checked[item.id]);
            return (
              <li
                key={group.hiveId}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  groupDone
                    ? "border-wax-300/50 bg-white opacity-70"
                    : group.severity === "danger"
                      ? "border-crimson-300/40 bg-crimson-50/40"
                      : "border-wax-300/60 bg-white"
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    setChecked((current) => {
                      const next = { ...current };
                      const mark = !groupDone;
                      for (const item of group.items) next[item.id] = mark;
                      return next;
                    })
                  }
                  aria-label={groupDone ? "Mark incomplete" : "Mark done"}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    groupDone
                      ? "border-meadow-600 bg-meadow-600 text-white"
                      : "border-wax-400 bg-white text-transparent hover:border-honey-500"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-hive-900">
                    {group.hiveName}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-1.5 text-sm text-hive-600"
                      >
                        <span aria-hidden>•</span>
                        <span>{item.message}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={group.href}
                    className="mt-1 inline-block text-xs font-semibold text-honey-700 hover:text-honey-600"
                  >
                    Open →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
