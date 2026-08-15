import { createClient } from "@/lib/supabase/server";
import { getYardsAndActive } from "@/lib/hives";
import { toYardChoice } from "@/lib/yards";
import { YardSwitcher } from "@/components/yards/yard-switcher";
import { env } from "@/lib/env";

export async function YardLede() {
  if (!env.isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { yards, active } = await getYardsAndActive(user.id);
    return (
      <YardSwitcher
        yards={yards.map(toYardChoice)}
        activeId={active.id}
        variant="lede"
      />
    );
  } catch {
    return null;
  }
}
