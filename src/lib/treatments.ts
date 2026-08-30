export type TreatmentCatalogItem = {
  id: string;
  name: string;
  defaultDays: number;
  dosage: string;
  postTreatmentMiteCheckDays: number;
};

export const TREATMENT_CATALOG: TreatmentCatalogItem[] = [
  {
    id: "apivar",
    name: "Apivar",
    defaultDays: 42,
    dosage: "2 strips / brood box",
    postTreatmentMiteCheckDays: 21,
  },
  {
    id: "formic-pro",
    name: "Formic Pro",
    defaultDays: 14,
    dosage: "2 pads, 14-day",
    postTreatmentMiteCheckDays: 14,
  },
  {
    id: "apiguard",
    name: "Apiguard",
    defaultDays: 28,
    dosage: "50g tray × 2",
    postTreatmentMiteCheckDays: 21,
  },
  {
    id: "oa-vapor",
    name: "OA vapor",
    defaultDays: 7,
    dosage: "1g / brood box",
    postTreatmentMiteCheckDays: 14,
  },
  {
    id: "hopguard",
    name: "HopGuard",
    defaultDays: 14,
    dosage: "2 strips / brood box",
    postTreatmentMiteCheckDays: 14,
  },
];

export function getTreatmentCatalogItem(id: string) {
  return TREATMENT_CATALOG.find((item) => item.id === id) ?? null;
}

export function postTreatmentMiteCheckDays(productName: string): number {
  const match = TREATMENT_CATALOG.find(
    (item) => item.name.toLowerCase() === productName.toLowerCase()
  );
  return match?.postTreatmentMiteCheckDays ?? 21;
}

export function addDaysISO(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  if (!year || !month || !day) return dateISO;
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

export function isTreatmentOverdue(
  status: "planned" | "in_progress" | "completed",
  endDate: string | null,
  today: Date = new Date()
): boolean {
  if (status === "completed" || !endDate) return false;
  const [year, month, day] = endDate.split("-").map(Number);
  if (!year || !month || !day) return false;
  const due = new Date(year, month - 1, day);
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due.getTime() < now.getTime();
}
