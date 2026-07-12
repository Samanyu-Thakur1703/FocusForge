"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bolt, ClipboardCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/check-in", label: "Check-In", icon: ClipboardCheck },
  { href: "/quick-focus", label: "Quick Focus", icon: Bolt },
  { href: "/profile", label: "Profile", icon: User }
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden w-64 shrink-0 border-r border-border/70 bg-card/40 px-4 py-6 md:block">
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
