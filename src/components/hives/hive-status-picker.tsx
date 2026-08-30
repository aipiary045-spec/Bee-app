"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateHiveStatusAction } from "@/app/(app)/hives/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

type HiveStatus = Enums<"hive_status">;

const STATUS_OPTIONS: { value: HiveStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deadout", label: "Deadout" },
];

interface HiveStatusPickerProps {
  hiveId: string;
  status: HiveStatus;
}

export function HiveStatusPicker({ hiveId, status }: HiveStatusPickerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSelect(next: HiveStatus) {
    if (next === status || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await updateHiveStatusAction({ hiveId, status: next });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={status === option.value ? "default" : "outline"}
            size="sm"
            disabled={pending}
            onClick={() => onSelect(option.value)}
            className={cn(
              status === option.value &&
                option.value === "active" &&
                "bg-meadow-600 hover:bg-meadow-700",
              status === option.value &&
                option.value === "deadout" &&
                "bg-crimson-600 hover:bg-crimson-700"
            )}
          >
            {pending && status === option.value ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              option.label
            )}
          </Button>
        ))}
      </div>
      {error && <p className="text-xs text-crimson-600">{error}</p>}
    </div>
  );
}
