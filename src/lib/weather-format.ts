export function formatWeatherClock(observedAt: string): string {
  const time = observedAt.includes("T") ? observedAt.split("T")[1] : observedAt;
  const [hourPart, minutePart] = (time ?? "").split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return observedAt;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}
