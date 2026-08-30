"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SeasonPanelProps {
  summary: string;
  children: React.ReactNode;
}

export function SeasonPanel({ summary, children }: SeasonPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="fade-up-delay-2 mb-6">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-honey-700">
            Season
          </span>
          <span className="font-display mt-0.5 block truncate text-base font-semibold text-hive-900">
            {summary}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-hive-500 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <CardContent className="space-y-6 border-t border-wax-300/50 pt-5">
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}
