import Link from "next/link";
import { ArrowLeft, Crown, Hexagon, LineChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HiveDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HiveDetailPage({ params }: HiveDetailPageProps) {
  const { id } = await params;
  const displayName = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const tabs = [
    { label: "Inspections", icon: Hexagon },
    { label: "Health Trends", icon: LineChart },
    { label: "Honey Yields", icon: Crown },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/hives">
          <ArrowLeft className="h-4 w-4" />
          All Hives
        </Link>
      </Button>

      <PageHeader
        eyebrow="Colony Detail"
        title={displayName}
        description="Inspection history, varroa trends, honey production, and hive-specific expenses — coming once Supabase is connected."
      />

      <div className="fade-up-delay-1 mb-8 flex flex-wrap gap-2">
        <Badge variant="success">Active</Badge>
        <Badge variant="default">10 frames</Badge>
        <Badge variant="warning">Preview data</Badge>
      </div>

      <div className="fade-up-delay-2 grid gap-4 sm:grid-cols-3">
        {tabs.map(({ label, icon: Icon }) => (
          <Card key={label} className="opacity-80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-4 w-4 text-honey-700" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-hive-500">
                Charts and logs will appear here after database connection.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
