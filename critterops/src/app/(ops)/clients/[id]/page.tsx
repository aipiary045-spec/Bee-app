import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { clientName, propertyLine } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";
import { formatMoney } from "@/lib/money";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      properties: true,
      jobs: true,
      quotes: true,
      invoices: true,
    },
  });
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Client</p>
        <h1 className="text-3xl font-semibold">{clientName(client)}</h1>
        <p className="text-muted">
          {client.phone} · {client.email}
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {client.properties.map((property) => (
          <Link
            key={property.id}
            href={`/properties/${property.id}`}
            className="rounded-2xl border border-line bg-card p-5"
          >
            <p className="text-xs uppercase tracking-wide text-muted">{property.label}</p>
            <p className="mt-1 font-semibold">{propertyLine(property)}</p>
            <p className="mt-2 text-sm text-muted">{property.accessNotes}</p>
          </Link>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <Column title="Jobs">
          {client.jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block py-2">
              {job.number} · {job.title} <StatusPill value={job.status} />
            </Link>
          ))}
        </Column>
        <Column title="Quotes">
          {client.quotes.map((quote) => (
            <Link key={quote.id} href={`/quotes/${quote.id}`} className="block py-2">
              {quote.number} · {formatMoney(quote.totalCents)} <StatusPill value={quote.status} />
            </Link>
          ))}
        </Column>
        <Column title="Invoices">
          {client.invoices.map((invoice) => (
            <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="block py-2">
              {invoice.number} · {formatMoney(invoice.balanceCents)} due{" "}
              <StatusPill value={invoice.status} />
            </Link>
          ))}
        </Column>
      </section>
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}
