"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Crown,
  HeartPulse,
  Loader2,
  Wrench,
} from "lucide-react";
import { createInspectionAction } from "@/app/(app)/inspect/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, DEFAULT_LOCATION } from "@/lib/utils";
import type { Hive } from "@/lib/hives";
import type { Enums } from "@/types/database";
import type { LocalWeather } from "@/lib/weather";

const weatherOptions = [
  "Sunny",
  "Partly Cloudy",
  "Cloudy",
  "Windy",
  "Light Rain",
  "Overcast",
];

const queenSightedOptions: {
  value: Enums<"queen_sighted">;
  label: string;
}[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "uncertain", label: "Uncertain" },
];

const markColors: { value: Enums<"queen_mark_color">; label: string }[] = [
  { value: "unmarked", label: "Unmarked" },
  { value: "white", label: "White" },
  { value: "yellow", label: "Yellow" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
];

const eggsLarvaeOptions: {
  value: Enums<"eggs_larvae_status">;
  label: string;
}[] = [
  { value: "eggs_and_larvae", label: "Eggs & Larvae Present" },
  { value: "eggs_only", label: "Eggs Only" },
  { value: "larvae_only", label: "Larvae Only" },
  { value: "none_observed", label: "None Observed" },
];

const broodOptions: { value: Enums<"brood_pattern">; label: string }[] = [
  { value: "excellent", label: "Solid / Excellent (5/5)" },
  { value: "good", label: "Good (4/5)" },
  { value: "fair", label: "Fair (3/5)" },
  { value: "spotty", label: "Spotty (2/5)" },
  { value: "poor", label: "Poor (1/5)" },
  { value: "none", label: "None" },
];

const temperamentOptions: { value: Enums<"temperament">; label: string }[] = [
  { value: "calm", label: "Calm / Gentle" },
  { value: "defensive", label: "Nervous" },
  { value: "aggressive", label: "Aggressive" },
];

const storeOptions: { value: Enums<"store_level">; label: string }[] = [
  { value: "empty", label: "Empty" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "good", label: "Good" },
  { value: "full", label: "Full" },
];

const pestOptions: { value: Enums<"pest_disease">; label: string }[] = [
  { value: "none", label: "None Observed" },
  { value: "varroa", label: "Varroa" },
  { value: "chalkbrood", label: "Chalkbrood" },
  { value: "foulbrood_suspect", label: "Foulbrood Suspect" },
  { value: "wax_moth", label: "Wax Moth" },
  { value: "ants", label: "Ants" },
  { value: "other", label: "Other" },
];

const actionOptions = [
  { key: "actionFed" as const, label: "Fed Sugar Syrup / Patty" },
  { key: "actionSuper" as const, label: "Added Honey Super" },
  { key: "actionSplit" as const, label: "Created Split / Swarm Control" },
  { key: "actionTreatment" as const, label: "Applied Mite Treatment" },
];

const fieldClass =
  "flex h-9 w-full rounded-lg border border-wax-300/80 bg-wax-50/95 px-2.5 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "border-honey-500 bg-honey-500/20 text-hive-900"
              : "border-wax-300/70 bg-wax-50 text-hive-600 hover:border-honey-400/50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-0 p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-honey-800">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-2">{children}</CardContent>
    </Card>
  );
}

interface QuickLogFormProps {
  hives: Pick<Hive, "id" | "name" | "status">[];
  initialHiveId?: string;
  initialWeather?: LocalWeather | null;
}

export function QuickLogForm({
  hives,
  initialHiveId,
  initialWeather = null,
}: QuickLogFormProps) {
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
  const [inspectionTime, setInspectionTime] = useState(nowTime());
  const [weather, setWeather] = useState(
    initialWeather?.condition ?? "Sunny"
  );
  const [temperatureF, setTemperatureF] = useState(
    initialWeather ? String(initialWeather.temperatureF) : ""
  );
  const weatherAutoFilled = Boolean(initialWeather);

  const [queenSighted, setQueenSighted] =
    useState<Enums<"queen_sighted">>("yes");
  const [queenMarkColor, setQueenMarkColor] =
    useState<Enums<"queen_mark_color">>("unmarked");
  const [eggsLarvae, setEggsLarvae] =
    useState<Enums<"eggs_larvae_status">>("eggs_and_larvae");
  const [broodPattern, setBroodPattern] =
    useState<Enums<"brood_pattern">>("excellent");

  const [temperament, setTemperament] =
    useState<Enums<"temperament">>("calm");
  const [honeyStores, setHoneyStores] =
    useState<Enums<"store_level">>("moderate");
  const [pollenStores, setPollenStores] =
    useState<Enums<"store_level">>("moderate");
  const [miteCountPer100, setMiteCountPer100] = useState("0");
  const [pestsDiseases, setPestsDiseases] =
    useState<Enums<"pest_disease">>("none");

  const [actionFed, setActionFed] = useState(false);
  const [actionSuper, setActionSuper] = useState(false);
  const [actionSplit, setActionSplit] = useState(false);
  const [actionTreatment, setActionTreatment] = useState(false);
  const [notes, setNotes] = useState("");

  const actionState = {
    actionFed,
    actionSuper,
    actionSplit,
    actionTreatment,
  };
  const setAction = {
    actionFed: setActionFed,
    actionSuper: setActionSuper,
    actionSplit: setActionSplit,
    actionTreatment: setActionTreatment,
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createInspectionAction({
        hiveId,
        date,
        inspectionTime,
        weather,
        temperatureF,
        queenSighted,
        queenMarkColor,
        eggsLarvae,
        broodPattern,
        temperament,
        honeyStores,
        pollenStores,
        miteCountPer100,
        pestsDiseases,
        actionFed,
        actionSuper,
        actionSplit,
        actionTreatment,
        notes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess("Inspection saved.");
      setNotes("");
      setActionFed(false);
      setActionSuper(false);
      setActionSplit(false);
      setActionTreatment(false);
      setMiteCountPer100("0");
      router.refresh();
    });
  }

  if (selectable.length === 0) {
    return (
      <Card className="border-dashed border-honey-400/40">
        <CardContent className="py-8 text-center">
          <p className="font-display font-semibold text-hive-900">
            No hives to inspect
          </p>
          <p className="mt-1 text-sm text-hive-600">
            Add a hive first, then come back to Quick Log.
          </p>
          <Button className="mt-3" size="sm" onClick={() => router.push("/hives")}>
            Go to Hives
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={ClipboardList} title="Inspection Details">
          <div className="space-y-1.5">
            <Label htmlFor="hive" className="text-xs">
              Target Hive
            </Label>
            <select
              id="hive"
              value={hiveId}
              onChange={(e) => setHiveId(e.target.value)}
              className={fieldClass}
              required
            >
              {selectable.map((hive) => (
                <option key={hive.id} value={hive.id}>
                  {hive.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs">
                Date (YYYY-MM-DD)
              </Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-xs">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={inspectionTime}
                onChange={(e) => setInspectionTime(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Weather (auto)</Label>
              {weatherAutoFilled ? (
                <span className="text-[10px] font-medium uppercase tracking-wider text-meadow-800">
                  Live · {DEFAULT_LOCATION}
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-wider text-hive-500">
                  Manual fallback
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="weather" className="text-xs text-hive-500">
                  Condition
                </Label>
                <select
                  id="weather"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className={fieldClass}
                >
                  {[
                    ...weatherOptions,
                    ...(weatherOptions.includes(weather) ? [] : [weather]),
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="temp" className="text-xs text-hive-500">
                  Temperature (°F)
                </Label>
                <Input
                  id="temp"
                  type="number"
                  value={temperatureF}
                  onChange={(e) => setTemperatureF(e.target.value)}
                  className="h-9"
                  placeholder="—"
                />
              </div>
            </div>
            {initialWeather && (
              <p className="text-[11px] text-hive-500">
                Wind {initialWeather.windSpeedMph} mph · Humidity{" "}
                {initialWeather.humidity}%
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard icon={Crown} title="Queen & Brood">
          <div className="space-y-1.5">
            <Label className="text-xs">Queen Sighted?</Label>
            <Segmented
              value={queenSighted}
              options={queenSightedOptions}
              onChange={setQueenSighted}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="queen-color" className="text-xs">
              Queen Color
            </Label>
            <select
              id="queen-color"
              value={queenMarkColor}
              onChange={(e) =>
                setQueenMarkColor(e.target.value as Enums<"queen_mark_color">)
              }
              className={fieldClass}
            >
              {markColors.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eggs" className="text-xs">
              Eggs & Larvae Status
            </Label>
            <select
              id="eggs"
              value={eggsLarvae}
              onChange={(e) =>
                setEggsLarvae(e.target.value as Enums<"eggs_larvae_status">)
              }
              className={fieldClass}
            >
              {eggsLarvaeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brood" className="text-xs">
              Brood Laying Pattern
            </Label>
            <select
              id="brood"
              value={broodPattern}
              onChange={(e) =>
                setBroodPattern(e.target.value as Enums<"brood_pattern">)
              }
              className={fieldClass}
            >
              {broodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        <SectionCard icon={HeartPulse} title="Colony Health & Resources">
          <div className="space-y-1.5">
            <Label className="text-xs">Colony Temperament</Label>
            <Segmented
              value={temperament}
              options={temperamentOptions}
              onChange={setTemperament}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="honey" className="text-xs">
                Honey Stores
              </Label>
              <select
                id="honey"
                value={honeyStores}
                onChange={(e) =>
                  setHoneyStores(e.target.value as Enums<"store_level">)
                }
                className={fieldClass}
              >
                {storeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pollen" className="text-xs">
                Pollen Stores
              </Label>
              <select
                id="pollen"
                value={pollenStores}
                onChange={(e) =>
                  setPollenStores(e.target.value as Enums<"store_level">)
                }
                className={fieldClass}
              >
                {storeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mites" className="text-xs">
                Varroa Mite Count (per 100)
              </Label>
              <Input
                id="mites"
                type="number"
                min={0}
                step="0.1"
                value={miteCountPer100}
                onChange={(e) => setMiteCountPer100(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pests" className="text-xs">
                Pests / Diseases
              </Label>
              <select
                id="pests"
                value={pestsDiseases}
                onChange={(e) =>
                  setPestsDiseases(e.target.value as Enums<"pest_disease">)
                }
                className={fieldClass}
              >
                {pestOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Wrench} title="Actions Taken & Notes">
          <div className="space-y-1.5">
            <Label className="text-xs">Check Actions Performed</Label>
            <div className="space-y-2">
              {actionOptions.map((action) => (
                <label
                  key={action.key}
                  className="flex items-center gap-2 text-sm text-hive-700"
                >
                  <input
                    type="checkbox"
                    checked={actionState[action.key]}
                    onChange={(e) => setAction[action.key](e.target.checked)}
                    className="h-3.5 w-3.5 accent-honey-600"
                  />
                  {action.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">
              Detailed Inspection Notes
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Additional observations…"
              className="w-full rounded-lg border border-wax-300/80 bg-wax-50/95 px-2.5 py-2 text-sm text-hive-900 shadow-sm placeholder:text-hive-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
            />
          </div>
        </SectionCard>
      </div>

      {error && (
        <p className="rounded-lg border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-lg border border-meadow-400/30 bg-meadow-100 px-3 py-2 text-sm text-meadow-800">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save inspection
        </Button>
      </div>
    </form>
  );
}
