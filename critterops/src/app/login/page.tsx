"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setPending(false);
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Could not sign in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <BrandMark size={56} />
          <div>
            <p className="text-lg font-semibold">The Wildlife Pros</p>
            <p className="text-sm text-muted">CritterOps field login</p>
          </div>
        </div>
        <label className="mb-3 block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            defaultValue="dawson@thewildlifepros.com"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            required
          />
        </label>
        <label className="mb-4 block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            defaultValue="DawsonField1"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            required
          />
        </label>
        {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-xs text-muted">
          Demo: dawson@thewildlifepros.com / DawsonField1
        </p>
      </form>
    </main>
  );
}
