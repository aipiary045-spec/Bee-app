import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function CompliancePage() {
  const [forms, chemicals] = await Promise.all([
    prisma.complianceForm.findMany({ orderBy: { submittedAt: "desc" } }),
    prisma.chemicalApplication.findMany({
      include: { property: true, applicator: true },
      orderBy: { appliedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-dark">ODWC / ODAFF</p>
        <h1 className="text-3xl font-semibold">Compliance</h1>
        <p className="text-muted">
          NWCO complaint reports are kept three years. Annual summaries are due January 30.
        </p>
      </div>
      <section className="space-y-3">
        {forms.map((form) => (
          <article key={form.id} className="rounded-2xl border border-line bg-card p-5">
            <p className="text-xs uppercase text-muted">{form.type.replaceAll("_", " ")}</p>
            <h2 className="text-lg font-semibold">{form.title}</h2>
            <p className="text-sm text-muted">
              Filed {formatDate(form.submittedAt)} · retain until {formatDate(form.retentionUntil)}
            </p>
          </article>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Pesticide / rodenticide applications</h2>
        {chemicals.map((row) => (
          <article key={row.id} className="rounded-2xl border border-line bg-card p-5">
            <h3 className="font-semibold">{row.productName}</h3>
            <p className="text-sm text-muted">EPA {row.epaRegNumber}</p>
            <p className="mt-2 text-sm">
              Target {row.targetPest} · {row.applicationRate} · used {row.amountUsed}
            </p>
            <p className="mt-1 text-sm text-muted">{row.siteDescription}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
