import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { StatusPill } from "@/components/status-pill";
import { clientName } from "@/lib/utils";
import { RecordPaymentButton } from "@/components/record-payment-button";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      lines: { orderBy: { sortOrder: "asc" } },
      payments: true,
    },
  });
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">
            {invoice.number}
          </p>
          <h1 className="text-3xl font-semibold">{clientName(invoice.client)}</h1>
        </div>
        <StatusPill value={invoice.status} />
      </div>
      <section className="rounded-2xl border border-line bg-card p-6">
        {invoice.lines.map((line) => (
          <div key={line.id} className="flex justify-between border-t border-line py-2 text-sm first:border-0">
            <span>{line.name}</span>
            <span>
              {line.quantity} × {formatMoney(line.unitCents)}
            </span>
          </div>
        ))}
        <div className="mt-4 text-right">
          <p>Total {formatMoney(invoice.totalCents)}</p>
          <p className="text-lg font-semibold">Balance {formatMoney(invoice.balanceCents)}</p>
        </div>
        {invoice.balanceCents > 0 ? (
          <RecordPaymentButton invoiceId={invoice.id} amountCents={invoice.balanceCents} />
        ) : null}
      </section>
    </div>
  );
}
