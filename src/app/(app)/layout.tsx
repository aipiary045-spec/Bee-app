import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { BrandWatermark } from "@/components/brand/brand-logo";
import { YardSwitcher } from "@/components/yards/yard-switcher";
import { createClient } from "@/lib/supabase/server";
import { getYardsAndActive } from "@/lib/hives";
import { toYardChoice, type YardChoice } from "@/lib/yards";
import { env } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let yardName = "Apiary";
  let yardLocation = "Your yard";
  let yards: YardChoice[] = [];
  let activeYardId = "";

  if (env.isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { yards: list, active } = await getYardsAndActive(user.id);
        yards = list.map(toYardChoice);
        activeYardId = active.id;
        yardName = active.name || "Apiary";
        yardLocation = active.location?.trim() || "Your yard";
      }
    } catch {
      // Keep the product defaults if the yard is not ready yet.
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        yardName={yardName}
        yardLocation={yardLocation}
        yards={yards}
        activeYardId={activeYardId}
      />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <BrandWatermark
          className="-right-16 -top-10 sm:-right-8 sm:top-8"
          size={480}
        />
        <BrandWatermark
          className="-bottom-24 -left-20 hidden rotate-12 opacity-80 lg:block"
          size={320}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-honey-200/25 to-transparent" />
        {yards.length > 0 && (
          <div className="relative z-20 px-4 pt-3 lg:hidden">
            <YardSwitcher yards={yards} activeId={activeYardId} compact />
          </div>
        )}
        <main className="relative flex-1 pb-24 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
