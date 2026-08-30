import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeCsv, financeCsvRows } from "./finances-csv.ts";

describe("escapeCsv", () => {
  it("quotes values with commas or quotes", () => {
    assert.equal(escapeCsv('Sugar, "bulk"'), '"Sugar, ""bulk"""');
    assert.equal(escapeCsv("plain"), "plain");
  });
});

describe("financeCsvRows", () => {
  it("builds a header and data rows", () => {
    const csv = financeCsvRows([
      ["2026-08-01", "Apiary", "Expense", "Feed", 'Sugar, "bulk"', "-12.50"],
    ]);
    assert.match(csv, /^Date,Hive,Flow,Category,Description,Amount/);
    assert.match(csv, /"Sugar, ""bulk"""/);
  });
});
