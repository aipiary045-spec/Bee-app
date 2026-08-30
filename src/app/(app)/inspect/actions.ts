"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getExpenseCatalogItem } from "@/lib/expense-catalog";
import {
  hiveHasSuperColumns,
  insertInspectionCompat,
  persistHiveSuperInventory,
} from "@/lib/hives";
import {
  parseHiveStacksFromDescription,
  resolveHiveInventory,
} from "@/lib/hive-stack-store";
import {
  applyTypedSuperChange,
  formatSuperInventory,
  formatTypedSuperChange,
  type SuperVisitChange,
} from "@/lib/supers";
import { isMissingColumnError } from "@/lib/hive-stack-store";
import { getTreatmentCatalogItem } from "@/lib/treatments";
import type { Enums, TablesInsert, TablesUpdate } from "@/types/database";

export type QuickLogExpenseInput = {
  catalogId: string;
  amount: string;
};

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
  miteMethod: Enums<"mite_method">;
  pestsDiseases: Enums<"pest_disease">;
  actionFed: boolean;
  mediumAdded: number;
  mediumRemoved: number;
  shallowAdded: number;
  shallowRemoved: number;
  actionSplit: boolean;
  splitType: Enums<"split_type"> | null;
  splitDestination: string;
  startTreatment: boolean;
  treatmentCatalogId: string;
  treatmentStartDate: string;
  treatmentEndDate: string;
  treatmentDosage: string;
  actionTreatment: boolean;
  notes: string;
  logExpenses: boolean;
  expenses: QuickLogExpenseInput[];
};

export type ActionResult =
  | {
      ok: true;
      inspectionId: string;
      superCountAfter: number;
      supersAdded: number;
      supersRemoved: number;
      mediumAdded: number;
      mediumRemoved: number;
      shallowAdded: number;
      shallowRemoved: number;
    }
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

  if (input.actionSplit && !input.splitType) {
    return { ok: false, error: "Choose a split or swarm type." };
  }

  if (input.startTreatment) {
    if (!input.treatmentCatalogId) {
      return { ok: false, error: "Choose a treatment product." };
    }
    if (!input.treatmentStartDate || !input.treatmentEndDate) {
      return { ok: false, error: "Treatment start and pull-by dates are required." };
    }
    if (input.treatmentEndDate < input.treatmentStartDate) {
      return { ok: false, error: "Pull-by date must be on or after the start date." };
    }
  }

  const parsedExpenses: {
    catalogId: string;
    label: string;
    category: Enums<"expense_category">;
    amount: number;
  }[] = [];

  if (input.logExpenses && input.expenses.length > 0) {
    for (const row of input.expenses) {
      const item = getExpenseCatalogItem(row.catalogId);
      if (!item) {
        return { ok: false, error: `Unknown expense item: ${row.catalogId}` };
      }
      const amount = Number(row.amount);
      if (Number.isNaN(amount) || amount < 0) {
        return {
          ok: false,
          error: `Enter a valid price for ${item.label}.`,
        };
      }
      parsedExpenses.push({
        catalogId: item.id,
        label: item.label,
        category: item.category,
        amount,
      });
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to log an inspection." };
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

    const change: SuperVisitChange = {
      mediumAdded: input.mediumAdded,
      mediumRemoved: input.mediumRemoved,
      shallowAdded: input.shallowAdded,
      shallowRemoved: input.shallowRemoved,
    };
    const superResult = applyTypedSuperChange(current, change);
    if (!superResult.ok) {
      return { ok: false, error: superResult.error };
    }
    const supersAdded = change.mediumAdded + change.shallowAdded;
    const supersRemoved = change.mediumRemoved + change.shallowRemoved;

    const typedChange = formatTypedSuperChange(change);
    const noteParts = [
      input.notes.trim(),
      typedChange !== "No super change"
        ? `${typedChange} · now ${formatSuperInventory(superResult.next)}`
        : "",
    ].filter(Boolean);

    const treatmentStarted = input.startTreatment;
    const inspectionPayload: TablesInsert<"inspections"> = {
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
      mite_method: miteCount !== null ? input.miteMethod : null,
      pests_diseases: input.pestsDiseases,
      action_fed: input.actionFed,
      action_super: supersAdded > 0,
      action_split: input.actionSplit,
      split_type: input.actionSplit ? input.splitType : null,
      split_destination:
        input.actionSplit && input.splitDestination.trim()
          ? input.splitDestination.trim()
          : null,
      action_treatment: treatmentStarted || input.actionTreatment,
      supers_added: supersAdded,
      supers_removed: supersRemoved,
      super_count_after: superResult.total,
      medium_added: change.mediumAdded,
      medium_removed: change.mediumRemoved,
      shallow_added: change.shallowAdded,
      shallow_removed: change.shallowRemoved,
      notes: noteParts.length > 0 ? noteParts.join(" · ") : null,
      created_by: user.id,
    };

    const { data: inspection, error: inspectionError } =
      await insertInspectionCompat(
        supabase,
        inspectionPayload,
        { columnsAvailable }
      );

    if (inspectionError || !inspection) {
      return { ok: false, error: inspectionError?.message ?? "Failed to save inspection." };
    }

    if (supersAdded > 0 || supersRemoved > 0) {
      await persistHiveSuperInventory(supabase, {
        hiveId: input.hiveId,
        apiaryId: hive.apiary_id,
        inventory: superResult.next,
        columnsAvailable,
      });
    }

    if (miteCount !== null) {
      await supabase.from("mite_counts").insert({
        hive_id: input.hiveId,
        inspection_id: inspection.id,
        method: input.miteMethod,
        count: miteCount,
        date: input.date,
      });
    }

    if (treatmentStarted) {
      const catalog = getTreatmentCatalogItem(input.treatmentCatalogId);
      const { error: treatmentError } = await supabase.from("treatments").insert({
        hive_id: input.hiveId,
        product_name: catalog?.name ?? input.treatmentCatalogId,
        start_date: input.treatmentStartDate,
        end_date: input.treatmentEndDate,
        dosage: input.treatmentDosage.trim() || catalog?.dosage || null,
        status: "in_progress",
        notes: "Started from Quick Log",
      });
      if (treatmentError) {
        return { ok: false, error: treatmentError.message };
      }
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

    if (parsedExpenses.length > 0) {
      const expenseRows: TablesInsert<"expenses">[] = parsedExpenses.map(
        (expense) => ({
          apiary_id: hive.apiary_id,
          hive_id: input.hiveId,
          category: expense.category,
          amount: expense.amount,
          date: input.date,
          description: `${expense.label} (Quick Log)`,
        })
      );

      const { error: expenseError } = await supabase
        .from("expenses")
        .insert(expenseRows);

      if (expenseError) {
        return { ok: false, error: expenseError.message };
      }
    }

    revalidatePath("/");
    revalidatePath("/inspect");
    revalidatePath("/hives");
    revalidatePath(`/hives/${input.hiveId}`);
    revalidatePath("/finances");
    revalidatePath("/expenses");

    return {
      ok: true,
      inspectionId: inspection.id,
      superCountAfter: superResult.total,
      supersAdded,
      supersRemoved,
      mediumAdded: change.mediumAdded,
      mediumRemoved: change.mediumRemoved,
      shallowAdded: change.shallowAdded,
      shallowRemoved: change.shallowRemoved,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save inspection.";
    if (/relation .* does not exist|Could not find the table/i.test(message)) {
      return {
        ok: false,
        error: "Could not save this visit. Try again in a moment.",
      };
    }
    return { ok: false, error: message };
  }
}

export type UpdateInspectionInput = {
  inspectionId: string;
  hiveId: string;
  date: string;
  inspectionTime: string;
  weather: string;
  temperatureF: string;
  queenSighted: Enums<"queen_sighted">;
  broodPattern: Enums<"brood_pattern">;
  miteCountPer100: string;
  miteMethod: Enums<"mite_method">;
  pestsDiseases: Enums<"pest_disease">;
  actionSplit: boolean;
  splitType: Enums<"split_type"> | null;
  splitDestination: string;
  notes: string;
};

export type UpdateInspectionResult =
  | { ok: true; inspectionId: string }
  | { ok: false; error: string };

export async function updateInspectionAction(
  input: UpdateInspectionInput
): Promise<UpdateInspectionResult> {
  if (!input.inspectionId) {
    return { ok: false, error: "Visit is required." };
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
    return { ok: false, error: "You must be signed in to edit a visit." };
  }

  const payload: TablesUpdate<"inspections"> = {
    date: input.date,
    inspection_time: input.inspectionTime || null,
    weather: input.weather || null,
    temperature_f: temp,
    queen_sighted: input.queenSighted,
    queen_spotted: input.queenSighted === "yes",
    brood_pattern: input.broodPattern,
    mite_count_per_100: miteCount,
    mite_method: miteCount !== null ? input.miteMethod : null,
    pests_diseases: input.pestsDiseases,
    split_type: input.actionSplit ? input.splitType : null,
    split_destination:
      input.actionSplit && input.splitDestination.trim()
        ? input.splitDestination.trim()
        : null,
    notes: input.notes.trim() || null,
  };

  const { error } = await supabase
    .from("inspections")
    .update(payload)
    .eq("id", input.inspectionId);

  if (error) {
    if (isMissingColumnError(error)) {
      const { mite_method, split_type, split_destination, ...fallback } =
        payload;
      void mite_method;
      void split_type;
      void split_destination;
      const retry = await supabase
        .from("inspections")
        .update(fallback)
        .eq("id", input.inspectionId);
      if (retry.error) {
        return { ok: false, error: retry.error.message };
      }
    } else {
      return { ok: false, error: error.message };
    }
  }

  if (miteCount !== null) {
    const { data: existing } = await supabase
      .from("mite_counts")
      .select("id")
      .eq("inspection_id", input.inspectionId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("mite_counts")
        .update({
          method: input.miteMethod,
          count: miteCount,
          date: input.date,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("mite_counts").insert({
        hive_id: input.hiveId,
        inspection_id: input.inspectionId,
        method: input.miteMethod,
        count: miteCount,
        date: input.date,
      });
    }
  } else {
    await supabase
      .from("mite_counts")
      .delete()
      .eq("inspection_id", input.inspectionId);
  }

  revalidatePath("/");
  revalidatePath("/inspect");
  revalidatePath("/hives");
  revalidatePath(`/hives/${input.hiveId}`);

  return { ok: true, inspectionId: input.inspectionId };
}

export type DeleteInspectionResult =
  | { ok: true; hiveId: string }
  | { ok: false; error: string };

export async function deleteInspectionAction(
  inspectionId: string
): Promise<DeleteInspectionResult> {
  if (!inspectionId) {
    return { ok: false, error: "Choose a visit to remove." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to remove a visit." };
  }

  try {
    const { data: inspection, error: loadError } = await supabase
      .from("inspections")
      .select("id, hive_id")
      .eq("id", inspectionId)
      .maybeSingle();

    if (loadError) {
      return { ok: false, error: loadError.message };
    }
    if (!inspection) {
      return { ok: false, error: "That visit was not found." };
    }

    const { error: miteError } = await supabase
      .from("mite_counts")
      .delete()
      .eq("inspection_id", inspectionId);
    if (miteError) {
      return { ok: false, error: miteError.message };
    }

    const { error: queenError } = await supabase
      .from("queen_logs")
      .delete()
      .eq("inspection_id", inspectionId);
    if (queenError) {
      return { ok: false, error: queenError.message };
    }

    const { error } = await supabase
      .from("inspections")
      .delete()
      .eq("id", inspectionId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/inspect");
    revalidatePath("/hives");
    revalidatePath(`/hives/${inspection.hive_id}`);

    return { ok: true, hiveId: inspection.hive_id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to remove that visit.",
    };
  }
}
