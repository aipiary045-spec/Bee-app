import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  new: "bg-sky-100 text-sky-800",
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-indigo-100 text-indigo-800",
  approved: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-emerald-100 text-emerald-800",
  converted: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
  deployed: "bg-amber-100 text-amber-900",
  needs_check: "bg-orange-100 text-orange-800",
  captured: "bg-rose-100 text-rose-800",
  overdue: "bg-rose-100 text-rose-800",
  partial: "bg-amber-100 text-amber-900",
  on_site: "bg-amber-100 text-amber-900",
  en_route: "bg-sky-100 text-sky-800",
  quoted: "bg-indigo-100 text-indigo-800",
  declined: "bg-rose-100 text-rose-800",
  canceled: "bg-slate-100 text-slate-600",
  in_stock: "bg-slate-100 text-slate-700",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        tones[value] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
