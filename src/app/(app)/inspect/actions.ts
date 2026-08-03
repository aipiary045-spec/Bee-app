"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type QuickLogInput = {
  hiveId: string;
  date: string;
  inspectionTime: string;
  weather: string;
  temperatureF: string;
  queenSighted: Enums<"queen_sighted">;
  queenMarkColor: Enums<"queen_mark_color">;
  eggsLarvae: Enums<"eggs_larvae_status">;
  broodPattern: Enums<"brood_pattern">;
  temperament: Enums<"temperament">;
  honeyStores: Enums<"store_level">;
  pollenStores: Enums<"store_level">;
  miteCountPer100: string;
  pestsDiseases: Enums<"pest_disease">;
  actionFed: boolean;
  actionSuper: boolean;
  actionSplit: boolean;
  actionTreatment: boolean;
  notes: string;
};

export type ActionResult =
  | { ok: true; inspectionId: string }
  | { ok: false; error: string };

export async function createInspectionAction(
  input: QuickLogInput
): Promise<ActionResult> {
  if (!input.hiveId) {
    return { ok: false, error: "Select a hive." };
  }
  if (!input.date) {
    return { ok: false, error: "Inspection date is required." };
  }

  const temp =
    input.temperatureF.trim() === "" ? null : Number(input.temperatureF);
  if (temp !== null && Number.isNaN(temp)) {
    return { ok: false, error: "Enter a valid temperature." };
  }

  const miteCount =
    input.miteCountPer100.trim() === ""
      ? null
      : Number(input.miteCountPer100);
  if (miteCount !== null && (Number.isNaN(miteCount) || miteCount < 0)) {
    return { ok: false, error: "Enter a valid mite count (0 or greater)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to log an inspection." };
  }

  try {
    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .insert({
        hive_id: input.hiveId,
        date: input.date,
        inspection_time: input.inspectionTime || null,
        weather: input.weather || null,
        temperature_f: temp,
        queen_sighted: input.queenSighted,
        queen_spotted: input.queenSighted === "yes",
        queen_mark_color: input.queenMarkColor,
        eggs_larvae: input.eggsLarvae,
        brood_pattern: input.broodPattern,
        temperament: input.temperament,
        honey_stores: input.honeyStores,
        pollen_stores: input.pollenStores,
        mite_count_per_100: miteCount,
        pests_diseases: input.pestsDiseases,
        action_fed: input.actionFed,
        action_super: input.actionSuper,
        action_split: input.actionSplit,
        action_treatment: input.actionTreatment,
        notes: input.notes.trim() || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (inspectionError) {
      return { ok: false, error: inspectionError.message };
    }

    if (miteCount !== null) {
      await supabase.from("mite_counts").insert({
        hive_id: input.hiveId,
        inspection_id: inspection.id,
        method: "alcohol_wash",
        count: miteCount,
        date: input.date,
      });
    }

    if (input.queenSighted === "yes" || input.queenMarkColor !== "unmarked") {
      await supabase.from("queen_logs").insert({
        hive_id: input.hiveId,
        inspection_id: inspection.id,
        status: "laying",
        mark_color: input.queenMarkColor,
        notes: null,
      });
    }

    revalidatePath("/");
    revalidatePath("/inspect");
    revalidatePath("/hives");
    revalidatePath(`/hives/${input.hiveId}`);

    return { ok: true, inspectionId: inspection.id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save inspection.";
    if (/relation .* does not exist|Could not find the table|column .* does not exist/i.test(message)) {
      return {
        ok: false,
        error:
          "Database is missing the latest inspection columns. Run supabase/migrations/20260804000000_extend_inspection_log.sql in the Supabase SQL Editor, then try again.",
      };
    }
    return { ok: false, error: message };
  }
}
