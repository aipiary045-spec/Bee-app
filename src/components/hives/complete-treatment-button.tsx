"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { completeTreatmentAction } from "@/app/(app)/hives/actions";
import { Button } from "@/components/ui/button";

interface CompleteTreatmentButtonProps {
  treatmentId: string;
  hiveId: string;
}

export function CompleteTreatmentButton({
  treatmentId,
  hiveId,
}: CompleteTreatmentButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await completeTreatmentAction({
              treatmentId,
              hiveId,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        Complete
      </Button>
      {error && <p className="text-xs text-crimson-600">{error}</p>}
    </div>
  );
}
