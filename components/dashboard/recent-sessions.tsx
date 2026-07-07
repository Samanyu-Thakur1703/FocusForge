import type { SessionHistoryItem } from "@/features/analytics/types";

type RecentSessionsProps = {
  sessions: SessionHistoryItem[];
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <section className="rounded-md border p-4">
      <h2 className="mb-4 text-lg font-semibold">Session History</h2>
      {sessions.length === 0 ? (
        <p>No sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <strong>{session.subject}</strong>
                <span className="capitalize">{session.status}</span>
              </div>
              <p className="text-sm">
                {session.sessionType === "quick" ? "Quick Focus" : "Assessment"} ·{" "}
                {session.durationMinutes} min · Rating {session.focusRating ?? "-"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
