"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultApiary } from "@/lib/hives";
import { getExpenseCatalogItem } from "@/lib/expense-catalog";
import type { Enums, TablesInsert } from "@/types/database";

export type CreateExpenseInput = {
  catalogId?: string;
  description: string;
  category: Enums<"expense_category">;
  amount: string;
  date: string;
  hiveId?: string;
};

export type CreateExpensesBatchInput = {
  date: string;
  hiveId?: string;
  items: {
    catalogId?: string;
    description?: string;
    category?: Enums<"expense_category">;
    amount: string;
  }[];
};

export type ActionResult =
  | { ok: true; expenseId: string }
  | { ok: false; error: string };

export type BatchActionResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

export async function createExpensesBatchAction(
  input: CreateExpensesBatchInput
): Promise<BatchActionResult> {
  if (!input.date) {
    return { ok: false, error: "Date is required." };
  }
  if (!input.items.length) {
    return { ok: false, error: "Select at least one expense." };
  }

  const rows: {
    description: string;
    category: Enums<"expense_category">;
    amount: number;
  }[] = [];

  for (const item of input.items) {
    let description = (item.description ?? "").trim();
    let category = item.category ?? "other";

    if (item.catalogId) {
      const catalogItem = getExpenseCatalogItem(item.catalogId);
      if (!catalogItem) {
        return { ok: false, error: `Unknown expense item: ${item.catalogId}` };
      }
      if (!description) description = catalogItem.label;
      category = catalogItem.category;
    }

    if (!description) {
      return { ok: false, error: "Each expense needs a description." };
    }

    const amount = Number(item.amount);
    if (Number.isNaN(amount) || amount < 0) {
      return {
        ok: false,
        error: `Enter a valid price for ${description}.`,
      };
    }

    rows.push({ description, category, amount });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add expenses." };
  }

  try {
    const apiary = await getOrCreateDefaultApiary(user.id);

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

    const payload: TablesInsert<"expenses">[] = rows.map((row) => ({
      apiary_id: apiary.id,
      hive_id: hiveId,
      category: row.category,
      amount: row.amount,
      date: input.date,
      description: row.description,
    }));

    const { error } = await supabase.from("expenses").insert(payload);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/expenses");
    revalidatePath("/");
    return { ok: true, count: rows.length };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create expenses.";
    if (/relation .* does not exist|Could not find the table/i.test(message)) {
      return {
        ok: false,
        error:
          "Expenses table is missing. Run supabase/migrations/20260804010000_ensure_expenses.sql in the Supabase SQL Editor, then try again.",
      };
    }
    return { ok: false, error: message };
  }
}

export async function createExpenseAction(
  input: CreateExpenseInput
): Promise<ActionResult> {
  const result = await createExpensesBatchAction({
    date: input.date,
    hiveId: input.hiveId,
    items: [
      {
        catalogId: input.catalogId,
        description: input.description,
        category: input.category,
        amount: input.amount,
      },
    ],
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true, expenseId: "" };
}

export async function deleteExpenseAction(
  expenseId: string
): Promise<ActionResult> {
  if (!expenseId) {
    return { ok: false, error: "Expense id is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to delete an expense." };
  }

  try {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/expenses");
    revalidatePath("/");
    return { ok: true, expenseId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete expense.";
    return { ok: false, error: message };
  }
}
