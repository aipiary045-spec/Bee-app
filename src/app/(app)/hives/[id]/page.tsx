import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bug,
  ClipboardList,
  Crown,
  Hexagon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { HiveQrCard } from "@/components/hives/hive-qr-card";
import { LogHarvestDialog } from "@/components/hives/log-harvest-dialog";
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
} from "@/lib/hives";
import { buildHiveAlerts, MITE_THRESHOLD_PER_100 } from "@/lib/alerts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatSuperChange, formatSuperCount } from "@/lib/supers";
import type { Inspection, MiteCount } from "@/lib/hives";

interface HiveDetailPageProps {
  params: Promise<{ id: string }>;
}

function inspectionSummary(inspection: Inspection) {
  const parts: string[] = [];
  const added = inspection.supers_added ?? 0;
  const removed = inspection.supers_removed ?? 0;
  if (added > 0 || removed > 0) {
    parts.push(formatSuperChange(added, removed));
    if (inspection.super_count_after != null) {
      parts.push(`now ${formatSuperCount(inspection.super_count_after)}`);
    }
  }
  if (inspection.action_fed) parts.push("Fed");
  if (inspection.action_split) parts.push("Split");
  if (inspection.action_treatment) parts.push("Treated");
  if (inspection.queen_sighted === "yes") parts.push("Queen seen");
  if (inspection.mite_count_per_100 != null) {
    parts.push(`${inspection.mite_count_per_100} mites / 100`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Inspection logged";
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

  const [inspections, miteCounts, yields, sales] = await Promise.all([
    listInspectionsForHive(id, 12).catch(() => []),
    listMiteCountsForHive(id).catch(() => []),
    listHoneyYieldsForHive(id).catch(() => []),
    listHoneySalesForHive(id).catch(() => []),
  ]);

  const alerts = buildHiveAlerts(
    [hive],
    inspections.map((row) => ({
      hiveId: row.hive_id,
      date: row.date,
      queenSighted: row.queen_sighted,
      miteCountPer100:
        row.mite_count_per_100 == null ? null : Number(row.mite_count_per_100),
      pestsDiseases: row.pests_diseases,
    }))
  );

  const readings = miteReadings(miteCounts, inspections);
  const latestMite = readings[0];
  const harvestLbs = yields.reduce((sum, row) => sum + Number(row.weight_lbs), 0);
  const salesTotal = sales.reduce((sum, row) => sum + Number(row.amount), 0);

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
        eyebrow={hive.apiary?.name ?? "Colony"}
        title={hive.name}
        description={`${hive.apiary?.location ?? "Your apiary"} · ${formatSuperCount(hive.super_count)} · ${hive.frame_count} frames`}
        actions={
          <Button asChild>
            <Link href={`/inspect?hive=${hive.id}`}>
              <ClipboardList className="h-4 w-4" />
              Quick Log
            </Link>
          </Button>
        }
      />

      <div className="fade-up-delay-1 mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant}>{hive.status}</Badge>
        <Badge variant="default">{hive.frame_count} frames</Badge>
        <Badge variant="default">{formatSuperCount(hive.super_count)}</Badge>
      </div>

      {alerts.length > 0 && (
        <div className="fade-up-delay-1 mb-6">
          <PriorityAlertsBar alerts={alerts} />
        </div>
      )}

      <div className="fade-up-delay-1 mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="fade-up-delay-2 mb-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
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
                <ul className="divide-y divide-wax-300/60">
                  {inspections.map((inspection) => (
                    <li key={inspection.id}>
                      <Link
                        href={`/inspect?hive=${hive.id}`}
                        className="flex flex-col gap-1 py-3 transition-colors first:pt-0 last:pb-0 hover:text-honey-800 sm:flex-row sm:items-baseline sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-hive-900">
                            {formatDate(inspection.date)}
                          </p>
                          <p className="text-sm text-hive-600">
                            {inspectionSummary(inspection)}
                          </p>
                        </div>
                        {inspection.notes && (
                          <p className="max-w-md truncate text-xs text-hive-500">
                            {inspection.notes}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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
        <HiveQrCard hiveId={hive.id} hiveName={hive.name} />
      </div>
    </div>
  );
}
