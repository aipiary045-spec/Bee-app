"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Crown,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { createInspectionAction } from "@/app/(app)/inspect/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Hive } from "@/lib/hives";
import type { Enums } from "@/types/database";

const broodOptions: Enums<"brood_pattern">[] = [
  "excellent",
  "good",
  "fair",
  "spotty",
  "poor",
  "none",
];

const temperamentOptions: Enums<"temperament">[] = [
  "calm",
  "moderate",
  "defensive",
  "aggressive",
];

const queenStatuses: Enums<"queen_status">[] = [
  "laying",
  "marked",
  "virgin",
  "cell_check",
  "replaced",
];

const markColors: Enums<"queen_mark_color">[] = [
  "unmarked",
  "white",
  "yellow",
  "red",
  "green",
  "blue",
];

const miteMethods: { value: Enums<"mite_method">; label: string }[] = [
  { value: "alcohol_wash", label: "Alcohol wash" },
  { value: "sugar_roll", label: "Sugar roll" },
  { value: "sticky_board", label: "Sticky board" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function labelize(value: string) {
  return value.replace(/_/g, " ");
}

interface QuickLogFormProps {
  hives: Pick<Hive, "id" | "name" | "status">[];
  initialHiveId?: string;
}

export function QuickLogForm({ hives, initialHiveId }: QuickLogFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeHives = useMemo(
    () => hives.filter((h) => h.status === "active"),
    [hives]
  );
  const selectable = activeHives.length > 0 ? activeHives : hives;

  const [hiveId, setHiveId] = useState(
    initialHiveId && selectable.some((h) => h.id === initialHiveId)
      ? initialHiveId
      : (selectable[0]?.id ?? "")
  );
  const [date, setDate] = useState(todayISO());
  const [queenSpotted, setQueenSpotted] = useState(false);
  const [broodPattern, setBroodPattern] = useState<Enums<"brood_pattern"> | "">(
    "good"
  );
  const [temperament, setTemperament] = useState<Enums<"temperament"> | "">(
    "moderate"
  );
  const [notes, setNotes] = useState("");

  const [logQueen, setLogQueen] = useState(false);
  const [queenStatus, setQueenStatus] = useState<Enums<"queen_status"> | "">(
    "laying"
  );
  const [markColor, setMarkColor] = useState<Enums<"queen_mark_color"> | "">(
    "unmarked"
  );

  const [logMites, setLogMites] = useState(true);
  const [miteMethod, setMiteMethod] = useState<Enums<"mite_method"> | "">(
    "alcohol_wash"
  );
  const [miteCount, setMiteCount] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createInspectionAction({
        hiveId,
        date,
        queenSpotted,
        broodPattern,
        temperament,
        notes,
        logQueen,
        queenStatus,
        markColor,
        logMites,
        miteMethod,
        miteCount,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess("Inspection saved.");
      setNotes("");
      setMiteCount("");
      setQueenSpotted(false);
      router.refresh();
    });
  }

  if (selectable.length === 0) {
    return (
      <Card className="border-dashed border-honey-400/40 bg-honey-50/50">
        <CardContent className="py-10 text-center">
          <p className="font-display text-lg font-semibold text-hive-900">
            No hives to inspect
          </p>
          <p className="mt-2 text-sm text-hive-600">
            Add a hive first, then come back to Quick Log.
          </p>
          <Button className="mt-4" onClick={() => router.push("/hives")}>
            Go to Hives
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-honey-700" />
            Hive & date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Hive</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {selectable.map((hive) => (
                <button
                  key={hive.id}
                  type="button"
                  onClick={() => setHiveId(hive.id)}
                  className={cn(
                    "min-h-12 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                    hiveId === hive.id
                      ? "border-honey-500 bg-honey-500/15 text-hive-900 ring-1 ring-honey-400/40"
                      : "border-wax-300/70 bg-wax-50 text-hive-700 hover:border-honey-400/50"
                  )}
                >
                  {hive.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspection-date">Date</Label>
            <Input
              id="inspection-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-12"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-honey-700" />
            Colony condition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => setQueenSpotted((v) => !v)}
            className={cn(
              "flex min-h-14 w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
              queenSpotted
                ? "border-meadow-400/50 bg-meadow-100 text-meadow-800"
                : "border-wax-300/70 bg-wax-50 text-hive-700"
            )}
          >
            <span className="font-medium">Queen spotted</span>
            <span className="text-sm">{queenSpotted ? "Yes" : "No"}</span>
          </button>

          <div className="space-y-2">
            <Label htmlFor="brood">Brood pattern</Label>
            <select
              id="brood"
              value={broodPattern}
              onChange={(e) =>
                setBroodPattern(e.target.value as Enums<"brood_pattern"> | "")
              }
              className="flex min-h-12 w-full rounded-lg border border-wax-300/80 bg-wax-50/90 px-3 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
            >
              {broodOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {labelize(opt)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperament">Temperament</Label>
            <select
              id="temperament"
              value={temperament}
              onChange={(e) =>
                setTemperament(e.target.value as Enums<"temperament"> | "")
              }
              className="flex min-h-12 w-full rounded-lg border border-wax-300/80 bg-wax-50/90 px-3 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
            >
              {temperamentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {labelize(opt)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Stores, supers, swarm cells, weather…"
              className="w-full rounded-lg border border-wax-300/80 bg-wax-50/90 px-3 py-3 text-sm text-hive-900 shadow-sm placeholder:text-hive-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-honey-700" />
            Queen log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => setLogQueen((v) => !v)}
            className={cn(
              "flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left",
              logQueen
                ? "border-honey-400/50 bg-honey-50 text-hive-900"
                : "border-wax-300/70 bg-wax-50 text-hive-700"
            )}
          >
            <span className="font-medium">Add queen status entry</span>
            <span className="text-sm">{logQueen ? "On" : "Off"}</span>
          </button>

          {logQueen && (
            <>
              <div className="space-y-2">
                <Label htmlFor="queen-status">Status</Label>
                <select
                  id="queen-status"
                  value={queenStatus}
                  onChange={(e) =>
                    setQueenStatus(e.target.value as Enums<"queen_status"> | "")
                  }
                  className="flex min-h-12 w-full rounded-lg border border-wax-300/80 bg-wax-50/90 px-3 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
                >
                  {queenStatuses.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelize(opt)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mark-color">Mark color</Label>
                <select
                  id="mark-color"
                  value={markColor}
                  onChange={(e) =>
                    setMarkColor(
                      e.target.value as Enums<"queen_mark_color"> | ""
                    )
                  }
                  className="flex min-h-12 w-full rounded-lg border border-wax-300/80 bg-wax-50/90 px-3 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
                >
                  {markColors.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelize(opt)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-honey-700" />
            Mite count
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => setLogMites((v) => !v)}
            className={cn(
              "flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left",
              logMites
                ? "border-honey-400/50 bg-honey-50 text-hive-900"
                : "border-wax-300/70 bg-wax-50 text-hive-700"
            )}
          >
            <span className="font-medium">Record mite test</span>
            <span className="text-sm">{logMites ? "On" : "Off"}</span>
          </button>

          {logMites && (
            <>
              <div className="space-y-2">
                <Label>Method</Label>
                <div className="grid gap-2">
                  {miteMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setMiteMethod(method.value)}
                      className={cn(
                        "min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-medium",
                        miteMethod === method.value
                          ? "border-honey-500 bg-honey-500/15 text-hive-900"
                          : "border-wax-300/70 bg-wax-50 text-hive-700"
                      )}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mite-count">
                  Count{" "}
                  <span className="font-normal text-hive-500">
                    ({miteMethod === "sticky_board" ? "mites" : "% / mites per 300"})
                  </span>
                </Label>
                <Input
                  id="mite-count"
                  type="number"
                  min={0}
                  step="0.1"
                  required={logMites}
                  value={miteCount}
                  onChange={(e) => setMiteCount(e.target.value)}
                  placeholder={miteMethod === "sticky_board" ? "e.g. 12" : "e.g. 2.5"}
                  className="min-h-12"
                />
                <p className="text-xs text-hive-500">
                  Threshold auto-flags at 3% (wash/roll) or 50 (sticky board).
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-xl border border-crimson-300/40 bg-crimson-50 px-4 py-3 text-sm text-crimson-800">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-xl border border-meadow-400/30 bg-meadow-100 px-4 py-3 text-sm text-meadow-800">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </p>
      )}

      <Button type="submit" size="lg" className="min-h-14 w-full text-base" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save inspection
      </Button>
    </form>
  );
}
