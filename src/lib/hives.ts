import { createClient } from "@/lib/supabase/server";
import type { AlertInspection } from "@/lib/alerts";
import type { Tables } from "@/types/database";

export type Apiary = Tables<"apiaries">;
export type Hive = Tables<"hives">;
export type Inspection = Tables<"inspections">;
export type MiteCount = Tables<"mite_counts">;
export type HoneyYield = Tables<"honey_yields">;
export type Revenue = Tables<"revenues">;

export async function getOrCreateDefaultApiary(
  userId: string
): Promise<Apiary> {
  const supabase = await createClient();

  const { data: existing, error: listError } = await supabase
    .from("apiaries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (listError) {
    throw new Error(listError.message);
  }

  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("apiaries")
    .insert({
      user_id: userId,
      name: "Agra Apiary",
      location: "Agra, OK",
      description: "Primary apiary near Agra, Oklahoma",
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created;
}

export async function listHivesForUser(userId: string): Promise<{
  apiary: Apiary;
  hives: Hive[];
}> {
  const apiary = await getOrCreateDefaultApiary(userId);
  const supabase = await createClient();

  const { data: hives, error } = await supabase
    .from("hives")
    .select("*")
    .eq("apiary_id", apiary.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return { apiary, hives: hives ?? [] };
}

export async function getHiveById(
  hiveId: string
): Promise<(Hive & { apiary: Apiary | null }) | null> {
  const supabase = await createClient();

  const { data: hive, error } = await supabase
    .from("hives")
    .select("*")
    .eq("id", hiveId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!hive) return null;

  const { data: apiary } = await supabase
    .from("apiaries")
    .select("*")
    .eq("id", hive.apiary_id)
    .maybeSingle();

  return { ...hive, apiary: apiary ?? null };
}

export async function listInspectionsForHive(
  hiveId: string,
  limit = 8
): Promise<Inspection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .eq("hive_id", hiveId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listRecentInspectionsForHives(
  hiveIds: string[]
): Promise<AlertInspection[]> {
  if (hiveIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inspections")
    .select("hive_id, date, queen_sighted, mite_count_per_100, pests_diseases")
    .in("hive_id", hiveIds)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    hiveId: row.hive_id,
    date: row.date,
    queenSighted: row.queen_sighted,
    miteCountPer100:
      row.mite_count_per_100 == null ? null : Number(row.mite_count_per_100),
    pestsDiseases: row.pests_diseases,
  }));
}

export async function listMiteCountsForHive(hiveId: string): Promise<MiteCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mite_counts")
    .select("*")
    .eq("hive_id", hiveId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listHoneyYieldsForHive(
  hiveId: string
): Promise<HoneyYield[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("honey_yields")
    .select("*")
    .eq("hive_id", hiveId)
    .order("harvest_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listHoneySalesForHive(hiveId: string): Promise<Revenue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("revenues")
    .select("*")
    .eq("hive_id", hiveId)
    .eq("category", "honey_sales")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
