"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApproveQuoteButton({
  quoteId,
  portalToken,
}: {
  quoteId: string;
  portalToken?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function approve() {
    setPending(true);
    await fetch(`/api/quotes/${quoteId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portalToken }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={approve}
      disabled={pending}
      className="mt-4 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"
    >
      {pending ? "Approving…" : "Approve quote"}
    </button>
  );
}
