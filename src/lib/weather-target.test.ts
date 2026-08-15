import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveWeatherTarget } from "./weather-target.ts";

describe("resolveWeatherTarget", () => {
  it("geocodes a yard town when no coordinates are given", () => {
    assert.deepEqual(resolveWeatherTarget({ location: "  Stillwater, OK  " }), {
      kind: "geocode",
      location: "Stillwater, OK",
    });
  });

  it("uses explicit yard coordinates when both are present", () => {
    assert.deepEqual(
      resolveWeatherTarget({
        location: "Austin, TX",
        lat: 30.2672,
        lon: -97.7431,
      }),
      {
        kind: "coords",
        lat: 30.2672,
        lon: -97.7431,
        label: "Austin, TX",
      }
    );
  });

  it("does not invent a place when the yard has no town", () => {
    assert.deepEqual(resolveWeatherTarget({}), { kind: "none" });
    assert.deepEqual(resolveWeatherTarget({ location: "   " }), { kind: "none" });
    assert.deepEqual(resolveWeatherTarget({ location: null }), { kind: "none" });
  });

  it("ignores a lone latitude or longitude", () => {
    assert.deepEqual(resolveWeatherTarget({ lat: 35.89 }), { kind: "none" });
    assert.deepEqual(resolveWeatherTarget({ lon: -96.87 }), { kind: "none" });
    assert.deepEqual(
      resolveWeatherTarget({ location: "Tulsa, OK", lat: 36.15 }),
      { kind: "geocode", location: "Tulsa, OK" }
    );
  });
});
