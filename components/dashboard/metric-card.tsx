type MetricCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
};

export function MetricCard({ label, value, helperText }: MetricCardProps) {
  return (
    <section className="flex min-h-32 flex-col justify-between rounded-md border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {helperText ? <p className="mt-2 text-sm text-muted-foreground">{helperText}</p> : null}
      </div>
    </section>
  );
}
