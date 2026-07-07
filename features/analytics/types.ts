export type DashboardMetrics = {
  todayMinutes: number;
  totalMinutes: number;
  completedSessions: number;
  currentStreak: number;
};

export type SessionHistoryItem = {
  id: string;
  subject: string;
  sessionType: "assessment" | "quick";
  durationMinutes: number;
  status: "active" | "paused" | "completed" | "abandoned";
  focusRating: number | null;
  startedAt: string;
};

export type SubjectSummaryItem = {
  subject: string;
  totalMinutes: number;
  sessionCount: number;
};

export type SessionTypeSummary = {
  assessmentCount: number;
  quickCount: number;
};

export type DashboardData = {
  metrics: DashboardMetrics;
  sessionHistory: SessionHistoryItem[];
  subjectSummary: SubjectSummaryItem[];
  sessionTypeSummary: SessionTypeSummary;
};
