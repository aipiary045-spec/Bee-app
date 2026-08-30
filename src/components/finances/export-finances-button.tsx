"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  financesCsvFilename,
  financesToCsv,
} from "@/lib/finances-export";
import type { FinanceActivity } from "@/lib/finances";

interface ExportFinancesButtonProps {
  activity: FinanceActivity[];
}

export function ExportFinancesButton({ activity }: ExportFinancesButtonProps) {
  function handleExport() {
    const csv = financesToCsv(activity);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = financesCsvFilename();
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={activity.length === 0}
    >
      <Download className="h-4 w-4" />
      <span className="sm:hidden">Export</span>
      <span className="hidden sm:inline">Export CSV</span>
    </Button>
  );
}
