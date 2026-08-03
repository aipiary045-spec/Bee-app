const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const v = value.toLowerCase();
  return (
    v.includes("your-") ||
    v.includes("placeholder") ||
    v === "changeme"
  );
}

export const env = {
  // IMPORTANT: NEXT_PUBLIC_* must be referenced as static property accesses
  // so Next.js can inline them into the browser bundle.
  supabaseUrl: () =>
    supabaseUrl && !looksLikePlaceholder(supabaseUrl)
      ? supabaseUrl
      : "https://placeholder.supabase.co",
  supabaseAnonKey: () =>
    supabaseAnonKey && !looksLikePlaceholder(supabaseAnonKey)
      ? supabaseAnonKey
      : "placeholder-anon-key",
  defaultLocation:
    process.env.NEXT_PUBLIC_DEFAULT_LOCATION ?? "Agra, OK",
  defaultLat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 35.8942),
  defaultLon: Number(process.env.NEXT_PUBLIC_DEFAULT_LON ?? -96.8714),
  isSupabaseConfigured: () =>
    Boolean(
      supabaseUrl &&
        supabaseAnonKey &&
        !looksLikePlaceholder(supabaseUrl) &&
        !looksLikePlaceholder(supabaseAnonKey) &&
        supabaseUrl.startsWith("http")
    ),
} as const;
