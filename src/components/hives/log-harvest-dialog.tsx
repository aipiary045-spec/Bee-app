"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createHarvestAction } from "@/app/(app)/hives/actions";
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

interface LogHarvestDialogProps {
  hiveId: string;
  hiveName: string;
}

export function LogHarvestDialog({ hiveId, hiveName }: LogHarvestDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [harvestDate, setHarvestDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [weightLbs, setWeightLbs] = useState("");
  const [framesHarvested, setFramesHarvested] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setHarvestDate(new Date().toISOString().slice(0, 10));
    setWeightLbs("");
    setFramesHarvested("");
    setNotes("");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createHarvestAction({
        hiveId,
        harvestDate,
        weightLbs,
        framesHarvested,
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
        <Button>
          <Plus className="h-4 w-4" />
          Log harvest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log harvest</DialogTitle>
          <DialogDescription>
            Record what came off {hiveName}. Sales still go in Finances.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="harvest-date">Date</Label>
            <Input
              id="harvest-date"
              type="date"
              required
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="harvest-weight">Weight (lbs)</Label>
              <Input
                id="harvest-weight"
                type="number"
                min={0}
                step="0.1"
                required
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvest-frames">Frames (optional)</Label>
              <Input
                id="harvest-frames"
                type="number"
                min={0}
                value={framesHarvested}
                onChange={(e) => setFramesHarvested(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="harvest-notes">Notes</Label>
            <textarea
              id="harvest-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Capped, moisture, which super…"
              className="w-full rounded-lg border border-wax-300/80 bg-wax-50/95 px-3 py-2 text-sm text-hive-900 shadow-sm placeholder:text-hive-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
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
              Save harvest
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
