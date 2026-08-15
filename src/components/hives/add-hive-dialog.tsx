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
  const [mediumCount, setMediumCount] = useState("0");
  const [shallowCount, setShallowCount] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function reset() {
    setName("");
    setFrameCount("10");
    setMediumCount("0");
    setShallowCount("0");
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
        mediumCount: Number(mediumCount) || 0,
        shallowCount: Number(shallowCount) || 0,
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
                Add a colony to your yard. A printable Quick Log tag is ready
                right after.
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

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="frame-count">Frames</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="medium-count">Medium</Label>
                  <Input
                    id="medium-count"
                    type="number"
                    min={0}
                    max={12}
                    required
                    value={mediumCount}
                    onChange={(e) => setMediumCount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shallow-count">Shallow</Label>
                  <Input
                    id="shallow-count"
                    type="number"
                    min={0}
                    max={12}
                    required
                    value={shallowCount}
                    onChange={(e) => setShallowCount(e.target.value)}
                  />
                </div>
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
                {created.name} is on the stand. Print a tag later from the hive
                page if you want one on the box.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const id = created.id;
                  setOpen(false);
                  reset();
                  router.push(`/hives/${id}/qr`);
                }}
              >
                Print tag
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
