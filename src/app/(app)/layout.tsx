import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { BrandWatermark } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultApiary } from "@/lib/hives";
import { env } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let yardName = "Apiary";
  let yardLocation = "Your yard";

  if (env.isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const apiary = await getOrCreateDefaultApiary(user.id);
        yardName = apiary.name || "Apiary";
        yardLocation = apiary.location?.trim() || "Your yard";
      }
    } catch {
      // Keep the product defaults if the yard is not ready yet.
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar yardName={yardName} yardLocation={yardLocation} />
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
        <main className="relative flex-1 pb-24 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
