type SessionStatusBadgeProps = {
  status: "active" | "paused" | "completed" | "abandoned";
};

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  return <span className="rounded-md border px-2 py-1 text-sm capitalize">{status}</span>;
}
