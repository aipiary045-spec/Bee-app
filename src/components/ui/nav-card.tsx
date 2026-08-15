import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  eyebrow?: string;
  accent?: "honey" | "meadow" | "crimson";
  featured?: boolean;
  className?: string;
}

const accents = {
  honey: {
    icon: "bg-honey-500/18 text-honey-800",
    featured: "border-honey-400/45 bg-gradient-to-br from-honey-100/80 via-wax-50 to-wax-100",
  },
  meadow: {
    icon: "bg-meadow-100 text-meadow-800",
    featured: "border-meadow-400/35 bg-gradient-to-br from-meadow-100/70 via-wax-50 to-wax-100",
  },
  crimson: {
    icon: "bg-crimson-100 text-crimson-800",
    featured: "border-crimson-300/40 bg-gradient-to-br from-crimson-50 via-wax-50 to-wax-100",
  },
};

export function NavCard({
  href,
  title,
  description,
  icon: Icon,
  eyebrow,
  accent = "honey",
  featured = false,
  className,
}: NavCardProps) {
  const tone = accents[accent];

  return (
    <Link
      href={href}
      className={cn(
        "surface-panel group flex h-full min-h-[8.5rem] flex-col justify-between rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-honey-400/50 hover:shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]",
        featured && tone.featured,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            featured ? "brand-mark text-white" : tone.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-hive-400 transition-transform group-hover:translate-x-0.5 group-hover:text-honey-700" />
      </div>
      <div className="mt-4">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-honey-700">
            {eyebrow}
          </p>
        )}
        <p className="font-display mt-1 text-xl font-semibold text-hive-900 group-hover:text-honey-800">
          {title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-hive-600">
          {description}
        </p>
      </div>
    </Link>
  );
}
