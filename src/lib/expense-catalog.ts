import type { Enums } from "@/types/database";

export type ExpenseCategory = Enums<"expense_category">;

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  equipment: "Equipment",
  treatments: "Treatments",
  feed: "Feed",
  administrative: "Administrative",
  other: "Other",
};

export type ExpenseCatalogItem = {
  id: string;
  label: string;
  category: ExpenseCategory;
};

/** Common beekeeping purchases for Quick Log expense logging. */
export const EXPENSE_CATALOG: ExpenseCatalogItem[] = [
  // Equipment
  { id: "langstroth-box", label: "Hive body / brood box", category: "equipment" },
  { id: "honey-super", label: "Honey super", category: "equipment" },
  { id: "frames", label: "Frames / foundation", category: "equipment" },
  { id: "inner-cover", label: "Inner cover", category: "equipment" },
  { id: "telescoping-cover", label: "Telescoping cover", category: "equipment" },
  { id: "bottom-board", label: "Bottom board", category: "equipment" },
  { id: "entrance-reducer", label: "Entrance reducer", category: "equipment" },
  { id: "queen-excluder", label: "Queen excluder", category: "equipment" },
  { id: "feeder", label: "Hive feeder", category: "equipment" },
  { id: "bee-suit", label: "Bee suit / jacket", category: "equipment" },
  { id: "gloves", label: "Gloves", category: "equipment" },
  { id: "veil", label: "Veil", category: "equipment" },
  { id: "smoker", label: "Smoker", category: "equipment" },
  { id: "hive-tool", label: "Hive tool", category: "equipment" },
  { id: "bee-brush", label: "Bee brush", category: "equipment" },
  { id: "uncapping-knife", label: "Uncapping knife", category: "equipment" },
  { id: "extractor", label: "Honey extractor", category: "equipment" },
  { id: "jars", label: "Honey jars / packaging", category: "equipment" },

  // Treatments
  { id: "oxalic-acid", label: "Oxalic acid treatment", category: "treatments" },
  { id: "formic-acid", label: "Formic acid (Formic Pro / Mite Away)", category: "treatments" },
  { id: "thymol", label: "Thymol treatment (Apiguard)", category: "treatments" },
  { id: "amitraz", label: "Amitraz strips (Apivar)", category: "treatments" },
  { id: "hopguard", label: "HopGuard", category: "treatments" },
  { id: "alcohol-wash-kit", label: "Alcohol wash / mite test kit", category: "treatments" },
  { id: "sticky-boards", label: "Sticky boards", category: "treatments" },

  // Feed
  { id: "sugar", label: "Sugar (for syrup)", category: "feed" },
  { id: "fondant", label: "Fondant / candy board", category: "feed" },
  { id: "pollen-patties", label: "Pollen patties", category: "feed" },
  { id: "protein-supplement", label: "Protein supplement", category: "feed" },

  // Other / livestock / admin
  { id: "package-bees", label: "Package bees", category: "other" },
  { id: "nuc", label: "Nuc colony", category: "other" },
  { id: "queen-bee", label: "Queen bee", category: "other" },
  { id: "queen-cage", label: "Queen cage / introduction", category: "other" },
  { id: "fuel-yard", label: "Fuel / yard travel", category: "administrative" },
  { id: "misc", label: "Miscellaneous", category: "other" },
];

export function getExpenseCatalogItem(id: string) {
  return EXPENSE_CATALOG.find((item) => item.id === id);
}
