import { redirect } from "next/navigation";
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
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Simple progress from completed focus sessions.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Today's focus minutes" value={dashboard.metrics.todayMinutes} />
        <MetricCard label="Total focus minutes" value={dashboard.metrics.totalMinutes} />
        <MetricCard label="Completed sessions" value={dashboard.metrics.completedSessions} />
        <MetricCard label="Current streak" value={`${dashboard.metrics.currentStreak} days`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <SubjectSummary subjects={dashboard.subjectSummary} />
          <SessionTypeSummary summary={dashboard.sessionTypeSummary} />
        </div>
        <RecentSessions sessions={dashboard.sessionHistory} />
      </div>
    </main>
  );
}
