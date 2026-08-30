"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { updateHiveNameAction } from "@/app/(app)/hives/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HiveNameEditorProps {
  hiveId: string;
  name: string;
}

export function HiveNameEditor({ hiveId, name }: HiveNameEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateHiveNameAction({
        hiveId,
        name: value,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Card className="fade-up-delay-1 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Pencil className="h-4 w-4 text-honey-700" />
          Hive name
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="hive-name" className="text-xs text-hive-500">
            Name or number on the yard stand
          </Label>
          <Input
            id="hive-name"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
            }}
            placeholder="North 3, Victory, Roger Woods South…"
            autoComplete="off"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={pending || value.trim() === name.trim()}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save name"}
          </Button>
          {saved && <p className="text-xs text-meadow-800">Saved</p>}
          {error && <p className="text-xs text-crimson-600">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
