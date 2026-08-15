import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { invoiceBalance, invoiceStatus } from "@/lib/money";
import { getSession } from "@/lib/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await context.params;
  const body = (await request.json()) as {
    amountCents?: number;
    method?: string;
    portalToken?: string;
  };

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, payments: true },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (!session && body.portalToken !== invoice.client.portalToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const amountCents = Number(body.amountCents ?? 0);
  if (amountCents <= 0) {
    return NextResponse.json({ error: "Payment must be greater than zero." }, { status: 400 });
  }

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amountCents,
      method: body.method ?? "card",
      note: session ? "Recorded in office" : "Paid in Client Hub",
    },
  });

  const paid = invoice.payments.reduce((sum, row) => sum + row.amountCents, 0) + amountCents;
  const balance = invoiceBalance(invoice.totalCents, paid);
  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      balanceCents: balance,
      status: invoiceStatus(balance, invoice.totalCents, invoice.dueAt),
    },
  });

  return NextResponse.json(updated);
}
