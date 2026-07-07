import { logoutAction } from "@/features/auth/actions";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between">
        <a href="/dashboard">FocusForge</a>
        <form action={logoutAction}>
          <button type="submit">Logout</button>
        </form>
      </header>
      {children}
    </div>
  );
}
