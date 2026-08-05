import { BrandWatermark } from "@/components/brand/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-honey-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-meadow-400/20 blur-3xl" />
      <BrandWatermark
        className="-right-10 top-6 sm:right-8 sm:top-12"
        size={460}
      />
      <BrandWatermark
        className="-left-16 bottom-4 rotate-[-18deg] opacity-70"
        size={300}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
