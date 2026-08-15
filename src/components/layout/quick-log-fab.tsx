"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

function inspectHref(pathname: string) {
  const match = pathname.match(/^\/hives\/([^/]+)$/);
  return match ? `/inspect?hive=${match[1]}` : "/inspect";
}

export function QuickLogFab() {
  const pathname = usePathname();
  const onInspect = pathname.startsWith("/inspect");
  const onSettings = pathname.startsWith("/settings");
  if (onInspect || onSettings) return null;

  return (
    <Link
      href={inspectHref(pathname)}
      className={cn(
        "nav-pop brand-mark fixed right-3 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(164,85,16,0.7)]",
        "bottom-24 lg:bottom-8 lg:right-6"
      )}
      aria-label="Open Quick Log"
    >
      <ClipboardList className="h-4 w-4" />
      Log
    </Link>
  );
}
