import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INSPECTION_OVERDUE_DAYS,
  MITE_THRESHOLD_PER_100,
  buildHiveAlerts,
  daysSince,
  uniqueHiveCount,
} from "./alerts.ts";

const today = new Date(2026, 7, 14);

function daysAgo(days: number) {
  const date = new Date(2026, 7, 14);
  date.setDate(date.getDate() - days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

describe("daysSince", () => {
  it("counts whole days from an ISO date", () => {
    assert.equal(daysSince("2026-08-01", today), 13);
    assert.equal(daysSince("2026-08-14", today), 0);
  });
});

describe("buildHiveAlerts", () => {
  it("flags a hive that has never been inspected", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [],
      today
    );
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].kind, "never_inspected");
    assert.equal(alerts[0].href, "/inspect?hive=h1");
  });

  it("flags an overdue inspection", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [
        {
          hiveId: "h1",
          date: daysAgo(INSPECTION_OVERDUE_DAYS + 4),
          queenSighted: "yes",
          miteCountPer100: 0.5,
          pestsDiseases: "none",
        },
      ],
      today
    );
    assert.equal(alerts.some((alert) => alert.kind === "overdue"), true);
    assert.match(alerts[0].message, /18 days/);
  });

  it("flags mites at or above the treatment threshold", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [
        {
          hiveId: "h1",
          date: daysAgo(2),
          queenSighted: "yes",
          miteCountPer100: MITE_THRESHOLD_PER_100,
          pestsDiseases: "none",
        },
      ],
      today
    );
    const mite = alerts.find((alert) => alert.kind === "mites");
    assert.ok(mite);
    assert.equal(mite.severity, "danger");
    assert.equal(mite.href, "/hives/h1#mites");
  });

  it("flags a missing queen across the last two visits", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [
        {
          hiveId: "h1",
          date: daysAgo(3),
          queenSighted: "no",
          miteCountPer100: 0,
          pestsDiseases: "none",
        },
        {
          hiveId: "h1",
          date: daysAgo(10),
          queenSighted: "uncertain",
          miteCountPer100: 0,
          pestsDiseases: "none",
        },
      ],
      today
    );
    assert.ok(alerts.some((alert) => alert.kind === "queen"));
  });

  it("does not flag a queen miss from a single visit", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [
        {
          hiveId: "h1",
          date: daysAgo(3),
          queenSighted: "no",
          miteCountPer100: 0,
          pestsDiseases: "none",
        },
      ],
      today
    );
    assert.equal(alerts.some((alert) => alert.kind === "queen"), false);
  });

  it("treats foulbrood as a danger alert", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [
        {
          hiveId: "h1",
          date: daysAgo(1),
          queenSighted: "yes",
          miteCountPer100: 0,
          pestsDiseases: "foulbrood_suspect",
        },
      ],
      today
    );
    const disease = alerts.find((alert) => alert.kind === "disease");
    assert.ok(disease);
    assert.equal(disease.severity, "danger");
  });

  it("surfaces deadouts and skips inspection rules for them", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h2", name: "Hive 2", status: "deadout" }],
      [],
      today
    );
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].kind, "deadout");
  });

  it("counts unique hives across stacked alerts", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [
        {
          hiveId: "h1",
          date: daysAgo(20),
          queenSighted: "no",
          miteCountPer100: 4.2,
          pestsDiseases: "varroa",
        },
        {
          hiveId: "h1",
          date: daysAgo(27),
          queenSighted: "no",
          miteCountPer100: 1,
          pestsDiseases: "none",
        },
      ],
      today
    );
    assert.ok(alerts.length >= 2);
    assert.equal(uniqueHiveCount(alerts), 1);
  });

  it("returns no alerts for a healthy recent visit", () => {
    const alerts = buildHiveAlerts(
      [{ id: "h1", name: "Hive 1", status: "active" }],
      [
        {
          hiveId: "h1",
          date: daysAgo(4),
          queenSighted: "yes",
          miteCountPer100: 0.4,
          pestsDiseases: "none",
        },
      ],
      today
    );
    assert.deepEqual(alerts, []);
  });
});
