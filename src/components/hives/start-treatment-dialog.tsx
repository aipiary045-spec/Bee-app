"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Loader2 } from "lucide-react";
import { createTreatmentAction } from "@/app/(app)/hives/actions";
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
  TREATMENT_CATALOG,
  addDaysISO,
  getTreatmentCatalogItem,
} from "@/lib/treatments";
import { cn } from "@/lib/utils";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

interface StartTreatmentDialogProps {
  hiveId: string;
  hiveName: string;
}

export function StartTreatmentDialog({
  hiveId,
  hiveName,
}: StartTreatmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [catalogId, setCatalogId] = useState(TREATMENT_CATALOG[0].id);
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(
    addDaysISO(todayISO(), TREATMENT_CATALOG[0].defaultDays)
  );
  const [dosage, setDosage] = useState(TREATMENT_CATALOG[0].dosage);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => getTreatmentCatalogItem(catalogId),
    [catalogId]
  );

  function applyCatalog(id: string) {
    const item = getTreatmentCatalogItem(id);
    setCatalogId(id);
    if (!item) return;
    setDosage(item.dosage);
    setEndDate(addDaysISO(startDate, item.defaultDays));
  }

  function reset() {
    const first = TREATMENT_CATALOG[0];
    setCatalogId(first.id);
    setStartDate(todayISO());
    setEndDate(addDaysISO(todayISO(), first.defaultDays));
    setDosage(first.dosage);
    setNotes("");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createTreatmentAction({
        hiveId,
        productName: selected?.name ?? catalogId,
        startDate,
        endDate,
        dosage,
        notes,
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
        <Button variant="outline" size="sm">
          <FlaskConical className="h-4 w-4" />
          Start treatment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start treatment</DialogTitle>
          <DialogDescription>
            Log a product on {hiveName}. Complete it when strips or pads come
            out.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {TREATMENT_CATALOG.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyCatalog(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  catalogId === item.id
                    ? "border-honey-500 bg-honey-500/20 text-hive-900"
                    : "border-wax-300/70 bg-wax-50 text-hive-600 hover:border-honey-400/50"
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="treat-start" className="text-xs">
                Start
              </Label>
              <Input
                id="treat-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (selected) {
                    setEndDate(addDaysISO(e.target.value, selected.defaultDays));
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="treat-end" className="text-xs">
                Pull by
              </Label>
              <Input
                id="treat-end"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="treat-dose" className="text-xs">
              Dosage
            </Label>
            <Input
              id="treat-dose"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="treat-notes" className="text-xs">
              Notes
            </Label>
            <Input
              id="treat-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Temp, brood nest, leftover strips…"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
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
              Start
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
