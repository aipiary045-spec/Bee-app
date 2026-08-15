import { cn } from "@/lib/utils";
import {
  formatSuperInventory,
  type SuperInventory,
  type SuperType,
  type SuperVisitChange,
} from "@/lib/supers";

interface HiveStackProps {
  current: SuperInventory;
  change: SuperVisitChange;
  next: SuperInventory;
  hiveName?: string;
  className?: string;
}

function SuperBox({
  type,
  state,
}: {
  type: SuperType;
  state: "current" | "added" | "removed";
}) {
  const label =
    state === "added"
      ? type === "medium"
        ? "New medium"
        : "New shallow"
      : state === "removed"
        ? "Coming off"
        : type === "medium"
          ? "Medium"
          : "Shallow";

  return (
    <div
      className={cn(
        "relative flex w-[9.5rem] items-center justify-center rounded-md border text-[11px] font-semibold tracking-wide transition-all duration-300",
        type === "medium" ? "h-11" : "h-7",
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

function boxesOf(count: number, type: SuperType, state: "current" | "added" | "removed") {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    key: `${state}-${type}-${index}`,
    type,
    state,
  }));
}

export function HiveStack({
  current,
  change,
  next,
  hiveName,
  className,
}: HiveStackProps) {
  const remainingMedium = current.medium - change.mediumRemoved;
  const remainingShallow = current.shallow - change.shallowRemoved;

  const stack = [
    ...boxesOf(change.shallowRemoved, "shallow", "removed"),
    ...boxesOf(change.mediumRemoved, "medium", "removed"),
    ...boxesOf(change.shallowAdded, "shallow", "added"),
    ...boxesOf(remainingShallow, "shallow", "current"),
    ...boxesOf(change.mediumAdded, "medium", "added"),
    ...boxesOf(remainingMedium, "medium", "current"),
  ];

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      {hiveName && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-honey-700">
          {hiveName}
        </p>
      )}

      <div
        className="h-3.5 w-[10.25rem] rounded-t-lg border border-[#2a1c10] bg-gradient-to-b from-[#5a3d22] to-[#2a1a10] shadow-sm"
        aria-hidden
      />

      {stack.length === 0 ? (
        <p className="py-1 text-[11px] text-hive-500">No supers on yet</p>
      ) : (
        stack.map((box) => (
          <SuperBox key={box.key} type={box.type} state={box.state} />
        ))
      )}

      <div className="flex h-12 w-[9.5rem] items-center justify-center rounded-md border border-[#2a1c10]/40 bg-gradient-to-b from-[#5a3d22] to-[#2a1a10] text-[11px] font-semibold tracking-wide text-white shadow-sm">
        Brood box
      </div>
      <div
        className="h-2 w-[10.25rem] rounded-b-md border border-[#2a1c10]/50 bg-[#2a1a10]"
        aria-hidden
      />

      <p className="mt-1 text-xs font-medium text-hive-700">
        After this visit: {formatSuperInventory(next)}
      </p>
    </div>
  );
}
