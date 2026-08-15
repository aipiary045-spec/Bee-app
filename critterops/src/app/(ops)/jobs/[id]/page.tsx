import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusPill } from "@/components/status-pill";
import { clientName, formatDateTime, propertyLine } from "@/lib/utils";
import { InvoiceJobButton } from "@/components/invoice-job-button";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      property: true,
      visits: { include: { technician: true }, orderBy: { startsAt: "asc" } },
      traps: true,
      captures: true,
      entryPoints: true,
      notes: true,
      invoices: true,
    },
  });
  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">
            {job.number}
          </p>
          <h1 className="text-3xl font-semibold">{job.title}</h1>
          <p className="text-muted">
            <Link href={`/clients/${job.clientId}`} className="text-green-dark">
              {clientName(job.client)}
            </Link>
            {" · "}
            {propertyLine(job.property)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill value={job.status} />
          <InvoiceJobButton jobId={job.id} />
        </div>
      </div>
      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Complaint</h2>
        <p className="mt-2">{job.complaint}</p>
        <p className="mt-2 text-sm text-muted">
          Species: {job.targetSpecies ?? "TBD"} · Type: {job.type}
        </p>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Visits</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {job.visits.map((visit) => (
              <li key={visit.id}>
                {formatDateTime(visit.startsAt)} · {visit.title} · {visit.technician?.name ?? "Unassigned"}{" "}
                <StatusPill value={visit.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Traps & captures</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {job.traps.map((trap) => (
              <li key={trap.id}>
                {trap.serialNumber} · {trap.locationNote} <StatusPill value={trap.status} />
              </li>
            ))}
            {job.captures.map((capture) => (
              <li key={capture.id}>
                {capture.count} {capture.species} · {capture.disposition}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
