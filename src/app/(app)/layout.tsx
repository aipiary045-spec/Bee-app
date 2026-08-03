import { Sidebar, MobileNav } from "@/components/layout/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-honey-200/25 to-transparent" />
        <main className="relative flex-1 pb-24 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
