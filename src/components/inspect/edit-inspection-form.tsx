"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Crown,
  HeartPulse,
  Layers,
  Loader2,
  Wrench,
} from "lucide-react";
import { updateInspectionAction } from "@/app/(app)/inspect/actions";
import { DeleteInspectionButton } from "@/components/hives/delete-inspection-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SectionCard,
  Segmented,
  inspectionFieldClass,
} from "@/components/inspect/log-controls";
import {
  BROOD_OPTIONS,
  EGGS_LARVAE_OPTIONS,
  PEST_OPTIONS,
  QUEEN_MARK_OPTIONS,
  QUEEN_SIGHTED_OPTIONS,
  STORE_OPTIONS,
  TEMPERAMENT_OPTIONS,
  formatInspectionTime,
  resolveQueenSighted,
  weatherSelectOptions,
} from "@/lib/inspection-log";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@/lib/hives";
import type { Enums } from "@/types/database";

type HiveChoice = { id: string; name: string };

interface EditInspectionFormProps {
  inspection: Inspection;
  hiveName: string;
  hives: HiveChoice[];
}

export function EditInspectionForm({
  inspection,
  hiveName,
  hives,
}: EditInspectionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectable = useMemo(() => {
    if (hives.some((hive) => hive.id === inspection.hive_id)) return hives;
    return [{ id: inspection.hive_id, name: hiveName }, ...hives];
  }, [hives, hiveName, inspection.hive_id]);

  const [hiveId, setHiveId] = useState(inspection.hive_id);
  const [date, setDate] = useState(inspection.date);
  const [inspectionTime, setInspectionTime] = useState(
    formatInspectionTime(inspection.inspection_time)
  );
  const [weather, setWeather] = useState(inspection.weather || "Sunny");
  const [temperatureF, setTemperatureF] = useState(
    inspection.temperature_f == null ? "" : String(inspection.temperature_f)
  );
  const [queenSighted, setQueenSighted] = useState<Enums<"queen_sighted">>(
    resolveQueenSighted(inspection)
  );
  const [queenMarkColor, setQueenMarkColor] = useState<
    Enums<"queen_mark_color">
  >(inspection.queen_mark_color ?? "unmarked");
  const [eggsLarvae, setEggsLarvae] = useState<Enums<"eggs_larvae_status">>(
    inspection.eggs_larvae ?? "eggs_and_larvae"
  );
  const [broodPattern, setBroodPattern] = useState<Enums<"brood_pattern">>(
    inspection.brood_pattern ?? "excellent"
  );
  const [temperament, setTemperament] = useState<Enums<"temperament">>(
    inspection.temperament ?? "calm"
  );
  const [honeyStores, setHoneyStores] = useState<Enums<"store_level">>(
    inspection.honey_stores ?? "moderate"
  );
  const [pollenStores, setPollenStores] = useState<Enums<"store_level">>(
    inspection.pollen_stores ?? "moderate"
  );
  const [miteCountPer100, setMiteCountPer100] = useState(
    inspection.mite_count_per_100 == null
      ? ""
      : String(inspection.mite_count_per_100)
  );
  const [pestsDiseases, setPestsDiseases] = useState<Enums<"pest_disease">>(
    inspection.pests_diseases ?? "none"
  );
  const [actionFed, setActionFed] = useState(inspection.action_fed);
  const [actionSplit, setActionSplit] = useState(inspection.action_split);
  const [actionTreatment, setActionTreatment] = useState(
    inspection.action_treatment
  );
  const [mediumAdded, setMediumAdded] = useState(
    String(inspection.medium_added ?? 0)
  );
  const [mediumRemoved, setMediumRemoved] = useState(
    String(inspection.medium_removed ?? 0)
  );
  const [shallowAdded, setShallowAdded] = useState(
    String(inspection.shallow_added ?? 0)
  );
  const [shallowRemoved, setShallowRemoved] = useState(
    String(inspection.shallow_removed ?? 0)
  );
  const [notes, setNotes] = useState(inspection.notes ?? "");

  const weatherOptions = weatherSelectOptions(weather);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updateInspectionAction({
        inspectionId: inspection.id,
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
        mediumAdded,
        mediumRemoved,
        shallowAdded,
        shallowRemoved,
        actionSplit,
        actionTreatment,
        notes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess("Visit saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-24">
      <SectionCard icon={Layers} title="Hive & supers">
        <div className="space-y-1.5">
          <Label htmlFor="hive" className="text-xs">
            Colony
          </Label>
          <select
            id="hive"
            value={hiveId}
            onChange={(e) => setHiveId(e.target.value)}
            className={inspectionFieldClass}
          >
            {selectable.map((hive) => (
              <option key={hive.id} value={hive.id}>
                {hive.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="medium-added" className="text-xs">
              Medium added
            </Label>
            <Input
              id="medium-added"
              type="number"
              min={0}
              step={1}
              value={mediumAdded}
              onChange={(e) => setMediumAdded(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="medium-pulled" className="text-xs">
              Medium pulled
            </Label>
            <Input
              id="medium-pulled"
              type="number"
              min={0}
              step={1}
              value={mediumRemoved}
              onChange={(e) => setMediumRemoved(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shallow-added" className="text-xs">
              Shallow added
            </Label>
            <Input
              id="shallow-added"
              type="number"
              min={0}
              step={1}
              value={shallowAdded}
              onChange={(e) => setShallowAdded(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shallow-pulled" className="text-xs">
              Shallow pulled
            </Label>
            <Input
              id="shallow-pulled"
              type="number"
              min={0}
              step={1}
              value={shallowRemoved}
              onChange={(e) => setShallowRemoved(e.target.value)}
              className="h-11"
            />
          </div>
        </div>
        <p className="text-xs text-hive-500">
          Changing these numbers updates the visit record. Boxes currently on
          the hive stay as they are.
        </p>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="weather" className="text-xs">
                Weather
              </Label>
              <select
                id="weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className={inspectionFieldClass}
              >
                {weatherOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temp" className="text-xs">
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
        </SectionCard>

        <SectionCard icon={Crown} title="Queen & brood">
          <div className="space-y-1.5">
            <Label className="text-xs">Queen sighted?</Label>
            <Segmented
              value={queenSighted}
              options={QUEEN_SIGHTED_OPTIONS}
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
              className={inspectionFieldClass}
            >
              {QUEEN_MARK_OPTIONS.map((opt) => (
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
              className={inspectionFieldClass}
            >
              {EGGS_LARVAE_OPTIONS.map((opt) => (
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
              className={inspectionFieldClass}
            >
              {BROOD_OPTIONS.map((opt) => (
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
              options={TEMPERAMENT_OPTIONS}
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
                className={inspectionFieldClass}
              >
                {STORE_OPTIONS.map((opt) => (
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
                className={inspectionFieldClass}
              >
                {STORE_OPTIONS.map((opt) => (
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
                className={inspectionFieldClass}
              >
                {PEST_OPTIONS.map((opt) => (
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
                className={
                  action.on
                    ? "min-h-12 rounded-xl border border-honey-500 bg-honey-500/20 px-3 py-2 text-sm font-medium text-hive-900"
                    : "min-h-12 rounded-xl border border-wax-300/70 bg-wax-50 px-3 py-2 text-sm font-medium text-hive-600 hover:border-honey-400/50"
                }
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
              className="w-full rounded-xl border border-wax-300/80 bg-wax-50/95 px-3 py-2 text-sm text-hive-900 shadow-sm placeholder:text-hive-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
            />
          </div>
        </SectionCard>
      </div>

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
          <DeleteInspectionButton
            inspectionId={inspection.id}
            dateLabel={formatDate(date)}
            redirectTo="/logs"
          />
          <Button type="submit" disabled={pending} size="lg">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save visit
          </Button>
        </div>
      </div>
    </form>
  );
}
