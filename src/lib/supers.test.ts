import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_SUPERS,
  applySuperChange,
  clampSuperCount,
  formatSuperChange,
  formatSuperCount,
  nextSuperCount,
  splitSuperDelta,
} from "./supers.ts";

describe("applySuperChange", () => {
  it("adds supers on top of the current stack", () => {
    assert.deepEqual(applySuperChange(1, 2, 0), { ok: true, next: 3 });
  });

  it("removes supers from the current stack", () => {
    assert.deepEqual(applySuperChange(3, 0, 2), { ok: true, next: 1 });
  });

  it("allows a net-zero harvest and replace", () => {
    assert.deepEqual(applySuperChange(2, 1, 1), { ok: true, next: 2 });
  });

  it("rejects removing more than the hive has", () => {
    const result = applySuperChange(1, 0, 2);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Cannot remove more supers/);
    }
  });

  it("rejects counts above the hive limit", () => {
    const result = applySuperChange(MAX_SUPERS, 1, 0);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /at most 12/);
    }
  });

  it("rejects fractional or negative inputs", () => {
    assert.equal(applySuperChange(1.5, 0, 0).ok, false);
    assert.equal(applySuperChange(1, -1, 0).ok, false);
    assert.equal(applySuperChange(1, 0, -1).ok, false);
  });
});

describe("splitSuperDelta / nextSuperCount", () => {
  it("splits a positive delta into added supers", () => {
    assert.deepEqual(splitSuperDelta(2), { added: 2, removed: 0 });
  });

  it("splits a negative delta into removed supers", () => {
    assert.deepEqual(splitSuperDelta(-3), { added: 0, removed: 3 });
  });

  it("clamps the next count to the legal range", () => {
    assert.equal(nextSuperCount(0, -1), 0);
    assert.equal(nextSuperCount(MAX_SUPERS, 2), MAX_SUPERS);
    assert.equal(nextSuperCount(2, 1), 3);
  });
});

describe("labels", () => {
  it("formats singular and plural super counts", () => {
    assert.equal(formatSuperCount(0), "0 supers");
    assert.equal(formatSuperCount(1), "1 super");
    assert.equal(formatSuperCount(4), "4 supers");
  });

  it("describes add and remove actions", () => {
    assert.equal(formatSuperChange(1, 0), "Added 1 super");
    assert.equal(formatSuperChange(2, 0), "Added 2 supers");
    assert.equal(formatSuperChange(0, 1), "Removed 1 super");
    assert.equal(formatSuperChange(1, 1), "Added 1, removed 1");
    assert.equal(formatSuperChange(0, 0), "No super change");
  });
});

describe("clampSuperCount", () => {
  it("keeps counts inside 0–12", () => {
    assert.equal(clampSuperCount(-4), 0);
    assert.equal(clampSuperCount(99), 12);
    assert.equal(clampSuperCount(2.8), 2);
  });
});
