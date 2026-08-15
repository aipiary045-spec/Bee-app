import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveActiveApiary, yardSkyClass } from "./yards.ts";

describe("resolveActiveApiary", () => {
  const yards = [
    { id: "home", name: "Backyard" },
    { id: "out", name: "North pasture" },
  ];

  it("uses the requested yard when it belongs to the keeper", () => {
    assert.equal(resolveActiveApiary(yards, "out")?.id, "out");
  });

  it("falls back to the first yard when the cookie is missing or stale", () => {
    assert.equal(resolveActiveApiary(yards, null)?.id, "home");
    assert.equal(resolveActiveApiary(yards, "gone")?.id, "home");
  });

  it("returns null when there are no yards", () => {
    assert.equal(resolveActiveApiary([], "home"), null);
  });
});

describe("yardSkyClass", () => {
  it("uses a rain sky for wet weather", () => {
    assert.match(yardSkyClass("Light Rain"), /6f8498/);
  });

  it("keeps a bright sky for sun", () => {
    assert.match(yardSkyClass("Sunny"), /8ec8ef/);
  });
});
