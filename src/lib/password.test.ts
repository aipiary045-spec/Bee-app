import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { passwordIssue } from "./password.ts";

describe("passwordIssue", () => {
  it("rejects a short password", () => {
    assert.match(passwordIssue("Ab1"), /at least 10/);
    assert.match(passwordIssue("Abcde1"), /at least 10/);
  });

  it("requires a letter and a number", () => {
    assert.match(passwordIssue("abcdefghij"), /number/);
    assert.match(passwordIssue("1234567890"), /letter/);
  });

  it("accepts a longer mixed password", () => {
    assert.equal(passwordIssue("Honeycomb1"), null);
  });
});
