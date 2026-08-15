import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/welcome" className="flex items-center gap-3">
          <BrandLogo size={42} className="h-11 w-11" priority />
          <div>
            <p className="font-display text-xl font-bold leading-none text-hive-900">
              Apiary
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              For the stand
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
