"use client";

import { useState, useTransition } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import {
  updateHiveConfigAction,
  type HiveConfig,
} from "@/app/(app)/hives/actions";
import { HiveStack, type HiveLayer } from "@/components/hives/hive-stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Enums } from "@/types/database";

const MAX_DEEP_BOXES = 6;
const MAX_HONEY_SUPERS = 8;

interface HiveConfiguratorProps {
  hiveId: string;
  status: Enums<"hive_status">;
  initial: HiveConfig;
}

export function HiveConfigurator({
  hiveId,
  status,
  initial,
}: HiveConfiguratorProps) {
  const [config, setConfig] = useState<HiveConfig>(initial);
  const [highlight, setHighlight] = useState<HiveLayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function commit(next: HiveConfig) {
    const previous = config;
    setConfig(next);
    setError(null);
    startTransition(async () => {
      const result = await updateHiveConfigAction(hiveId, next);
      if (!result.ok) {
        setConfig(previous);
        setError(result.error);
      } else {
        setConfig(result.config);
      }
    });
  }

  const setSupers = (value: number) =>
    commit({ ...config, honeySupers: Math.max(0, Math.min(MAX_HONEY_SUPERS, value)) });
  const setDeeps = (value: number) =>
    commit({ ...config, deepBoxes: Math.max(0, Math.min(MAX_DEEP_BOXES, value)) });
  const toggleExcluder = () =>
    commit({ ...config, hasQueenExcluder: !config.hasQueenExcluder });

  return (
    <Card>
      <CardContent className="grid gap-6 p-5 sm:grid-cols-[minmax(0,180px)_1fr] sm:items-center">
        {/* The live picture */}
        <div className="relative mx-auto w-full max-w-[180px]">
          <HiveStack
            deepBoxes={config.deepBoxes}
            honeySupers={config.honeySupers}
            hasQueenExcluder={config.hasQueenExcluder}
            status={status}
            highlight={highlight}
            className="mx-auto h-auto max-h-[340px] w-full drop-shadow-sm"
          />
          {pending ? (
            <span className="absolute right-1 top-1 flex items-center gap-1 rounded-full bg-hive-900/80 px-2 py-0.5 text-[10px] font-medium text-wax-50">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving
            </span>
          ) : null}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <ControlRow
            label="Honey supers"
            hint="Boxes stacked on top for honey storage."
            value={config.honeySupers}
            max={MAX_HONEY_SUPERS}
            swatch="bg-honey-400"
            onDecrement={() => setSupers(config.honeySupers - 1)}
            onIncrement={() => setSupers(config.honeySupers + 1)}
            onHover={() => setHighlight("supers")}
            onLeave={() => setHighlight(null)}
            disabled={pending}
          />

          <ControlRow
            label="Brood boxes"
            hint="Deep boxes where the queen lays."
            value={config.deepBoxes}
            max={MAX_DEEP_BOXES}
            swatch="bg-honey-800"
            onDecrement={() => setDeeps(config.deepBoxes - 1)}
            onIncrement={() => setDeeps(config.deepBoxes + 1)}
            onHover={() => setHighlight("deeps")}
            onLeave={() => setHighlight(null)}
            disabled={pending}
          />

          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-wax-300/70 bg-wax-50/70 px-3 py-2"
            onMouseEnter={() => setHighlight("excluder")}
            onMouseLeave={() => setHighlight(null)}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-hive-800">Queen excluder</p>
              <p className="text-xs text-hive-500">
                Mesh between brood and supers.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={config.hasQueenExcluder ? "default" : "outline"}
              onClick={toggleExcluder}
              disabled={pending}
            >
              {config.hasQueenExcluder ? "On" : "Off"}
            </Button>
          </div>

          {error ? (
            <p className="rounded-lg border border-crimson-300/40 bg-crimson-50 px-3 py-2 text-sm text-crimson-800">
              {error}
            </p>
          ) : (
            <p className="text-xs text-hive-500">
              Changes save automatically and update the picture. Logging{" "}
              <span className="font-medium text-hive-700">Added / Removed Honey Super</span>{" "}
              in Quick Log adjusts this too.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ControlRow({
  label,
  hint,
  value,
  max,
  swatch,
  onIncrement,
  onDecrement,
  onHover,
  onLeave,
  disabled,
}: {
  label: string;
  hint: string;
  value: number;
  max: number;
  swatch: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onHover: () => void;
  onLeave: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border border-wax-300/70 bg-wax-50/70 px-3 py-2"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-3.5 w-3.5 shrink-0 rounded-sm ring-1 ring-black/10 ${swatch}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-hive-800">{label}</p>
          <p className="text-xs text-hive-500">{hint}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={onDecrement}
          disabled={disabled || value <= 0}
          aria-label={`Remove ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums text-hive-900">
          {value}
        </span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={onIncrement}
          disabled={disabled || value >= max}
          aria-label={`Add ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
