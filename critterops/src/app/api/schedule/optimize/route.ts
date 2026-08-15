import { NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { optimizeRoute, type GeoPoint } from "@/lib/routing";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { technicianId?: string; date?: string };
  const technicianId = body.technicianId;
  if (!technicianId) {
    return NextResponse.json({ error: "technicianId is required" }, { status: 400 });
  }

  const tech = await prisma.user.findUnique({ where: { id: technicianId } });
  if (!tech || tech.homeLat == null || tech.homeLng == null) {
    return NextResponse.json({ error: "Technician needs a home/shop location." }, { status: 400 });
  }

  const day = body.date ? new Date(body.date) : new Date();
  const start = startOfDay(day);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const visits = await prisma.visit.findMany({
    where: {
      technicianId,
      startsAt: { gte: start, lt: end },
      status: { not: "canceled" },
    },
    include: { property: true },
    orderBy: { startsAt: "asc" },
  });

  const stops: GeoPoint[] = visits
    .filter((visit) => visit.property.lat != null && visit.property.lng != null)
    .map((visit) => ({
      id: visit.id,
      lat: visit.property.lat as number,
      lng: visit.property.lng as number,
    }));

  const result = optimizeRoute(
    { id: "shop", lat: tech.homeLat, lng: tech.homeLng },
    stops
  );

  const visitIds = result.ordered.filter((point) => point.id !== "shop").map((point) => point.id);
  let cursor = new Date(start);
  cursor.setHours(8, 0, 0, 0);

  for (const visitId of visitIds) {
    const visit = visits.find((row) => row.id === visitId);
    if (!visit) continue;
    const duration = visit.endsAt.getTime() - visit.startsAt.getTime();
    const startsAt = new Date(cursor);
    const endsAt = new Date(startsAt.getTime() + duration);
    await prisma.visit.update({
      where: { id: visitId },
      data: { startsAt, endsAt },
    });
    cursor = new Date(endsAt.getTime() + 20 * 60 * 1000);
  }

  await prisma.routePlan.deleteMany({
    where: { technicianId, date: start },
  });
  const plan = await prisma.routePlan.create({
    data: {
      organizationId: session.organizationId,
      technicianId,
      date: start,
      totalMiles: result.totalMiles,
      stops: {
        create: visitIds.map((visitId, index) => ({
          visitId,
          stopOrder: index + 1,
          milesFromPrev: result.legs[index] ?? 0,
        })),
      },
    },
    include: { stops: true },
  });

  return NextResponse.json({
    totalMiles: Number(result.totalMiles.toFixed(1)),
    orderedVisitIds: visitIds,
    plan,
  });
}
