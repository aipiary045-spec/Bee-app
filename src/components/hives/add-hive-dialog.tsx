"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createHiveAction } from "@/app/(app)/hives/actions";
import { HiveQrCard } from "@/components/hives/hive-qr-card";
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
  const [created, setCreated] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function reset() {
    setName("");
    setFrameCount("10");
    setError(null);
    setCreated(null);
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

      setCreated({ id: result.hiveId, name: name.trim() });
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
          Add Hive
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {!created ? (
          <>
            <DialogHeader>
              <DialogTitle>Add a hive</DialogTitle>
              <DialogDescription>
                Create a colony in your Agra apiary. A printable Quick Log QR
                code is generated right after.
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
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{created.name} created</DialogTitle>
              <DialogDescription>
                Download or print this QR code and attach it to the hive. Scanning
                opens Quick Log for this colony.
              </DialogDescription>
            </DialogHeader>

            <HiveQrCard
              hiveId={created.id}
              hiveName={created.name}
              variant="inline"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Done
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const id = created.id;
                  setOpen(false);
                  reset();
                  router.push(`/hives/${id}`);
                }}
              >
                View hive
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
