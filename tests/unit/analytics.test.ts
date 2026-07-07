import { describe, expect, it } from "vitest";
import {
  buildDashboardData,
  buildSessionTypeSummary,
  buildSubjectSummary,
  calculateCurrentStreak,
  secondsToMinutes
} from "@/lib/analytics/metrics";
import type { FocusSession } from "@/lib/database/repositories/session-repository";

function makeSession(overrides: Partial<FocusSession>): FocusSession {
  return {
    id: "session-id",
    user_id: "user-id",
    protocol_id: "protocol-id",
    session_type: "assessment",
    subject: "Operating Systems",
    status: "completed",
    started_at: "2026-06-09T08:00:00.000Z",
    paused_at: null,
    ended_at: "2026-06-09T08:25:00.000Z",
    accumulated_seconds: 1500,
    focus_rating: 4,
    goal_completed: true,
    reflection_note: null,
    created_at: "2026-06-09T08:00:00.000Z",
    ...overrides
  };
}

describe("analytics foundation", () => {
  it("converts seconds to whole minutes", () => {
    expect(secondsToMinutes(125)).toBe(2);
  });

  it("calculates current streak from completed sessions", () => {
    expect(
      calculateCurrentStreak(
        [
          makeSession({ started_at: "2026-06-09T08:00:00.000Z" }),
          makeSession({ started_at: "2026-06-08T08:00:00.000Z" }),
          makeSession({ started_at: "2026-06-07T08:00:00.000Z" }),
          makeSession({ started_at: "2026-06-05T08:00:00.000Z" })
        ],
        new Date("2026-06-09T12:00:00.000Z")
      )
    ).toBe(3);
  });

  it("ignores abandoned sessions for dashboard study metrics", () => {
    const dashboard = buildDashboardData(
      [
        makeSession({ accumulated_seconds: 1500 }),
        makeSession({ status: "abandoned", accumulated_seconds: 9999, focus_rating: null })
      ],
      new Date("2026-06-09T12:00:00.000Z")
    );

    expect(dashboard.metrics.todayMinutes).toBe(25);
    expect(dashboard.metrics.totalMinutes).toBe(25);
    expect(dashboard.metrics.completedSessions).toBe(1);
  });

  it("builds subject summaries sorted by most studied", () => {
    expect(
      buildSubjectSummary([
        makeSession({ subject: "C Programming", accumulated_seconds: 1200 }),
        makeSession({ subject: "Operating Systems", accumulated_seconds: 3000 }),
        makeSession({ subject: "C Programming", accumulated_seconds: 600 })
      ])
    ).toEqual([
      { subject: "Operating Systems", totalMinutes: 50, sessionCount: 1 },
      { subject: "C Programming", totalMinutes: 30, sessionCount: 2 }
    ]);
  });

  it("builds completed session type summaries", () => {
    expect(
      buildSessionTypeSummary([
        makeSession({ session_type: "assessment" }),
        makeSession({ session_type: "quick" }),
        makeSession({ session_type: "quick" }),
        makeSession({ session_type: "quick", status: "abandoned" })
      ])
    ).toEqual({ assessmentCount: 1, quickCount: 2 });
  });
});
