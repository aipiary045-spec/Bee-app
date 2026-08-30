import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildYardWalkChecklist,
  groupYardWalkByHive,
} from "./yard-walk-checklist.ts";
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

describe("groupYardWalkByHive", () => {
  it("groups flags for the same hive into one row", () => {
    const groups = groupYardWalkByHive([
      {
        id: "a-overdue",
        hiveId: "a",
        hiveName: "Roger Woods North",
        message: "Overdue for a look",
        severity: "warning",
        href: "/inspect?hive=a",
      },
      {
        id: "a-treat",
        hiveId: "a",
        hiveName: "Roger Woods North",
        message: "Apiguard pull due today",
        severity: "warning",
        href: "/hives/a#treatments",
      },
      {
        id: "b-mites",
        hiveId: "b",
        hiveName: "Victory",
        message: "Mites high",
        severity: "danger",
        href: "/hives/b#mites",
      },
    ]);

    assert.equal(groups.length, 2);
    assert.equal(groups[0]?.hiveName, "Roger Woods North");
    assert.equal(groups[0]?.items.length, 2);
    assert.equal(groups[1]?.hiveName, "Victory");
    assert.equal(groups[1]?.items.length, 1);
  });

  it("raises the group to danger when any flag is danger", () => {
    const groups = groupYardWalkByHive([
      {
        id: "a-overdue",
        hiveId: "a",
        hiveName: "Hive A",
        message: "Overdue",
        severity: "warning",
        href: "/hives/a",
      },
      {
        id: "a-mites",
        hiveId: "a",
        hiveName: "Hive A",
        message: "Mites high",
        severity: "danger",
        href: "/hives/a#mites",
      },
    ]);

    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.severity, "danger");
  });
});
