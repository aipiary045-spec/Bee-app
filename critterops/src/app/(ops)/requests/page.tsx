import { prisma } from "@/lib/db";
import { StatusPill } from "@/components/status-pill";
import { clientName } from "@/lib/utils";

export default async function RequestsPage() {
  const requests = await prisma.workRequest.findMany({
    include: { client: true, property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Inbox</p>
        <h1 className="text-3xl font-semibold">Requests</h1>
        <p className="text-muted">Phone and Client Hub intake — convert these into quotes and jobs.</p>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">{request.number}</p>
                <h2 className="text-lg font-semibold">{clientName(request.client)}</h2>
                <p className="text-sm text-muted">
                  {request.property.address1}, {request.property.city}
                </p>
              </div>
              <StatusPill value={request.status} />
            </div>
            <p className="mt-3">{request.complaint}</p>
            <p className="mt-2 text-sm text-muted">
              Target: {request.targetSpecies ?? "unspecified"} · Source: {request.source}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
