import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { HiveQrCard } from "@/components/hives/hive-qr-card";
import { Button } from "@/components/ui/button";
import { getHiveById } from "@/lib/hives";

interface HiveQrPageProps {
  params: Promise<{ id: string }>;
}

export default async function HiveQrPage({ params }: HiveQrPageProps) {
  const { id } = await params;
  let hive;
  try {
    hive = await getHiveById(id);
  } catch {
    hive = null;
  }

  if (!hive) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-3 -ml-2" asChild>
        <Link href={`/hives/${hive.id}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to {hive.name}
        </Link>
      </Button>

      <PageHeader
        eyebrow={hive.name}
        title="Hive tag"
        description="Print this and stick it on the box. Scan it to open Quick Log."
      />

      <HiveQrCard hiveId={hive.id} hiveName={hive.name} />
    </div>
  );
}
