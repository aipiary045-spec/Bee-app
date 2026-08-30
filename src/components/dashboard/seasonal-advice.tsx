import { Sprout } from "lucide-react";
import { getSeasonalForagingAdvice } from "@/lib/utils";

interface SeasonalAdviceProps {
  month?: number;
}

export function SeasonalAdvice({ month = new Date().getMonth() }: SeasonalAdviceProps) {
  const advice = getSeasonalForagingAdvice(month);

  return (
    <p className="fade-up-delay-1 mb-4 flex items-start gap-2 text-sm leading-relaxed text-hive-700">
      <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-meadow-800" />
      <span>{advice}</span>
    </p>
  );
}
