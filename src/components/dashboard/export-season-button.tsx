"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seasonCsvFilename, seasonToCsv } from "@/lib/season-export";
import type { SeasonMetricDelta } from "@/lib/season-compare";
import type { SeasonSnapshot } from "@/lib/season-snapshot";

interface ExportSeasonButtonProps {
  snapshot: SeasonSnapshot;
  comparison: SeasonMetricDelta[];
}

export function ExportSeasonButton({
  snapshot,
  comparison,
}: ExportSeasonButtonProps) {
  function handleExport() {
    const csv = seasonToCsv(snapshot, comparison);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = seasonCsvFilename(snapshot.year);
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4" />
      Export season
    </Button>
  );
}
