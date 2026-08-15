import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { GetAroundStrip } from "@/components/layout/get-around";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { PriorityAlertsBar } from "@/components/dashboard/priority-alerts";
import { HiveCard } from "@/components/hives/hive-card";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
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
  uniqueHiveCount,
} from "@/lib/alerts";
import type { Hive } from "@/lib/hives";
import type { HiveAlert } from "@/lib/alerts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hives: Hive[] = [];
  let alerts: HiveAlert[] = [];
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
    } catch {
      hives = [];
      alerts = [];
    }
  }

  const activeHives = hives.filter((hive) => hive.status === "active").length;
  const attentionCount = uniqueHiveCount(alerts);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Agra Apiary"
        title="Home"
        description="The yard first. Open a hive, or jump to Quick Log from the card."
      />

      <div className="fade-up-delay-1 mb-6">
        <PriorityAlertsBar alerts={alerts} />
      </div>

      <div className="fade-up-delay-1 mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <GetAroundStrip />
        <p className="text-sm text-hive-600">
          {hives.length === 0
            ? "Add a colony to start the yard."
            : `${activeHives} active · ${attentionCount} need a look`}
        </p>
      </div>

      <section className="fade-up-delay-2 mb-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              Yard
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-hive-900">
              Your hives
            </h2>
          </div>
          <Link
            href="/hives"
            className="text-sm font-semibold text-honey-700 transition-colors hover:text-honey-600"
          >
            Manage →
          </Link>
        </div>

        {hives.length === 0 ? (
          <div className="surface-panel rounded-2xl border-dashed px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <BrandLogo size={64} className="h-14 w-14" />
            </div>
            <p className="font-display text-lg font-semibold text-hive-900">
              No colonies yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-hive-600">
              Add your first hive, then Quick Log from the card on this page.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/hives">Add a hive</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hives.map((hive) => (
              <HiveCard key={hive.id} hive={hive} />
            ))}
          </div>
        )}
      </section>

      <div className="fade-up-delay-3 mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SummaryCards
            activeHives={activeHives}
            totalHives={hives.length}
            attentionCount={attentionCount}
          />
        </div>
        <WeatherWidget />
      </div>
    </div>
  );
}
