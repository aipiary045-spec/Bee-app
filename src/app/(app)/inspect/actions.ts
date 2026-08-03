"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type QuickLogInput = {
  hiveId: string;
  date: string;
  queenSpotted: boolean;
  broodPattern?: Enums<"brood_pattern"> | "";
  temperament?: Enums<"temperament"> | "";
  notes?: string;
  logQueen: boolean;
  queenStatus?: Enums<"queen_status"> | "";
  markColor?: Enums<"queen_mark_color"> | "";
  logMites: boolean;
  miteMethod?: Enums<"mite_method"> | "";
  miteCount?: string;
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
        queen_spotted: input.queenSpotted,
        brood_pattern: input.broodPattern || null,
        temperament: input.temperament || "moderate",
        notes: input.notes?.trim() || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (inspectionError) {
      return { ok: false, error: inspectionError.message };
    }

    if (input.logQueen && input.queenStatus) {
      const { error: queenError } = await supabase.from("queen_logs").insert({
        hive_id: input.hiveId,
        inspection_id: inspection.id,
        status: input.queenStatus,
        mark_color: input.markColor || "unmarked",
        notes: null,
      });

      if (queenError) {
        return { ok: false, error: queenError.message };
      }
    }

    if (input.logMites) {
      if (!input.miteMethod) {
        return { ok: false, error: "Choose a mite test method." };
      }
      const count = Number(input.miteCount);
      if (Number.isNaN(count) || count < 0) {
        return { ok: false, error: "Enter a valid mite count (0 or greater)." };
      }

      const { error: miteError } = await supabase.from("mite_counts").insert({
        hive_id: input.hiveId,
        inspection_id: inspection.id,
        method: input.miteMethod,
        count,
        date: input.date,
      });

      if (miteError) {
        return { ok: false, error: miteError.message };
      }
    }

    revalidatePath("/inspect");
    revalidatePath("/hives");
    revalidatePath(`/hives/${input.hiveId}`);
    revalidatePath("/");

    return { ok: true, inspectionId: inspection.id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save inspection.";
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
