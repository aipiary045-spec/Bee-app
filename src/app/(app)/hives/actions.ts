"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveApiary,
  hiveHasSuperColumns,
  insertInspectionCompat,
  persistHiveSuperInventory,
  saveHiveStackSidecar,
} from "@/lib/hives";
import {
  isMissingColumnError,
  parseHiveStacksFromDescription,
  resolveHiveInventory,
} from "@/lib/hive-stack-store";
import {
  applyTypedSuperChange,
  emptySuperChange,
  formatSuperInventory,
  formatTypedSuperChange,
  type SuperType,
} from "@/lib/supers";
import type { Enums } from "@/types/database";
import { postTreatmentMiteCheckDays } from "@/lib/treatments";
import { miteRetestDueDate } from "@/lib/treatment-followup";

export type CreateHiveInput = {
  name: string;
  status?: Enums<"hive_status">;
  frameCount?: number;
  superCount?: number;
  mediumCount?: number;
  shallowCount?: number;
};

export type ActionResult =
  | { ok: true; hiveId: string }
  | { ok: false; error: string };

export async function createHiveAction(
  input: CreateHiveInput
): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Hive name is required." };
  }

  const frameCount = input.frameCount ?? 10;
  if (frameCount < 1 || frameCount > 20) {
    return { ok: false, error: "Frame count must be between 1 and 20." };
  }

  const mediumCount = input.mediumCount ?? input.superCount ?? 0;
  const shallowCount = input.shallowCount ?? 0;
  if (
    mediumCount < 0 ||
    shallowCount < 0 ||
    mediumCount + shallowCount > 12
  ) {
    return { ok: false, error: "Honey supers must total between 0 and 12." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add a hive." };
  }

  try {
    const apiary = await getActiveApiary(user.id);

    const fullInsert = await supabase
      .from("hives")
      .insert({
        apiary_id: apiary.id,
        name,
        status: input.status ?? "active",
        frame_count: frameCount,
        super_count: mediumCount + shallowCount,
        medium_count: mediumCount,
        shallow_count: shallowCount,
      })
      .select("id")
      .single();

    let data = fullInsert.data;
    let error = fullInsert.error;

    if (error && isMissingColumnError(error)) {
      const slimInsert = await supabase
        .from("hives")
        .insert({
          apiary_id: apiary.id,
          name,
          status: input.status ?? "active",
          frame_count: frameCount,
        })
        .select("id")
        .single();
      data = slimInsert.data;
      error = slimInsert.error;
      if (!error && data && (mediumCount > 0 || shallowCount > 0)) {
        await saveHiveStackSidecar(supabase, apiary.id, data.id, {
          medium: mediumCount,
          shallow: shallowCount,
        });
      }
    }

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "A hive with that name already exists." };
      }
      return { ok: false, error: error.message };
    }

    if (!data) {
      return { ok: false, error: "Failed to create hive." };
    }

    revalidatePath("/hives");
    revalidatePath("/");
    return { ok: true, hiveId: data.id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create hive.";
    if (/relation .* does not exist|Could not find the table/i.test(message)) {
      return {
        ok: false,
        error:
          "Database tables missing. Run the SQL migration in the Supabase SQL Editor first.",
      };
    }
    return { ok: false, error: message };
  }
}

export async function adjustHiveSupersAction(input: {
  hiveId: string;
  type: SuperType;
  direction: "add" | "remove";
}): Promise<ActionResult> {
  if (!input.hiveId) {
    return { ok: false, error: "Select a hive." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to change supers." };
  }

  try {
    const { data: hive, error: hiveError } = await supabase
      .from("hives")
      .select("*")
      .eq("id", input.hiveId)
      .maybeSingle();

    if (hiveError || !hive) {
      return { ok: false, error: hiveError?.message ?? "Hive not found." };
    }

    const { data: apiary } = await supabase
      .from("apiaries")
      .select("description")
      .eq("id", hive.apiary_id)
      .maybeSingle();

    const sidecar = parseHiveStacksFromDescription(apiary?.description).stacks[
      hive.id
    ];
    const current = resolveHiveInventory(hive, sidecar);
    const columnsAvailable = hiveHasSuperColumns(hive);

    const change = emptySuperChange();
    if (input.type === "medium" && input.direction === "add") change.mediumAdded = 1;
    if (input.type === "medium" && input.direction === "remove") change.mediumRemoved = 1;
    if (input.type === "shallow" && input.direction === "add") change.shallowAdded = 1;
    if (input.type === "shallow" && input.direction === "remove") {
      change.shallowRemoved = 1;
    }

    const result = applyTypedSuperChange(current, change);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    await persistHiveSuperInventory(supabase, {
      hiveId: input.hiveId,
      apiaryId: hive.apiary_id,
      inventory: result.next,
      columnsAvailable,
    });

    const today = new Date().toISOString().slice(0, 10);
    const stackNote = [
      "Stack updated from hive page",
      formatTypedSuperChange(change),
      `now ${formatSuperInventory(result.next)}`,
    ].join(" · ");
    await insertInspectionCompat(
      supabase,
      {
        hive_id: input.hiveId,
        date: today,
        created_by: user.id,
        medium_added: change.mediumAdded,
        medium_removed: change.mediumRemoved,
        shallow_added: change.shallowAdded,
        shallow_removed: change.shallowRemoved,
        supers_added: change.mediumAdded + change.shallowAdded,
        supers_removed: change.mediumRemoved + change.shallowRemoved,
        super_count_after: result.total,
        notes: stackNote,
      },
      { columnsAvailable }
    );

    revalidatePath("/");
    revalidatePath("/hives");
    revalidatePath(`/hives/${input.hiveId}`);
    revalidatePath("/inspect");
    return { ok: true, hiveId: input.hiveId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update supers.";
    if (/relation .* does not exist|Could not find the table/i.test(message)) {
      return {
        ok: false,
        error: "Could not save the hive stack. Try again in a moment.",
      };
    }
    return { ok: false, error: message };
  }
}

export type CreateHarvestInput = {
  hiveId: string;
  harvestDate: string;
  weightLbs: string;
  framesHarvested: string;
  notes: string;
};

export async function createHarvestAction(
  input: CreateHarvestInput
): Promise<ActionResult> {
  if (!input.hiveId) {
    return { ok: false, error: "Select a hive." };
  }
  if (!input.harvestDate) {
    return { ok: false, error: "Harvest date is required." };
  }

  const weight = Number(input.weightLbs);
  if (Number.isNaN(weight) || weight < 0) {
    return { ok: false, error: "Enter a valid harvest weight." };
  }

  const frames =
    input.framesHarvested.trim() === ""
      ? null
      : Number(input.framesHarvested);
  if (frames !== null && (Number.isNaN(frames) || frames < 0)) {
    return { ok: false, error: "Enter a valid frame count, or leave it blank." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to log a harvest." };
  }

  try {
    const { error } = await supabase.from("honey_yields").insert({
      hive_id: input.hiveId,
      harvest_date: input.harvestDate,
      weight_lbs: weight,
      frames_harvested: frames,
      notes: input.notes.trim() || null,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/hives");
    revalidatePath(`/hives/${input.hiveId}`);
    revalidatePath("/finances");
    return { ok: true, hiveId: input.hiveId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to log harvest.";
    if (/relation .* does not exist|Could not find the table/i.test(message)) {
      return {
        ok: false,
        error:
          "Database tables missing. Run the SQL migration in the Supabase SQL Editor first.",
      };
    }
    return { ok: false, error: message };
  }
}

export type CreateTreatmentInput = {
  hiveId: string;
  productName: string;
  startDate: string;
  endDate: string;
  dosage: string;
  notes: string;
};

export async function createTreatmentAction(
  input: CreateTreatmentInput
): Promise<ActionResult> {
  if (!input.hiveId) {
    return { ok: false, error: "Select a hive." };
  }
  if (!input.productName.trim()) {
    return { ok: false, error: "Choose a treatment product." };
  }
  if (!input.startDate || !input.endDate) {
    return { ok: false, error: "Start and pull-by dates are required." };
  }
  if (input.endDate < input.startDate) {
    return { ok: false, error: "Pull-by date must be on or after the start date." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to start a treatment." };
  }

  try {
    const { error } = await supabase.from("treatments").insert({
      hive_id: input.hiveId,
      product_name: input.productName.trim(),
      start_date: input.startDate,
      end_date: input.endDate,
      dosage: input.dosage.trim() || null,
      status: "in_progress",
      notes: input.notes.trim() || null,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/hives");
    revalidatePath(`/hives/${input.hiveId}`);
    return { ok: true, hiveId: input.hiveId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to start treatment.";
    if (/relation .* does not exist|Could not find the table/i.test(message)) {
      return {
        ok: false,
        error:
          "Database tables missing. Run the SQL migration in the Supabase SQL Editor first.",
      };
    }
    return { ok: false, error: message };
  }
}

export async function completeTreatmentAction(input: {
  treatmentId: string;
  hiveId: string;
}): Promise<ActionResult> {
  if (!input.treatmentId) {
    return { ok: false, error: "Treatment is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to complete a treatment." };
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();
    const { data: existing, error: loadError } = await supabase
      .from("treatments")
      .select("id, end_date, product_name")
      .eq("id", input.treatmentId)
      .maybeSingle();

    if (loadError || !existing) {
      return { ok: false, error: loadError?.message ?? "Treatment not found." };
    }

    const retestDays = postTreatmentMiteCheckDays(existing.product_name);
    const completedDate = existing.end_date ?? today;

    const { error } = await supabase
      .from("treatments")
      .update({
        status: "completed",
        end_date: completedDate,
        completed_at: nowIso,
        mite_retest_due_date: miteRetestDueDate(completedDate, retestDays),
      })
      .eq("id", input.treatmentId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/hives");
    revalidatePath(`/hives/${input.hiveId}`);
    return { ok: true, hiveId: input.hiveId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to complete treatment.";
    return { ok: false, error: message };
  }
}

export async function updateHiveStatusAction(input: {
  hiveId: string;
  status: Enums<"hive_status">;
}): Promise<ActionResult> {
  if (!input.hiveId) {
    return { ok: false, error: "Hive is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update a hive." };
  }

  const { error } = await supabase
    .from("hives")
    .update({ status: input.status })
    .eq("id", input.hiveId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/hives");
  revalidatePath(`/hives/${input.hiveId}`);
  return { ok: true, hiveId: input.hiveId };
}

export async function updateHiveNameAction(input: {
  hiveId: string;
  name: string;
}): Promise<ActionResult> {
  const name = input.name.trim();
  if (!input.hiveId) {
    return { ok: false, error: "Hive is required." };
  }
  if (!name) {
    return { ok: false, error: "Hive name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to rename a hive." };
  }

  const { error } = await supabase
    .from("hives")
    .update({ name })
    .eq("id", input.hiveId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A hive with that name already exists." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/hives");
  revalidatePath(`/hives/${input.hiveId}`);
  return { ok: true, hiveId: input.hiveId };
}

export async function updateHiveNotesAction(input: {
  hiveId: string;
  notes: string;
}): Promise<ActionResult> {
  if (!input.hiveId) {
    return { ok: false, error: "Hive is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update hive notes." };
  }

  const notes = input.notes.trim();
  const { error } = await supabase
    .from("hives")
    .update({ notes: notes || null })
    .eq("id", input.hiveId);

  if (error) {
    if (isMissingColumnError(error)) {
      return {
        ok: false,
        error:
          "Hive notes need a database update. Run the latest SQL migration in Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/hives");
  revalidatePath(`/hives/${input.hiveId}`);
  return { ok: true, hiveId: input.hiveId };
}

export async function updateHarvestGoalAction(input: {
  apiaryId: string;
  goalLbs: string;
}): Promise<ActionResult> {
  if (!input.apiaryId) {
    return { ok: false, error: "Yard is required." };
  }

  const trimmed = input.goalLbs.trim();
  const goal =
    trimmed === "" ? null : Number(trimmed);

  if (goal !== null && (Number.isNaN(goal) || goal < 0)) {
    return { ok: false, error: "Enter a valid goal in pounds, or leave it blank." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to set a harvest goal." };
  }

  const { error } = await supabase
    .from("apiaries")
    .update({ harvest_goal_lbs: goal })
    .eq("id", input.apiaryId);

  if (error) {
    if (isMissingColumnError(error)) {
      return {
        ok: false,
        error:
          "Harvest goals need a database update. Run the latest SQL migration in Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true, hiveId: input.apiaryId };
}

export async function updateMiteCheckIntervalAction(input: {
  apiaryId: string;
  intervalDays: string;
}): Promise<ActionResult> {
  if (!input.apiaryId) {
    return { ok: false, error: "Yard is required." };
  }

  const trimmed = input.intervalDays.trim();
  const interval = trimmed === "" ? null : Number(trimmed);

  if (interval !== null && (Number.isNaN(interval) || interval < 7)) {
    return {
      ok: false,
      error: "Enter at least 7 days between mite checks, or leave it blank for the default.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update mite check settings." };
  }

  const { error } = await supabase
    .from("apiaries")
    .update({ mite_check_interval_days: interval })
    .eq("id", input.apiaryId);

  if (error) {
    if (isMissingColumnError(error)) {
      return {
        ok: false,
        error:
          "Mite check intervals need a database update. Run the latest SQL migration in Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true, hiveId: input.apiaryId };
}

export async function updateQueenIntroducedAction(input: {
  hiveId: string;
  introducedDate: string;
}): Promise<ActionResult> {
  if (!input.hiveId) {
    return { ok: false, error: "Hive is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update queen details." };
  }

  const { error } = await supabase
    .from("hives")
    .update({
      queen_introduced_date:
        input.introducedDate.trim() === "" ? null : input.introducedDate,
    })
    .eq("id", input.hiveId);

  if (error) {
    if (isMissingColumnError(error)) {
      return {
        ok: false,
        error:
          "Queen lifecycle tracking needs a database update. Run the latest SQL migration in Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/hives");
  revalidatePath(`/hives/${input.hiveId}`);
  return { ok: true, hiveId: input.hiveId };
}
