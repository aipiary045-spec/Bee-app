import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-wax-300/80 bg-wax-50/90 px-3 py-2 text-sm text-hive-900 shadow-sm transition-colors placeholder:text-hive-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40 focus-visible:border-honey-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1c1610] dark:border-honey-400/25",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
