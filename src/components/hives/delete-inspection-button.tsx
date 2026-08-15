"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteInspectionAction } from "@/app/(app)/inspect/actions";
import { Button } from "@/components/ui/button";

interface DeleteInspectionButtonProps {
  inspectionId: string;
  dateLabel: string;
}

export function DeleteInspectionButton({
  inspectionId,
  dateLabel,
}: DeleteInspectionButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onRemove() {
    if (
      !confirm(
        `Remove the ${dateLabel} visit from the record? The boxes on the hive stay as they are.`
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteInspectionAction(inspectionId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={pending}
        aria-label={`Remove visit from ${dateLabel}`}
        className="text-hive-500 hover:text-crimson-700"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Remove
      </Button>
      {error && <p className="text-xs text-crimson-600">{error}</p>}
    </div>
  );
}
