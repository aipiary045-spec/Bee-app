import { StatusPill } from "@/components/status-pill";
import { type FieldLogEntry } from "@/lib/field-logs";

export function LogFieldList({ entry }: { entry: FieldLogEntry }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{entry.title}</h2>
        <StatusPill value={entry.kind} />
      </div>
      <dl className="mt-4 divide-y divide-line">
        {entry.fields.map((field) => (
          <div key={field.label} className="grid grid-cols-[10rem_minmax(0,1fr)] gap-4 py-2 text-sm">
            <dt className="text-muted">{field.label}</dt>
            <dd className="font-medium">{field.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
