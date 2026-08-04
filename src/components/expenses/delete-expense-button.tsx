"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteExpenseAction } from "@/app/(app)/expenses/actions";
import { Button } from "@/components/ui/button";

type Props = {
  expenseId: string;
};

export function DeleteExpenseButton({ expenseId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("Delete this expense?")) return;

    startTransition(async () => {
      const result = await deleteExpenseAction(expenseId);
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
      aria-label="Delete expense"
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
