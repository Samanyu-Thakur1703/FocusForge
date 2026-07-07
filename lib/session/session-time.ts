export function calculateElapsedSeconds(startedAt: Date, endedAt: Date) {
  return Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000));
}

export function calculateAccumulatedSeconds(input: {
  status: "active" | "paused" | "completed" | "abandoned";
  startedAt: Date;
  accumulatedSeconds: number;
  now: Date;
}) {
  if (input.status !== "active") {
    return input.accumulatedSeconds;
  }

  return input.accumulatedSeconds + calculateElapsedSeconds(input.startedAt, input.now);
}
