import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, Crown, Hexagon, LineChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { HiveQrCard } from "@/components/hives/hive-qr-card";
import { HiveConfigurator } from "@/components/hives/hive-configurator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHiveById } from "@/lib/hives";

interface HiveDetailPageProps {
  params: Promise<{ id: string }>;
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

  const tabs = [
    { label: "Inspections", icon: Hexagon },
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
        <Badge variant="default">
          {hive.deep_boxes} brood · {hive.honey_supers} super
          {hive.honey_supers === 1 ? "" : "s"}
        </Badge>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/inspect?hive=${hive.id}`}>Quick Log</Link>
        </Button>
      </div>

      <div className="fade-up-delay-1 mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Boxes className="h-4 w-4 text-honey-700" />
          <h2 className="font-display text-lg font-semibold text-hive-900">
            Hive Configuration
          </h2>
        </div>
        <HiveConfigurator
          hiveId={hive.id}
          status={hive.status}
          initial={{
            deepBoxes: hive.deep_boxes,
            honeySupers: hive.honey_supers,
            hasQueenExcluder: hive.has_queen_excluder,
          }}
        />
      </div>

      <div className="fade-up-delay-2 mb-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
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
