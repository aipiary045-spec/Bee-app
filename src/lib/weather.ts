import { DEFAULT_LAT, DEFAULT_LON, DEFAULT_LOCATION } from "@/lib/utils";

export { formatWeatherClock } from "@/lib/weather-format";

export type LocalWeather = {
  condition: string;
  temperatureF: number;
  windSpeedMph: number;
  humidity: number;
  location: string;
  observedAt: string;
};

/** WMO weather interpretation codes → form-friendly labels */
function conditionFromCode(code: number): string {
  if (code === 0) return "Sunny";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Cloudy";
  if (code >= 51 && code <= 67) return "Light Rain";
  if (code >= 71 && code <= 77) return "Cloudy";
  if (code >= 80 && code <= 82) return "Light Rain";
  if (code >= 95) return "Windy";
  return "Cloudy";
}

export async function fetchLocalWeather(
  lat = DEFAULT_LAT,
  lon = DEFAULT_LON
): Promise<LocalWeather | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
    );
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("timezone", "America/Chicago");

    const res = await fetch(url.toString(), {
      next: { revalidate: 600 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      current?: {
        time?: string;
        temperature_2m?: number;
        relative_humidity_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
    };

    const current = data.current;
    if (!current || typeof current.temperature_2m !== "number") {
      return null;
    }

    return {
      condition: conditionFromCode(current.weather_code ?? 3),
      temperatureF: Math.round(current.temperature_2m),
      windSpeedMph: Math.round(current.wind_speed_10m ?? 0),
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      location: DEFAULT_LOCATION,
      observedAt: current.time ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
