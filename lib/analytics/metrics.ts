import type { FocusSession } from "@/lib/database/repositories/session-repository";
import { getTodayRange, toDateKey } from "@/lib/analytics/date-ranges";
import type {
  DashboardData,
  SessionHistoryItem,
  SessionTypeSummary,
  SubjectSummaryItem
} from "@/features/analytics/types";

export function secondsToMinutes(seconds: number) {
  return Math.floor(seconds / 60);
}

export function completedSessionsOnly(sessions: FocusSession[]) {
  return sessions.filter((session) => session.status === "completed");
}

export function calculateTodayMinutes(sessions: FocusSession[], now = new Date()) {
  const { start, end } = getTodayRange(now);

  return secondsToMinutes(
    completedSessionsOnly(sessions)
      .filter((session) => {
        const startedAt = new Date(session.started_at);
        return startedAt >= start && startedAt < end;
      })
      .reduce((total, session) => total + session.accumulated_seconds, 0)
  );
}

export function calculateTotalMinutes(sessions: FocusSession[]) {
  return secondsToMinutes(
    completedSessionsOnly(sessions).reduce(
      (total, session) => total + session.accumulated_seconds,
      0
    )
  );
}

export function calculateCurrentStreak(sessions: FocusSession[], now = new Date()) {
  const completedDateKeys = new Set(
    completedSessionsOnly(sessions).map((session) => toDateKey(new Date(session.started_at)))
  );

  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  while (completedDateKeys.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function buildSessionHistory(sessions: FocusSession[]): SessionHistoryItem[] {
  return [...sessions]
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .map((session) => ({
      id: session.id,
      subject: session.subject,
      sessionType: session.session_type,
      durationMinutes: secondsToMinutes(session.accumulated_seconds),
      status: session.status,
      focusRating: session.focus_rating,
      startedAt: session.started_at
    }));
}

export function buildSubjectSummary(sessions: FocusSession[]): SubjectSummaryItem[] {
  const bySubject = new Map<string, { totalSeconds: number; sessionCount: number }>();

  for (const session of completedSessionsOnly(sessions)) {
    const current = bySubject.get(session.subject) ?? { totalSeconds: 0, sessionCount: 0 };
    bySubject.set(session.subject, {
      totalSeconds: current.totalSeconds + session.accumulated_seconds,
      sessionCount: current.sessionCount + 1
    });
  }

  return [...bySubject.entries()]
    .map(([subject, summary]) => ({
      subject,
      totalMinutes: secondsToMinutes(summary.totalSeconds),
      sessionCount: summary.sessionCount
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function buildSessionTypeSummary(sessions: FocusSession[]): SessionTypeSummary {
  return completedSessionsOnly(sessions).reduce(
    (summary, session) => {
      if (session.session_type === "assessment") {
        summary.assessmentCount += 1;
      } else {
        summary.quickCount += 1;
      }

      return summary;
    },
    { assessmentCount: 0, quickCount: 0 }
  );
}

export function buildDashboardData(sessions: FocusSession[], now = new Date()): DashboardData {
  const completed = completedSessionsOnly(sessions);

  return {
    metrics: {
      todayMinutes: calculateTodayMinutes(completed, now),
      totalMinutes: calculateTotalMinutes(completed),
      completedSessions: completed.length,
      currentStreak: calculateCurrentStreak(completed, now)
    },
    sessionHistory: buildSessionHistory(sessions),
    subjectSummary: buildSubjectSummary(completed),
    sessionTypeSummary: buildSessionTypeSummary(completed)
  };
}
