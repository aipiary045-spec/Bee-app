import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  inferQueenMarkYear,
  formatQueenMarkYear,
} from "./queen-lifecycle.ts";
import { buildSeasonSnapshot } from "./season-snapshot.ts";

describe("queen mark year", () => {
  it("decodes IBRA mark colors", () => {
    assert.equal(inferQueenMarkYear("blue", 2026), 2025);
    assert.equal(inferQueenMarkYear("white", 2026), 2026);
    assert.equal(formatQueenMarkYear("yellow", 2026), "Marked for 2022");
  });
});

describe("season snapshot", () => {
  it("aggregates yard stats", () => {
    const snapshot = buildSeasonSnapshot(
      {
        inspectionCount: 12,
        treatmentCount: 3,
        splitCount: 2,
        harvestLbs: 145.5,
        miteReadings: [1.2, 2.4, 3.0],
      },
      2026
    );
    assert.equal(snapshot.inspectionCount, 12);
    assert.equal(snapshot.avgMitePer100, 2.2);
  });
});
