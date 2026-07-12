"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bolt, ClipboardCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/check-in", label: "Check-In", icon: ClipboardCheck },
  { href: "/quick-focus", label: "Quick", icon: Bolt },
  { href: "/profile", label: "Profile", icon: User }
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
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
