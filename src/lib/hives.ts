import { createClient } from "@/lib/supabase/server";
import type { AlertInspection } from "@/lib/alerts";
import {
  attachStacksToHives,
  isMissingColumnError,
  parseHiveStacksFromDescription,
  writeHiveStacksToDescription,
} from "@/lib/hive-stack-store";
import type { SuperInventory } from "@/lib/supers";
import type { Tables, TablesInsert } from "@/types/database";

export type Apiary = Tables<"apiaries">;
export type Hive = Tables<"hives">;
export type Inspection = Tables<"inspections">;
export type MiteCount = Tables<"mite_counts">;
export type HoneyYield = Tables<"honey_yields">;
export type Revenue = Tables<"revenues">;
export type Treatment = Tables<"treatments">;

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

  return { apiary, hives: attachStacksToHives(apiary, hives ?? []) };
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

  const [resolved] = attachStacksToHives(apiary ?? { description: null }, [hive]);
  return { ...resolved, apiary: apiary ?? null };
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export async function saveHiveStackSidecar(
  supabase: ServerClient,
  apiaryId: string,
  hiveId: string,
  inventory: SuperInventory
): Promise<void> {
  const { data, error } = await supabase
    .from("apiaries")
    .select("id, description")
    .eq("id", apiaryId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Yard not found.");
  }

  const parsed = parseHiveStacksFromDescription(data.description);
  const description = writeHiveStacksToDescription(parsed.text, {
    ...parsed.stacks,
    [hiveId]: {
      medium: inventory.medium,
      shallow: inventory.shallow,
    },
  });

  const { error: updateError } = await supabase
    .from("apiaries")
    .update({ description })
    .eq("id", apiaryId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export function hiveHasSuperColumns(hive: {
  super_count?: number | null;
  medium_count?: number | null;
  shallow_count?: number | null;
}): boolean {
  return (
    typeof hive.medium_count === "number" &&
    typeof hive.shallow_count === "number"
  );
}

export async function persistHiveSuperInventory(
  supabase: ServerClient,
  input: {
    hiveId: string;
    apiaryId: string;
    inventory: SuperInventory;
    columnsAvailable?: boolean;
  }
): Promise<void> {
  if (input.columnsAvailable !== false) {
    const { error } = await supabase
      .from("hives")
      .update({
        medium_count: input.inventory.medium,
        shallow_count: input.inventory.shallow,
        super_count: input.inventory.medium + input.inventory.shallow,
      })
      .eq("id", input.hiveId);

    if (!error) return;
    if (!isMissingColumnError(error)) {
      throw new Error(error.message);
    }
  }

  await saveHiveStackSidecar(
    supabase,
    input.apiaryId,
    input.hiveId,
    input.inventory
  );
}

function withoutSuperInspectionColumns(
  row: TablesInsert<"inspections">
): TablesInsert<"inspections"> {
  const compat: TablesInsert<"inspections"> = { ...row };
  delete compat.supers_added;
  delete compat.supers_removed;
  delete compat.super_count_after;
  delete compat.medium_added;
  delete compat.medium_removed;
  delete compat.shallow_added;
  delete compat.shallow_removed;
  return compat;
}

export async function insertInspectionCompat(
  supabase: ServerClient,
  row: TablesInsert<"inspections">,
  options?: { columnsAvailable?: boolean }
) {
  const payload =
    options?.columnsAvailable === false
      ? withoutSuperInspectionColumns(row)
      : row;
  const first = await supabase
    .from("inspections")
    .insert(payload)
    .select("id")
    .single();
  if (!first.error || !isMissingColumnError(first.error)) {
    return first;
  }

  return supabase
    .from("inspections")
    .insert(withoutSuperInspectionColumns(row))
    .select("id")
    .single();
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

export async function listTreatmentsForHive(hiveId: string): Promise<Treatment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .eq("hive_id", hiveId)
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listOpenTreatmentsForHives(
  hiveIds: string[]
): Promise<Treatment[]> {
  if (hiveIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .in("hive_id", hiveIds)
    .neq("status", "completed")
    .order("end_date", { ascending: true });

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
