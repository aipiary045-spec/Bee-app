import assert from "node:assert/strict";
import { test } from "node:test";
import { chemicalRecordComplete, isRetained, retentionUntil } from "./compliance.ts";

test("NWCO complaint forms are retained three years", () => {
  const submitted = new Date("2026-08-15T00:00:00Z");
  const until = retentionUntil(submitted);
  assert.equal(until.getUTCFullYear(), 2029);
  assert.equal(isRetained(until, new Date("2028-01-01")), true);
  assert.equal(isRetained(until, new Date("2030-01-01")), false);
});

test("chemical records require EPA fields", () => {
  assert.equal(
    chemicalRecordComplete({
      productName: "Contrac Blox",
      epaRegNumber: "12455-79",
      targetPest: "Norway rat",
      applicationRate: "4–16 oz / placement",
      amountUsed: "2 lb",
      siteDescription: "Barn crawl, north wall",
      appliedAt: new Date(),
    }),
    true
  );
  assert.equal(
    chemicalRecordComplete({
      productName: "",
      epaRegNumber: "",
      targetPest: "rat",
      applicationRate: "",
      amountUsed: "",
      siteDescription: "",
      appliedAt: new Date(),
    }),
    false
  );
});
