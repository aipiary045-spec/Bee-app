"use client";

import { Hexagon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiveStatusPicker } from "@/components/hives/hive-status-picker";
import { HiveNameEditor } from "@/components/hives/hive-name-editor";
import { HiveNotesEditor } from "@/components/hives/hive-notes-editor";
import type { Enums } from "@/types/database";

interface ColonyCardProps {
  hiveId: string;
  name: string;
  status: Enums<"hive_status">;
  notes: string | null;
}

export function ColonyCard({ hiveId, name, status, notes }: ColonyCardProps) {
  return (
    <Card className="fade-up-delay-1 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hexagon className="h-4 w-4 text-honey-700" />
          Colony
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <HiveStatusPicker hiveId={hiveId} status={status} />
        <HiveNameEditor hiveId={hiveId} name={name} embedded />
        <HiveNotesEditor hiveId={hiveId} notes={notes} embedded />
      </CardContent>
    </Card>
  );
}
