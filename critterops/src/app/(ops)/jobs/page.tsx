import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusPill } from "@/components/status-pill";
import { clientName } from "@/lib/utils";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    include: { client: true, property: true, visits: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Work</p>
        <h1 className="text-3xl font-semibold">Jobs</h1>
      </div>
      <div className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block rounded-2xl border border-line bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">{job.number}</p>
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p className="text-sm text-muted">
                  {clientName(job.client)} · {job.property.city} · {job.visits.length} visits
                </p>
              </div>
              <StatusPill value={job.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
