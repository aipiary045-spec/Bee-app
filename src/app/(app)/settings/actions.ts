"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultApiary } from "@/lib/hives";

export type YardActionResult = { ok: true } | { ok: false; error: string };

export async function updateYardAction(input: {
  name: string;
  location: string;
}): Promise<YardActionResult> {
  const name = input.name.trim();
  const location = input.location.trim();

  if (!name) {
    return { ok: false, error: "Give the yard a name." };
  }
  if (name.length > 80) {
    return { ok: false, error: "Yard name must be 80 characters or fewer." };
  }
  if (location.length > 80) {
    return { ok: false, error: "Location must be 80 characters or fewer." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update the yard." };
  }

  try {
    const apiary = await getOrCreateDefaultApiary(user.id);
    const { error } = await supabase
      .from("apiaries")
      .update({
        name,
        location,
      })
      .eq("id", apiary.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/hives");
    revalidatePath("/inspect");
    revalidatePath("/settings");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save the yard.",
    };
  }
}
