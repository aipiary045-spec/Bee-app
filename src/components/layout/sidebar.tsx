"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Hexagon,
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hives", label: "Hives", icon: Hexagon },
  { href: "/inspect", label: "Quick Log", icon: ClipboardList },
  { href: "/expenses", label: "Expenses", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-wax-300/50 lg:bg-wax-100/40">
      <div className="flex h-16 items-center gap-3 border-b border-wax-300/50 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-honey-500 shadow-sm">
          <Hexagon className="h-5 w-5 text-wax-950" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-tight text-hive-900">
            Apiary
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-hive-500">
            Agra, Oklahoma
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-honey-500/15 text-hive-900 shadow-sm ring-1 ring-honey-400/30"
                  : "text-hive-600 hover:bg-wax-200/60 hover:text-hive-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-wax-300/50 p-4">
        <div className="rounded-lg bg-gradient-to-br from-honey-100 to-wax-200 p-4">
          <p className="font-display text-sm font-semibold text-hive-800">
            Field Season
          </p>
          <p className="mt-1 text-xs leading-relaxed text-hive-600">
            Log inspections on-site with Quick Log — works great on mobile.
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-wax-300/60 bg-wax-50/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-honey-700" : "text-hive-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-honey-600")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
