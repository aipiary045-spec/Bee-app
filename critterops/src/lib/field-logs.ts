import { formatDateTime, clientName, propertyLine } from "./utils.ts";

export type LogKind = "capture" | "trap_event" | "chemical" | "note";

export type LogField = {
  label: string;
  value: string;
};

export type FieldLogEntry = {
  id: string;
  kind: LogKind;
  at: Date;
  title: string;
  fields: LogField[];
};

export const LOG_KIND_LABELS: Record<LogKind, string> = {
  capture: "Capture",
  trap_event: "Trap check",
  chemical: "Chemical",
  note: "Note",
};

export function displayValue(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return formatDateTime(value);
  return String(value);
}

export function logFields(pairs: Array<[string, string | number | Date | null | undefined]>): LogField[] {
  return pairs.map(([label, value]) => ({ label, value: displayValue(value) }));
}

type Named = { name: string };
type ClientRef = { firstName: string; lastName: string; companyName?: string | null };
type PropertyRef = {
  label: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  county?: string | null;
  client: ClientRef;
};
type JobRef = { number: string; title: string } | null;
type TrapRef = { serialNumber: string; type: string; locationNote?: string | null } | null;

export function captureLogEntry(capture: {
  id: string;
  species: string;
  count: number;
  disposition: string;
  method: string;
  capturedAt: Date;
  relocationSite?: string | null;
  notes?: string | null;
  technician?: Named | null;
  trap?: TrapRef;
  job?: JobRef;
  property: PropertyRef;
}): FieldLogEntry {
  return {
    id: `capture-${capture.id}`,
    kind: "capture",
    at: capture.capturedAt,
    title: `${capture.count} ${capture.species} · ${capture.disposition}`,
    fields: logFields([
      ["When", capture.capturedAt],
      ["Species", capture.species],
      ["Count", capture.count],
      ["Method", capture.method],
      ["Disposition", capture.disposition],
      ["Relocation site", capture.relocationSite],
      ["Technician", capture.technician?.name],
      ["Trap", capture.trap?.serialNumber],
      ["Trap location", capture.trap?.locationNote],
      ["Job", capture.job ? `${capture.job.number} · ${capture.job.title}` : null],
      ["Client", clientName(capture.property.client)],
      ["Property", capture.property.label],
      ["Address", propertyLine(capture.property)],
      ["County", capture.property.county],
      ["Notes", capture.notes],
    ]),
  };
}

export function trapEventLogEntry(event: {
  id: string;
  type: string;
  notes?: string | null;
  at: Date;
  user?: Named | null;
  trap: {
    serialNumber: string;
    type: string;
    status: string;
    locationNote?: string | null;
    property?: PropertyRef | null;
  };
}): FieldLogEntry {
  return {
    id: `trap-${event.id}`,
    kind: "trap_event",
    at: event.at,
    title: `${event.trap.serialNumber} · ${event.type}`,
    fields: logFields([
      ["When", event.at],
      ["Event", event.type],
      ["Trap", event.trap.serialNumber],
      ["Trap type", event.trap.type],
      ["Trap status", event.trap.status],
      ["Location", event.trap.locationNote],
      ["Technician", event.user?.name],
      ["Client", event.trap.property ? clientName(event.trap.property.client) : null],
      ["Property", event.trap.property?.label],
      ["Address", event.trap.property ? propertyLine(event.trap.property) : null],
      ["Notes", event.notes],
    ]),
  };
}

export function chemicalLogEntry(row: {
  id: string;
  appliedAt: Date;
  productName: string;
  epaRegNumber: string;
  targetPest: string;
  applicationRate: string;
  amountUsed: string;
  siteDescription: string;
  method: string;
  windMph?: number | null;
  temperatureF?: number | null;
  notes?: string | null;
  applicator?: Named | null;
  job?: JobRef;
  property: PropertyRef;
}): FieldLogEntry {
  return {
    id: `chemical-${row.id}`,
    kind: "chemical",
    at: row.appliedAt,
    title: `${row.productName} · ${row.targetPest}`,
    fields: logFields([
      ["When", row.appliedAt],
      ["Product", row.productName],
      ["EPA number", row.epaRegNumber],
      ["Target pest", row.targetPest],
      ["Rate", row.applicationRate],
      ["Amount used", row.amountUsed],
      ["Site", row.siteDescription],
      ["Method", row.method],
      ["Wind (mph)", row.windMph],
      ["Temperature (°F)", row.temperatureF],
      ["Applicator", row.applicator?.name],
      ["Job", row.job ? `${row.job.number} · ${row.job.title}` : null],
      ["Client", clientName(row.property.client)],
      ["Property", row.property.label],
      ["Address", propertyLine(row.property)],
      ["Notes", row.notes],
    ]),
  };
}

export function activityNoteLogEntry(note: {
  id: string;
  kind: string;
  body: string;
  createdAt: Date;
  user?: Named | null;
  job: { number: string; title: string };
}): FieldLogEntry {
  return {
    id: `note-${note.id}`,
    kind: "note",
    at: note.createdAt,
    title: `${note.job.number} · ${note.kind}`,
    fields: logFields([
      ["When", note.createdAt],
      ["Kind", note.kind],
      ["Job", `${note.job.number} · ${note.job.title}`],
      ["Author", note.user?.name],
      ["Note", note.body],
    ]),
  };
}

export function mergeFieldLogs(entries: FieldLogEntry[]) {
  return [...entries].sort((a, b) => b.at.getTime() - a.at.getTime());
}

export function filterFieldLogs(entries: FieldLogEntry[], kind: string | null | undefined) {
  if (!kind || kind === "all") return entries;
  return entries.filter((entry) => entry.kind === kind);
}
