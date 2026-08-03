import { MapPin, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";
import { DEFAULT_LOCATION, DEFAULT_LAT, DEFAULT_LON } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Apiary defaults, location context for weather and seasonal advice, and account preferences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
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
                Add credentials to <code className="text-xs">.env.local</code>
              </span>
            </div>
            <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-hive-600">
              <li>Copy <code className="text-xs">.env.local.example</code> to <code className="text-xs">.env.local</code></li>
              <li>Add your Supabase project URL and anon key</li>
              <li>Run the migration in <code className="text-xs">supabase/migrations/</code></li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
