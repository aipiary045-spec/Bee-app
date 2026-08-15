import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json()) as { type?: string; notes?: string; status?: string };
  const type = body.type ?? "check";

  await prisma.trapEvent.create({
    data: {
      trapId: id,
      userId: session.userId,
      type,
      notes: body.notes,
    },
  });

  const status =
    body.status ??
    (type === "catch" ? "captured" : type === "pull" ? "pulled" : "deployed");

  const trap = await prisma.trap.update({
    where: { id },
    data: {
      status,
      lastCheckedAt: new Date(),
    },
  });

  return NextResponse.json(trap);
}
