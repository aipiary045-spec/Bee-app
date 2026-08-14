import Link from "next/link";
import { ClipboardList, DollarSign, Hexagon, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { PriorityAlertsBar } from "@/components/dashboard/priority-alerts";
import { NavCard } from "@/components/ui/nav-card";
import { HiveCard } from "@/components/hives/hive-card";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
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
      hives = result.hives;
    } catch {
      hives = [];
    }
  }

  const preview = hives.slice(0, 4);
  const activeHives = hives.filter((hive) => hive.status === "active").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Agra Apiary"
        title="Home"
        description="Tap a card to move — log a visit, open a hive, or check the ledger."
      />

      <section className="fade-up-delay-1 mb-8">
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
            Get around
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <NavCard
            href="/inspect"
            eyebrow="Field work"
            title="Quick Log"
            description="Inspect a hive, add or pull supers, and save before you close the lid."
            icon={ClipboardList}
            featured
          />
          <NavCard
            href="/hives"
            title="Hives"
            description="Every colony, stack count, and a tap into details."
            icon={Hexagon}
          />
          <NavCard
            href="/finances"
            title="Finances"
            description="Honey sales, yard costs, and season profit."
            icon={DollarSign}
            accent="meadow"
          />
          <NavCard
            href="/settings"
            title="Settings"
            description="Account, yard location, and QR access."
            icon={Settings}
          />
        </div>
      </section>

      <div className="fade-up-delay-2 mb-8">
        <PriorityAlertsBar hives={hives} />
      </div>

      <div className="fade-up-delay-2 mb-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SummaryCards
            activeHives={activeHives}
            totalHives={hives.length}
            attentionCount={3}
          />
        </div>
        <WeatherWidget />
      </div>

      <section className="fade-up-delay-3 mb-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              Yard snapshot
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-hive-900">
              Your hives
            </h2>
          </div>
          <Link
            href="/hives"
            className="text-sm font-semibold text-honey-700 transition-colors hover:text-honey-600"
          >
            View all →
          </Link>
        </div>

        {preview.length === 0 ? (
          <div className="surface-panel rounded-2xl border-dashed px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <BrandLogo size={64} className="h-14 w-14" />
            </div>
            <p className="font-display text-lg font-semibold text-hive-900">
              No colonies yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-hive-600">
              Add your first hive, then Quick Log from the card on this page.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/hives">Add a hive</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((hive) => (
              <HiveCard key={hive.id} hive={hive} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
