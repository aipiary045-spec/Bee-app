import { PageHeader } from "@/components/layout/page-header";
import { YardLede } from "@/components/yards/yard-lede";
import { AddHiveDialog } from "@/components/hives/add-hive-dialog";
import { HiveFilterList } from "@/components/hives/hive-filter-list";
import { Card, CardContent } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/server";
import {
  listHivesForUser,
  listOpenTreatmentsForHives,
  listRecentInspectionsForHives,
} from "@/lib/hives";
import {
  buildHiveAlerts,
  buildTreatmentAlerts,
  mergeAlerts,
} from "@/lib/alerts";
import { hiveHealthForYard } from "@/lib/hive-health";
import type { Hive } from "@/lib/hives";
import type { HiveAlert } from "@/lib/alerts";

export default async function HivesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hives: Hive[] = [];
  let alerts: HiveAlert[] = [];
  let hiveHealth: ReturnType<typeof hiveHealthForYard> = {};
  let loadError: string | null = null;

  if (user) {
    try {
      const result = await listHivesForUser(user.id);
      hives = result.hives;
      const hiveIds = hives.map((hive) => hive.id);
      const [inspections, treatments] = await Promise.all([
        listRecentInspectionsForHives(hiveIds),
        listOpenTreatmentsForHives(hiveIds).catch(() => []),
      ]);
      alerts = mergeAlerts(
        buildHiveAlerts(hives, inspections),
        buildTreatmentAlerts(
          hives,
          treatments.map((row) => ({
            id: row.id,
            hiveId: row.hive_id,
            productName: row.product_name,
            endDate: row.end_date,
            status: row.status,
          }))
        )
      );
      hiveHealth = hiveHealthForYard(hives, alerts);
    } catch (err) {
      loadError =
        err instanceof Error ? err.message : "Failed to load hives.";
      if (/relation .* does not exist|Could not find the table/i.test(loadError)) {
        loadError =
          "Database tables are missing. Open the Supabase SQL Editor and run supabase/migrations/20260729000000_initial_schema.sql, then refresh.";
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={<YardLede />}
        title="Hives"
        actions={<AddHiveDialog />}
      />

      {loadError && (
        <div className="mb-6 rounded-xl border border-crimson-300/40 bg-crimson-50 px-4 py-3 text-sm text-crimson-800">
          {loadError}
        </div>
      )}

      {!loadError && hives.length === 0 && (
        <Card className="fade-up-delay-1 mb-8 border-dashed border-honey-400/40 bg-honey-50/50">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex justify-center">
              <BrandLogo size={64} className="h-14 w-14" />
            </div>
            <p className="font-display text-lg font-semibold text-hive-900">
              No hives yet
            </p>
            <p className="max-w-sm text-sm text-hive-600">
              Add your first colony to start logging inspections, mite counts,
              and honey yields.
            </p>
            <AddHiveDialog />
          </CardContent>
        </Card>
      )}

      {hives.length > 0 && (
        <HiveFilterList hives={hives} alerts={alerts} hiveHealth={hiveHealth} />
      )}
    </div>
  );
}
