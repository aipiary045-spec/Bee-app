import Image from "next/image";
import { prisma } from "@/lib/db";
import { StatusPill } from "@/components/status-pill";

export default async function PhotosPage() {
  const photos = await prisma.photo.findMany({
    include: { property: { include: { client: true } }, entryPoint: true },
    orderBy: { takenAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">Documentation</p>
        <h1 className="text-3xl font-semibold">Before / after photos</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-2xl border border-line bg-card">
            <Image
              src={photo.url}
              alt={photo.caption ?? photo.kind}
              width={640}
              height={400}
              className="h-40 w-full object-cover"
            />
            <figcaption className="space-y-1 p-4">
              <StatusPill value={photo.kind} />
              <p className="font-medium">{photo.caption}</p>
              <p className="text-sm text-muted">
                {photo.property.client.firstName} {photo.property.client.lastName}
                {photo.entryPoint ? ` · ${photo.entryPoint.label}` : ""}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
