import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BrandMark } from "@/components/brand-mark";
import { formatMoney } from "@/lib/money";
import { StatusPill } from "@/components/status-pill";
import { ApproveQuoteButton } from "@/components/approve-quote-button";
import { RecordPaymentButton } from "@/components/record-payment-button";
import { clientName, formatDateTime } from "@/lib/utils";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    include: {
      quotes: { include: { lines: true, property: true } },
      invoices: { include: { lines: true } },
      jobs: { include: { visits: true, property: true } },
    },
  });
  if (!client) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <BrandMark size={48} />
        <div>
          <p className="font-semibold">The Wildlife Pros</p>
          <p className="text-sm text-muted">Client Hub for {clientName(client)}</p>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-xl font-semibold">Upcoming visits</h2>
        {client.jobs.flatMap((job) =>
          job.visits
            .filter((visit) => visit.status !== "canceled")
            .map((visit) => (
              <p key={visit.id} className="mt-2 text-sm">
                {formatDateTime(visit.startsAt)} · {visit.title} · {job.property.city}
              </p>
            ))
        )}
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Quotes</h2>
        {client.quotes.map((quote) => (
          <article key={quote.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{quote.title}</p>
                <p className="text-sm text-muted">{formatMoney(quote.totalCents)}</p>
              </div>
              <StatusPill value={quote.status} />
            </div>
            {quote.status !== "approved" ? (
              <ApproveQuoteButton quoteId={quote.id} portalToken={token} />
            ) : (
              <p className="mt-3 text-sm text-green-dark">Approved. We will schedule the work.</p>
            )}
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Invoices</h2>
        {client.invoices.map((invoice) => (
          <article key={invoice.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{invoice.number}</p>
                <p className="text-sm text-muted">Balance {formatMoney(invoice.balanceCents)}</p>
              </div>
              <StatusPill value={invoice.status} />
            </div>
            {invoice.balanceCents > 0 ? (
              <RecordPaymentButton
                invoiceId={invoice.id}
                amountCents={invoice.balanceCents}
                portalToken={token}
              />
            ) : (
              <p className="mt-3 text-sm text-green-dark">Paid. Thank you.</p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
