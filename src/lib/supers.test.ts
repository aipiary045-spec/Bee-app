import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_SUPERS,
  applySuperChange,
  applyTypedSuperChange,
  canAddSuper,
  canRemoveSuper,
  clampSuperCount,
  emptySuperChange,
  formatSuperChange,
  formatSuperCount,
  formatSuperInventory,
  formatTypedSuperChange,
  hiveSuperInventory,
  nextInventory,
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

describe("applyTypedSuperChange", () => {
  it("lets a visit pull a medium and add a shallow", () => {
    const result = applyTypedSuperChange(
      { medium: 2, shallow: 1 },
      {
        mediumAdded: 0,
        mediumRemoved: 1,
        shallowAdded: 1,
        shallowRemoved: 0,
      }
    );
    assert.deepEqual(result, {
      ok: true,
      next: { medium: 1, shallow: 2 },
      total: 3,
    });
  });

  it("keeps a harvest-and-replace at the same total", () => {
    const result = applyTypedSuperChange(
      { medium: 1, shallow: 1 },
      {
        mediumAdded: 1,
        mediumRemoved: 0,
        shallowAdded: 0,
        shallowRemoved: 1,
      }
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.total, 2);
      assert.deepEqual(result.next, { medium: 2, shallow: 0 });
    }
  });

  it("rejects pulling more of one type than the hive has", () => {
    const result = applyTypedSuperChange(
      { medium: 1, shallow: 0 },
      {
        mediumAdded: 0,
        mediumRemoved: 0,
        shallowAdded: 0,
        shallowRemoved: 1,
      }
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /shallow/);
    }
  });

  it("rejects a stack over the hive limit", () => {
    const result = applyTypedSuperChange(
      { medium: 10, shallow: 2 },
      {
        mediumAdded: 1,
        mediumRemoved: 0,
        shallowAdded: 0,
        shallowRemoved: 0,
      }
    );
    assert.equal(result.ok, false);
  });
});

describe("inventory helpers", () => {
  it("falls back to super_count as mediums when typed counts are missing", () => {
    assert.deepEqual(hiveSuperInventory({ super_count: 3 }), {
      medium: 3,
      shallow: 0,
    });
  });

  it("prefers typed counts when both are present", () => {
    assert.deepEqual(
      hiveSuperInventory({ super_count: 4, medium_count: 2, shallow_count: 1 }),
      { medium: 2, shallow: 1 }
    );
  });

  it("knows when a type can still be pulled or added", () => {
    const current = { medium: 1, shallow: 0 };
    const change = emptySuperChange();
    assert.equal(canRemoveSuper(current, change, "medium"), true);
    assert.equal(canRemoveSuper(current, change, "shallow"), false);
    assert.equal(canAddSuper(current, change), true);
    assert.equal(
      canAddSuper({ medium: MAX_SUPERS, shallow: 0 }, change),
      false
    );
  });

  it("previews the next inventory after a mixed visit", () => {
    assert.deepEqual(
      nextInventory(
        { medium: 2, shallow: 0 },
        {
          mediumAdded: 0,
          mediumRemoved: 1,
          shallowAdded: 1,
          shallowRemoved: 0,
        }
      ),
      { medium: 1, shallow: 1 }
    );
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

  it("formats a mixed stack", () => {
    assert.equal(formatSuperInventory({ medium: 0, shallow: 0 }), "0 supers");
    assert.equal(formatSuperInventory({ medium: 2, shallow: 0 }), "2 medium");
    assert.equal(formatSuperInventory({ medium: 0, shallow: 1 }), "1 shallow");
    assert.equal(
      formatSuperInventory({ medium: 2, shallow: 1 }),
      "2 medium · 1 shallow"
    );
  });

  it("describes add and remove actions", () => {
    assert.equal(formatSuperChange(1, 0), "Added 1 super");
    assert.equal(formatSuperChange(2, 0), "Added 2 supers");
    assert.equal(formatSuperChange(0, 1), "Removed 1 super");
    assert.equal(formatSuperChange(1, 1), "Added 1, removed 1");
    assert.equal(formatSuperChange(0, 0), "No super change");
  });

  it("describes a harvest-and-replace visit by type", () => {
    assert.equal(
      formatTypedSuperChange({
        mediumAdded: 1,
        mediumRemoved: 0,
        shallowAdded: 0,
        shallowRemoved: 1,
      }),
      "Added 1 medium · Pulled 1 shallow"
    );
    assert.equal(formatTypedSuperChange(emptySuperChange()), "No super change");
  });
});

describe("clampSuperCount", () => {
  it("keeps counts inside 0–12", () => {
    assert.equal(clampSuperCount(-4), 0);
    assert.equal(clampSuperCount(99), 12);
    assert.equal(clampSuperCount(2.8), 2);
  });
});
