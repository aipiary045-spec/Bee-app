import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Crown,
  Hexagon,
  LineChart,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { HiveQrCard } from "@/components/hives/hive-qr-card";
import { NavCard } from "@/components/ui/nav-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHiveById, listInspectionsForHive } from "@/lib/hives";
import { formatDate } from "@/lib/utils";
import { formatSuperChange, formatSuperCount } from "@/lib/supers";
import type { Inspection } from "@/lib/hives";

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
  return parts.length > 0 ? parts.join(" · ") : "Inspection logged";
}

export default async function HiveDetailPage({ params }: HiveDetailPageProps) {
  const { id } = await params;
  let hive;
  let inspections: Inspection[] = [];
  try {
    hive = await getHiveById(id);
  } catch {
    hive = null;
  }

  if (!hive) notFound();

  try {
    inspections = await listInspectionsForHive(id);
  } catch {
    inspections = [];
  }

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

      <div className="fade-up-delay-1 mb-6 grid gap-3 sm:grid-cols-3">
        <NavCard
          href={`/inspect?hive=${hive.id}`}
          eyebrow="This visit"
          title="Quick Log"
          description="Record queen, brood, supers, and notes for this box."
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
          href="/finances"
          title="Honey & money"
          description="Log a harvest sale or a purchase against this yard."
          icon={Crown}
          accent="meadow"
        />
      </div>

      <div className="fade-up-delay-2 mb-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          <Card id="inspections">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hexagon className="h-4 w-4 text-honey-700" />
                Recent inspections
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LineChart className="h-4 w-4 text-honey-700" />
                  Health trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-hive-500">
                  Mite and brood charts will land here after a few Quick Logs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Crown className="h-4 w-4 text-honey-700" />
                  Honey yields
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href="/finances"
                  className="text-sm font-medium text-honey-700 hover:text-honey-600"
                >
                  Record a honey sale in Finances →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <HiveQrCard hiveId={hive.id} hiveName={hive.name} />
      </div>
    </div>
  );
}
