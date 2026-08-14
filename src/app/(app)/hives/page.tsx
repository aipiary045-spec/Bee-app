import { PageHeader } from "@/components/layout/page-header";
import { AddHiveDialog } from "@/components/hives/add-hive-dialog";
import { HiveStack } from "@/components/hives/hive-stack";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/server";
import { listHivesForUser } from "@/lib/hives";
import type { Hive } from "@/lib/hives";
import Link from "next/link";

function statusVariant(status: Hive["status"]) {
  if (status === "active") return "success" as const;
  if (status === "deadout") return "danger" as const;
  return "muted" as const;
}

function statusDot(status: Hive["status"]) {
  if (status === "active") return "bg-meadow-600";
  if (status === "deadout") return "bg-crimson-500";
  return "bg-hive-500";
}

export default async function HivesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hives: Hive[] = [];
  let apiaryName = "Agra Apiary";
  let loadError: string | null = null;

  if (user) {
    try {
      const result = await listHivesForUser(user.id);
      hives = result.hives;
      apiaryName = result.apiary.name;
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={apiaryName}
        title="Hives"
        description="Track every colony in your apiary — status, frame counts, and drill-down health history."
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
        <div className="fade-up-delay-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hives.map((hive) => (
            <Link key={hive.id} href={`/hives/${hive.id}`}>
              <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-honey-400/40 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <p className="font-display font-semibold text-hive-900 group-hover:text-honey-700">
                      {hive.name}
                    </p>
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusDot(hive.status)}`}
                    />
                  </div>
                  <div className="my-3 flex items-end justify-center rounded-lg bg-honey-50/60 py-3 ring-1 ring-honey-400/15">
                    <HiveStack
                      deepBoxes={hive.deep_boxes}
                      honeySupers={hive.honey_supers}
                      hasQueenExcluder={hive.has_queen_excluder}
                      status={hive.status}
                      detailed={false}
                      className="h-[120px] w-auto transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={statusVariant(hive.status)}>
                      {hive.status}
                    </Badge>
                    <Badge variant="default">
                      {hive.honey_supers} super{hive.honey_supers === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
