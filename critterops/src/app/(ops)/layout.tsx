import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { OpsNav } from "@/components/ops-nav";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <OpsNav userName={session.name} />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-line bg-card px-8 py-3">
          <p className="text-sm text-muted">Oklahoma NWCO · (405) 363-4433</p>
          <p className="text-sm font-medium">{session.role}</p>
        </header>
        <main className="px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
