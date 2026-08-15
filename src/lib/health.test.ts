import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { broodScore, broodScoreLabel, shortChartDate } from "./health.ts";

describe("broodScore", () => {
  it("maps inspection labels onto a 0–5 scale", () => {
    assert.equal(broodScore("none"), 0);
    assert.equal(broodScore("poor"), 1);
    assert.equal(broodScore("spotty"), 2);
    assert.equal(broodScore("fair"), 3);
    assert.equal(broodScore("good"), 4);
    assert.equal(broodScore("excellent"), 5);
  });

  it("returns null for missing or unknown patterns", () => {
    assert.equal(broodScore(null), null);
    assert.equal(broodScore("unknown"), null);
  });

  it("labels a numeric score", () => {
    assert.equal(broodScoreLabel(5), "excellent");
    assert.equal(broodScoreLabel(2), "spotty");
  });

  it("shortens ISO dates for chart ticks", () => {
    assert.equal(shortChartDate("2026-08-14"), "8/14");
  });
});
