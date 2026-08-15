import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  formatSuperInventory,
  hiveSuperInventory,
  type SuperInventory,
} from "@/lib/supers";
import type { Hive } from "@/lib/hives";

export type YardHiveData = Pick<
  Hive,
  | "id"
  | "name"
  | "status"
  | "super_count"
  | "medium_count"
  | "shallow_count"
>;

const sizes = {
  sm: {
    lid: "h-2.5 w-[4.35rem]",
    shallow: "h-3 w-16",
    medium: "h-5 w-16",
    brood: "h-8 w-16",
    board: "h-1.5 w-[4.35rem]",
    stand: "h-3 w-14",
    hole: "h-1.5 w-1.5",
    name: "text-[11px]",
    count: "text-[10px]",
  },
  md: {
    lid: "h-3.5 w-[5.6rem]",
    shallow: "h-4 w-[5.15rem]",
    medium: "h-6 w-[5.15rem]",
    brood: "h-11 w-[5.15rem]",
    board: "h-2 w-[5.6rem]",
    stand: "h-4 w-[4.6rem]",
    hole: "h-2 w-2",
    name: "text-sm",
    count: "text-[11px]",
  },
};

function Box({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[3px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
        className
      )}
    >
      <span
        className="pointer-events-none absolute inset-y-1 left-[18%] w-px bg-black/10"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-y-1 right-[18%] w-px bg-black/10"
        aria-hidden
      />
      {children}
    </div>
  );
}

interface YardHiveProps {
  hive: YardHiveData;
  inventory?: SuperInventory;
  selected?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function YardHive({
  hive,
  inventory,
  selected = false,
  size = "md",
  showLabel = true,
  className,
  style,
}: YardHiveProps) {
  const stack = inventory ?? hiveSuperInventory(hive);
  const scale = sizes[size];
  const dead = hive.status === "deadout";
  const quiet = hive.status !== "active";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-end gap-2",
        className
      )}
      style={style}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-px transition-transform duration-200",
          selected && "-translate-y-1",
          quiet && "opacity-70 grayscale-[0.35]"
        )}
      >
        <div
          className={cn(
            "rounded-t-md border border-[#3a2a18] bg-gradient-to-b from-[#6b4a28] to-[#3a2414]",
            scale.lid
          )}
          aria-hidden
        />

        {Array.from({ length: stack.shallow }).map((_, index) => (
          <Box
            key={`shallow-${index}`}
            className={cn(
              "border-[#c47a18] bg-gradient-to-b from-[#f3c35a] to-[#d4921c]",
              scale.shallow
            )}
          />
        ))}

        {Array.from({ length: stack.medium }).map((_, index) => (
          <Box
            key={`medium-${index}`}
            className={cn(
              "border-[#b86a12] bg-gradient-to-b from-[#efb23a] to-[#c4730f]",
              scale.medium
            )}
          />
        ))}

        <Box
          className={cn(
            "flex items-end justify-center border-[#2c2014] bg-gradient-to-b from-[#5a3d22] to-[#2a1a10] pb-1.5",
            scale.brood
          )}
        >
          <span
            className={cn(
              "rounded-full bg-[#1a120c] ring-1 ring-black/40",
              scale.hole
            )}
            aria-hidden
          />
        </Box>

        <div
          className={cn(
            "rounded-b-sm border border-[#2a1c10] bg-[#3d2a18]",
            scale.board
          )}
          aria-hidden
        />
        <div className="flex w-[72%] justify-between" aria-hidden>
          <span className={cn("w-1.5 rounded-sm bg-[#3a2814]", scale.stand)} />
          <span className={cn("w-1.5 rounded-sm bg-[#3a2814]", scale.stand)} />
        </div>
      </div>

      {showLabel && (
        <div className="text-center">
          <p
            className={cn(
              "font-display font-semibold leading-tight text-hive-900",
              scale.name,
              selected && "text-honey-800"
            )}
          >
            {hive.name}
          </p>
          <p className={cn("text-hive-600", scale.count)}>
            {dead ? "Deadout" : formatSuperInventory(stack)}
          </p>
        </div>
      )}
    </div>
  );
}
