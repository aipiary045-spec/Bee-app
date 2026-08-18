import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { YardLede } from "@/components/yards/yard-lede";
import { EditInspectionForm } from "@/components/inspect/edit-inspection-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getInspectionById, listHivesForUser } from "@/lib/hives";
import { formatDate } from "@/lib/utils";

interface LogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LogDetailPage({ params }: LogDetailPageProps) {
  const { id } = await params;
  let record;
  try {
    record = await getInspectionById(id);
  } catch {
    record = null;
  }

  if (!record) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hives: { id: string; name: string }[] = [];
  if (user) {
    try {
      const result = await listHivesForUser(user.id);
      hives = result.hives.map((hive) => ({ id: hive.id, name: hive.name }));
    } catch {
      hives = [{ id: record.hive.id, name: record.hive.name }];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-3 -ml-2" asChild>
        <Link href="/logs">
          <ArrowLeft className="h-4 w-4" />
          All logs
        </Link>
      </Button>

      <PageHeader
        eyebrow={<YardLede />}
        title={record.hive.name}
        description={`${formatDate(record.inspection.date)} visit. Change anything that was logged, or remove the visit.`}
      />

      <EditInspectionForm
        inspection={record.inspection}
        hiveName={record.hive.name}
        hives={hives}
      />
    </div>
  );
}
