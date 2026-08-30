"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, StickyNote } from "lucide-react";
import { updateHiveNotesAction } from "@/app/(app)/hives/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HiveNotesEditorProps {
  hiveId: string;
  notes: string | null;
  embedded?: boolean;
}

export function HiveNotesEditor({
  hiveId,
  notes,
  embedded = false,
}: HiveNotesEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(notes ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateHiveNotesAction({
        hiveId,
        notes: value,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const fields = (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="hive-notes" className="text-xs text-hive-500">
          Persistent reminders for this colony
        </Label>
        <textarea
          id="hive-notes"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Aggressive on the north side, weak since May split, needs a new queen…"
          className="w-full rounded-xl border border-wax-300/70 bg-white px-3 py-2 text-sm leading-relaxed text-hive-800 placeholder:text-hive-400 focus:border-honey-400 focus:outline-none focus:ring-2 focus:ring-honey-400/30"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={onSave} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save notes"}
        </Button>
        {saved && <p className="text-xs text-meadow-800">Saved</p>}
        {error && <p className="text-xs text-crimson-600">{error}</p>}
      </div>
    </div>
  );

  if (embedded) return fields;

  return (
    <Card className="fade-up-delay-1 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <StickyNote className="h-4 w-4 text-honey-700" />
          Hive notes
        </CardTitle>
      </CardHeader>
      <CardContent>{fields}</CardContent>
    </Card>
  );
}
