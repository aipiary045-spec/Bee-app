import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterLogsByHive,
  formatInspectionTime,
  groupLogsByDate,
  inspectionSummary,
  miteCountFromCheck,
  miteCountSyncPlan,
  optionLabel,
  parseInspectionNumbers,
  resolveQueenSighted,
  shouldKeepQueenLog,
  weatherSelectOptions,
  QUEEN_SIGHTED_OPTIONS,
} from "./inspection-log.ts";

describe("inspectionSummary", () => {
  it("summarizes queen, mites, and actions", () => {
    assert.equal(
      inspectionSummary({
        queen_sighted: "yes",
        mite_count_per_100: 1.5,
        action_fed: true,
        action_split: false,
        action_treatment: true,
        medium_added: 0,
        medium_removed: 0,
        shallow_added: 0,
        shallow_removed: 0,
        supers_added: 0,
        supers_removed: 0,
        super_count_after: 2,
      }),
      "Fed · Treated · Queen seen · 1.5 mites / 100"
    );
  });

  it("prefers typed super changes over legacy totals", () => {
    assert.equal(
      inspectionSummary({
        queen_sighted: "no",
        mite_count_per_100: null,
        action_fed: false,
        action_split: false,
        action_treatment: false,
        medium_added: 1,
        medium_removed: 0,
        shallow_added: 0,
        shallow_removed: 1,
        supers_added: 1,
        supers_removed: 1,
        super_count_after: 3,
      }),
      "Added 1 medium · Pulled 1 shallow · now 3 supers"
    );
  });

  it("falls back when no details were recorded", () => {
    assert.equal(
      inspectionSummary({
        queen_sighted: "no",
        mite_count_per_100: null,
        action_fed: false,
        action_split: false,
        action_treatment: false,
        medium_added: 0,
        medium_removed: 0,
        shallow_added: 0,
        shallow_removed: 0,
        supers_added: 0,
        supers_removed: 0,
        super_count_after: null,
      }),
      "Inspection logged"
    );
  });
});

describe("filterLogsByHive", () => {
  const logs = [
    { id: "a", hive_id: "h1" },
    { id: "b", hive_id: "h2" },
    { id: "c", hive_id: "h1" },
  ];

  it("returns every log when no hive is selected", () => {
    assert.deepEqual(filterLogsByHive(logs, undefined), logs);
    assert.deepEqual(filterLogsByHive(logs, "  "), logs);
  });

  it("keeps only the selected hive", () => {
    assert.deepEqual(filterLogsByHive(logs, "h1"), [
      { id: "a", hive_id: "h1" },
      { id: "c", hive_id: "h1" },
    ]);
  });
});

describe("groupLogsByDate", () => {
  it("groups consecutive logs that share a date", () => {
    const grouped = groupLogsByDate([
      { id: "a", date: "2026-08-18" },
      { id: "b", date: "2026-08-18" },
      { id: "c", date: "2026-08-17" },
    ]);
    assert.equal(grouped.length, 2);
    assert.equal(grouped[0].logs.length, 2);
    assert.equal(grouped[1].date, "2026-08-17");
  });
});

describe("parseInspectionNumbers", () => {
  it("accepts blank temperature and mite count", () => {
    const parsed = parseInspectionNumbers({
      temperatureF: "",
      miteCountPer100: "",
      mediumAdded: "0",
      mediumRemoved: "1",
      shallowAdded: 2,
      shallowRemoved: "0",
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.temperatureF, null);
      assert.equal(parsed.miteCountPer100, null);
      assert.equal(parsed.mediumRemoved, 1);
      assert.equal(parsed.shallowAdded, 2);
    }
  });

  it("rejects a negative mite count", () => {
    const parsed = parseInspectionNumbers({
      temperatureF: "80",
      miteCountPer100: "-1",
      mediumAdded: "0",
      mediumRemoved: "0",
      shallowAdded: "0",
      shallowRemoved: "0",
    });
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.match(parsed.error, /mite count/i);
    }
  });
});

describe("miteCountFromCheck", () => {
  it("skips a count when mites were not checked", () => {
    assert.deepEqual(miteCountFromCheck(false, "4"), { ok: true, value: "" });
    assert.deepEqual(miteCountFromCheck(false, ""), { ok: true, value: "" });
  });

  it("requires a count when mites were checked", () => {
    const empty = miteCountFromCheck(true, "  ");
    assert.equal(empty.ok, false);
    if (!empty.ok) {
      assert.match(empty.error, /mite count per 100/i);
    }
  });

  it("keeps a zero count as a real wash result", () => {
    assert.deepEqual(miteCountFromCheck(true, "0"), { ok: true, value: "0" });
    assert.deepEqual(miteCountFromCheck(true, "1.5"), {
      ok: true,
      value: "1.5",
    });
  });
});

describe("miteCountSyncPlan", () => {
  it("inserts when a count appears without a linked row", () => {
    assert.deepEqual(
      miteCountSyncPlan({ nextCount: 2, date: "2026-08-18", hasLinkedRow: false }),
      { type: "insert", count: 2, date: "2026-08-18" }
    );
  });

  it("updates an existing linked row", () => {
    assert.deepEqual(
      miteCountSyncPlan({ nextCount: 3, date: "2026-08-18", hasLinkedRow: true }),
      { type: "update", count: 3, date: "2026-08-18" }
    );
  });

  it("deletes a linked row when the count is cleared", () => {
    assert.deepEqual(
      miteCountSyncPlan({ nextCount: null, date: "2026-08-18", hasLinkedRow: true }),
      { type: "delete" }
    );
  });
});

describe("queen helpers", () => {
  it("keeps a queen log when the queen was seen or marked", () => {
    assert.equal(shouldKeepQueenLog("yes", "unmarked"), true);
    assert.equal(shouldKeepQueenLog("no", "yellow"), true);
    assert.equal(shouldKeepQueenLog("no", "unmarked"), false);
  });

  it("falls back to queen_spotted on older records", () => {
    assert.equal(
      resolveQueenSighted({ queen_sighted: null, queen_spotted: true }),
      "yes"
    );
    assert.equal(
      resolveQueenSighted({ queen_sighted: "uncertain", queen_spotted: false }),
      "uncertain"
    );
  });
});

describe("display helpers", () => {
  it("shortens postgres times to HH:MM", () => {
    assert.equal(formatInspectionTime("14:30:00"), "14:30");
    assert.equal(formatInspectionTime(null), "");
  });

  it("labels enum values and keeps custom weather", () => {
    assert.equal(optionLabel(QUEEN_SIGHTED_OPTIONS, "yes"), "Yes");
    assert.deepEqual(weatherSelectOptions("Hazy"), [
      "Sunny",
      "Partly Cloudy",
      "Cloudy",
      "Windy",
      "Light Rain",
      "Overcast",
      "Hazy",
    ]);
  });
});
