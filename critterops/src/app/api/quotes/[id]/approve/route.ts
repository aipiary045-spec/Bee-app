import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nextNumber } from "@/lib/numbers";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { portalToken?: string };
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, lines: true },
  });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (body.portalToken && body.portalToken !== quote.client.portalToken) {
    return NextResponse.json({ error: "Portal token does not match." }, { status: 403 });
  }

  const jobs = await prisma.job.findMany({ select: { number: true } });
  const job = await prisma.job.create({
    data: {
      organizationId: quote.organizationId,
      clientId: quote.clientId,
      propertyId: quote.propertyId,
      requestId: quote.requestId,
      quoteId: quote.id,
      number: nextNumber("JOB", jobs.map((row) => row.number)),
      title: quote.title,
      type: "inspection",
      status: "scheduled",
      complaint: quote.message ?? quote.title,
    },
  });

  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "approved", approvedAt: new Date() },
  });

  return NextResponse.json({ quoteId: quote.id, jobId: job.id });
}
