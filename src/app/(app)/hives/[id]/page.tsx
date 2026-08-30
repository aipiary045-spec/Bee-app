import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bug,
  ClipboardList,
  Crown,
  FlaskConical,
  Hexagon,
  Layers,
  QrCode,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { YardLede } from "@/components/yards/yard-lede";
import { HiveStackEditor } from "@/components/hives/hive-stack-editor";
import { LogHarvestDialog } from "@/components/hives/log-harvest-dialog";
import { StartTreatmentDialog } from "@/components/hives/start-treatment-dialog";
import { CompleteTreatmentButton } from "@/components/hives/complete-treatment-button";
import { InspectionList } from "@/components/hives/inspection-list";
import { HealthCharts } from "@/components/hives/health-charts";
import { QueenTimeline } from "@/components/hives/queen-timeline";
import { AddRevenueDialog } from "@/components/finances/add-revenue-dialog";
import { NavCard } from "@/components/ui/nav-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriorityAlertsBar } from "@/components/dashboard/priority-alerts";
import {
  getHiveById,
  listHoneySalesForHive,
  listHoneyYieldsForHive,
  listInspectionsForHive,
  listMiteCountsForHive,
  listTreatmentsForHive,
  listQueenLogsForHive,
} from "@/lib/hives";
import {
  buildHiveAlerts,
  buildTreatmentAlerts,
  mergeAlerts,
  MITE_THRESHOLD_PER_100,
} from "@/lib/alerts";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  formatSuperInventory,
  hiveSuperInventory,
} from "@/lib/supers";
import { broodScore } from "@/lib/health";
import { isTreatmentOverdue } from "@/lib/treatments";
import type { Inspection, MiteCount } from "@/lib/hives";

interface HiveDetailPageProps {
  params: Promise<{ id: string }>;
}

function miteReadings(counts: MiteCount[], inspections: Inspection[]) {
  const fromWashes = counts.map((row) => ({
    id: row.id,
    date: row.date,
    count: Number(row.count),
    source: "Alcohol wash",
  }));
  const linked = new Set(
    counts.map((row) => row.inspection_id).filter((id): id is string => Boolean(id))
  );
  const fromInspections = inspections
    .filter(
      (row) =>
        row.mite_count_per_100 != null && !linked.has(row.id)
    )
    .map((row) => ({
      id: row.id,
      date: row.date,
      count: Number(row.mite_count_per_100),
      source: "Quick Log",
    }));

  return [...fromWashes, ...fromInspections].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export default async function HiveDetailPage({ params }: HiveDetailPageProps) {
  const { id } = await params;
  let hive;
  try {
    hive = await getHiveById(id);
  } catch {
    hive = null;
  }

  if (!hive) notFound();

  const [inspections, miteCounts, yields, sales, treatments, queenLogs] =
    await Promise.all([
    listInspectionsForHive(id, 24).catch(() => []),
    listMiteCountsForHive(id).catch(() => []),
    listHoneyYieldsForHive(id).catch(() => []),
    listHoneySalesForHive(id).catch(() => []),
    listTreatmentsForHive(id).catch(() => []),
    listQueenLogsForHive(id).catch(() => []),
  ]);

  const alerts = mergeAlerts(
    buildHiveAlerts(
      [hive],
      inspections.map((row) => ({
        hiveId: row.hive_id,
        date: row.date,
        queenSighted: row.queen_sighted,
        miteCountPer100:
          row.mite_count_per_100 == null ? null : Number(row.mite_count_per_100),
        pestsDiseases: row.pests_diseases,
      }))
    ),
    buildTreatmentAlerts(
      [hive],
      treatments.map((row) => ({
        id: row.id,
        hiveId: row.hive_id,
        productName: row.product_name,
        endDate: row.end_date,
        status: row.status,
      }))
    )
  );

  const readings = miteReadings(miteCounts, inspections);
  const latestMite = readings[0];
  const harvestLbs = yields.reduce((sum, row) => sum + Number(row.weight_lbs), 0);
  const salesTotal = sales.reduce((sum, row) => sum + Number(row.amount), 0);
  const inventory = hiveSuperInventory(hive);
  const openTreatments = treatments.filter((row) => row.status !== "completed");
  const broodPoints = inspections.flatMap((row) => {
    const score = broodScore(row.brood_pattern);
    if (score == null) return [];
    return [
      {
        date: row.date,
        value: score,
        label: row.brood_pattern ?? undefined,
      },
    ];
  });

  const statusVariant =
    hive.status === "active"
      ? ("success" as const)
      : hive.status === "deadout"
        ? ("danger" as const)
        : ("muted" as const);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-3 -ml-2" asChild>
        <Link href="/hives">
          <ArrowLeft className="h-4 w-4" />
          All hives
        </Link>
      </Button>

      <PageHeader
        eyebrow={<YardLede />}
        title={hive.name}
        description={`${hive.apiary?.location ?? "Your apiary"} · ${formatSuperInventory(inventory)} · ${hive.frame_count} frames`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/hives/${hive.id}/qr`}>
              <QrCode className="h-4 w-4" />
              Tag
            </Link>
          </Button>
        }
      />

      <div className="fade-up-delay-1 mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant}>{hive.status}</Badge>
        <Badge variant="default">{hive.frame_count} frames</Badge>
        <Badge variant="default">{formatSuperInventory(inventory)}</Badge>
      </div>

      <Card className="fade-up-delay-1 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-honey-700" />
            Supers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HiveStackEditor hive={hive} />
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <div className="fade-up-delay-1 mb-6">
          <PriorityAlertsBar alerts={alerts} />
        </div>
      )}

      <div className="fade-up-delay-1 mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <NavCard
          href={`/inspect?hive=${hive.id}`}
          eyebrow="This visit"
          title="Quick Log"
          description="Queen, brood, supers, and notes for this box."
          icon={ClipboardList}
          featured
        />
        <NavCard
          href="#inspections"
          title="Inspections"
          description={
            inspections.length === 0
              ? "No visits yet — start with Quick Log."
              : `${inspections.length} recent visit${inspections.length === 1 ? "" : "s"} on file.`
          }
          icon={Hexagon}
        />
        <NavCard
          href="#mites"
          title="Mites"
          description={
            latestMite
              ? `Latest ${latestMite.count} / 100 · threshold ${MITE_THRESHOLD_PER_100}`
              : "No mite counts yet — log one on the next visit."
          }
          icon={Bug}
          accent={
            latestMite && latestMite.count >= MITE_THRESHOLD_PER_100
              ? "crimson"
              : "honey"
          }
        />
        <NavCard
          href="#treatments"
          title="Treatments"
          description={
            openTreatments.length === 0
              ? "No open treatments — start one when mites climb."
              : `${openTreatments.length} open treatment${openTreatments.length === 1 ? "" : "s"}.`
          }
          icon={FlaskConical}
          accent={
            openTreatments.some((row) =>
              isTreatmentOverdue(row.status, row.end_date)
            )
              ? "crimson"
              : "honey"
          }
        />
        <NavCard
          href="#harvest"
          title="Harvest"
          description={
            yields.length === 0
              ? "No pulls recorded — log a harvest when you take honey."
              : `${harvestLbs} lbs on file this record.`
          }
          icon={Crown}
          accent="meadow"
        />
      </div>

      <div className="fade-up-delay-2 mb-8 space-y-4">
          <QueenTimeline
            hiveId={hive.id}
            entries={queenLogs.map((row) => ({
              id: row.id,
              date: row.created_at.slice(0, 10),
              status: row.status,
              markColor: row.mark_color,
              notes: row.notes,
            }))}
          />

          <Card id="inspections">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span className="flex items-center gap-2">
                  <Hexagon className="h-4 w-4 text-honey-700" />
                  Inspections
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/inspect?hive=${hive.id}`}>Log visit</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inspections.length === 0 ? (
                <Link
                  href={`/inspect?hive=${hive.id}`}
                  className="block rounded-xl border border-dashed border-honey-400/40 bg-honey-50/50 px-4 py-6 text-center text-sm text-hive-600 transition-colors hover:border-honey-400/70 hover:bg-honey-50"
                >
                  No records yet — tap to open Quick Log for this colony.
                </Link>
              ) : (
                <InspectionList inspections={inspections} />
              )}
            </CardContent>
          </Card>

          <Card id="health">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bug className="h-4 w-4 text-honey-700" />
                Health trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthCharts
                mites={readings.map((row) => ({
                  date: row.date,
                  value: row.count,
                }))}
                brood={broodPoints}
              />
            </CardContent>
          </Card>

          <Card id="mites">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-honey-700" />
                  Mites
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/inspect?hive=${hive.id}`}>Log count</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readings.length === 0 ? (
                <Link
                  href={`/inspect?hive=${hive.id}`}
                  className="block rounded-xl border border-dashed border-honey-400/40 bg-honey-50/50 px-4 py-6 text-center text-sm text-hive-600 transition-colors hover:border-honey-400/70 hover:bg-honey-50"
                >
                  No mite counts yet — add one in Quick Log (per 100 bees).
                </Link>
              ) : (
                <ul className="divide-y divide-wax-300/60">
                  {readings.map((reading) => {
                    const high = reading.count >= MITE_THRESHOLD_PER_100;
                    return (
                      <li
                        key={reading.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-hive-900">
                            {formatDate(reading.date)}
                          </p>
                          <p className="text-xs text-hive-500">{reading.source}</p>
                        </div>
                        <Badge variant={high ? "danger" : "success"}>
                          {reading.count} / 100
                          {high ? " · treat" : ""}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card id="treatments">
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-honey-700" />
                  Treatments
                </span>
                <StartTreatmentDialog hiveId={hive.id} hiveName={hive.name} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {treatments.length === 0 ? (
                <p className="text-sm text-hive-500">
                  No treatments yet. Start Apivar, Formic Pro, OA vapor, or
                  another catalog product when the count calls for it.
                </p>
              ) : (
                <ul className="divide-y divide-wax-300/60">
                  {treatments.map((row) => {
                    const overdue = isTreatmentOverdue(row.status, row.end_date);
                    return (
                      <li
                        key={row.id}
                        className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-hive-900">
                            {row.product_name}
                          </p>
                          <p className="text-xs text-hive-500">
                            {formatDate(row.start_date)}
                            {row.end_date ? ` → ${formatDate(row.end_date)}` : ""}
                            {row.dosage ? ` · ${row.dosage}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              row.status === "completed"
                                ? "success"
                                : overdue
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {row.status === "completed"
                              ? "Completed"
                              : overdue
                                ? "Overdue"
                                : row.status === "in_progress"
                                  ? "In progress"
                                  : "Planned"}
                          </Badge>
                          {row.status !== "completed" && (
                            <CompleteTreatmentButton
                              treatmentId={row.id}
                              hiveId={hive.id}
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card id="harvest">
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-honey-700" />
                  Harvest
                </span>
                <div className="flex flex-wrap gap-2">
                  <LogHarvestDialog hiveId={hive.id} hiveName={hive.name} />
                  <AddRevenueDialog
                    hives={[{ id: hive.id, name: hive.name }]}
                    defaultHiveId={hive.id}
                    triggerLabel="Record sale"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-wax-300/60 bg-wax-50/70 px-4 py-3">
                  <p className="text-xs text-hive-500">Honey pulled</p>
                  <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                    {harvestLbs} lbs
                  </p>
                </div>
                <div className="rounded-xl border border-wax-300/60 bg-wax-50/70 px-4 py-3">
                  <p className="text-xs text-hive-500">Honey sales</p>
                  <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                    {formatCurrency(salesTotal)}
                  </p>
                </div>
              </div>

              {yields.length === 0 ? (
                <p className="text-sm text-hive-500">
                  No harvests yet. Log weight when you pull a super.
                </p>
              ) : (
                <ul className="divide-y divide-wax-300/60">
                  {yields.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-hive-900">
                          {formatDate(row.harvest_date)}
                        </p>
                        <p className="text-xs text-hive-500">
                          {row.frames_harvested
                            ? `${row.frames_harvested} frames`
                            : "Harvest"}
                          {row.notes ? ` · ${row.notes}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-hive-800">
                        {Number(row.weight_lbs)} lbs
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
