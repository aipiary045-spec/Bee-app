import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { nextNumber } from "@/lib/numbers";
import { sumLines, taxOn } from "@/lib/money";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { quote: { include: { lines: true } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const invoices = await prisma.invoice.findMany({ select: { number: true } });
  const lines = job.quote?.lines.length
    ? job.quote.lines
    : [{ name: job.title, quantity: 1, unitCents: 18500, description: job.complaint }];
  const subtotal = sumLines(lines);
  const tax = taxOn(subtotal);
  const total = subtotal + tax;

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: job.organizationId,
      clientId: job.clientId,
      propertyId: job.propertyId,
      jobId: job.id,
      number: nextNumber("INV", invoices.map((row) => row.number)),
      status: "sent",
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subtotalCents: subtotal,
      taxCents: tax,
      totalCents: total,
      balanceCents: total,
      lines: {
        create: lines.map((line, index) => ({
          name: line.name,
          description: "description" in line ? line.description : null,
          quantity: line.quantity,
          unitCents: line.unitCents,
          sortOrder: index,
        })),
      },
    },
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "completed" },
  });

  return NextResponse.json(invoice);
}
