"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultApiary } from "@/lib/hives";
import type { Enums } from "@/types/database";

export type CreateHiveInput = {
  name: string;
  status?: Enums<"hive_status">;
  frameCount?: number;
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add a hive." };
  }

  try {
    const apiary = await getOrCreateDefaultApiary(user.id);

    const { data, error } = await supabase
      .from("hives")
      .insert({
        apiary_id: apiary.id,
        name,
        status: input.status ?? "active",
        frame_count: frameCount,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "A hive with that name already exists." };
      }
      return { ok: false, error: error.message };
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

export type HiveConfig = {
  deepBoxes: number;
  honeySupers: number;
  hasQueenExcluder: boolean;
};

export type HiveConfigResult =
  | { ok: true; config: HiveConfig }
  | { ok: false; error: string };

const MAX_DEEP_BOXES = 6;
const MAX_HONEY_SUPERS = 8;

export async function updateHiveConfigAction(
  hiveId: string,
  config: HiveConfig
): Promise<HiveConfigResult> {
  if (!hiveId) {
    return { ok: false, error: "Missing hive." };
  }

  const deepBoxes = Math.round(config.deepBoxes);
  const honeySupers = Math.round(config.honeySupers);

  if (
    !Number.isFinite(deepBoxes) ||
    deepBoxes < 0 ||
    deepBoxes > MAX_DEEP_BOXES
  ) {
    return { ok: false, error: `Brood boxes must be between 0 and ${MAX_DEEP_BOXES}.` };
  }
  if (
    !Number.isFinite(honeySupers) ||
    honeySupers < 0 ||
    honeySupers > MAX_HONEY_SUPERS
  ) {
    return { ok: false, error: `Honey supers must be between 0 and ${MAX_HONEY_SUPERS}.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update a hive." };
  }

  const { data, error } = await supabase
    .from("hives")
    .update({
      deep_boxes: deepBoxes,
      honey_supers: honeySupers,
      has_queen_excluder: config.hasQueenExcluder,
    })
    .eq("id", hiveId)
    .select("deep_boxes, honey_supers, has_queen_excluder")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/hives");
  revalidatePath(`/hives/${hiveId}`);
  revalidatePath("/");

  return {
    ok: true,
    config: {
      deepBoxes: data.deep_boxes,
      honeySupers: data.honey_supers,
      hasQueenExcluder: data.has_queen_excluder,
    },
  };
}
