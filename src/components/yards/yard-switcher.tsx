"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { selectYardAction } from "@/app/(app)/settings/actions";
import { cn } from "@/lib/utils";
import type { YardChoice } from "@/lib/yards";

interface YardSwitcherProps {
  yards: YardChoice[];
  activeId: string;
  variant?: "lede" | "pill" | "chips";
  compact?: boolean;
  className?: string;
}

export function YardSwitcher({
  yards,
  activeId,
  variant,
  compact = false,
  className,
}: YardSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = yards.find((yard) => yard.id === activeId) ?? yards[0];
  const look = variant ?? (compact ? "pill" : "chips");

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function chooseYard(nextId: string) {
    setOpen(false);
    if (!nextId || nextId === activeId) return;
    startTransition(async () => {
      const result = await selectYardAction(nextId);
      if (result.ok) router.refresh();
    });
  }

  if (yards.length === 0 || !active) {
    return null;
  }

  if (look === "chips") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {yards.map((yard) => {
          const selected = yard.id === active.id;
          return (
            <button
              key={yard.id}
              type="button"
              disabled={pending || selected}
              onClick={() => chooseYard(yard.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                selected
                  ? "bg-honey-500/20 text-hive-900 ring-1 ring-honey-400/50"
                  : "bg-wax-100 text-hive-700 ring-1 ring-wax-300/70 hover:bg-honey-50"
              )}
            >
              {yard.name}
            </button>
          );
        })}
      </div>
    );
  }

  const triggerClass =
    look === "lede"
      ? "inline-flex max-w-full items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-honey-700 hover:text-honey-800"
      : "inline-flex max-w-full items-center gap-1.5 rounded-full border border-wax-300/70 bg-wax-50 px-3 py-1.5 text-sm font-semibold text-hive-900 shadow-sm hover:bg-honey-50 dark:bg-[#1c1610] dark:border-honey-400/25 dark:hover:bg-[#261c12]";

  return (
    <div ref={rootRef} className={cn("relative inline-flex max-w-full", className)}>
      <button
        type="button"
        disabled={pending || yards.length === 1}
        onClick={() => {
          if (yards.length > 1) setOpen((current) => !current);
        }}
        aria-haspopup={yards.length > 1 ? "listbox" : undefined}
        aria-expanded={yards.length > 1 ? open : undefined}
        className={cn(triggerClass, pending && "opacity-70")}
      >
        <span className="truncate">{active.name}</span>
        {yards.length > 1 && (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform",
              look === "lede" ? "text-honey-700" : "text-hive-500",
              open && "rotate-180"
            )}
            aria-hidden
          />
        )}
      </button>

      {open && yards.length > 1 && (
        <div
          role="listbox"
          aria-label="Yards"
          className="absolute left-0 top-full z-30 mt-1.5 min-w-[12.5rem] overflow-hidden rounded-2xl border border-wax-300/70 bg-wax-50 py-1 text-left font-normal normal-case tracking-normal shadow-lg dark:border-honey-400/25 dark:bg-[#1c1610]"
        >
          {yards.map((yard) => {
            const selected = yard.id === active.id;
            return (
              <button
                key={yard.id}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={pending}
                onClick={() => chooseYard(yard.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                  selected
                    ? "bg-honey-500/15 font-semibold text-hive-900"
                    : "text-hive-700 hover:bg-honey-50 dark:hover:bg-[#261c12]"
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    selected ? "text-honey-700" : "opacity-0"
                  )}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate">{yard.name}</span>
                  {yard.location ? (
                    <span className="block truncate text-[11px] font-medium text-hive-500">
                      {yard.location}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
          <Link
            href="/settings#yard"
            onClick={() => setOpen(false)}
            className="block border-t border-wax-300/50 px-3 py-2 text-xs font-semibold text-honey-800 hover:bg-honey-50 dark:hover:bg-[#261c12]"
          >
            Manage yards
          </Link>
        </div>
      )}
    </div>
  );
}
