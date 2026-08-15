import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cleanSignupDetails } from "./signup-details.ts";

describe("cleanSignupDetails", () => {
  it("keeps a complete keeper and yard", () => {
    assert.deepEqual(
      cleanSignupDetails({
        keeperName: "  Billy  ",
        yardName: " Agra Apiary ",
        location: " Agra, OK ",
      }),
      {
        ok: true,
        keeperName: "Billy",
        yardName: "Agra Apiary",
        location: "Agra, OK",
      }
    );
  });

  it("requires a name, yard, and town", () => {
    assert.equal(
      cleanSignupDetails({ keeperName: "", yardName: "Backyard", location: "Austin, TX" }).ok,
      false
    );
    assert.equal(
      cleanSignupDetails({ keeperName: "Sam", yardName: "", location: "Austin, TX" }).ok,
      false
    );
    assert.equal(
      cleanSignupDetails({ keeperName: "Sam", yardName: "Backyard", location: "" }).ok,
      false
    );
  });
});
