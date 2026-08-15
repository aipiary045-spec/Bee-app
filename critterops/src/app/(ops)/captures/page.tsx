import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function CapturesPage() {
  const captures = await prisma.captureLog.findMany({
    include: { property: { include: { client: true } }, technician: true, trap: true },
    orderBy: { capturedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Field log</p>
        <h1 className="text-3xl font-semibold">Species & disposition</h1>
      </div>
      <div className="space-y-3">
        {captures.map((capture) => (
          <article key={capture.id} className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-lg font-semibold">
              {capture.count} {capture.species}
            </h2>
            <p className="text-sm text-muted">
              {formatDateTime(capture.capturedAt)} · {capture.method} · {capture.disposition}
            </p>
            <p className="mt-2">
              {capture.property.client.firstName} {capture.property.client.lastName} · {capture.property.city}
            </p>
            {capture.relocationSite ? (
              <p className="mt-2 text-sm">Relocation: {capture.relocationSite}</p>
            ) : null}
            {capture.notes ? <p className="mt-2 text-sm text-muted">{capture.notes}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
