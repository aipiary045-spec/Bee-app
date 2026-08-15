"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function InvoiceJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function createInvoice() {
    setPending(true);
    const response = await fetch(`/api/jobs/${jobId}/invoice`, { method: "POST" });
    const invoice = (await response.json()) as { id?: string };
    setPending(false);
    if (invoice.id) router.push(`/invoices/${invoice.id}`);
    else router.refresh();
  }

  return (
    <button
      type="button"
      onClick={createInvoice}
      disabled={pending}
      className="rounded-lg bg-green px-3 py-2 text-sm font-semibold text-white hover:bg-green-dark"
    >
      {pending ? "Creating…" : "Create invoice"}
    </button>
  );
}
