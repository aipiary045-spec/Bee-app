import Link from "next/link";
import { Hexagon, MapPin, Moon, QrCode, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { DEFAULT_LOCATION } from "@/lib/utils";

export default async function SettingsPage() {
  let userEmail: string | null = null;

  if (env.isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Settings"
        description="Your account, how the app looks at the stand, and this yard."
      />

      <div className="space-y-4">
        <Card id="account" className="fade-up-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-honey-600" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-wax-300/60 bg-wax-50/80 px-4 py-3">
              <span className="text-sm text-hive-600">Signed in as</span>
              <span className="text-right font-medium text-hive-900">
                {userEmail ?? "Not signed in"}
              </span>
            </div>
            <SignOutButton className="w-full sm:w-auto" />
          </CardContent>
        </Card>

        <Card id="look" className="fade-up-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-honey-600" />
              Look
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-hive-900">Field dark</p>
                <p className="mt-1 text-sm text-hive-600">
                  Bigger type and higher contrast for the stand. Honey and wax
                  stay the usual look until you switch.
                </p>
              </div>
              <ThemeToggle className="shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card id="yard" className="fade-up-delay-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-honey-600" />
              Yard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-wax-300/60 bg-wax-50/80 px-4 py-3">
              <span className="text-sm text-hive-600">Location</span>
              <span className="font-medium text-hive-900">{DEFAULT_LOCATION}</span>
            </div>
            <p className="text-sm leading-relaxed text-hive-600">
              Weather on Home uses this yard. Forage notes follow the Oklahoma
              season.
            </p>
          </CardContent>
        </Card>

        <Card id="tags" className="fade-up-delay-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-honey-600" />
              Hive tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-hive-600">
              Each hive has a QR you can print and stick on the box. Scan it
              with your phone to open Quick Log for that colony.
            </p>
            <Button variant="outline" asChild>
              <Link href="/hives">
                <Hexagon className="h-4 w-4" />
                Open hives
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
