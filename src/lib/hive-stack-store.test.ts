import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attachStacksToHives,
  isMissingColumnError,
  parseHiveStacksFromDescription,
  resolveHiveInventory,
  withResolvedStack,
  writeHiveStacksToDescription,
} from "./hive-stack-store.ts";

describe("isMissingColumnError", () => {
  it("matches Postgres missing-column errors", () => {
    assert.equal(
      isMissingColumnError("column hives.super_count does not exist"),
      true
    );
  });

  it("matches PostgREST schema-cache errors", () => {
    assert.equal(
      isMissingColumnError(
        "Could not find the 'super_count' column of 'hives' in the schema cache"
      ),
      true
    );
  });

  it("ignores unrelated errors", () => {
    assert.equal(isMissingColumnError("Hive not found."), false);
    assert.equal(isMissingColumnError(null), false);
  });
});

describe("hive stack description sidecar", () => {
  it("round-trips stacks without losing the visible description", () => {
    const written = writeHiveStacksToDescription("Primary apiary near Agra, Oklahoma", {
      "hive-1": { medium: 2, shallow: 1 },
    });
    const parsed = parseHiveStacksFromDescription(written);
    assert.equal(parsed.text, "Primary apiary near Agra, Oklahoma");
    assert.deepEqual(parsed.stacks, { "hive-1": { medium: 2, shallow: 1 } });
  });

  it("drops empty stacks so the description stays clean", () => {
    const written = writeHiveStacksToDescription("Agra yard", {
      empty: { medium: 0, shallow: 0 },
    });
    assert.equal(written, "Agra yard");
  });

  it("returns the original text when no sidecar is present", () => {
    const parsed = parseHiveStacksFromDescription("Just a yard note");
    assert.equal(parsed.text, "Just a yard note");
    assert.deepEqual(parsed.stacks, {});
  });

  it("survives corrupt sidecar JSON", () => {
    const parsed = parseHiveStacksFromDescription(
      "Yard note\n<!--hive-stacks:{not-json-->"
    );
    assert.equal(parsed.text, "Yard note");
    assert.deepEqual(parsed.stacks, {});
  });
});

describe("resolveHiveInventory", () => {
  it("prefers real column counts over the sidecar", () => {
    assert.deepEqual(
      resolveHiveInventory(
        { super_count: 3, medium_count: 2, shallow_count: 1 },
        { medium: 9, shallow: 9 }
      ),
      { medium: 2, shallow: 1 }
    );
  });

  it("uses the sidecar when columns are missing or zero", () => {
    assert.deepEqual(
      resolveHiveInventory({ id: "hive-1" }, { medium: 2, shallow: 0 }),
      { medium: 2, shallow: 0 }
    );
  });
});

describe("attachStacksToHives", () => {
  it("fills typed counts from the yard sidecar", () => {
    const [hive] = attachStacksToHives(
      {
        description:
          'Primary apiary\n<!--hive-stacks:{"victory":{"medium":1,"shallow":2}}-->',
      },
      [{ id: "victory", name: "Victory" }]
    );
    assert.equal(hive.medium_count, 1);
    assert.equal(hive.shallow_count, 2);
    assert.equal(hive.super_count, 3);
  });

  it("keeps column counts when they already exist", () => {
    const hive = withResolvedStack(
      {
        id: "victory",
        super_count: 2,
        medium_count: 2,
        shallow_count: 0,
      },
      { victory: { medium: 8, shallow: 1 } }
    );
    assert.deepEqual(
      { medium: hive.medium_count, shallow: hive.shallow_count },
      { medium: 2, shallow: 0 }
    );
  });
});
