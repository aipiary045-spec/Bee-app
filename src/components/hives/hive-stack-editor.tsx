"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus } from "lucide-react";
import { adjustHiveSupersAction } from "@/app/(app)/hives/actions";
import { HiveStack } from "@/components/inspect/hive-stack";
import { Button } from "@/components/ui/button";
import { emptySuperChange, hiveSuperInventory, type SuperType } from "@/lib/supers";
import { cn } from "@/lib/utils";
import type { Hive } from "@/lib/hives";

type EditorHive = Pick<
  Hive,
  "id" | "name" | "super_count" | "medium_count" | "shallow_count"
>;

interface HiveStackEditorProps {
  hive: EditorHive;
  compact?: boolean;
  className?: string;
}

export function HiveStackEditor({
  hive,
  compact = false,
  className,
}: HiveStackEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inventory = hiveSuperInventory(hive);

  function bump(type: SuperType, direction: "add" | "remove") {
    setError(null);
    startTransition(async () => {
      const result = await adjustHiveSupersAction({
        hiveId: hive.id,
        type,
        direction,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "grid items-center gap-4",
          compact ? "grid-cols-1" : "sm:grid-cols-[auto_1fr]"
        )}
      >
        {!compact && (
          <HiveStack
            current={inventory}
            change={emptySuperChange()}
            next={inventory}
            hiveName={hive.name}
            showAfterLabel={false}
          />
        )}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-hive-500">
                Medium · {inventory.medium}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending || inventory.medium <= 0}
                  onClick={() => bump("medium", "remove")}
                >
                  <Minus className="h-4 w-4" />
                  Pull
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={pending || inventory.medium + inventory.shallow >= 12}
                  onClick={() => bump("medium", "add")}
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-hive-500">
                Shallow · {inventory.shallow}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending || inventory.shallow <= 0}
                  onClick={() => bump("shallow", "remove")}
                >
                  <Minus className="h-4 w-4" />
                  Pull
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={pending || inventory.medium + inventory.shallow >= 12}
                  onClick={() => bump("shallow", "add")}
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>
            </div>
          </div>
          {error && (
            <p className="text-sm text-crimson-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
