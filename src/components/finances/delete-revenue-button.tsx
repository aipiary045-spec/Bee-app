"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteRevenueAction } from "@/app/(app)/finances/actions";
import { Button } from "@/components/ui/button";

type Props = {
  revenueId: string;
};

export function DeleteRevenueButton({ revenueId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("Delete this revenue entry?")) return;

    startTransition(async () => {
      const result = await deleteRevenueAction(revenueId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onDelete}
      disabled={pending}
      aria-label="Delete revenue"
      className="text-hive-500 hover:text-crimson-700"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
