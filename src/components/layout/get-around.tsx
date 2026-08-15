import Link from "next/link";
import { ClipboardList, DollarSign, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/inspect", label: "Quick Log", icon: ClipboardList, featured: true },
  { href: "/finances", label: "Finances", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function GetAroundStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map(({ href, label, icon: Icon, featured }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            featured
              ? "border-honey-500/50 bg-honey-500/15 text-honey-900 hover:bg-honey-500/25"
              : "border-wax-300/70 bg-wax-50/80 text-hive-700 hover:border-honey-400/50 hover:bg-honey-50/60"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </div>
  );
}
