import type { Enums } from "@/types/database";

export type RevenueCategory = Enums<"revenue_category">;

export const REVENUE_CATEGORY_LABELS: Record<RevenueCategory, string> = {
  honey_sales: "Honey sales",
  nucs: "Nucs",
  queens: "Queens",
  pollination: "Pollination",
  wax: "Wax",
  other: "Other",
};

export type RevenueCatalogItem = {
  id: string;
  label: string;
  category: RevenueCategory;
};

/** Common beekeeping income items for Finances revenue logging. */
export const REVENUE_CATALOG: RevenueCatalogItem[] = [
  { id: "honey-jars", label: "Honey jars / retail", category: "honey_sales" },
  { id: "honey-bulk", label: "Bulk honey", category: "honey_sales" },
  { id: "honey-comb", label: "Comb honey", category: "honey_sales" },
  { id: "nuc-sale", label: "Nuc colony sale", category: "nucs" },
  { id: "package-sale", label: "Package bees sale", category: "nucs" },
  { id: "queen-sale", label: "Queen bee sale", category: "queens" },
  { id: "queen-cells", label: "Queen cells", category: "queens" },
  { id: "pollination-contract", label: "Pollination contract", category: "pollination" },
  { id: "wax-blocks", label: "Beeswax / blocks", category: "wax" },
  { id: "wax-products", label: "Wax products (candles, etc.)", category: "wax" },
  { id: "misc-income", label: "Miscellaneous income", category: "other" },
];

export function getRevenueCatalogItem(id: string) {
  return REVENUE_CATALOG.find((item) => item.id === id);
}
