import { prisma } from "@/lib/db";
import { ScheduleBoard } from "@/components/schedule-board";
import { clientName } from "@/lib/utils";

export default async function SchedulePage() {
  const [visits, technicians, plans] = await Promise.all([
    prisma.visit.findMany({
      include: { property: { include: { client: true } }, technician: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.routePlan.findMany({
      include: { stops: { include: { visit: { include: { property: true } } }, orderBy: { stopOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Dispatch</p>
        <h1 className="text-3xl font-semibold">Schedule</h1>
        <p className="text-muted">
          Drag-style reschedule, assign techs, then optimize the day with nearest-neighbor + 2-opt.
        </p>
      </div>
      <ScheduleBoard
        technicians={technicians.map((user) => ({ id: user.id, name: user.name }))}
        visits={visits.map((visit) => ({
          id: visit.id,
          title: visit.title,
          startsAt: visit.startsAt.toISOString(),
          endsAt: visit.endsAt.toISOString(),
          status: visit.status,
          technicianId: visit.technicianId,
          technicianName: visit.technician?.name ?? null,
          clientName: clientName(visit.property.client),
          city: visit.property.city,
        }))}
      />
      {plans.map((plan) => (
        <section key={plan.id} className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">
            Last optimized route · {plan.totalMiles.toFixed(1)} miles
          </h2>
          <ol className="mt-3 space-y-2 text-sm">
            {plan.stops.map((stop) => (
              <li key={stop.id}>
                {stop.stopOrder}. {stop.visit.title} — {stop.visit.property.city} (+
                {stop.milesFromPrev.toFixed(1)} mi)
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
