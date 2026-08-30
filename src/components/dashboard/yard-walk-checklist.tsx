"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { YardWalkItem } from "@/lib/yard-walk-checklist";

interface YardWalkChecklistProps {
  items: YardWalkItem[];
}

export function YardWalkChecklist({ items }: YardWalkChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

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
    <Card className="fade-up-delay-1 mb-6 border-honey-400/25 bg-gradient-to-br from-honey-50/50 to-wax-50">
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
          {items.map((item) => {
            const isChecked = Boolean(checked[item.id]);
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  isChecked
                    ? "border-wax-300/50 bg-wax-50/50 opacity-70"
                    : item.severity === "danger"
                      ? "border-crimson-300/40 bg-crimson-50/40"
                      : "border-wax-300/60 bg-wax-50/70"
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    setChecked((current) => ({
                      ...current,
                      [item.id]: !current[item.id],
                    }))
                  }
                  aria-label={isChecked ? "Mark incomplete" : "Mark done"}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isChecked
                      ? "border-meadow-600 bg-meadow-600 text-white"
                      : "border-wax-400 bg-white text-transparent hover:border-honey-500"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-hive-900">
                    {item.hiveName}
                  </p>
                  <p className="text-sm text-hive-600">{item.message}</p>
                  <Link
                    href={item.href}
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
