import { createClient } from "@/lib/supabase/server";
import {
  REVENUE_CATEGORY_LABELS,
  type RevenueCategory,
} from "@/lib/revenue-catalog";
import { getActiveApiary } from "@/lib/hives";
import type { Tables } from "@/types/database";

export type Revenue = Tables<"revenues">;
export type { RevenueCategory };
export { REVENUE_CATEGORY_LABELS };

export type RevenueWithHive = Revenue & {
  hive: { id: string; name: string } | null;
};

export type RevenueCategoryTotal = {
  category: RevenueCategory;
  amount: number;
  count: number;
};

export async function listRevenuesForUser(userId: string): Promise<{
  apiaryId: string;
  revenues: RevenueWithHive[];
  ytdTotal: number;
  byCategory: RevenueCategoryTotal[];
}> {
  const apiary = await getActiveApiary(userId);
  const supabase = await createClient();
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const { data, error } = await supabase
    .from("revenues")
    .select("*, hive:hives(id, name)")
    .eq("apiary_id", apiary.id)
    .gte("date", yearStart)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const revenues = (data ?? []) as RevenueWithHive[];
  const ytdTotal = revenues.reduce((sum, row) => sum + Number(row.amount), 0);

  const categoryMap = new Map<RevenueCategory, RevenueCategoryTotal>();
  for (const category of Object.keys(
    REVENUE_CATEGORY_LABELS
  ) as RevenueCategory[]) {
    categoryMap.set(category, { category, amount: 0, count: 0 });
  }

  for (const row of revenues) {
    const entry = categoryMap.get(row.category);
    if (!entry) continue;
    entry.amount += Number(row.amount);
    entry.count += 1;
  }

  return {
    apiaryId: apiary.id,
    revenues,
    ytdTotal,
    byCategory: Array.from(categoryMap.values()),
  };
}
