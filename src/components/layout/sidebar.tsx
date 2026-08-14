"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  DollarSign,
  Hexagon,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/inspect", label: "Quick Log", icon: ClipboardList, featured: true },
  { href: "/hives", label: "Hives", icon: Hexagon },
  { href: "/finances", label: "Finances", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-wax-300/40 lg:bg-gradient-to-b lg:from-wax-50/90 lg:via-wax-100/70 lg:to-honey-100/30 lg:backdrop-blur-md">
      <div className="relative overflow-hidden border-b border-wax-300/40 px-6 py-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px shimmer-line" />
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size={48} className="h-12 w-12" priority />
          <div>
            <p className="font-display text-xl font-bold leading-tight text-hive-900">
              Apiary
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              Agra, Oklahoma
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 p-4">
        {navItems.map(({ href, label, icon: Icon, featured }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                featured && !active && "bg-honey-500/10 ring-1 ring-honey-400/25",
                active
                  ? "bg-honey-500/18 text-hive-900 shadow-sm ring-1 ring-honey-400/35"
                  : "text-hive-600 hover:bg-wax-200/70 hover:text-hive-900"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  featured && !active && "brand-mark text-wax-50",
                  active
                    ? "bg-honey-500/25 text-honey-800"
                    : !featured && "bg-wax-200/60 text-hive-500 group-hover:text-hive-800"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-wax-300/40 p-4">
        <SignOutButton className="w-full" />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-wax-300/50 bg-wax-50/90 shadow-[0_-8px_30px_-18px_rgba(61,42,20,0.35)] backdrop-blur-xl lg:hidden">
      <div className="flex items-end justify-around px-1 py-2">
        {navItems.map(({ href, label, icon: Icon, featured }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[3.6rem] flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-[10px] font-semibold tracking-wide transition-all",
                featured && "-mt-3",
                active && !featured && "bg-honey-500/15 text-honey-800",
                !active && !featured && "text-hive-500"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center",
                  featured
                    ? "brand-mark h-12 w-12 rounded-2xl text-wax-50 shadow-md"
                    : "h-6 w-6",
                  active && featured && "ring-2 ring-honey-300"
                )}
              >
                <Icon className={cn(featured ? "h-5 w-5" : "h-5 w-5", active && !featured && "text-honey-700")} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
