import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { StatusPill } from "@/components/status-pill";
import { clientName } from "@/lib/utils";

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    include: { client: true, property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Win work</p>
        <h1 className="text-3xl font-semibold">Quotes</h1>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Quote</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/quotes/${quote.id}`} className="font-medium text-green-dark">
                    {quote.number}
                  </Link>
                  <p className="text-muted">{quote.title}</p>
                </td>
                <td className="px-4 py-3">{clientName(quote.client)}</td>
                <td className="px-4 py-3">{formatMoney(quote.totalCents)}</td>
                <td className="px-4 py-3">
                  <StatusPill value={quote.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
