import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildYardWalkChecklist } from "./yard-walk-checklist.ts";
import type { HiveAlert } from "./alerts.ts";

describe("buildYardWalkChecklist", () => {
  it("orders items by hive stand order", () => {
    const hives = [
      { id: "a", name: "Hive A" },
      { id: "b", name: "Hive B" },
    ];
    const alerts: HiveAlert[] = [
      {
        id: "b-mites",
        hiveId: "b",
        hiveName: "Hive B",
        kind: "mites",
        severity: "danger",
        message: "Mites high",
        href: "/hives/b",
      },
      {
        id: "a-overdue",
        hiveId: "a",
        hiveName: "Hive A",
        kind: "overdue",
        severity: "warning",
        message: "Overdue",
        href: "/inspect?hive=a",
      },
    ];

    const items = buildYardWalkChecklist(hives, alerts, []);
    assert.equal(items[0]?.hiveId, "a");
    assert.equal(items[1]?.hiveId, "b");
  });

  it("includes open treatments due soon", () => {
    const today = new Date(2026, 7, 30);
    const items = buildYardWalkChecklist(
      [{ id: "a", name: "Hive A" }],
      [],
      [
        {
          id: "t1",
          hiveId: "a",
          hiveName: "Hive A",
          productName: "Apivar",
          endDate: "2026-08-30",
          status: "in_progress",
        },
      ],
      today
    );
    assert.equal(items.length, 1);
    assert.match(items[0]?.message ?? "", /pull due today/);
  });
});
