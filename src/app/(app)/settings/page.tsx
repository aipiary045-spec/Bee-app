import { MapPin, Moon, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { YardForm } from "@/components/settings/yard-form";
import { AddYardForm } from "@/components/settings/add-yard-form";
import { YardSwitcher } from "@/components/yards/yard-switcher";
import { MiteIntervalEditor } from "@/components/dashboard/mite-interval-editor";
import { createClient } from "@/lib/supabase/server";
import { getYardsAndActive } from "@/lib/hives";
import { toYardChoice } from "@/lib/yards";
import { env } from "@/lib/env";

export default async function SettingsPage() {
  let userEmail: string | null = null;
  let yards: ReturnType<typeof toYardChoice>[] = [];
  let activeId = "";
  let yardName = "My Apiary";
  let yardLocation = "";
  let miteIntervalDays: number | null = null;

  if (env.isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
    if (user) {
      try {
        const { yards: list, active } = await getYardsAndActive(user.id);
        yards = list.map(toYardChoice);
        activeId = active.id;
        yardName = active.name;
        yardLocation = active.location?.trim() ?? "";
        miteIntervalDays =
          active.mite_check_interval_days != null
            ? Number(active.mite_check_interval_days)
            : null;
      } catch {
        // Keep the friendly defaults if the yard row is not ready yet.
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Settings"
        description="Your account, how the app looks at the stand, and every yard you keep."
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
              Yards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {yards.length > 0 && (
              <YardSwitcher yards={yards} activeId={activeId} />
            )}
            <YardForm
              key={activeId}
              yardId={activeId}
              name={yardName}
              location={yardLocation}
            />
            <div className="border-t border-wax-300/50 pt-5">
              <p className="mb-3 text-sm font-medium text-hive-900">
                Add another stand
              </p>
              <AddYardForm />
            </div>
          </CardContent>
        </Card>

        {activeId ? (
          <MiteIntervalEditor
            apiaryId={activeId}
            intervalDays={miteIntervalDays}
          />
        ) : null}
      </div>
    </div>
  );
}
