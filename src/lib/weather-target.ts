export type WeatherQuery = {
  location?: string | null;
  lat?: number;
  lon?: number;
};

export type WeatherTarget =
  | { kind: "coords"; lat: number; lon: number; label: string }
  | { kind: "geocode"; location: string }
  | { kind: "none" };

function hasCoords(
  query: WeatherQuery
): query is WeatherQuery & { lat: number; lon: number } {
  return (
    typeof query.lat === "number" &&
    typeof query.lon === "number" &&
    Number.isFinite(query.lat) &&
    Number.isFinite(query.lon)
  );
}

/**
 * Weather follows the selected yard's saved town or coordinates.
 * It never falls back to a shared default or the keeper's current place.
 */
export function resolveWeatherTarget(query: WeatherQuery = {}): WeatherTarget {
  const location = query.location?.trim() ?? "";

  if (hasCoords(query)) {
    return {
      kind: "coords",
      lat: query.lat,
      lon: query.lon,
      label: location || "Yard",
    };
  }

  if (location) {
    return { kind: "geocode", location };
  }

  return { kind: "none" };
}
