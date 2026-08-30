import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSeasonComparison,
  formatSeasonDelta,
} from "./season-compare.ts";
import {
  buildMonthlySeasonPoints,
  monthIndexFromDate,
  peakMonth,
} from "./season-monthly.ts";
import { buildSeasonSnapshot } from "./season-snapshot.ts";
import { seasonCsvFilename, seasonToCsv } from "./season-export.ts";

describe("season compare", () => {
  it("builds year-over-year deltas", () => {
    const current = buildSeasonSnapshot(
      {
        inspectionCount: 12,
        treatmentCount: 3,
        splitCount: 2,
        harvestLbs: 145.5,
        miteReadings: [2, 4],
      },
      2026
    );
    const prior = buildSeasonSnapshot(
      {
        inspectionCount: 8,
        treatmentCount: 4,
        splitCount: 1,
        harvestLbs: 120,
        miteReadings: [3],
      },
      2025
    );
    const comparison = buildSeasonComparison(current, prior);
    const visits = comparison.find((row) => row.key === "inspectionCount");
    assert.equal(visits?.delta, 4);
    assert.equal(visits?.improved, true);
    const mites = comparison.find((row) => row.key === "avgMitePer100");
    assert.equal(mites?.delta, 0);
    assert.equal(mites?.improved, null);
    assert.equal(formatSeasonDelta(4), "+4");
    assert.equal(formatSeasonDelta(-2), "-2");
  });
});

describe("season monthly", () => {
  it("groups visits and harvest by month", () => {
    assert.equal(monthIndexFromDate("2026-03-15"), 2);
    const points = buildMonthlySeasonPoints(
      [0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0]
    );
    assert.equal(points[2]?.visits, 4);
    assert.equal(peakMonth(points, "visits")?.label, "Mar");
    assert.equal(peakMonth(points, "harvestLbs")?.label, "May");
  });
});

describe("season export", () => {
  it("writes a csv summary", () => {
    const snapshot = buildSeasonSnapshot(
      {
        inspectionCount: 5,
        treatmentCount: 1,
        splitCount: 0,
        harvestLbs: 42,
        miteReadings: [1.5],
      },
      2026
    );
    const csv = seasonToCsv(
      snapshot,
      buildSeasonComparison(snapshot, null)
    );
    assert.match(csv, /Visits logged,5/);
    assert.equal(seasonCsvFilename(2026), "apiary-season-2026.csv");
  });
});
