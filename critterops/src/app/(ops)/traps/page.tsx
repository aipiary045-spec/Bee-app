import { prisma } from "@/lib/db";
import { trapNeedsCheck } from "@/lib/traps";
import { StatusPill } from "@/components/status-pill";
import { TrapCheckButton } from "@/components/trap-check-button";
import { formatDateTime } from "@/lib/utils";

export default async function TrapsPage() {
  const traps = await prisma.trap.findMany({
    include: {
      property: { include: { client: true } },
      events: { include: { user: true }, orderBy: { at: "desc" } },
    },
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
              <section className="mt-4 border-t border-line pt-3">
                <h3 className="text-sm font-semibold">Check log</h3>
                {trap.events.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">No checks recorded yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {trap.events.map((event) => (
                      <li key={event.id} className="text-sm">
                        <p>
                          {formatDateTime(event.at)} · {event.type.replaceAll("_", " ")}
                          {event.user ? ` · ${event.user.name}` : ""}
                        </p>
                        <p className="text-muted">{event.notes ?? "—"}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </article>
          );
        })}
      </div>
    </div>
  );
}
