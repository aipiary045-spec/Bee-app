import { Sidebar, MobileNav } from "@/components/layout/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
