import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  groupAlertsByHiveId,
  hiveMatchesFilter,
} from "./hive-filters.ts";
import type { HiveAlert } from "./alerts.ts";

const alert = (
  hiveId: string,
  kind: HiveAlert["kind"]
): HiveAlert => ({
  id: `${hiveId}-${kind}`,
  hiveId,
  hiveName: "Hive",
  kind,
  severity: "warning",
  message: "test",
  href: `/hives/${hiveId}`,
});

describe("hiveMatchesFilter", () => {
  it("filters by search text", () => {
    const hive = { id: "1", name: "North 3", status: "active" as const };
    const map = groupAlertsByHiveId([]);
    assert.equal(hiveMatchesFilter(hive, "all", map, "north"), true);
    assert.equal(hiveMatchesFilter(hive, "all", map, "south"), false);
  });

  it("shows only hives with alerts for attention filter", () => {
    const steady = { id: "1", name: "A", status: "active" as const };
    const flagged = { id: "2", name: "B", status: "active" as const };
    const map = groupAlertsByHiveId([alert("2", "mites")]);
    assert.equal(hiveMatchesFilter(steady, "attention", map, ""), false);
    assert.equal(hiveMatchesFilter(flagged, "attention", map, ""), true);
  });

  it("matches steady active hives without alerts", () => {
    const hive = { id: "1", name: "A", status: "active" as const };
    const map = groupAlertsByHiveId([]);
    assert.equal(hiveMatchesFilter(hive, "steady", map, ""), true);
    assert.equal(
      hiveMatchesFilter(hive, "steady", groupAlertsByHiveId([alert("1", "mites")]), ""),
      false
    );
  });
});
