import Link from "next/link";
import { prisma } from "@/lib/db";
import { LogFieldList } from "@/components/log-field-list";
import {
  activityNoteLogEntry,
  captureLogEntry,
  chemicalLogEntry,
  filterFieldLogs,
  LOG_KIND_LABELS,
  mergeFieldLogs,
  trapEventLogEntry,
  type LogKind,
} from "@/lib/field-logs";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ kind: "all" | LogKind; label: string }> = [
  { kind: "all", label: "All logs" },
  { kind: "capture", label: LOG_KIND_LABELS.capture },
  { kind: "trap_event", label: LOG_KIND_LABELS.trap_event },
  { kind: "chemical", label: LOG_KIND_LABELS.chemical },
  { kind: "note", label: LOG_KIND_LABELS.note },
];

export default async function CapturesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const [captures, trapEvents, chemicals, notes] = await Promise.all([
    prisma.captureLog.findMany({
      include: {
        property: { include: { client: true } },
        technician: true,
        trap: true,
        job: true,
      },
      orderBy: { capturedAt: "desc" },
    }),
    prisma.trapEvent.findMany({
      include: {
        user: true,
        trap: { include: { property: { include: { client: true } } } },
      },
      orderBy: { at: "desc" },
    }),
    prisma.chemicalApplication.findMany({
      include: {
        property: { include: { client: true } },
        applicator: true,
        job: true,
      },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.activityNote.findMany({
      include: { user: true, job: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const logs = filterFieldLogs(
    mergeFieldLogs([
      ...captures.map(captureLogEntry),
      ...trapEvents.map(trapEventLogEntry),
      ...chemicals.map(chemicalLogEntry),
      ...notes.map(activityNoteLogEntry),
    ]),
    kind
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Field log</p>
        <h1 className="text-3xl font-semibold">All activity</h1>
        <p className="text-muted">
          Every capture, trap check, chemical application, and job note — with every stored field listed.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href = filter.kind === "all" ? "/captures" : `/captures?kind=${filter.kind}`;
          const active = (kind ?? "all") === filter.kind;
          return (
            <Link
              key={filter.kind}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-sm",
                active ? "border-green bg-green/10 text-green-dark" : "border-line bg-card text-muted"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
      {logs.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card p-5 text-muted">No logs in this list yet.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((entry) => (
            <LogFieldList key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
