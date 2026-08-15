"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { completeSignupDetailsAction } from "@/app/(auth)/signup/actions";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupDetailsForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await completeSignupDetailsAction({
        keeperName: String(form.get("keeperName") ?? ""),
        yardName: String(form.get("yardName") ?? ""),
        location: String(form.get("location") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="fade-up w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="float-slow mx-auto mb-5 flex justify-center">
          <BrandLogo size={88} className="h-[5.25rem] w-[5.25rem]" priority />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-honey-700">
          Almost there
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold text-hive-900">
          Your yard
        </h1>
        <p className="mt-3 text-hive-600">
          Tell us who you are and where the stand sits. Weather will follow
          this town, not where you are standing.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="surface-panel relative space-y-4 overflow-hidden rounded-3xl p-7"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="space-y-2">
          <Label htmlFor="keeper-name">Your name</Label>
          <Input
            id="keeper-name"
            name="keeperName"
            required
            autoComplete="name"
            placeholder="Sam Rivera"
            className="min-h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yard-name">Yard name</Label>
          <Input
            id="yard-name"
            name="yardName"
            required
            placeholder="Backyard, North pasture…"
            className="min-h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yard-location">Town or region</Label>
          <Input
            id="yard-location"
            name="location"
            required
            placeholder="Austin, TX"
            className="min-h-12 rounded-xl"
          />
          <p className="text-sm leading-relaxed text-hive-600">
            Home reads the sky for this place.
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Open the yard
        </Button>
      </form>
    </div>
  );
}
