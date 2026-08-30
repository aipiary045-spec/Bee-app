import { createClient } from "@/lib/supabase/server";
import { readActiveYardId } from "@/lib/active-yard";
import type { AlertInspection } from "@/lib/alerts";
import {
  attachStacksToHives,
  isMissingColumnError,
  parseHiveStacksFromDescription,
  writeHiveStacksToDescription,
} from "@/lib/hive-stack-store";
import type { SuperInventory } from "@/lib/supers";
import { resolveActiveApiary } from "@/lib/yards";
import type { Tables, TablesInsert } from "@/types/database";
import type { Enums } from "@/types/database";

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
      name: "My Apiary",
      location: "",
      description: "",
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created;
}

export async function listApiariesForUser(userId: string): Promise<Apiary[]> {
  await getOrCreateDefaultApiary(userId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apiaries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getYardsAndActive(userId: string): Promise<{
  yards: Apiary[];
  active: Apiary;
}> {
  const yards = await listApiariesForUser(userId);
  const requested = await readActiveYardId();
  const active = resolveActiveApiary(yards, requested);
  if (!active) {
    throw new Error("No yard found for this account.");
  }
  return { yards, active };
}

export async function getActiveApiary(userId: string): Promise<Apiary> {
  const { active } = await getYardsAndActive(userId);
  return active;
}

export async function createApiaryForUser(
  userId: string,
  input: { name: string; location: string }
): Promise<Apiary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apiaries")
    .insert({
      user_id: userId,
      name: input.name,
      location: input.location,
      description: "",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not add the yard.");
  }

  return data;
}

export async function listHivesForUser(userId: string): Promise<{
  apiary: Apiary;
  hives: Hive[];
}> {
  const apiary = await getActiveApiary(userId);
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
    .select(
      "hive_id, date, queen_sighted, mite_count_per_100, pests_diseases, queen_cells_seen, honey_stores"
    )
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
    queenCellsSeen: row.queen_cells_seen ?? false,
    honeyStores: row.honey_stores,
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

export async function listLastMiteDatesForHives(
  hiveIds: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (hiveIds.length === 0) return result;

  const supabase = await createClient();
  const [washRows, inspectionRows] = await Promise.all([
    supabase
      .from("mite_counts")
      .select("hive_id, date")
      .in("hive_id", hiveIds)
      .order("date", { ascending: false }),
    supabase
      .from("inspections")
      .select("hive_id, date, mite_count_per_100")
      .in("hive_id", hiveIds)
      .not("mite_count_per_100", "is", null)
      .order("date", { ascending: false }),
  ]);

  for (const row of washRows.data ?? []) {
    if (!result.has(row.hive_id)) result.set(row.hive_id, row.date);
  }
  for (const row of inspectionRows.data ?? []) {
    const existing = result.get(row.hive_id);
    if (!existing || row.date > existing) result.set(row.hive_id, row.date);
  }

  return result;
}

export async function listMiteRetestTreatmentsForHives(
  hiveIds: string[]
): Promise<
  {
    id: string;
    hive_id: string;
    product_name: string;
    mite_retest_due_date: string;
    completed_at: string | null;
  }[]
> {
  if (hiveIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treatments")
    .select("id, hive_id, product_name, mite_retest_due_date, completed_at")
    .in("hive_id", hiveIds)
    .eq("status", "completed")
    .not("mite_retest_due_date", "is", null)
    .order("mite_retest_due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter(
    (row): row is typeof row & { mite_retest_due_date: string } =>
      row.mite_retest_due_date != null
  );
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

export type QueenLog = Tables<"queen_logs">;

export async function listQueenLogsForHive(
  hiveId: string,
  limit = 12
): Promise<QueenLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("queen_logs")
    .select("*")
    .eq("hive_id", hiveId)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export type HarvestSummary = {
  totalLbs: number;
  pullCount: number;
  hiveCount: number;
  topHive?: { id: string; name: string; lbs: number };
};

export async function getHarvestSummaryForHives(
  hives: { id: string; name: string }[],
  year = new Date().getFullYear()
): Promise<HarvestSummary> {
  if (hives.length === 0) {
    return { totalLbs: 0, pullCount: 0, hiveCount: 0 };
  }

  const supabase = await createClient();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const hiveIds = hives.map((hive) => hive.id);
  const names = new Map(hives.map((hive) => [hive.id, hive.name]));

  const { data, error } = await supabase
    .from("honey_yields")
    .select("hive_id, weight_lbs")
    .in("hive_id", hiveIds)
    .gte("harvest_date", start)
    .lte("harvest_date", end);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const byHive = new Map<string, number>();
  let totalLbs = 0;

  for (const row of rows) {
    const lbs = Number(row.weight_lbs);
    totalLbs += lbs;
    byHive.set(row.hive_id, (byHive.get(row.hive_id) ?? 0) + lbs);
  }

  let topHive: HarvestSummary["topHive"];
  for (const [hiveId, lbs] of byHive) {
    if (!topHive || lbs > topHive.lbs) {
      topHive = { id: hiveId, name: names.get(hiveId) ?? "Hive", lbs };
    }
  }

  return {
    totalLbs: Math.round(totalLbs * 10) / 10,
    pullCount: rows.length,
    hiveCount: byHive.size,
    topHive,
  };
}

export async function listSplitInspectionsForHives(
  hives: { id: string; name: string }[],
  daysBack = 45
): Promise<
  {
    id: string;
    hive_id: string;
    date: string;
    split_type: Enums<"split_type">;
    split_destination: string | null;
  }[]
> {
  if (hives.length === 0) return [];

  const supabase = await createClient();
  const hiveIds = hives.map((hive) => hive.id);
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  const startISO = start.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("inspections")
    .select("id, hive_id, date, split_type, split_destination")
    .in("hive_id", hiveIds)
    .eq("action_split", true)
    .not("split_type", "is", null)
    .gte("date", startISO)
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter(
    (row): row is {
      id: string;
      hive_id: string;
      date: string;
      split_type: Enums<"split_type">;
      split_destination: string | null;
    } => row.split_type != null
  );
}

export async function getSeasonSnapshotDataForHives(
  hiveIds: string[],
  year = new Date().getFullYear()
) {
  if (hiveIds.length === 0) {
    return {
      inspectionCount: 0,
      treatmentCount: 0,
      splitCount: 0,
      harvestLbs: 0,
      miteReadings: [] as number[],
    };
  }

  const supabase = await createClient();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const [inspections, treatments, harvest, miteCounts] = await Promise.all([
    supabase
      .from("inspections")
      .select("id, mite_count_per_100, action_split")
      .in("hive_id", hiveIds)
      .gte("date", start)
      .lte("date", end),
    supabase
      .from("treatments")
      .select("id")
      .in("hive_id", hiveIds)
      .gte("start_date", start)
      .lte("start_date", end),
    supabase
      .from("honey_yields")
      .select("weight_lbs")
      .in("hive_id", hiveIds)
      .gte("harvest_date", start)
      .lte("harvest_date", end),
    supabase
      .from("mite_counts")
      .select("count")
      .in("hive_id", hiveIds)
      .gte("date", start)
      .lte("date", end),
  ]);

  const inspectionRows = inspections.data ?? [];
  const miteFromInspections = inspectionRows
    .map((row) =>
      row.mite_count_per_100 == null ? null : Number(row.mite_count_per_100)
    )
    .filter((value): value is number => value != null);
  const miteFromWashes = (miteCounts.data ?? []).map((row) => Number(row.count));

  return {
    inspectionCount: inspectionRows.length,
    treatmentCount: treatments.data?.length ?? 0,
    splitCount: inspectionRows.filter((row) => row.action_split).length,
    harvestLbs: (harvest.data ?? []).reduce(
      (sum, row) => sum + Number(row.weight_lbs),
      0
    ),
    miteReadings: [...miteFromInspections, ...miteFromWashes],
  };
}
