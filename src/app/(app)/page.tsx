import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { YardLede } from "@/components/yards/yard-lede";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PriorityAlertsBar } from "@/components/dashboard/priority-alerts";
import { HarvestSummary } from "@/components/dashboard/harvest-summary";
import { SeasonalAdvice } from "@/components/dashboard/seasonal-advice";
import { YardWalkChecklist } from "@/components/dashboard/yard-walk-checklist";
import { TreatmentCalendar } from "@/components/dashboard/treatment-calendar";
import { YardScene } from "@/components/yard/yard-scene";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  listHivesForUser,
  listOpenTreatmentsForHives,
  listRecentInspectionsForHives,
  getHarvestSummaryForHives,
} from "@/lib/hives";
import {
  buildHiveAlerts,
  buildTreatmentAlerts,
  mergeAlerts,
  uniqueHiveCount,
} from "@/lib/alerts";
import { hiveHealthForYard } from "@/lib/hive-health";
import { buildYardWalkChecklist } from "@/lib/yard-walk-checklist";
import { fetchLocalWeather, type LocalWeather } from "@/lib/weather";
import type { Hive, Apiary } from "@/lib/hives";
import type { HiveAlert } from "@/lib/alerts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  let hives: Hive[] = [];
  let apiary: Apiary | null = null;
  let alerts: HiveAlert[] = [];
  let yardLocation = "";
  let weather: LocalWeather | null = null;
  let treatmentCalendar: {
    id: string;
    hiveId: string;
    hiveName: string;
    productName: string;
    startDate: string;
    endDate: string | null;
    status: "planned" | "in_progress" | "completed";
  }[] = [];
  let harvestSummary = {
    totalLbs: 0,
    pullCount: 0,
    hiveCount: 0,
  };
  let hiveHealth: ReturnType<typeof hiveHealthForYard> = {};
  let yardWalkItems: ReturnType<typeof buildYardWalkChecklist> = [];

  if (user) {
    try {
      const result = await listHivesForUser(user.id);
      hives = result.hives;
      apiary = result.apiary;
      yardLocation = result.apiary.location?.trim() ?? "";
      weather = await fetchLocalWeather({
        location: yardLocation,
      });
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
      const hiveNames = new Map(hives.map((hive) => [hive.id, hive.name]));
      treatmentCalendar = treatments.map((row) => ({
        id: row.id,
        hiveId: row.hive_id,
        hiveName: hiveNames.get(row.hive_id) ?? "Hive",
        productName: row.product_name,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
      }));
      harvestSummary = await getHarvestSummaryForHives(
        hives.map((hive) => ({ id: hive.id, name: hive.name }))
      );
      yardWalkItems = buildYardWalkChecklist(
        hives.map((hive) => ({ id: hive.id, name: hive.name })),
        alerts,
        treatmentCalendar
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
        eyebrow={<YardLede />}
        title="Home"
        description="Walk the stand. Tap a hive to open it, or Log to record a visit."
      />

      <div className="fade-up-delay-1 mb-6">
        <PriorityAlertsBar alerts={alerts} />
      </div>

      <SeasonalAdvice />

      <YardWalkChecklist items={yardWalkItems} />

      <TreatmentCalendar treatments={treatmentCalendar} />
      <HarvestSummary
        summary={harvestSummary}
        goalLbs={
          apiary?.harvest_goal_lbs != null
            ? Number(apiary.harvest_goal_lbs)
            : null
        }
        apiaryId={apiary?.id ?? ""}
      />

      <p className="fade-up-delay-1 mb-6 text-sm text-hive-600">
        {hives.length === 0
          ? "Add a colony to start the yard."
          : `${activeHives} active · ${attentionCount} need a look`}
      </p>

      <section className="fade-up-delay-2 mb-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              The stand
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-hive-900">
              Yard
            </h2>
          </div>
          <Link
            href="/hives"
            className="text-sm font-semibold text-honey-700 transition-colors hover:text-honey-600"
          >
            Manage →
          </Link>
        </div>

        <YardScene
          hives={hives}
          weather={weather}
          yardLocation={user ? yardLocation : undefined}
          showWeather
          hiveHealth={hiveHealth}
          empty={
            <div className="text-center">
              <div className="mx-auto mb-4 flex justify-center">
                <BrandLogo size={64} className="h-14 w-14" />
              </div>
              <p className="font-display text-lg font-semibold text-hive-900">
                Empty stand
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-hive-700">
                Add a colony and it will show up here with the supers on it.
              </p>
              <Button className="mt-5" asChild>
                <Link href="/hives">Add a hive</Link>
              </Button>
            </div>
          }
        />
      </section>

      <div className="fade-up-delay-3 mb-6">
        <SummaryCards
          activeHives={activeHives}
          totalHives={hives.length}
          attentionCount={attentionCount}
        />
      </div>
    </div>
  );
}
