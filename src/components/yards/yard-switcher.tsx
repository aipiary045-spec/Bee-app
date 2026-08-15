"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { selectYardAction } from "@/app/(app)/settings/actions";
import { cn } from "@/lib/utils";
import type { YardChoice } from "@/lib/yards";

interface YardSwitcherProps {
  yards: YardChoice[];
  activeId: string;
  compact?: boolean;
  className?: string;
}

export function YardSwitcher({
  yards,
  activeId,
  compact = false,
  className,
}: YardSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = yards.find((yard) => yard.id === activeId) ?? yards[0];

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = event.target.value;
    if (!nextId || nextId === activeId) return;
    startTransition(async () => {
      const result = await selectYardAction(nextId);
      if (result.ok) router.refresh();
    });
  }

  if (yards.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Active yard</span>
        <MapPin
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-honey-700"
          aria-hidden
        />
        <select
          value={active?.id ?? activeId}
          onChange={onChange}
          disabled={pending || yards.length === 1}
          className={cn(
            "w-full appearance-none truncate rounded-xl border border-wax-300/70 bg-wax-50/90 py-2.5 pl-9 pr-8 text-sm font-semibold text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40 disabled:opacity-100 dark:bg-[#1c1610] dark:border-honey-400/25",
            compact && "py-2 text-xs"
          )}
        >
          {yards.map((yard) => (
            <option key={yard.id} value={yard.id}>
              {yard.location ? `${yard.name} · ${yard.location}` : yard.name}
            </option>
          ))}
        </select>
      </label>
      <Link
        href="/settings#yard"
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-wax-300/70 bg-wax-50/90 text-honey-800 hover:bg-honey-50",
          compact && "h-9 w-9"
        )}
        aria-label="Add or edit yards"
        title="Add or edit yards"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </div>
  );
}
