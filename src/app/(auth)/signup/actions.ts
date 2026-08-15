"use server";

import { revalidatePath } from "next/cache";
import { writeActiveYardId } from "@/lib/active-yard";
import { createApiaryForUser } from "@/lib/hives";
import { cleanSignupDetails } from "@/lib/signup-details";
import { createClient } from "@/lib/supabase/server";

export type SignupDetailsActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function completeSignupDetailsAction(input: {
  keeperName: string;
  yardName: string;
  location: string;
}): Promise<SignupDetailsActionResult> {
  const fields = cleanSignupDetails(input);
  if (!fields.ok) return fields;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in to finish setting up your yard." };
  }

  try {
    const { error: profileError } = await supabase.auth.updateUser({
      data: { full_name: fields.keeperName },
    });
    if (profileError) {
      return { ok: false, error: profileError.message };
    }

    const { data: existing, error: loadError } = await supabase
      .from("apiaries")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (loadError) {
      return { ok: false, error: loadError.message };
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("apiaries")
        .update({
          name: fields.yardName,
          location: fields.location,
        })
        .eq("id", existing.id)
        .eq("user_id", user.id);
      if (updateError) {
        return { ok: false, error: updateError.message };
      }
      await writeActiveYardId(existing.id);
    } else {
      const created = await createApiaryForUser(user.id, {
        name: fields.yardName,
        location: fields.location,
      });
      await writeActiveYardId(created.id);
    }

    revalidatePath("/");
    revalidatePath("/hives");
    revalidatePath("/settings");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save your yard.",
    };
  }
}
