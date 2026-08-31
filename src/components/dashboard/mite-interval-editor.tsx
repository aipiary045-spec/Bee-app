"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bug, Loader2 } from "lucide-react";
import { updateMiteCheckIntervalAction } from "@/app/(app)/hives/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_MITE_CHECK_INTERVAL_DAYS } from "@/lib/mite-interval";

interface MiteIntervalEditorProps {
  apiaryId: string;
  intervalDays: number | null;
}

export function MiteIntervalEditor({
  apiaryId,
  intervalDays,
}: MiteIntervalEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const effective = intervalDays ?? DEFAULT_MITE_CHECK_INTERVAL_DAYS;
  const [input, setInput] = useState(String(effective));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateMiteCheckIntervalAction({
        apiaryId,
        intervalDays: input,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <Card className="fade-up-delay-1 mb-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-meadow-800" />
            Mite check cadence
          </span>
          {!editing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(String(effective));
                setEditing(true);
              }}
            >
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[8rem] flex-1">
              <Label htmlFor="mite-interval" className="text-xs text-hive-500">
                Days between mite tests
              </Label>
              <Input
                id="mite-interval"
                type="number"
                min="7"
                step="1"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </div>
            <Button type="button" size="sm" onClick={onSave} disabled={pending}>
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
        ) : (
          <p className="text-sm text-hive-700">
            Remind when a hive goes more than{" "}
            <span className="font-medium">{effective} days</span> without a mite count.
          </p>
        )}
        {error && <p className="mt-2 text-xs text-crimson-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
