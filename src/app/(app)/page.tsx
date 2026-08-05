import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { PriorityAlertsBar } from "@/components/dashboard/priority-alerts";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/server";
import { listHivesForUser } from "@/lib/hives";
import type { Hive } from "@/lib/hives";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hives: Hive[] = [];
  if (user) {
    try {
      const result = await listHivesForUser(user.id);
      hives = result.hives.slice(0, 4);
    } catch {
      hives = [];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Agra Apiary"
        title="Dashboard"
        description="Your colonies at a glance — weather, health flags, and seasonal guidance for Oklahoma beekeeping."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/inspect">
                <ClipboardList className="h-4 w-4" />
                Quick Log
              </Link>
            </Button>
            <Button asChild>
              <Link href="/hives">
                <Plus className="h-4 w-4" />
                Add Hive
              </Link>
            </Button>
          </>
        }
      />

      <div className="fade-up-delay-1 mb-8">
        <PriorityAlertsBar />
      </div>

      <div className="fade-up-delay-2 mb-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SummaryCards />
        </div>
        <WeatherWidget />
      </div>

      <section className="fade-up-delay-3 mb-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              Yard snapshot
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-hive-900">
              Your Hives
            </h2>
          </div>
          <Link
            href="/hives"
            className="text-sm font-semibold text-honey-700 transition-colors hover:text-honey-600"
          >
            View all →
          </Link>
        </div>

        {hives.length === 0 ? (
          <div className="surface-panel rounded-2xl border-dashed px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-wax-50/90 ring-1 ring-honey-400/35">
              <BrandLogo size={52} className="h-12 w-12" />
            </div>
            <p className="font-display text-lg font-semibold text-hive-900">
              No colonies yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-hive-600">
              Add your first hive to start seeing live yard data on this
              dashboard.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/hives">Add Hive</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hives.map((hive) => (
              <Link
                key={hive.id}
                href={`/hives/${hive.id}`}
                className="surface-panel group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-honey-400/50 hover:shadow-[0_18px_40px_-24px_rgba(61,42,20,0.45)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold text-hive-900 group-hover:text-honey-700">
                    {hive.name}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      hive.status === "active"
                        ? "bg-meadow-600"
                        : hive.status === "deadout"
                          ? "bg-crimson-500"
                          : "bg-hive-500"
                    }`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    variant={
                      hive.status === "active"
                        ? "success"
                        : hive.status === "deadout"
                          ? "danger"
                          : "muted"
                    }
                  >
                    {hive.status}
                  </Badge>
                  <Badge variant="default">{hive.frame_count} frames</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="fade-up-delay-3">
        <Link
          href="/inspect"
          className="surface-panel group relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-honey-400/50 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-honey-400/20 blur-3xl transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-start gap-4">
            <div className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <ClipboardList className="h-6 w-6 text-wax-50" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
                Field work
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-hive-900">
                Quick Log
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-hive-600">
                Open the field inspection form to record queen status, brood,
                temperament, and mite counts.
              </p>
            </div>
          </div>
          <span className="relative text-sm font-semibold text-honey-700 group-hover:text-honey-600">
            Open Quick Log →
          </span>
        </Link>
      </section>
    </div>
  );
}
