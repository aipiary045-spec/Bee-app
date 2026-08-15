import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { StatusPill } from "@/components/status-pill";
import { clientName } from "@/lib/utils";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Billing</p>
        <h1 className="text-3xl font-semibold">Invoices</h1>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-green-dark">
                    {invoice.number}
                  </Link>
                </td>
                <td className="px-4 py-3">{clientName(invoice.client)}</td>
                <td className="px-4 py-3">{formatMoney(invoice.balanceCents)}</td>
                <td className="px-4 py-3">
                  <StatusPill value={invoice.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
