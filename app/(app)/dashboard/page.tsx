import { redirect } from "next/navigation";
import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { SessionTypeSummary } from "@/components/dashboard/session-type-summary";
import { SubjectSummary } from "@/components/dashboard/subject-summary";
import { AuthService } from "@/features/auth/service";
import { AnalyticsService } from "@/features/analytics/service";
import { SessionRepository } from "@/lib/database/repositories/session-repository";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return <DashboardContent />;
}

async function DashboardContent() {
  const supabase = await createClient();
  const user = await new AuthService(supabase).getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const dashboard = await new AnalyticsService({
    sessions: new SessionRepository(supabase)
  }).getDashboardData(user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Track completed focus sessions and study patterns.
          </p>
        </div>
        <Link
          href="/check-in"
          className="inline-flex w-fit rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Start Focus Session
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Today's focus minutes"
          value={dashboard.metrics.todayMinutes}
          helperText={dashboard.metrics.todayMinutes === 0 ? "Your study journey starts here." : undefined}
        />
        <MetricCard
          label="Total focus minutes"
          value={dashboard.metrics.totalMinutes}
          helperText={dashboard.metrics.totalMinutes === 0 ? "Build momentum one session at a time." : undefined}
        />
        <MetricCard
          label="Completed sessions"
          value={dashboard.metrics.completedSessions}
          helperText={dashboard.metrics.completedSessions === 0 ? "Complete your first session to begin." : undefined}
        />
        <MetricCard
          label="Current streak"
          value={`${dashboard.metrics.currentStreak} days`}
          helperText={dashboard.metrics.currentStreak === 0 ? "A streak begins after a completed session." : undefined}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <SubjectSummary subjects={dashboard.subjectSummary} />
          <SessionTypeSummary summary={dashboard.sessionTypeSummary} />
        </div>
        <RecentSessions sessions={dashboard.sessionHistory} />
      </div>
    </div>
  );
}
