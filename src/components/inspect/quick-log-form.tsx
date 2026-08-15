"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Crown,
  DollarSign,
  HeartPulse,
  Layers,
  Loader2,
  Minus,
  Plus,
  Wrench,
} from "lucide-react";
import { createInspectionAction } from "@/app/(app)/inspect/actions";
import { HiveStack } from "@/components/inspect/hive-stack";
import { YardPicker } from "@/components/yard/yard-scene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { EXPENSE_CATALOG, EXPENSE_CATEGORY_LABELS } from "@/lib/expense-catalog";
import {
  canAddSuper,
  canRemoveSuper,
  emptySuperChange,
  formatSuperInventory,
  formatTypedSuperChange,
  hiveSuperInventory,
  nextInventory,
  type SuperType,
  type SuperVisitChange,
} from "@/lib/supers";
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
  { value: "eggs_and_larvae", label: "Eggs & Larvae" },
  { value: "eggs_only", label: "Eggs Only" },
  { value: "larvae_only", label: "Larvae Only" },
  { value: "none_observed", label: "None Seen" },
];

const broodOptions: { value: Enums<"brood_pattern">; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "spotty", label: "Spotty" },
  { value: "poor", label: "Poor" },
  { value: "none", label: "None" },
];

const temperamentOptions: { value: Enums<"temperament">; label: string }[] = [
  { value: "calm", label: "Calm" },
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
  { value: "none", label: "None" },
  { value: "varroa", label: "Varroa" },
  { value: "chalkbrood", label: "Chalkbrood" },
  { value: "foulbrood_suspect", label: "Foulbrood?" },
  { value: "wax_moth", label: "Wax Moth" },
  { value: "ants", label: "Ants" },
  { value: "other", label: "Other" },
];

const fieldClass =
  "flex h-11 w-full rounded-xl border border-wax-300/80 bg-wax-50/95 px-3 text-sm text-hive-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40 dark:bg-[#1c1610] dark:border-honey-400/25";

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
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
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
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("h-full", className)}>
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

export type QuickLogHive = Pick<
  Hive,
  | "id"
  | "name"
  | "status"
  | "super_count"
  | "medium_count"
  | "shallow_count"
  | "frame_count"
>;

interface QuickLogFormProps {
  hives: QuickLogHive[];
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
  const [superChange, setSuperChange] = useState<SuperVisitChange>(emptySuperChange);
  const [actionSplit, setActionSplit] = useState(false);
  const [actionTreatment, setActionTreatment] = useState(false);
  const [notes, setNotes] = useState("");

  const [logExpenses, setLogExpenses] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [expenseAmounts, setExpenseAmounts] = useState<Record<string, string>>(
    {}
  );

  const selectedHive = selectable.find((hive) => hive.id === hiveId);
  const currentInventory = hiveSuperInventory(selectedHive ?? {});
  const nextSupers = nextInventory(currentInventory, superChange);

  const expenseTotal = useMemo(() => {
    if (!logExpenses) return 0;
    return selectedExpenseIds.reduce((sum, id) => {
      const amount = Number(expenseAmounts[id] ?? "");
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
  }, [logExpenses, selectedExpenseIds, expenseAmounts]);

  function selectHive(id: string) {
    setHiveId(id);
    setSuperChange(emptySuperChange());
  }

  function bumpSuper(type: SuperType, direction: "add" | "remove") {
    setSuperChange((current) => {
      if (direction === "add") {
        if (!canAddSuper(currentInventory, current)) return current;
        return type === "medium"
          ? { ...current, mediumAdded: current.mediumAdded + 1 }
          : { ...current, shallowAdded: current.shallowAdded + 1 };
      }
      if (!canRemoveSuper(currentInventory, current, type)) return current;
      return type === "medium"
        ? { ...current, mediumRemoved: current.mediumRemoved + 1 }
        : { ...current, shallowRemoved: current.shallowRemoved + 1 };
    });
  }

  function toggleExpense(id: string) {
    setSelectedExpenseIds((current) => {
      if (current.includes(id)) {
        setExpenseAmounts((amounts) => {
          const next = { ...amounts };
          delete next[id];
          return next;
        });
        return current.filter((item) => item !== id);
      }
      setExpenseAmounts((amounts) => ({ ...amounts, [id]: amounts[id] ?? "" }));
      return [...current, id];
    });
  }

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
        mediumAdded: superChange.mediumAdded,
        mediumRemoved: superChange.mediumRemoved,
        shallowAdded: superChange.shallowAdded,
        shallowRemoved: superChange.shallowRemoved,
        actionSplit,
        actionTreatment,
        notes,
        logExpenses,
        expenses: selectedExpenseIds.map((catalogId) => ({
          catalogId,
          amount: expenseAmounts[catalogId] ?? "",
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const superNote = formatTypedSuperChange({
        mediumAdded: result.mediumAdded,
        mediumRemoved: result.mediumRemoved,
        shallowAdded: result.shallowAdded,
        shallowRemoved: result.shallowRemoved,
      });
      const expenseNote =
        logExpenses && selectedExpenseIds.length > 0
          ? ` · ${selectedExpenseIds.length} expense${selectedExpenseIds.length === 1 ? "" : "s"}`
          : "";
      setSuccess(
        superNote === "No super change"
          ? `Inspection saved${expenseNote}.`
          : `Inspection saved. ${superNote} — now ${formatSuperInventory(nextInventory(currentInventory, {
              mediumAdded: result.mediumAdded,
              mediumRemoved: result.mediumRemoved,
              shallowAdded: result.shallowAdded,
              shallowRemoved: result.shallowRemoved,
            }))}${expenseNote}.`
      );
      setNotes("");
      setActionFed(false);
      setSuperChange(emptySuperChange());
      setActionSplit(false);
      setActionTreatment(false);
      setMiteCountPer100("0");
      setLogExpenses(false);
      setSelectedExpenseIds([]);
      setExpenseAmounts({});
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

  const saveSummary = [
    selectedHive?.name ?? "Hive",
    formatTypedSuperChange(superChange) === "No super change"
      ? formatSuperInventory(currentInventory)
      : `${formatTypedSuperChange(superChange)} → ${formatSuperInventory(nextSupers)}`,
  ].join(" · ");

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-24">
      <SectionCard icon={Layers} title="Hive & supers">
        <div className="space-y-1.5">
          <Label className="text-xs">Which colony?</Label>
          <YardPicker
            hives={selectable}
            selectedId={hiveId}
            onSelect={selectHive}
          />
        </div>

        <div className="grid items-center gap-5 rounded-2xl border border-honey-400/25 bg-honey-50/40 p-4 dark:bg-honey-500/10 sm:grid-cols-[1fr_auto_1fr]">
          <div className="order-2 space-y-3 sm:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honey-700">
              Stack this visit
            </p>
            <p className="font-display text-2xl font-semibold text-hive-900">
              {formatSuperInventory(nextSupers)}
            </p>
            <p className="text-sm text-hive-600">
              On now: {formatSuperInventory(currentInventory)}. Pull and add in
              the same visit — harvest a capped box and put an empty one back.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-hive-500">
                  Medium
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canRemoveSuper(currentInventory, superChange, "medium")}
                    onClick={() => bumpSuper("medium", "remove")}
                  >
                    <Minus className="h-4 w-4" />
                    Pull
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!canAddSuper(currentInventory, superChange)}
                    onClick={() => bumpSuper("medium", "add")}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-hive-500">
                  Shallow
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canRemoveSuper(currentInventory, superChange, "shallow")}
                    onClick={() => bumpSuper("shallow", "remove")}
                  >
                    <Minus className="h-4 w-4" />
                    Pull
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!canAddSuper(currentInventory, superChange)}
                    onClick={() => bumpSuper("shallow", "add")}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-hive-800">
              {formatTypedSuperChange(superChange)}
            </p>
          </div>

          <HiveStack
            className="order-1 sm:order-2"
            hiveName={selectedHive?.name}
            current={currentInventory}
            change={superChange}
            next={nextSupers}
          />

          <div className="order-3 hidden text-sm text-hive-600 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honey-700">
              Yard tip
            </p>
            <p className="mt-2 leading-relaxed">
              Pull a capped shallow and add a medium in the same save. Mediums
              sit taller on the stack; shallows go on top.
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={ClipboardList} title="Inspection details">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
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
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Weather</Label>
              {weatherAutoFilled ? (
                <span className="text-[10px] font-medium uppercase tracking-wider text-meadow-800">
                  Live · {initialWeather?.location ?? "this yard"}
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-wider text-hive-500">
                  Manual
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
                  Temp (°F)
                </Label>
                <Input
                  id="temp"
                  type="number"
                  value={temperatureF}
                  onChange={(e) => setTemperatureF(e.target.value)}
                  className="h-11"
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

        <SectionCard icon={Crown} title="Queen & brood">
          <div className="space-y-1.5">
            <Label className="text-xs">Queen sighted?</Label>
            <Segmented
              value={queenSighted}
              options={queenSightedOptions}
              onChange={setQueenSighted}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="queen-color" className="text-xs">
              Queen color
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
              Eggs & larvae
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
              Brood pattern
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

        <SectionCard icon={HeartPulse} title="Health & stores">
          <div className="space-y-1.5">
            <Label className="text-xs">Temperament</Label>
            <Segmented
              value={temperament}
              options={temperamentOptions}
              onChange={setTemperament}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="honey" className="text-xs">
                Honey stores
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
                Pollen stores
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
                Mites / 100
              </Label>
              <Input
                id="mites"
                type="number"
                min={0}
                step="0.1"
                value={miteCountPer100}
                onChange={(e) => setMiteCountPer100(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pests" className="text-xs">
                Pests / disease
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

        <SectionCard icon={Wrench} title="Other actions & notes">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { key: "fed", label: "Fed", on: actionFed, toggle: setActionFed },
              {
                key: "split",
                label: "Split / swarm",
                on: actionSplit,
                toggle: setActionSplit,
              },
              {
                key: "treatment",
                label: "Treated",
                on: actionTreatment,
                toggle: setActionTreatment,
              },
            ].map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => action.toggle(!action.on)}
                className={cn(
                  "min-h-12 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  action.on
                    ? "border-honey-500 bg-honey-500/20 text-hive-900"
                    : "border-wax-300/70 bg-wax-50 text-hive-600 hover:border-honey-400/50"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">
              Notes
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Queen cells, drawn comb, anything you’ll want next visit…"
              className="w-full rounded-xl border border-wax-300/80 bg-wax-50/95 px-3 py-2 text-sm text-hive-900 shadow-sm placeholder:text-hive-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard icon={DollarSign} title="Purchases">
        <button
          type="button"
          onClick={() => setLogExpenses((current) => !current)}
          className={cn(
            "flex min-h-12 w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors",
            logExpenses
              ? "border-honey-500 bg-honey-500/20 text-hive-900"
              : "border-wax-300/70 bg-wax-50 text-hive-700 hover:border-honey-400/50"
          )}
        >
          <span>Bought something this visit</span>
          <span className="text-xs font-semibold text-honey-800">
            {logExpenses ? "On" : "Off"}
          </span>
        </button>

        {logExpenses && (
          <div className="space-y-4">
            <p className="text-sm text-hive-600">
              Tap what you bought, then put the price.
            </p>
            {(
              [
                "equipment",
                "treatments",
                "feed",
                "administrative",
                "other",
              ] as const
            ).map((category) => (
              <div key={category} className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-honey-700">
                  {EXPENSE_CATEGORY_LABELS[category]}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {EXPENSE_CATALOG.filter((item) => item.category === category).map(
                    (item) => {
                      const selected = selectedExpenseIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleExpense(item.id)}
                          className={cn(
                            "min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                            selected
                              ? "border-honey-500 bg-honey-500/20 text-hive-900"
                              : "border-wax-300/70 bg-wax-50 text-hive-600 hover:border-honey-400/50"
                          )}
                        >
                          {item.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ))}

            {selectedExpenseIds.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-wax-300/60 bg-wax-50/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">
                  Prices
                </p>
                {selectedExpenseIds.map((id) => {
                  const item = EXPENSE_CATALOG.find((entry) => entry.id === id);
                  if (!item) return null;
                  return (
                    <div
                      key={id}
                      className="grid grid-cols-[1fr_7rem] items-center gap-2"
                    >
                      <span className="truncate text-sm text-hive-700">
                        {item.label}
                      </span>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-hive-500">
                          $
                        </span>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          required={logExpenses}
                          value={expenseAmounts[id] ?? ""}
                          onChange={(e) =>
                            setExpenseAmounts((amounts) => ({
                              ...amounts,
                              [id]: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          className="h-11 pl-6"
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-right text-sm font-semibold text-hive-800">
                  Total {formatCurrency(expenseTotal)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-hive-500">Nothing selected yet.</p>
            )}
          </div>
        )}
      </SectionCard>

      {error && (
        <p className="rounded-xl border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-xl border border-meadow-400/30 bg-meadow-100 px-3 py-2 text-sm text-meadow-800">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </p>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6">
        <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-honey-400/40 bg-wax-50/95 px-4 py-3 shadow-[0_12px_40px_-18px_rgba(61,42,20,0.55)] backdrop-blur dark:bg-[#241c10]/95">
          <p className="min-w-0 truncate text-sm text-hive-700">{saveSummary}</p>
          <Button type="submit" disabled={pending} size="lg">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save inspection
          </Button>
        </div>
      </div>
    </form>
  );
}
