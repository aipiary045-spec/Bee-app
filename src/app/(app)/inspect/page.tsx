import { PageHeader } from "@/components/layout/page-header";
import { YardLede } from "@/components/yards/yard-lede";
import { QuickLogForm } from "@/components/inspect/quick-log-form";
import { createClient } from "@/lib/supabase/server";
import { listHivesForUser } from "@/lib/hives";
import { fetchLocalWeather, type LocalWeather } from "@/lib/weather";
import type { Hive } from "@/lib/hives";

interface InspectPageProps {
  searchParams: Promise<{ hive?: string }>;
}

export default async function InspectPage({ searchParams }: InspectPageProps) {
  const { hive: initialHiveId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hives: Pick<
    Hive,
    | "id"
    | "name"
    | "status"
    | "super_count"
    | "medium_count"
    | "shallow_count"
    | "frame_count"
  >[] = [];
  let loadError: string | null = null;
  let weather: LocalWeather | null = null;

  if (user) {
    try {
      const result = await listHivesForUser(user.id);
      weather = await fetchLocalWeather({
        location: result.apiary.location,
      });
      hives = result.hives.map(
        ({
          id,
          name,
          status,
          super_count,
          medium_count,
          shallow_count,
          frame_count,
        }) => ({
          id,
          name,
          status,
          super_count,
          medium_count,
          shallow_count,
          frame_count,
        })
      );
    } catch (err) {
      loadError =
        err instanceof Error ? err.message : "Failed to load hives.";
      if (/relation .* does not exist|Could not find the table/i.test(loadError)) {
        loadError =
          "Database tables are missing. Run the SQL migration in Supabase, then refresh.";
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={<YardLede />}
        title="Quick Log"
      />

      {loadError && (
        <div className="mb-6 rounded-xl border border-crimson-300/40 bg-crimson-50 px-4 py-3 text-sm text-crimson-800">
          {loadError}
        </div>
      )}

      {!loadError && (
        <div className="fade-up-delay-1">
          <QuickLogForm
            hives={hives}
            initialHiveId={initialHiveId}
            initialWeather={weather}
          />
        </div>
      )}
    </div>
  );
}
