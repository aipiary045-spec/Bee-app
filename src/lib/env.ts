function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${name}`);
}

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
  supabaseUrl: () =>
    getEnv("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder.supabase.co"),
  supabaseAnonKey: () =>
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder-anon-key"),
  defaultLocation:
    process.env.NEXT_PUBLIC_DEFAULT_LOCATION ?? "Agra, OK",
  defaultLat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 35.8942),
  defaultLon: Number(process.env.NEXT_PUBLIC_DEFAULT_LON ?? -96.8714),
  isSupabaseConfigured: () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return Boolean(
      url &&
        key &&
        !looksLikePlaceholder(url) &&
        !looksLikePlaceholder(key) &&
        url.startsWith("http")
    );
  },
} as const;
