import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { BrandWatermark } from "@/components/brand/brand-logo";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <BrandWatermark
          className="-right-16 -top-10 sm:-right-8 sm:top-8"
          size={480}
        />
        <BrandWatermark
          className="-bottom-24 -left-20 hidden rotate-12 opacity-80 lg:block"
          size={320}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-honey-200/25 to-transparent" />
        <main className="relative flex-1 pb-24 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
