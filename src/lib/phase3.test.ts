import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatQueenAge,
  isQueenAging,
  queenAgeMonths,
} from "./queen-lifecycle.ts";
import { scoreSwarmRisk, isSwarmSeason } from "./swarm-risk.ts";
import { buildMiteDueAlerts } from "./mite-interval.ts";

describe("queen lifecycle", () => {
  it("calculates queen age in months", () => {
    assert.equal(queenAgeMonths("2025-02-01", new Date(2026, 7, 14)), 18);
    assert.equal(formatQueenAge("2025-02-01", new Date(2026, 7, 14)), "1y 6mo");
  });

  it("flags aging queens", () => {
    assert.equal(isQueenAging("2024-01-01", new Date(2026, 7, 14)), true);
    assert.equal(isQueenAging("2025-08-01", new Date(2026, 7, 14)), false);
  });
});

describe("swarm risk", () => {
  it("scores peak season with queen cells as high", () => {
    assert.equal(
      scoreSwarmRisk({ month: 3, queenCellsSeen: true }),
      "high"
    );
  });

  it("knows swarm season months", () => {
    assert.equal(isSwarmSeason(3), true);
    assert.equal(isSwarmSeason(7), false);
  });
});

describe("mite due alerts", () => {
  it("flags hives without mite counts", () => {
    const alerts = buildMiteDueAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      new Map(),
      28,
      new Date(2026, 7, 14)
    );
    assert.equal(alerts[0].kind, "mite_due");
  });
});
