import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          FocusForge
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Logout
          </button>
        </form>
      </header>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <SidebarNav />
        <main className="w-full px-4 py-6 pb-24 md:px-8 md:py-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
