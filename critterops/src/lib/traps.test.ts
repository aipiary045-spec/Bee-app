import assert from "node:assert/strict";
import { test } from "node:test";
import { trapLabel, trapNeedsCheck } from "./traps.ts";

test("Oklahoma 24-hour trap check", () => {
  const now = new Date("2026-08-15T16:00:00Z");
  assert.equal(trapNeedsCheck("deployed", new Date("2026-08-14T15:00:00Z"), now), true);
  assert.equal(trapNeedsCheck("deployed", new Date("2026-08-15T10:00:00Z"), now), false);
  assert.equal(trapNeedsCheck("in_stock", new Date("2026-08-01T00:00:00Z"), now), false);
});

test("field label matches the example shape", () => {
  assert.equal(
    trapLabel("Trap #14", "Active", "Raccoon in Attic"),
    "Trap #14 · Active · Raccoon in Attic"
  );
});
