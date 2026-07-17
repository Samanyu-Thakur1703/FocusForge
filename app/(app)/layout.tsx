import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PostHogIdentifier } from "@/components/analytics/posthog-identifier";
import { AuthService } from "@/features/auth/service";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const user = await new AuthService(supabase).getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <PostHogIdentifier userId={user.id} email={user.email ?? ""} />
      {children}
    </AppShell>
  );
}
