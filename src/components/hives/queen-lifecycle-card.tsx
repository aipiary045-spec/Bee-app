"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Crown, Loader2 } from "lucide-react";
import { updateQueenIntroducedAction } from "@/app/(app)/hives/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  formatQueenAge,
  isQueenAging,
} from "@/lib/queen-lifecycle";

interface QueenLifecycleCardProps {
  hiveId: string;
  introducedDate: string | null;
}

export function QueenLifecycleCard({
  hiveId,
  introducedDate,
}: QueenLifecycleCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [dateInput, setDateInput] = useState(introducedDate ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const aging = isQueenAging(introducedDate);

  function onSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateQueenIntroducedAction({
        hiveId,
        introducedDate: dateInput,
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
    <Card id="queen-lifecycle" className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-honey-700" />
            Current queen
          </span>
          {!editing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDateInput(introducedDate ?? "");
                setEditing(true);
              }}
            >
              {introducedDate ? "Edit date" : "Set date"}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="queen-introduced" className="text-xs text-hive-500">
                Introduced or replaced
              </Label>
              <Input
                id="queen-introduced"
                type="date"
                value={dateInput}
                onChange={(event) => setDateInput(event.target.value)}
              />
            </div>
            <div className="flex gap-2">
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
            {error && <p className="text-xs text-crimson-600">{error}</p>}
          </div>
        ) : introducedDate ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-hive-700">
              Age: <span className="font-medium">{formatQueenAge(introducedDate)}</span>
            </p>
            {aging && <Badge variant="warning">Consider requeening</Badge>}
          </div>
        ) : (
          <p className="text-sm text-hive-500">
            No queen start date yet. Log a replacement in Quick Log or set it here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
