"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hexagon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/lib/env";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = env.isSupabaseConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!configured) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          router.push("/");
          router.refresh();
          return;
        }

        setMessage(
          "Account created. Check your email to confirm, or sign in if email confirmation is disabled in Supabase."
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Authentication failed.";
      if (/failed to fetch|networkerror|load failed/i.test(raw)) {
        setError(
          "Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local (must be https://YOUR_REF.supabase.co with no quotes), save, restart npm run dev, and confirm the project is not paused."
        );
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-up w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="brand-mark float-slow mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl">
          <Hexagon className="h-8 w-8 text-wax-50" strokeWidth={2.5} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-honey-700">
          Apiary
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold text-hive-900">
          {mode === "login" ? "Welcome back" : "Join the yard"}
        </h1>
        <p className="mt-3 text-hive-600">
          {mode === "login"
            ? "Sign in to manage your apiary."
            : "Create an account to track hives, inspections, and harvests."}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="surface-panel relative space-y-4 overflow-hidden rounded-3xl p-7"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px shimmer-line" />
        {!configured && (
          <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Supabase keys missing in <code className="text-xs">.env.local</code>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="beekeeper@example.com"
            className="min-h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="min-h-12 rounded-xl"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl border border-meadow-400/30 bg-meadow-100 px-3 py-2 text-sm text-meadow-800">
            {message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-hive-600">
        {mode === "login" ? (
          <>
            New beekeeper?{" "}
            <Link href="/signup" className="font-semibold text-honey-700 hover:text-honey-600">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-honey-700 hover:text-honey-600">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
