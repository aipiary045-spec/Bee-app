function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${name}`);
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
  isSupabaseConfigured: () =>
    Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
} as const;
