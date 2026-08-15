import Link from "next/link";
import { prisma } from "@/lib/db";
import { clientName } from "@/lib/utils";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { properties: true, jobs: true, invoices: true },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">CRM</p>
        <h1 className="text-3xl font-semibold">Clients</h1>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Properties</th>
              <th className="px-4 py-3">Jobs</th>
              <th className="px-4 py-3">Portal</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/clients/${client.id}`} className="font-medium text-green-dark">
                    {clientName(client)}
                  </Link>
                </td>
                <td className="px-4 py-3">{client.phone}</td>
                <td className="px-4 py-3">{client.properties.length}</td>
                <td className="px-4 py-3">{client.jobs.length}</td>
                <td className="px-4 py-3">
                  <Link href={`/p/${client.portalToken}`} className="text-green-dark">
                    Client Hub
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
