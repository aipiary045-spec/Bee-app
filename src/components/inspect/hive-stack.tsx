import { cn } from "@/lib/utils";
import { formatSuperCount } from "@/lib/supers";

interface HiveStackProps {
  currentSupers: number;
  nextSupers: number;
  hiveName?: string;
  className?: string;
}

function SuperBox({
  label,
  state,
}: {
  label: string;
  state: "current" | "added" | "removed";
}) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-[9.5rem] items-center justify-center rounded-md border text-[11px] font-semibold tracking-wide transition-all duration-300",
        state === "current" &&
          "border-honey-600/50 bg-gradient-to-b from-honey-300 to-honey-500 text-honey-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        state === "added" &&
          "border-dashed border-meadow-600/70 bg-meadow-100/90 text-meadow-800 shadow-[0_0_0_3px_rgba(122,171,106,0.18)]",
        state === "removed" &&
          "border-crimson-400/40 bg-crimson-100/70 text-crimson-800/80 line-through opacity-70"
      )}
    >
      {label}
    </div>
  );
}

export function HiveStack({
  currentSupers,
  nextSupers,
  hiveName,
  className,
}: HiveStackProps) {
  const shown = Math.max(currentSupers, nextSupers, 0);
  const boxes = Array.from({ length: shown }, (_, index) => {
    const fromTop = shown - 1 - index;
    if (nextSupers > currentSupers) {
      return fromTop >= currentSupers ? ("added" as const) : ("current" as const);
    }
    if (nextSupers < currentSupers) {
      return fromTop >= nextSupers ? ("removed" as const) : ("current" as const);
    }
    return "current" as const;
  });

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      {hiveName && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-honey-700">
          {hiveName}
        </p>
      )}

      <div
        className="h-3.5 w-[10.25rem] rounded-t-lg border border-hive-800/70 bg-gradient-to-b from-hive-700 to-hive-900 shadow-sm"
        aria-hidden
      />

      {boxes.length === 0 ? (
        <p className="py-1 text-[11px] text-hive-500">No supers on yet</p>
      ) : (
        boxes.map((state, index) => (
          <SuperBox
            key={`${state}-${index}`}
            state={state}
            label={
              state === "added"
                ? "New super"
                : state === "removed"
                  ? "Coming off"
                  : "Honey super"
            }
          />
        ))
      )}

      <div className="flex h-12 w-[9.5rem] items-center justify-center rounded-md border border-hive-800/40 bg-gradient-to-b from-hive-600 to-hive-800 text-[11px] font-semibold tracking-wide text-wax-100 shadow-sm">
        Brood box
      </div>
      <div
        className="h-2 w-[10.25rem] rounded-b-md border border-hive-800/50 bg-hive-800"
        aria-hidden
      />

      <p className="mt-1 text-xs font-medium text-hive-700">
        After this visit: {formatSuperCount(nextSupers)}
      </p>
    </div>
  );
}
