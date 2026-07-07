import type { SubjectSummaryItem } from "@/features/analytics/types";

type SubjectSummaryProps = {
  subjects: SubjectSummaryItem[];
};

export function SubjectSummary({ subjects }: SubjectSummaryProps) {
  return (
    <section className="rounded-md border p-4">
      <h2 className="mb-4 text-lg font-semibold">Subjects</h2>
      {subjects.length === 0 ? (
        <p>No completed study time yet.</p>
      ) : (
        <ul className="space-y-2">
          {subjects.map((subject) => (
            <li key={subject.subject} className="flex items-center justify-between gap-3">
              <span>{subject.subject}</span>
              <span>
                {subject.totalMinutes} min · {subject.sessionCount} sessions
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
