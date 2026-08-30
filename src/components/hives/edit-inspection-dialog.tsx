"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { updateInspectionAction } from "@/app/(app)/inspect/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MITE_METHOD_OPTIONS } from "@/lib/mite-methods";
import { SPLIT_TYPE_OPTIONS } from "@/lib/splits";
import type { Tables } from "@/types/database";
import type { Enums } from "@/types/database";

type Inspection = Tables<"inspections">;

const fieldClass =
  "flex h-10 w-full rounded-xl border border-wax-300/80 bg-wax-50/95 px-3 text-sm text-hive-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40";

interface EditInspectionDialogProps {
  inspection: Inspection;
  dateLabel: string;
}

export function EditInspectionDialog({
  inspection,
  dateLabel,
}: EditInspectionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(inspection.date);
  const [inspectionTime, setInspectionTime] = useState(
    inspection.inspection_time?.slice(0, 5) ?? ""
  );
  const [weather, setWeather] = useState(inspection.weather ?? "");
  const [temperatureF, setTemperatureF] = useState(
    inspection.temperature_f != null ? String(inspection.temperature_f) : ""
  );
  const [queenSighted, setQueenSighted] = useState<Enums<"queen_sighted">>(
    inspection.queen_sighted ?? "yes"
  );
  const [broodPattern, setBroodPattern] = useState<Enums<"brood_pattern">>(
    inspection.brood_pattern ?? "good"
  );
  const [miteCountPer100, setMiteCountPer100] = useState(
    inspection.mite_count_per_100 != null
      ? String(inspection.mite_count_per_100)
      : ""
  );
  const [miteMethod, setMiteMethod] = useState<Enums<"mite_method">>(
    inspection.mite_method ?? "alcohol_wash"
  );
  const [pestsDiseases, setPestsDiseases] = useState<Enums<"pest_disease">>(
    inspection.pests_diseases ?? "none"
  );
  const [splitType, setSplitType] = useState<Enums<"split_type"> | "">(
    inspection.split_type ?? ""
  );
  const [splitDestination, setSplitDestination] = useState(
    inspection.split_destination ?? ""
  );
  const [queenCellsSeen, setQueenCellsSeen] = useState(
    inspection.queen_cells_seen ?? false
  );
  const [notes, setNotes] = useState(inspection.notes ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateInspectionAction({
        inspectionId: inspection.id,
        hiveId: inspection.hive_id,
        date,
        inspectionTime,
        weather,
        temperatureF,
        queenSighted: queenSighted as Enums<"queen_sighted">,
        broodPattern: broodPattern as Enums<"brood_pattern">,
        miteCountPer100,
        miteMethod,
        pestsDiseases: pestsDiseases as Enums<"pest_disease">,
        actionSplit: inspection.action_split,
        splitType: splitType || null,
        splitDestination,
        queenCellsSeen,
        notes,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-hive-500 hover:text-honey-800"
          aria-label={`Edit visit from ${dateLabel}`}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit visit</DialogTitle>
          <DialogDescription>
            Fix counts, notes, or other details for {dateLabel}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-date" className="text-xs">
                Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-time" className="text-xs">
                Time
              </Label>
              <Input
                id="edit-time"
                type="time"
                value={inspectionTime}
                onChange={(e) => setInspectionTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-weather" className="text-xs">
                Weather
              </Label>
              <Input
                id="edit-weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-temp" className="text-xs">
                Temp °F
              </Label>
              <Input
                id="edit-temp"
                type="number"
                value={temperatureF}
                onChange={(e) => setTemperatureF(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-queen" className="text-xs">
                Queen seen
              </Label>
              <select
                id="edit-queen"
                value={queenSighted}
                onChange={(e) =>
                  setQueenSighted(e.target.value as Enums<"queen_sighted">)
                }
                className={fieldClass}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="uncertain">Uncertain</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-brood" className="text-xs">
                Brood
              </Label>
              <select
                id="edit-brood"
                value={broodPattern}
                onChange={(e) =>
                  setBroodPattern(e.target.value as Enums<"brood_pattern">)
                }
                className={fieldClass}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="spotty">Spotty</option>
                <option value="poor">Poor</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-hive-700">
            <input
              type="checkbox"
              checked={queenCellsSeen}
              onChange={(event) => setQueenCellsSeen(event.target.checked)}
              className="h-4 w-4 rounded border-wax-400"
            />
            Queen cells seen
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-mite-method" className="text-xs">
                Mite method
              </Label>
              <select
                id="edit-mite-method"
                value={miteMethod}
                onChange={(e) =>
                  setMiteMethod(e.target.value as Enums<"mite_method">)
                }
                className={fieldClass}
              >
                {MITE_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-mites" className="text-xs">
                Mite count
              </Label>
              <Input
                id="edit-mites"
                type="number"
                min={0}
                step="0.1"
                value={miteCountPer100}
                onChange={(e) => setMiteCountPer100(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-pests" className="text-xs">
              Pests / disease
            </Label>
            <select
              id="edit-pests"
              value={pestsDiseases}
              onChange={(e) =>
                setPestsDiseases(e.target.value as Enums<"pest_disease">)
              }
              className={fieldClass}
            >
              <option value="none">None</option>
              <option value="varroa">Varroa</option>
              <option value="chalkbrood">Chalkbrood</option>
              <option value="foulbrood_suspect">Foulbrood?</option>
              <option value="wax_moth">Wax moth</option>
              <option value="ants">Ants</option>
              <option value="other">Other</option>
            </select>
          </div>
          {inspection.action_split && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-split-type" className="text-xs">
                  Split type
                </Label>
                <select
                  id="edit-split-type"
                  value={splitType}
                  onChange={(e) =>
                    setSplitType(e.target.value as Enums<"split_type"> | "")
                  }
                  className={fieldClass}
                >
                  <option value="">Select type</option>
                  {SPLIT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-split-dest" className="text-xs">
                  Destination / notes
                </Label>
                <Input
                  id="edit-split-dest"
                  value={splitDestination}
                  onChange={(e) => setSplitDestination(e.target.value)}
                  placeholder="Nuc name, combine target…"
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes" className="text-xs">
              Notes
            </Label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-wax-300/80 bg-wax-50/95 px-3 py-2 text-sm text-hive-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500/40"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
