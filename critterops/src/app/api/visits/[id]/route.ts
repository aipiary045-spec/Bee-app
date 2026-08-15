import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json()) as {
    startsAt?: string;
    endsAt?: string;
    technicianId?: string | null;
    status?: string;
  };

  const visit = await prisma.visit.update({
    where: { id },
    data: {
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      technicianId: body.technicianId === undefined ? undefined : body.technicianId,
      status: body.status,
    },
  });

  return NextResponse.json(visit);
}
