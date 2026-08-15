"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TrapCheckButton({ trapId }: { trapId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function log(type: string) {
    setPending(true);
    await fetch(`/api/traps/${trapId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => log("check")}
        className="rounded-lg bg-green px-3 py-1.5 text-sm font-semibold text-white"
      >
        Log check
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => log("catch")}
        className="rounded-lg border border-line px-3 py-1.5 text-sm"
      >
        Catch
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => log("pull")}
        className="rounded-lg border border-line px-3 py-1.5 text-sm"
      >
        Pull
      </button>
    </div>
  );
}
