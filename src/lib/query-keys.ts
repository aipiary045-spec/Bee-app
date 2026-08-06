export const queryKeys = {
  apiaries: {
    all: ["apiaries"] as const,
    detail: (id: string) => ["apiaries", id] as const,
  },
  hives: {
    all: ["hives"] as const,
    byApiary: (apiaryId: string) => ["hives", "apiary", apiaryId] as const,
    detail: (id: string) => ["hives", id] as const,
  },
  inspections: {
    byHive: (hiveId: string) => ["inspections", "hive", hiveId] as const,
  },
  miteCounts: {
    byHive: (hiveId: string) => ["mite-counts", "hive", hiveId] as const,
  },
  honeyYields: {
    byHive: (hiveId: string) => ["honey-yields", "hive", hiveId] as const,
  },
  expenses: {
    byApiary: (apiaryId: string) => ["expenses", "apiary", apiaryId] as const,
  },
  revenues: {
    byApiary: (apiaryId: string) => ["revenues", "apiary", apiaryId] as const,
  },
  finances: {
    summary: () => ["finances", "summary"] as const,
  },
  dashboard: {
    summary: (apiaryId: string) => ["dashboard", "summary", apiaryId] as const,
    alerts: (apiaryId: string) => ["dashboard", "alerts", apiaryId] as const,
  },
} as const;
