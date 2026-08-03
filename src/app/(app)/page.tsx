import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { PriorityAlertsBar } from "@/components/dashboard/priority-alerts";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="fade-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-honey-700">
            Agra Apiary
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-hive-900 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-lg text-hive-600">
            Your colonies at a glance — weather, health flags, and seasonal
            guidance for Oklahoma beekeeping.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/inspect">Quick Log</Link>
          </Button>
          <Button asChild>
            <Link href="/hives">
              <Plus className="h-4 w-4" />
              Add Hive
            </Link>
          </Button>
        </div>
      </header>

      {/* Priority Alerts */}
      <div className="fade-up-delay-1 mb-8">
        <PriorityAlertsBar />
      </div>

      {/* Summary + Weather */}
      <div className="fade-up-delay-2 mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SummaryCards />
        </div>
        <WeatherWidget />
      </div>

      {/* Hive Grid Preview */}
      <section className="fade-up-delay-3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-hive-900">
            Your Hives
          </h2>
          <Link
            href="/hives"
            className="text-sm font-medium text-honey-700 hover:text-honey-600"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Hive 1", status: "active", mite: 1.2 },
            { name: "Hive 3", status: "active", mite: 2.8 },
            { name: "Hive 7", status: "active", mite: 4.2 },
            { name: "Hive 12", status: "inactive", mite: 0.8 },
          ].map((hive) => (
            <Link
              key={hive.name}
              href={`/hives/${hive.name.toLowerCase().replace(" ", "-")}`}
              className="group rounded-xl border border-wax-300/60 bg-wax-50/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-honey-400/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-hive-900 group-hover:text-honey-700">
                  {hive.name}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    hive.mite >= 3
                      ? "bg-crimson-500"
                      : hive.status === "inactive"
                        ? "bg-hive-500"
                        : "bg-meadow-600"
                  }`}
                />
              </div>
              <p className="mt-2 text-xs text-hive-500">
                Mites: {hive.mite}% ·{" "}
                <span className="capitalize">{hive.status}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
