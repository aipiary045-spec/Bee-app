"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateYardAction } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface YardFormProps {
  yardId?: string;
  name: string;
  location: string;
  submitLabel?: string;
}

export function YardForm({
  yardId,
  name,
  location,
  submitLabel = "Save yard",
}: YardFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateYardAction({
        yardId,
        name: String(form.get("name") ?? ""),
        location: String(form.get("location") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="yard-name">Yard name</Label>
        <Input
          id="yard-name"
          name="name"
          required
          defaultValue={name}
          placeholder="Backyard, North pasture, City lot…"
          className="min-h-12 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="yard-location">Town or region</Label>
        <Input
          id="yard-location"
          name="location"
          defaultValue={location}
          placeholder="Austin, TX"
          className="min-h-12 rounded-xl"
        />
        <p className="text-sm leading-relaxed text-hive-600">
          Weather on Home and Quick Log is for this yard&apos;s town, not
          where you are standing. Use a place keepers would recognize.
        </p>
      </div>
      {error && <p className="text-sm text-crimson-600">{error}</p>}
      {saved && <p className="text-sm text-meadow-600">Yard saved.</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
