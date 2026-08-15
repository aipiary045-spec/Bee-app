"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createYardAction } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddYardForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    startTransition(async () => {
      const result = await createYardAction({
        name: String(data.get("name") ?? ""),
        location: String(data.get("location") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-yard-name">New yard name</Label>
        <Input
          id="new-yard-name"
          name="name"
          required
          placeholder="Outyard, South lot…"
          className="min-h-12 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-yard-location">Town or region</Label>
        <Input
          id="new-yard-location"
          name="location"
          placeholder="Stillwater, OK"
          className="min-h-12 rounded-xl"
        />
        <p className="text-sm leading-relaxed text-hive-600">
          Each stand keeps its own weather. Leave this blank and that yard
          will wait for a town before it reads the sky.
        </p>
      </div>
      {error && <p className="text-sm text-crimson-600">{error}</p>}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Add yard
      </Button>
    </form>
  );
}
