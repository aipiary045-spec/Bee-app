import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hiveHealthById, worstHiveHealth } from "./hive-health.ts";
import type { HiveAlert } from "./alerts.ts";

const alert = (
  partial: Partial<HiveAlert> & Pick<HiveAlert, "hiveId" | "severity">
): HiveAlert => ({
  id: `${partial.hiveId}-${partial.severity}`,
  hiveName: partial.hiveName ?? "Hive",
  kind: partial.kind ?? "overdue",
  message: partial.message ?? "test",
  href: partial.href ?? "/",
  ...partial,
});

describe("hiveHealthById", () => {
  it("prefers danger over warning for the same hive", () => {
    const tones = hiveHealthById([
      alert({ hiveId: "a", severity: "warning" }),
      alert({ hiveId: "a", severity: "danger", kind: "mites" }),
    ]);
    assert.equal(tones.a, "danger");
  });

  it("returns an empty map when there are no alerts", () => {
    assert.deepEqual(hiveHealthById([]), {});
  });
});

describe("worstHiveHealth", () => {
  it("reports the highest severity present", () => {
    assert.equal(
      worstHiveHealth({ a: "warning", b: "danger" }),
      "danger"
    );
    assert.equal(worstHiveHealth({ a: "warning" }), "warning");
    assert.equal(worstHiveHealth({}), null);
  });
});
