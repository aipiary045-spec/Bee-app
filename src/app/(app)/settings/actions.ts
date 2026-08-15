"use server";

import { revalidatePath } from "next/cache";
import { writeActiveYardId } from "@/lib/active-yard";
import { createClient } from "@/lib/supabase/server";
import {
  createApiaryForUser,
  getActiveApiary,
  listApiariesForUser,
} from "@/lib/hives";

export type YardActionResult = { ok: true; yardId?: string } | { ok: false; error: string };

function revalidateYardViews() {
  revalidatePath("/");
  revalidatePath("/hives");
  revalidatePath("/inspect");
  revalidatePath("/finances");
  revalidatePath("/settings");
}

function cleanYardFields(input: { name: string; location: string }) {
  const name = input.name.trim();
  const location = input.location.trim();
  if (!name) return { ok: false as const, error: "Give the yard a name." };
  if (name.length > 80) {
    return { ok: false as const, error: "Yard name must be 80 characters or fewer." };
  }
  if (location.length > 80) {
    return { ok: false as const, error: "Location must be 80 characters or fewer." };
  }
  return { ok: true as const, name, location };
}

export async function selectYardAction(yardId: string): Promise<YardActionResult> {
  if (!yardId) {
    return { ok: false, error: "Choose a yard." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to switch yards." };
  }

  try {
    const yards = await listApiariesForUser(user.id);
    const match = yards.find((yard) => yard.id === yardId);
    if (!match) {
      return { ok: false, error: "That yard is not on this account." };
    }
    await writeActiveYardId(match.id);
    revalidateYardViews();
    return { ok: true, yardId: match.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not switch yards.",
    };
  }
}

export async function updateYardAction(input: {
  yardId?: string;
  name: string;
  location: string;
}): Promise<YardActionResult> {
  const fields = cleanYardFields(input);
  if (!fields.ok) return fields;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update the yard." };
  }

  try {
    const yards = await listApiariesForUser(user.id);
    const target =
      yards.find((yard) => yard.id === input.yardId) ??
      (await getActiveApiary(user.id));

    const { error } = await supabase
      .from("apiaries")
      .update({
        name: fields.name,
        location: fields.location,
      })
      .eq("id", target.id)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    await writeActiveYardId(target.id);
    revalidateYardViews();
    return { ok: true, yardId: target.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save the yard.",
    };
  }
}

export async function createYardAction(input: {
  name: string;
  location: string;
}): Promise<YardActionResult> {
  const fields = cleanYardFields(input);
  if (!fields.ok) return fields;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add a yard." };
  }

  try {
    const created = await createApiaryForUser(user.id, {
      name: fields.name,
      location: fields.location,
    });
    await writeActiveYardId(created.id);
    revalidateYardViews();
    return { ok: true, yardId: created.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not add the yard.",
    };
  }
}
