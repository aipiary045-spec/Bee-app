import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SeasonSnapshot } from "@/lib/season-snapshot";

interface SeasonSnapshotCardProps {
  snapshot: SeasonSnapshot;
}

export function SeasonSnapshotCard({ snapshot }: SeasonSnapshotCardProps) {
  return (
    <Card className="fade-up-delay-2 mb-6 border-honey-400/25 bg-gradient-to-br from-wax-50 to-honey-50/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-honey-700" />
          {snapshot.year} season snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Visits logged" value={String(snapshot.inspectionCount)} />
          <Stat label="Treatments" value={String(snapshot.treatmentCount)} />
          <Stat label="Splits / swarms" value={String(snapshot.splitCount)} />
          <Stat
            label="Honey pulled"
            value={`${snapshot.harvestLbs} lbs`}
          />
          <Stat
            label="Avg mites / 100"
            value={
              snapshot.avgMitePer100 != null
                ? String(snapshot.avgMitePer100)
                : "—"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-wax-300/60 bg-wax-50/70 px-4 py-3">
      <p className="text-xs text-hive-500">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
        {value}
      </p>
    </div>
  );
}
