import { prisma } from "@/lib/db";
import { trapNeedsCheck } from "@/lib/traps";
import { StatusPill } from "@/components/status-pill";
import { TrapCheckButton } from "@/components/trap-check-button";

export default async function TrapsPage() {
  const traps = await prisma.trap.findMany({
    include: { property: { include: { client: true } }, events: { orderBy: { at: "desc" }, take: 3 } },
    orderBy: { serialNumber: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Inventory</p>
        <h1 className="text-3xl font-semibold">Traps & exclusion gear</h1>
        <p className="text-muted">Oklahoma rule: deployed traps must be checked at least once every 24 hours.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {traps.map((trap) => {
          const overdue = trapNeedsCheck(trap.status, trap.lastCheckedAt);
          return (
            <article key={trap.id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{trap.serialNumber}</h2>
                  <p className="text-sm text-muted">{trap.locationNote ?? trap.type}</p>
                </div>
                <StatusPill value={overdue ? "needs_check" : trap.status} />
              </div>
              {trap.property ? (
                <p className="mt-2 text-sm">
                  {trap.property.client.firstName} {trap.property.client.lastName} · {trap.property.city}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">In the shop</p>
              )}
              <TrapCheckButton trapId={trap.id} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
