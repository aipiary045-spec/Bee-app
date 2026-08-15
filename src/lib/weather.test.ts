import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatWeatherClock } from "./weather-format.ts";

describe("formatWeatherClock", () => {
  it("formats an Open-Meteo local timestamp", () => {
    assert.equal(formatWeatherClock("2026-08-14T20:45"), "8:45 PM");
    assert.equal(formatWeatherClock("2026-08-14T09:05"), "9:05 AM");
    assert.equal(formatWeatherClock("2026-08-14T00:00"), "12:00 AM");
  });
});
