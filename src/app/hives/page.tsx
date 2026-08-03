import Link from "next/link";
import { Hexagon, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/components/layout/coming-soon-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const previewHives = [
  { name: "Hive 1", status: "active" as const, frames: 10, mite: 1.2 },
  { name: "Hive 3", status: "active" as const, frames: 10, mite: 2.8 },
  { name: "Hive 7", status: "active" as const, frames: 12, mite: 4.2 },
  { name: "Hive 12", status: "inactive" as const, frames: 8, mite: 0.8 },
];

export default function HivesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Colony Management"
        title="Hives"
        description="Track every colony in your apiary — status, frame counts, mite levels, and drill-down health history."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Hive
          </Button>
        }
      />

      <div className="fade-up-delay-1 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {previewHives.map((hive) => (
          <Link key={hive.name} href={`/hives/${hive.name.toLowerCase().replace(" ", "-")}`}>
            <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-honey-400/40 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-honey-500/15 ring-1 ring-honey-400/20">
                    <Hexagon className="h-5 w-5 text-honey-700" />
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      hive.mite >= 3
                        ? "bg-crimson-500"
                        : hive.status === "inactive"
                          ? "bg-hive-500"
                          : "bg-meadow-600"
                    }`}
                  />
                </div>
                <p className="font-display mt-3 font-semibold text-hive-900 group-hover:text-honey-700">
                  {hive.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={hive.status === "active" ? "success" : "muted"}>
                    {hive.status}
                  </Badge>
                  <Badge variant={hive.mite >= 3 ? "danger" : "default"}>
                    {hive.mite}% mites
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-hive-500">
                  {hive.frames} frames · Tap for details
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <ComingSoonPanel
        icon={Hexagon}
        title="Live Hive Data"
        description="Once Supabase is connected, this page will load your colonies with real-time health metrics, inspection history, and mite trend charts."
        features={[
          {
            title: "Health Trends",
            description: "Varroa mite line charts with threshold warnings and brood pattern history.",
          },
          {
            title: "Queen Tracking",
            description: "Spotting logs, mark colors, re-queening history, and cell checks.",
          },
          {
            title: "Honey Yields",
            description: "Seasonal bar charts for harvest weight and frames pulled per hive.",
          },
          {
            title: "Per-Hive Costs",
            description: "Allocate equipment and treatment expenses to individual colonies.",
          },
        ]}
      />
    </div>
  );
}
