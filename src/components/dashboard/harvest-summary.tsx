"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Loader2, Target } from "lucide-react";
import { updateHarvestGoalAction } from "@/app/(app)/hives/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HarvestSummaryData = {
  totalLbs: number;
  pullCount: number;
  hiveCount: number;
  topHive?: { id: string; name: string; lbs: number };
};

interface HarvestSummaryProps {
  summary: HarvestSummaryData;
  goalLbs: number | null;
  apiaryId: string;
  compact?: boolean;
}

export function HarvestSummary({
  summary,
  goalLbs,
  apiaryId,
  compact = false,
}: HarvestSummaryProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(
    goalLbs != null ? String(goalLbs) : ""
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const progress =
    goalLbs != null && goalLbs > 0
      ? Math.min(100, Math.round((summary.totalLbs / goalLbs) * 100))
      : null;

  function onSaveGoal() {
    setError(null);
    startTransition(async () => {
      const result = await updateHarvestGoalAction({
        apiaryId,
        goalLbs: goalInput,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  const goalBlock = (
    <div className="rounded-xl border border-wax-300/50 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-honey-700" />
          <p className="text-sm font-medium text-hive-900">Season goal</p>
        </div>
        {!editing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setGoalInput(goalLbs != null ? String(goalLbs) : "");
              setEditing(true);
            }}
          >
            {goalLbs != null ? "Edit goal" : "Set goal"}
          </Button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[8rem] flex-1">
            <Label htmlFor="harvest-goal" className="text-xs text-hive-500">
              Target lbs this year
            </Label>
            <Input
              id="harvest-goal"
              type="number"
              min="0"
              step="1"
              value={goalInput}
              onChange={(event) => setGoalInput(event.target.value)}
              placeholder="200"
            />
          </div>
          <Button type="button" size="sm" onClick={onSaveGoal} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
            disabled={pending}
          >
            Cancel
          </Button>
        </div>
      ) : goalLbs != null && goalLbs > 0 ? (
        <div className="mt-3">
          <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
            <span className="text-hive-600">
              {summary.totalLbs} / {goalLbs} lbs
            </span>
            <span className="font-semibold text-hive-800">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-wax-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-honey-500 to-meadow-600 transition-all"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-hive-500">
          Set a season target to track progress toward your harvest goal.
        </p>
      )}

      {summary.topHive ? (
        <p className="mt-2 text-xs text-hive-600">
          Top hive{" "}
          <Link
            href={`/hives/${summary.topHive.id}#harvest`}
            className="font-semibold text-honey-700 hover:text-honey-600"
          >
            {summary.topHive.name} · {summary.topHive.lbs} lbs →
          </Link>
        </p>
      ) : null}

      {error && <p className="mt-2 text-xs text-crimson-600">{error}</p>}
    </div>
  );

  if (compact) {
    return goalBlock;
  }

  return (
    <Card className="fade-up-delay-2 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-meadow-800" />
          Harvest this season
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.pullCount === 0 ? (
          <p className="text-sm text-hive-500">
            No honey pulls logged yet this year.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-wax-300/50 bg-white px-4 py-3">
              <p className="text-xs text-hive-500">Total pulled</p>
              <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                {summary.totalLbs} lbs
              </p>
            </div>
            <div className="rounded-xl border border-wax-300/50 bg-white px-4 py-3">
              <p className="text-xs text-hive-500">Pulls logged</p>
              <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                {summary.pullCount}
              </p>
              <p className="mt-1 text-xs text-hive-500">
                across {summary.hiveCount} hive
                {summary.hiveCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-xl border border-wax-300/50 bg-white px-4 py-3">
              <p className="text-xs text-hive-500">Top hive</p>
              {summary.topHive ? (
                <>
                  <p className="font-display mt-1 text-2xl font-semibold text-hive-900">
                    {summary.topHive.lbs} lbs
                  </p>
                  <Link
                    href={`/hives/${summary.topHive.id}#harvest`}
                    className="mt-1 inline-block text-xs font-semibold text-honey-700 hover:text-honey-600"
                  >
                    {summary.topHive.name} →
                  </Link>
                </>
              ) : (
                <p className="mt-1 text-sm text-hive-500">—</p>
              )}
            </div>
          </div>
        )}
        {goalBlock}
      </CardContent>
    </Card>
  );
}
