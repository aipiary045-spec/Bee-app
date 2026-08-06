"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Hexagon,
  LayoutDashboard,
  DollarSign,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hives", label: "Hives", icon: Hexagon },
  { href: "/finances", label: "Finances", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-wax-300/40 lg:bg-gradient-to-b lg:from-wax-50/90 lg:via-wax-100/70 lg:to-honey-100/30 lg:backdrop-blur-md">
      <div className="relative overflow-hidden border-b border-wax-300/40 px-6 py-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px shimmer-line" />
        <div className="flex items-center gap-3">
          <BrandLogo size={48} className="h-12 w-12" priority />
          <div>
            <p className="font-display text-xl font-bold leading-tight text-hive-900">
              Apiary
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              Agra, Oklahoma
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-honey-500/18 text-hive-900 shadow-sm ring-1 ring-honey-400/35"
                  : "text-hive-600 hover:bg-wax-200/70 hover:text-hive-900"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-honey-500/25 text-honey-800"
                    : "bg-wax-200/60 text-hive-500 group-hover:text-hive-800"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-wax-300/40 p-4">
        <div className="relative overflow-hidden rounded-2xl border border-honey-300/40 bg-gradient-to-br from-honey-100 via-wax-100 to-meadow-100/40 p-4">
          <div className="pointer-events-none absolute -right-4 -top-3 opacity-20">
            <BrandLogo size={72} className="h-16 w-16" alt="" />
          </div>
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-honey-400/25 blur-2xl" />
          <p className="font-display relative text-sm font-semibold text-hive-800">
            Field Season
          </p>
          <p className="relative mt-1.5 text-xs leading-relaxed text-hive-600">
            Log inspections from the dashboard Quick Log link — built for gloves
            and Oklahoma yards.
          </p>
        </div>
        <SignOutButton className="w-full" />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-wax-300/50 bg-wax-50/90 shadow-[0_-8px_30px_-18px_rgba(61,42,20,0.35)] backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[4.25rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold tracking-wide transition-all",
                active
                  ? "bg-honey-500/15 text-honey-800"
                  : "text-hive-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-honey-700")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
