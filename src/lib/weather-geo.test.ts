import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickGeoResult } from "./weather-geo.ts";

describe("pickGeoResult", () => {
  it("reads the first Open-Meteo geocode hit", () => {
    assert.deepEqual(
      pickGeoResult(
        {
          results: [
            {
              name: "Austin",
              admin1: "Texas",
              country: "United States",
              latitude: 30.2672,
              longitude: -97.7431,
            },
          ],
        },
        "Austin, TX"
      ),
      { lat: 30.2672, lon: -97.7431, label: "Austin, Texas" }
    );
  });

  it("returns null when there are no results", () => {
    assert.equal(pickGeoResult({ results: [] }, "Nowhere"), null);
    assert.equal(pickGeoResult(null, "Nowhere"), null);
  });
});
