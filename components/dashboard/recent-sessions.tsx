import type { SessionHistoryItem } from "@/features/analytics/types";
import Link from "next/link";

type RecentSessionsProps = {
  sessions: SessionHistoryItem[];
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">Session History</h2>
      {sessions.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-border p-5">
          <p className="font-medium">No focus sessions yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate a protocol and complete your first study session.
          </p>
          <Link
            href="/check-in"
            className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Go to Check-In
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-md border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <strong>{session.subject}</strong>
                <span className="text-sm capitalize text-muted-foreground">{session.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
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
