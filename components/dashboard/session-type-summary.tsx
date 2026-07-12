import type { SessionTypeSummary as SessionTypeSummaryData } from "@/features/analytics/types";

type SessionTypeSummaryProps = {
  summary: SessionTypeSummaryData;
};

export function SessionTypeSummary({ summary }: SessionTypeSummaryProps) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold">Session Types</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-border p-3">
          <p className="text-sm text-muted-foreground">Assessment</p>
          <p className="text-2xl font-semibold">{summary.assessmentCount}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-sm text-muted-foreground">Quick Focus</p>
          <p className="text-2xl font-semibold">{summary.quickCount}</p>
        </div>
      </div>
    </section>
  );
}
