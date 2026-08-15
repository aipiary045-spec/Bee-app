import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { trapNeedsCheck } from "@/lib/traps";
import { StatusPill } from "@/components/status-pill";
import { formatDateTime } from "@/lib/utils";

export default async function HomePage() {
  const [visits, traps, invoices, requests, quotes] = await Promise.all([
    prisma.visit.findMany({
      where: { status: { in: ["scheduled", "en_route", "on_site"] } },
      include: { property: { include: { client: true } }, technician: true, job: true },
      orderBy: { startsAt: "asc" },
      take: 8,
    }),
    prisma.trap.findMany({ include: { property: true } }),
    prisma.invoice.findMany({
      where: { status: { in: ["sent", "partial", "overdue"] } },
      include: { client: true },
    }),
    prisma.workRequest.findMany({
      where: { status: { in: ["new", "assessing"] } },
      include: { client: true, property: true },
    }),
    prisma.quote.findMany({
      where: { status: "sent" },
      include: { client: true },
    }),
  ]);

  const dueTraps = traps.filter((trap) => trapNeedsCheck(trap.status, trap.lastCheckedAt));
  const openBalance = invoices.reduce((sum, invoice) => sum + invoice.balanceCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Today</p>
        <h1 className="text-3xl font-semibold">Action center</h1>
        <p className="text-muted">Same Jobber flow: requests → quotes → jobs → invoices, plus traps and NWCO logs.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Visits on deck" value={String(visits.length)} href="/schedule" />
        <Stat label="Traps past 24h" value={String(dueTraps.length)} href="/traps" />
        <Stat label="Open invoices" value={formatMoney(openBalance)} href="/invoices" />
        <Stat label="New requests" value={String(requests.length)} href="/requests" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Upcoming visits" href="/schedule">
          {visits.map((visit) => (
            <Row
              key={visit.id}
              title={visit.title}
              meta={`${visit.property.client.firstName} ${visit.property.client.lastName} · ${formatDateTime(visit.startsAt)}`}
              right={<StatusPill value={visit.status} />}
            />
          ))}
        </Card>
        <Card title="Traps that need a check" href="/traps">
          {dueTraps.length === 0 ? (
            <p className="text-sm text-muted">All deployed traps were checked in the last 24 hours.</p>
          ) : (
            dueTraps.map((trap) => (
              <Row
                key={trap.id}
                title={`${trap.serialNumber} · ${trap.locationNote ?? trap.type}`}
                meta={trap.property ? `${trap.property.city}, ${trap.property.state}` : "Unassigned"}
                right={<StatusPill value="needs_check" />}
              />
            ))
          )}
        </Card>
        <Card title="Quotes waiting on the customer" href="/quotes">
          {quotes.map((quote) => (
            <Row
              key={quote.id}
              title={quote.number}
              meta={`${quote.client.firstName} ${quote.client.lastName} · ${quote.title}`}
              right={formatMoney(quote.totalCents)}
            />
          ))}
        </Card>
        <Card title="Requests to convert" href="/requests">
          {requests.map((request) => (
            <Row
              key={request.id}
              title={request.number}
              meta={`${request.client.firstName} ${request.client.lastName} · ${request.targetSpecies ?? "species TBD"}`}
              right={<StatusPill value={request.status} />}
            />
          ))}
        </Card>
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Link>
  );
}

function Card({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-sm font-medium text-green-dark">
          Open
        </Link>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({
  title,
  meta,
  right,
}: {
  title: string;
  meta: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/70 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted">{meta}</p>
      </div>
      <div className="text-sm font-medium">{right}</div>
    </div>
  );
}
