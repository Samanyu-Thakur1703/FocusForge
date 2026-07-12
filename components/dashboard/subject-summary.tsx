import type { SubjectSummaryItem } from "@/features/analytics/types";
import Link from "next/link";

type SubjectSummaryProps = {
  subjects: SubjectSummaryItem[];
};

export function SubjectSummary({ subjects }: SubjectSummaryProps) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">Subjects</h2>
      {subjects.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-border p-5">
          <p className="font-medium">No study subjects yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete your first focus session to see your progress and insights.
          </p>
          <Link
            href="/check-in"
            className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Begin a session
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {subjects.map((subject) => (
            <li
              key={subject.subject}
              className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
            >
              <span className="font-medium">{subject.subject}</span>
              <span className="text-sm text-muted-foreground">
                {subject.totalMinutes} min · {subject.sessionCount} sessions
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
