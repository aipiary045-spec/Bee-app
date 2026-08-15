import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { clientName, propertyLine } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      client: true,
      jobs: true,
      traps: true,
      entryPoints: true,
      photos: true,
    },
  });
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">
          {property.label}
        </p>
        <h1 className="text-3xl font-semibold">{propertyLine(property)}</h1>
        <p className="text-muted">
          <Link href={`/clients/${property.clientId}`} className="text-green-dark">
            {clientName(property.client)}
          </Link>
          {property.county ? ` · ${property.county} County` : ""}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Access</h2>
          <p className="mt-2 text-sm">{property.accessNotes ?? "No access notes."}</p>
          <p className="mt-2 text-sm text-muted">Pets: {property.petsOnSite ?? "none noted"}</p>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Entry points</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {property.entryPoints.map((point) => (
              <li key={point.id}>
                {point.label} · {point.area} <StatusPill value={point.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Traps on this site</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {property.traps.map((trap) => (
              <li key={trap.id}>
                {trap.serialNumber} · {trap.locationNote} <StatusPill value={trap.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Jobs</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {property.jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.id}`} className="text-green-dark">
                  {job.number} · {job.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
