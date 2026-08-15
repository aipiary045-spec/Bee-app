"use client";

import { useRouter } from "next/navigation";
import { addHours, format, startOfDay } from "date-fns";
import { StatusPill } from "@/components/status-pill";

type VisitRow = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: string;
  technicianId: string | null;
  technicianName: string | null;
  clientName: string;
  city: string;
};

export function ScheduleBoard({
  visits,
  technicians,
}: {
  visits: VisitRow[];
  technicians: { id: string; name: string }[];
}) {
  const router = useRouter();

  async function move(id: string, hours: number) {
    const visit = visits.find((row) => row.id === id);
    if (!visit) return;
    const startsAt = addHours(new Date(visit.startsAt), hours);
    const endsAt = addHours(new Date(visit.endsAt), hours);
    await fetch(`/api/visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }),
    });
    router.refresh();
  }

  async function assign(id: string, technicianId: string) {
    await fetch(`/api/visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technicianId }),
    });
    router.refresh();
  }

  async function optimize(technicianId: string) {
    await fetch("/api/schedule/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        technicianId,
        date: startOfDay(new Date()).toISOString(),
      }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {technicians.map((tech) => (
          <button
            key={tech.id}
            type="button"
            onClick={() => optimize(tech.id)}
            className="rounded-lg bg-green px-3 py-2 text-sm font-semibold text-white hover:bg-green-dark"
          >
            Optimize {tech.name.split(" ")[0]}&apos;s route
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Visit</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Tech</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Move</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{visit.title}</p>
                  <p className="text-muted">
                    {visit.clientName} · {visit.city}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {format(new Date(visit.startsAt), "EEE p")} – {format(new Date(visit.endsAt), "p")}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-line px-2 py-1"
                    value={visit.technicianId ?? ""}
                    onChange={(event) => assign(visit.id, event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <StatusPill value={visit.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" className="text-green-dark" onClick={() => move(visit.id, -1)}>
                      −1h
                    </button>
                    <button type="button" className="text-green-dark" onClick={() => move(visit.id, 1)}>
                      +1h
                    </button>
                    <button type="button" className="text-green-dark" onClick={() => move(visit.id, 24)}>
                      +1d
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
