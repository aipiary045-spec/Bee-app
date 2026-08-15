import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { StatusPill } from "@/components/status-pill";
import { clientName, propertyLine } from "@/lib/utils";
import { ApproveQuoteButton } from "@/components/approve-quote-button";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, property: true, lines: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quote) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">
            {quote.number}
          </p>
          <h1 className="text-3xl font-semibold">{quote.title}</h1>
          <p className="text-muted">
            {clientName(quote.client)} · {propertyLine(quote.property)}
          </p>
        </div>
        <StatusPill value={quote.status} />
      </div>
      <section className="rounded-2xl border border-line bg-card p-6">
        <p className="mb-4 text-sm">{quote.message}</p>
        <table className="w-full text-sm">
          <tbody>
            {quote.lines.map((line) => (
              <tr key={line.id} className="border-t border-line">
                <td className="py-2">
                  {line.name}
                  <p className="text-muted">{line.description}</p>
                </td>
                <td className="py-2 text-right">
                  {line.quantity} × {formatMoney(line.unitCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 text-right text-sm">
          <p>Subtotal {formatMoney(quote.subtotalCents)}</p>
          <p>Tax {formatMoney(quote.taxCents)}</p>
          <p className="text-lg font-semibold">Total {formatMoney(quote.totalCents)}</p>
        </div>
        {quote.status !== "approved" ? <ApproveQuoteButton quoteId={quote.id} /> : null}
      </section>
    </div>
  );
}
