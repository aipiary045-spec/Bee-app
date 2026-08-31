"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createExpensesBatchAction } from "@/app/(app)/expenses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EXPENSE_CATALOG,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/expense-catalog";
import { formatCurrency } from "@/lib/utils";
import type { Enums } from "@/types/database";

type HiveOption = { id: string; name: string };

type Props = {
  hives: HiveOption[];
  triggerLabel?: string;
  triggerSize?: "default" | "sm";
};

const fieldClass =
  "w-full rounded-lg border border-wax-300/80 bg-wax-50/95 px-2.5 py-2 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40";

export function AddExpenseDialog({
  hives,
  triggerLabel = "Add Expense",
  triggerSize = "default",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [includeCustom, setIncludeCustom] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [customCategory, setCustomCategory] =
    useState<Enums<"expense_category">>("other");
  const [customAmount, setCustomAmount] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [hiveId, setHiveId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = useMemo(() => {
    let sum = selectedIds.reduce((acc, id) => {
      const amount = Number(amounts[id] ?? "");
      return acc + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
    if (includeCustom) {
      const custom = Number(customAmount);
      if (!Number.isNaN(custom)) sum += custom;
    }
    return sum;
  }, [selectedIds, amounts, includeCustom, customAmount]);

  function reset() {
    setSelectedIds([]);
    setAmounts({});
    setIncludeCustom(false);
    setCustomDescription("");
    setCustomCategory("other");
    setCustomAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setHiveId("");
    setError(null);
  }

  function toggleExpense(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        setAmounts((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return current.filter((item) => item !== id);
      }
      setAmounts((prev) => ({ ...prev, [id]: prev[id] ?? "" }));
      return [...current, id];
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payloadItems = [
      ...selectedIds.map((catalogId) => ({
        catalogId,
        amount: amounts[catalogId] ?? "",
      })),
      ...(includeCustom
        ? [
            {
              description: customDescription,
              category: customCategory,
              amount: customAmount,
            },
          ]
        : []),
    ];

    if (payloadItems.length === 0) {
      setError("Select at least one purchase, or add a custom expense.");
      return;
    }

    startTransition(async () => {
      const result = await createExpensesBatchAction({
        date,
        hiveId: hiveId || undefined,
        items: payloadItems,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size={triggerSize} className={triggerSize === "sm" ? "w-full sm:w-auto" : undefined}>
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add expenses</DialogTitle>
          <DialogDescription>
            Select one or more common purchases, enter prices, and optionally
            assign them to a hive.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="expense-catalog" className="text-xs">
              Common purchases (hold Ctrl/Cmd to select multiple)
            </Label>
            <select
              id="expense-catalog"
              multiple
              size={8}
              value={selectedIds}
              onChange={(e) => {
                const next = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setSelectedIds(next);
                setAmounts((prev) => {
                  const updated: Record<string, string> = {};
                  for (const id of next) {
                    updated[id] = prev[id] ?? "";
                  }
                  return updated;
                });
              }}
              className={fieldClass}
            >
              {(
                [
                  "equipment",
                  "treatments",
                  "feed",
                  "administrative",
                  "other",
                ] as const
              ).map((group) => (
                <optgroup key={group} label={EXPENSE_CATEGORY_LABELS[group]}>
                  {EXPENSE_CATALOG.filter((item) => item.category === group).map(
                    (item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    )
                  )}
                </optgroup>
              ))}
            </select>
            <p className="text-[11px] text-hive-500">
              On mobile, use the checklist below to select multiple items.
            </p>
          </div>

          <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-wax-300/50 bg-wax-50/70 p-2 sm:hidden">
            {EXPENSE_CATALOG.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-hive-700"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleExpense(item.id)}
                  className="h-3.5 w-3.5 accent-honey-600"
                />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </label>
            ))}
          </div>

          {selectedIds.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Prices</Label>
              {selectedIds.map((id) => {
                const item = EXPENSE_CATALOG.find((entry) => entry.id === id);
                if (!item) return null;
                return (
                  <div
                    key={id}
                    className="grid grid-cols-[1fr_7rem] items-center gap-2"
                  >
                    <span className="truncate text-sm text-hive-700">
                      {item.label}
                    </span>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-hive-500">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={amounts[id] ?? ""}
                        onChange={(e) =>
                          setAmounts((prev) => ({
                            ...prev,
                            [id]: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="h-9 pl-6"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-hive-700">
            <input
              type="checkbox"
              checked={includeCustom}
              onChange={(e) => setIncludeCustom(e.target.checked)}
              className="h-3.5 w-3.5 accent-honey-600"
            />
            Add a custom expense too
          </label>

          {includeCustom && (
            <div className="space-y-3 rounded-lg border border-wax-300/60 bg-wax-50/70 p-3">
              <div className="space-y-1.5">
                <Label htmlFor="custom-description" className="text-xs">
                  Description
                </Label>
                <Input
                  id="custom-description"
                  required={includeCustom}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="What did you buy?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-category" className="text-xs">
                    Category
                  </Label>
                  <select
                    id="custom-category"
                    value={customCategory}
                    onChange={(e) =>
                      setCustomCategory(
                        e.target.value as Enums<"expense_category">
                      )
                    }
                    className={fieldClass}
                  >
                    {(
                      Object.keys(
                        EXPENSE_CATEGORY_LABELS
                      ) as Enums<"expense_category">[]
                    ).map((key) => (
                      <option key={key} value={key}>
                        {EXPENSE_CATEGORY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="custom-amount" className="text-xs">
                    Amount ($)
                  </Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    required={includeCustom}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expense-date" className="text-xs">
                Date
              </Label>
              <Input
                id="expense-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense-hive" className="text-xs">
                Hive (optional)
              </Label>
              <select
                id="expense-hive"
                value={hiveId}
                onChange={(e) => setHiveId(e.target.value)}
                className={fieldClass}
              >
                <option value="">Apiary-wide</option>
                {hives.map((hive) => (
                  <option key={hive.id} value={hive.id}>
                    {hive.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedIds.length > 0 || includeCustom) && (
            <p className="text-right text-sm font-medium text-hive-800">
              Total: {formatCurrency(total)}
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save expenses
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
