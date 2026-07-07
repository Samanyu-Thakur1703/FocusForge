type MetricCardProps = {
  label: string;
  value: string | number;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <section className="rounded-md border p-4">
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </section>
  );
}
