"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveApiary } from "@/lib/hives";
import { getRevenueCatalogItem } from "@/lib/revenue-catalog";
import type { Enums, TablesInsert } from "@/types/database";

export type CreateRevenuesBatchInput = {
  date: string;
  hiveId?: string;
  items: {
    catalogId?: string;
    description?: string;
    category?: Enums<"revenue_category">;
    amount: string;
  }[];
};

export type ActionResult =
  | { ok: true; revenueId: string }
  | { ok: false; error: string };

export type BatchActionResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

function revalidateFinances() {
  revalidatePath("/finances");
  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function createRevenuesBatchAction(
  input: CreateRevenuesBatchInput
): Promise<BatchActionResult> {
  if (!input.date) {
    return { ok: false, error: "Date is required." };
  }
  if (!input.items.length) {
    return { ok: false, error: "Select at least one revenue item." };
  }

  const rows: {
    description: string;
    category: Enums<"revenue_category">;
    amount: number;
  }[] = [];

  for (const item of input.items) {
    let description = (item.description ?? "").trim();
    let category = item.category ?? "other";

    if (item.catalogId) {
      const catalogItem = getRevenueCatalogItem(item.catalogId);
      if (!catalogItem) {
        return { ok: false, error: `Unknown revenue item: ${item.catalogId}` };
      }
      if (!description) description = catalogItem.label;
      category = catalogItem.category;
    }

    if (!description) {
      return { ok: false, error: "Each revenue entry needs a description." };
    }

    const amount = Number(item.amount);
    if (Number.isNaN(amount) || amount < 0) {
      return {
        ok: false,
        error: `Enter a valid amount for ${description}.`,
      };
    }

    rows.push({ description, category, amount });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add revenue." };
  }

  try {
    const apiary = await getActiveApiary(user.id);

    const hiveId: string | null = input.hiveId?.trim() || null;
    if (hiveId) {
      const { data: hive, error: hiveError } = await supabase
        .from("hives")
        .select("id")
        .eq("id", hiveId)
        .eq("apiary_id", apiary.id)
        .maybeSingle();

      if (hiveError || !hive) {
        return { ok: false, error: "Selected hive was not found." };
      }
    }

    const payload: TablesInsert<"revenues">[] = rows.map((row) => ({
      apiary_id: apiary.id,
      hive_id: hiveId,
      category: row.category,
      amount: row.amount,
      date: input.date,
      description: row.description,
    }));

    const { error } = await supabase.from("revenues").insert(payload);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidateFinances();
    return { ok: true, count: rows.length };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create revenue.";
    if (/relation .* does not exist|Could not find the table/i.test(message)) {
      return {
        ok: false,
        error:
          "Revenues table is missing. Run supabase/migrations/20260805000000_revenues.sql in the Supabase SQL Editor, then try again.",
      };
    }
    return { ok: false, error: message };
  }
}

export async function deleteRevenueAction(
  revenueId: string
): Promise<ActionResult> {
  if (!revenueId) {
    return { ok: false, error: "Revenue id is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to delete revenue." };
  }

  try {
    const { error } = await supabase
      .from("revenues")
      .delete()
      .eq("id", revenueId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidateFinances();
    return { ok: true, revenueId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete revenue.";
    return { ok: false, error: message };
  }
}
