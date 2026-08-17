import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activityNoteLogEntry,
  captureLogEntry,
  chemicalLogEntry,
  displayValue,
  filterFieldLogs,
  mergeFieldLogs,
  trapEventLogEntry,
} from "./field-logs.ts";

const property = {
  label: "Main house",
  address1: "12 Oak St",
  city: "Chandler",
  state: "OK",
  zip: "74834",
  county: "Lincoln",
  client: { firstName: "Helen", lastName: "Marlow" },
};

test("empty log values render as an em dash so the list stays complete", () => {
  assert.equal(displayValue(null), "—");
  assert.equal(displayValue(""), "—");
  assert.equal(displayValue("raccoon"), "raccoon");
});

test("capture logs list every stored field", () => {
  const entry = captureLogEntry({
    id: "c1",
    species: "raccoon",
    count: 1,
    disposition: "relocated",
    method: "box or live trap",
    capturedAt: new Date("2026-08-15T12:00:00Z"),
    relocationSite: "Lincoln County",
    notes: "Healthy adult",
    technician: { name: "Riley" },
    trap: { serialNumber: "Trap #14", type: "live", locationNote: "North attic" },
    job: { number: "JOB-104", title: "Attic raccoon" },
    property,
  });

  const labels = entry.fields.map((field) => field.label);
  assert.deepEqual(labels, [
    "When",
    "Species",
    "Count",
    "Method",
    "Disposition",
    "Relocation site",
    "Technician",
    "Trap",
    "Trap location",
    "Job",
    "Client",
    "Property",
    "Address",
    "County",
    "Notes",
  ]);
  assert.equal(entry.fields.find((field) => field.label === "Trap")?.value, "Trap #14");
  assert.equal(entry.fields.find((field) => field.label === "Client")?.value, "Helen Marlow");
});

test("missing capture details still appear as blank rows", () => {
  const entry = captureLogEntry({
    id: "c2",
    species: "opossum",
    count: 1,
    disposition: "relocated",
    method: "box or live trap",
    capturedAt: new Date("2026-08-15T12:00:00Z"),
    property,
  });
  assert.equal(entry.fields.find((field) => field.label === "Trap")?.value, "—");
  assert.equal(entry.fields.find((field) => field.label === "Technician")?.value, "—");
});

test("merged logs sort newest first and can filter by kind", () => {
  const capture = captureLogEntry({
    id: "c1",
    species: "raccoon",
    count: 1,
    disposition: "relocated",
    method: "live trap",
    capturedAt: new Date("2026-08-15T10:00:00Z"),
    property,
  });
  const trap = trapEventLogEntry({
    id: "t1",
    type: "check",
    notes: "Empty. Reset.",
    at: new Date("2026-08-15T16:00:00Z"),
    user: { name: "Dawson" },
    trap: {
      serialNumber: "Trap #14",
      type: "live",
      status: "deployed",
      locationNote: "North attic",
      property,
    },
  });
  const chemical = chemicalLogEntry({
    id: "ch1",
    appliedAt: new Date("2026-08-15T08:00:00Z"),
    productName: "Contrac Blox",
    epaRegNumber: "12455-79",
    targetPest: "Norway rat",
    applicationRate: "4–16 oz",
    amountUsed: "2 lb",
    siteDescription: "Warehouse wall",
    method: "station",
    property,
  });
  const note = activityNoteLogEntry({
    id: "n1",
    kind: "note",
    body: "Scratching Monday night",
    createdAt: new Date("2026-08-15T09:00:00Z"),
    user: { name: "Dawson" },
    job: { number: "JOB-100", title: "Attic raccoon" },
  });

  const merged = mergeFieldLogs([capture, trap, chemical, note]);
  assert.deepEqual(
    merged.map((entry) => entry.kind),
    ["trap_event", "capture", "note", "chemical"]
  );
  assert.equal(filterFieldLogs(merged, "capture").length, 1);
  assert.equal(filterFieldLogs(merged, "all").length, 4);
});
