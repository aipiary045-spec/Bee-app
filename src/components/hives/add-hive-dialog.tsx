"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createHiveAction } from "@/app/(app)/hives/actions";
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

export function AddHiveDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frameCount, setFrameCount] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setFrameCount("10");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createHiveAction({
        name,
        frameCount: Number(frameCount) || 10,
        status: "active",
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
      router.push(`/hives/${result.hiveId}`);
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
          Add Hive
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a hive</DialogTitle>
          <DialogDescription>
            Create a colony in your Agra apiary. You can log inspections and mite
            counts after it exists.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hive-name">Name / number</Label>
            <Input
              id="hive-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hive 1"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frame-count">Frame count</Label>
            <Input
              id="frame-count"
              type="number"
              min={1}
              max={20}
              required
              value={frameCount}
              onChange={(e) => setFrameCount(e.target.value)}
            />
          </div>

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
              Create hive
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
