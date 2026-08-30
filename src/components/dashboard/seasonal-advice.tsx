import { Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeasonalForagingAdvice } from "@/lib/utils";

interface SeasonalAdviceProps {
  month?: number;
}

export function SeasonalAdvice({ month = new Date().getMonth() }: SeasonalAdviceProps) {
  const advice = getSeasonalForagingAdvice(month);

  return (
    <Card className="fade-up-delay-1 mb-6 border-honey-400/25 bg-gradient-to-br from-honey-50/70 to-wax-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sprout className="h-4 w-4 text-meadow-800" />
          Seasonal note
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-hive-700">{advice}</p>
      </CardContent>
    </Card>
  );
}
