import { MapPin, Moon, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { YardForm } from "@/components/settings/yard-form";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultApiary } from "@/lib/hives";
import { env } from "@/lib/env";

export default async function SettingsPage() {
  let userEmail: string | null = null;
  let yardName = "My Apiary";
  let yardLocation = "";

  if (env.isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
    if (user) {
      try {
        const apiary = await getOrCreateDefaultApiary(user.id);
        yardName = apiary.name;
        yardLocation = apiary.location?.trim() ?? "";
      } catch {
        // Keep the friendly defaults if the yard row is not ready yet.
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Settings"
        description="Your account, how the app looks at the stand, and the yard other keepers would recognize."
      />

      <div className="stagger-in space-y-4">
        <Card id="account">
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

        <Card id="look">
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

        <Card id="yard">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-honey-600" />
              Yard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <YardForm name={yardName} location={yardLocation} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
