import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hiveSlideHint,
  hiveStripCanSlide,
  nearestHiveIndex,
} from "./yard-slide.ts";

describe("hiveStripCanSlide", () => {
  it("is still when the stand fits", () => {
    assert.equal(hiveStripCanSlide(320, 320), false);
    assert.equal(hiveStripCanSlide(324, 320), false);
  });

  it("slides when hives run past the frame", () => {
    assert.equal(hiveStripCanSlide(480, 320), true);
  });
});

describe("nearestHiveIndex", () => {
  it("returns 0 when the stand is empty", () => {
    assert.equal(nearestHiveIndex(160, []), 0);
  });

  it("picks the hive closest to the middle of the frame", () => {
    assert.equal(nearestHiveIndex(160, [40, 140, 280]), 1);
    assert.equal(nearestHiveIndex(40, [40, 140, 280]), 0);
    assert.equal(nearestHiveIndex(300, [40, 140, 280]), 2);
  });
});

describe("hiveSlideHint", () => {
  it("knows when more of the stand sits off-screen", () => {
    assert.deepEqual(hiveSlideHint(0, 320, 640), {
      moreLeft: false,
      moreRight: true,
    });
    assert.deepEqual(hiveSlideHint(200, 320, 640), {
      moreLeft: true,
      moreRight: true,
    });
    assert.deepEqual(hiveSlideHint(320, 320, 640), {
      moreLeft: true,
      moreRight: false,
    });
  });
});
