"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecordsAccordionProps {
  children: React.ReactNode;
}

const RECORD_HASHES = new Set([
  "#inspections",
  "#health",
  "#mites",
  "#treatments",
  "#harvest",
]);

export function RecordsAccordion({ children }: RecordsAccordionProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function openFromHash() {
      if (RECORD_HASHES.has(window.location.hash)) setOpen(true);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [open]);

  return (
    <Card className="mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-honey-700">
            Records
          </span>
          <span className="font-display text-base font-semibold text-hive-900">
            Inspections, mites, treatments, harvest
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
        <div className="space-y-4 border-t border-wax-300/50 px-4 py-4 sm:px-5">
          {children}
        </div>
      ) : null}
    </Card>
  );
}
