"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const inspectionFieldClass =
  "flex h-11 w-full rounded-xl border border-wax-300/80 bg-wax-50/95 px-3 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40 dark:bg-[#1c1610] dark:border-honey-400/25";

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
            value === opt.value
              ? "border-honey-500 bg-honey-500/20 text-hive-900"
              : "border-wax-300/70 bg-wax-50 text-hive-600 hover:border-honey-400/50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SectionCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="space-y-0 p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-honey-800">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-2">{children}</CardContent>
    </Card>
  );
}

export function MiteCheckFields({
  checked,
  count,
  onCheckedChange,
  onCountChange,
}: {
  checked: boolean;
  count: string;
  onCheckedChange: (checked: boolean) => void;
  onCountChange: (count: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label
        className={cn(
          "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
          checked
            ? "border-honey-500 bg-honey-500/20 text-hive-900"
            : "border-wax-300/70 bg-wax-50 text-hive-700 hover:border-honey-400/50"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-wax-400 accent-honey-500"
        />
        <span className="flex-1 text-left">Checked for mites this visit</span>
      </label>
      {checked && (
        <div className="space-y-1.5 rounded-xl border border-honey-400/30 bg-honey-50/50 p-3">
          <Label htmlFor="mites" className="text-xs">
            Mites / 100 bees
          </Label>
          <Input
            id="mites"
            type="number"
            min={0}
            step="0.1"
            required
            value={count}
            onChange={(e) => onCountChange(e.target.value)}
            className="h-11"
            placeholder="0"
          />
          <p className="text-xs text-hive-500">
            Alcohol wash, sugar roll, or sticky board — whatever you used.
          </p>
        </div>
      )}
    </div>
  );
}
