"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultApiary } from "@/lib/hives";
import type { Enums } from "@/types/database";

export type CreateHiveInput = {
  name: string;
  status?: Enums<"hive_status">;
  frameCount?: number;
  superCount?: number;
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

  const superCount = input.superCount ?? 0;
  if (superCount < 0 || superCount > 12) {
    return { ok: false, error: "Honey supers must be between 0 and 12." };
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
        super_count: superCount,
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
