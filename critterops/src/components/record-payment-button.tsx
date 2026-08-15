"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RecordPaymentButton({
  invoiceId,
  amountCents,
  portalToken,
}: {
  invoiceId: string;
  amountCents: number;
  portalToken?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function pay() {
    setPending(true);
    await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountCents,
        method: portalToken ? "card" : "check",
        portalToken,
      }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={pay}
      disabled={pending}
      className="mt-4 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"
    >
      {pending ? "Recording…" : portalToken ? "Pay invoice" : "Record payment"}
    </button>
  );
}
