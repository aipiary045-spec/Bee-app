import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Hexagon, LineChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { HiveQrCard } from "@/components/hives/hive-qr-card";
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

  const tabs = [
    { label: "Health Trends", icon: LineChart },
    { label: "Honey Yields", icon: Crown },
  ];

  const statusVariant =
    hive.status === "active"
      ? ("success" as const)
      : hive.status === "deadout"
        ? ("danger" as const)
        : ("muted" as const);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/hives">
          <ArrowLeft className="h-4 w-4" />
          All Hives
        </Link>
      </Button>

      <PageHeader
        eyebrow={hive.apiary?.name ?? "Colony Detail"}
        title={hive.name}
        description={`Located in ${hive.apiary?.location ?? "your apiary"}. Inspection charts and mite trends will appear here as you log field data.`}
      />

      <div className="fade-up-delay-1 mb-8 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant}>{hive.status}</Badge>
        <Badge variant="default">{hive.frame_count} frames</Badge>
        <Badge variant="default">{formatSuperCount(hive.super_count)}</Badge>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/inspect?hive=${hive.id}`}>Quick Log</Link>
        </Button>
      </div>

      <div className="fade-up-delay-2 mb-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hexagon className="h-4 w-4 text-honey-700" />
                Recent inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inspections.length === 0 ? (
                <p className="text-sm text-hive-500">
                  No records yet — use Quick Log to start tracking this colony.
                </p>
              ) : (
                <ul className="divide-y divide-wax-300/60">
                  {inspections.map((inspection) => (
                    <li
                      key={inspection.id}
                      className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between"
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
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          {tabs.map(({ label, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-honey-700" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-hive-500">
                  No records yet — use Quick Log to start tracking this colony.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <HiveQrCard hiveId={hive.id} hiveName={hive.name} />
      </div>
    </div>
  );
}
