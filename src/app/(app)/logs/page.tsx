import Link from "next/link";
import { ClipboardList, Pencil, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { YardLede } from "@/components/yards/yard-lede";
import { DeleteInspectionButton } from "@/components/hives/delete-inspection-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  listHivesForUser,
  listInspectionsForHives,
  type Hive,
  type Inspection,
} from "@/lib/hives";
import {
  filterLogsByHive,
  formatInspectionTime,
  groupLogsByDate,
  inspectionSummary,
} from "@/lib/inspection-log";
import { cn, formatDate } from "@/lib/utils";

interface LogsPageProps {
  searchParams: Promise<{ hive?: string }>;
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const { hive: hiveFilter } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hives: Pick<Hive, "id" | "name">[] = [];
  let inspections: Inspection[] = [];
  let loadError: string | null = null;

  if (user) {
    try {
      const result = await listHivesForUser(user.id);
      hives = result.hives.map((hive) => ({ id: hive.id, name: hive.name }));
      inspections = await listInspectionsForHives(result.hives.map((hive) => hive.id));
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load logs.";
      if (/relation .* does not exist|Could not find the table/i.test(loadError)) {
        loadError =
          "Database tables are missing. Run the SQL migration in Supabase, then refresh.";
      }
    }
  }

  const hiveNames = new Map(hives.map((hive) => [hive.id, hive.name]));
  const visible = filterLogsByHive(inspections, hiveFilter);
  const groups = groupLogsByDate(visible);
  const selectedHiveName = hiveFilter
    ? hiveNames.get(hiveFilter) ?? "This hive"
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={<YardLede />}
        title="Logs"
        description="Every visit on this yard — open one to check the details, fix a mistake, or remove it."
        actions={
          <Button asChild>
            <Link href={hiveFilter ? `/inspect?hive=${hiveFilter}` : "/inspect"}>
              <ClipboardList className="h-4 w-4" />
              New visit
            </Link>
          </Button>
        }
      />

      {loadError && (
        <div className="mb-6 rounded-xl border border-crimson-300/40 bg-crimson-50 px-4 py-3 text-sm text-crimson-800">
          {loadError}
        </div>
      )}

      {!loadError && (
        <div className="fade-up-delay-1 mb-5 flex flex-wrap gap-2">
          <FilterChip href="/logs" active={!hiveFilter}>
            All hives
          </FilterChip>
          {hives.map((hive) => (
            <FilterChip
              key={hive.id}
              href={`/logs?hive=${hive.id}`}
              active={hiveFilter === hive.id}
            >
              {hive.name}
            </FilterChip>
          ))}
        </div>
      )}

      {!loadError && visible.length === 0 ? (
        <Card className="fade-up-delay-1 border-dashed border-honey-400/40">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-honey-500/15 text-honey-800">
              <ScrollText className="h-5 w-5" />
            </div>
            <p className="font-display font-semibold text-hive-900">
              {selectedHiveName
                ? `No visits on ${selectedHiveName} yet`
                : "No visits logged yet"}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-hive-600">
              Quick Log still captures the visit. This page is the record — every
              inspection stays here so you can read, edit, or delete it.
            </p>
            <Button className="mt-4" size="sm" asChild>
              <Link href={hiveFilter ? `/inspect?hive=${hiveFilter}` : "/inspect"}>
                Open Quick Log
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="fade-up-delay-1 space-y-6">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-honey-700">
                {formatDate(group.date)}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-wax-300/60">
                    {group.logs.map((log) => {
                      const time = formatInspectionTime(log.inspection_time);
                      return (
                        <li key={log.id} className="px-4 py-3 sm:px-5">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={`/logs/${log.id}`}
                              className="min-w-0 flex-1 rounded-lg outline-none ring-honey-400/40 focus-visible:ring-2"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-display text-base font-semibold text-hive-900">
                                  {hiveNames.get(log.hive_id) ?? "Hive"}
                                </p>
                                {time && (
                                  <Badge variant="muted">{time}</Badge>
                                )}
                                {log.weather && (
                                  <Badge variant="default">{log.weather}</Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-hive-600">
                                {inspectionSummary(log)}
                              </p>
                              {log.notes && (
                                <p className="mt-1 line-clamp-2 text-xs text-hive-500">
                                  {log.notes}
                                </p>
                              )}
                            </Link>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/logs/${log.id}`}>
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Link>
                              </Button>
                              <DeleteInspectionButton
                                inspectionId={log.id}
                                dateLabel={formatDate(log.date)}
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-honey-500 bg-honey-500/20 text-hive-900"
          : "border-wax-300/70 bg-wax-50 text-hive-600 hover:border-honey-400/50"
      )}
    >
      {children}
    </Link>
  );
}
