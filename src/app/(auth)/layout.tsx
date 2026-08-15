import { BrandWatermark } from "@/components/brand/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
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
