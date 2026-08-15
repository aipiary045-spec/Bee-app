import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDaysISO, isTreatmentOverdue } from "./treatments.ts";

describe("addDaysISO", () => {
  it("adds whole days without UTC drift", () => {
    assert.equal(addDaysISO("2026-08-14", 14), "2026-08-28");
    assert.equal(addDaysISO("2026-08-20", 14), "2026-09-03");
  });
});

describe("isTreatmentOverdue", () => {
  const today = new Date(2026, 7, 14);

  it("flags an in-progress treatment past its end date", () => {
    assert.equal(isTreatmentOverdue("in_progress", "2026-08-10", today), true);
  });

  it("does not flag a completed or undated treatment", () => {
    assert.equal(isTreatmentOverdue("completed", "2026-08-01", today), false);
    assert.equal(isTreatmentOverdue("in_progress", null, today), false);
    assert.equal(isTreatmentOverdue("planned", "2026-08-20", today), false);
  });
});
