export type GeoPoint = {
  lat: number;
  lon: number;
  label: string;
};

export function pickGeoResult(data: unknown, fallbackLabel: string): GeoPoint | null {
  if (!data || typeof data !== "object") return null;
  const results = (data as { results?: unknown }).results;
  if (!Array.isArray(results) || results.length === 0) return null;
  const first = results[0];
  if (!first || typeof first !== "object") return null;
  const row = first as {
    latitude?: unknown;
    longitude?: unknown;
    name?: unknown;
    admin1?: unknown;
    country?: unknown;
  };
  const lat = Number(row.latitude);
  const lon = Number(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const parts = [row.name, row.admin1].filter(
    (part): part is string => typeof part === "string" && part.trim().length > 0
  );
  return {
    lat,
    lon,
    label: parts.length > 0 ? parts.join(", ") : fallbackLabel,
  };
}

export async function geocodeLocation(query: string): Promise<GeoPoint | null> {
  const name = query.trim();
  if (!name) return null;

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return pickGeoResult(await res.json(), name);
}
