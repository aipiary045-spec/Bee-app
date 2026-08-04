import { env } from "@/lib/env";

/** Absolute URL for a hive's Quick Log (used in QR codes). */
export function getHiveQuickLogUrl(hiveId: string, origin?: string): string {
  const configured = env.appUrl();
  const base = (configured ?? origin?.replace(/\/$/, "") ?? "").replace(
    /\/$/,
    ""
  );
  return `${base}/inspect?hive=${encodeURIComponent(hiveId)}`;
}
