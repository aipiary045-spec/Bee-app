"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Camera,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  PawPrint,
  Receipt,
  Shield,
  Users,
  Briefcase,
  Inbox,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/traps", label: "Traps", icon: PawPrint },
  { href: "/captures", label: "Logs", icon: ClipboardList },
  { href: "/compliance", label: "Compliance", icon: Shield },
  { href: "/photos", label: "Photos", icon: Camera },
];

export function OpsNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-card">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <BrandMark size={42} />
        <div>
          <p className="text-sm font-semibold leading-tight">The Wildlife Pros</p>
          <p className="text-xs text-muted">CritterOps</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-green/10 text-green-dark" : "text-ink/80 hover:bg-paper"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4">
        <p className="mb-2 text-xs text-muted">{userName}</p>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-paper"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
