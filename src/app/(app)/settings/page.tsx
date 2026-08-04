import { MapPin, QrCode, Settings, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { DEFAULT_LOCATION, DEFAULT_LAT, DEFAULT_LON } from "@/lib/utils";

export default async function SettingsPage() {
  let userEmail: string | null = null;
  const yardUrl = env.appUrl();

  if (env.isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Apiary defaults, location context for weather and seasonal advice, and account preferences."
        actions={<SignOutButton />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="fade-up-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-honey-600" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-wax-300/60 bg-wax-50/80 px-4 py-3">
              <span className="text-sm text-hive-600">Email</span>
              <span className="font-medium text-hive-900">
                {userEmail ?? "Not signed in"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-hive-600">
              Your apiary data is scoped to this account via Supabase Row Level
              Security.
            </p>
          </CardContent>
        </Card>

        <Card className="fade-up-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-honey-600" />
              Default Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-wax-300/60 bg-wax-50/80 px-4 py-3">
              <span className="text-sm text-hive-600">Location</span>
              <span className="font-medium text-hive-900">{DEFAULT_LOCATION}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-wax-300/60 bg-wax-50/80 px-4 py-3">
              <span className="text-sm text-hive-600">Coordinates</span>
              <span className="font-mono text-sm text-hive-800">
                {DEFAULT_LAT.toFixed(4)}, {DEFAULT_LON.toFixed(4)}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-hive-600">
              Weather widgets and seasonal foraging advice use this location.
              Override via{" "}
              <code className="rounded bg-wax-200 px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_DEFAULT_*
              </code>{" "}
              env vars.
            </p>
          </CardContent>
        </Card>

        <Card className="fade-up-delay-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-honey-600" />
              Yard QR access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={yardUrl ? "success" : "warning"}>
                {yardUrl ? "Configured" : "Not set"}
              </Badge>
            </div>
            <div className="rounded-lg border border-wax-300/60 bg-wax-50/80 px-4 py-3">
              <p className="text-xs text-hive-500">NEXT_PUBLIC_APP_URL</p>
              <p className="mt-1 break-all font-mono text-sm text-hive-900">
                {yardUrl ?? "Not configured"}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-hive-600">
              Hive QR codes use this LAN URL so phones on your Wi‑Fi can open
              Quick Log while the app is running. Keep the computer and phone on
              the same network.
            </p>
          </CardContent>
        </Card>

        <Card className="fade-up-delay-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-hive-600" />
              Supabase Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={env.isSupabaseConfigured() ? "success" : "warning"}>
                {env.isSupabaseConfigured() ? "Connected" : "Not configured"}
              </Badge>
              <span className="text-sm text-hive-600">
                Credentials live in <code className="text-xs">.env.local</code>
              </span>
            </div>
            <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-hive-600">
              <li>
                Create a project at{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-honey-700 hover:text-honey-600"
                >
                  supabase.com/dashboard
                </a>
              </li>
              <li>
                Copy Project URL + anon key into{" "}
                <code className="text-xs">.env.local</code>
              </li>
              <li>
                Run{" "}
                <code className="text-xs">
                  supabase/migrations/20260729000000_initial_schema.sql
                </code>{" "}
                in the SQL Editor
              </li>
              <li>
                Under Authentication → Providers, keep Email enabled. Optionally
                turn off “Confirm email” for faster local testing.
              </li>
              <li>Restart <code className="text-xs">npm run dev</code>, then sign up at /signup</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
