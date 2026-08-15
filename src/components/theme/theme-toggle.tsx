"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-wax-300/70 bg-wax-50/80 px-3 py-2 text-sm font-medium text-hive-800 transition-colors hover:border-honey-400/50 hover:bg-honey-50/70",
        compact && "w-full justify-start",
        className
      )}
      aria-pressed={dark}
      aria-label={dark ? "Switch to honey light" : "Switch to field dark"}
    >
      {dark ? <Sun className="h-4 w-4 text-honey-400" /> : <Moon className="h-4 w-4 text-honey-700" />}
      {dark ? "Honey light" : "Field dark"}
    </button>
  );
}
