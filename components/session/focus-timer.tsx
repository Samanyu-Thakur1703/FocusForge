"use client";

import { useFocusTimer } from "@/hooks/use-focus-timer";

type FocusTimerProps = {
  sessionId: string;
  durationSeconds: number;
  initialElapsedSeconds: number;
  status: "active" | "paused" | "completed" | "abandoned";
};

export function FocusTimer(props: FocusTimerProps) {
  const timer = useFocusTimer(props);

  return (
    <section className="rounded-md border p-6 text-center">
      <p className="text-sm uppercase tracking-wide">Remaining</p>
      <div className="mt-2 text-6xl font-semibold tabular-nums">{timer.formattedRemaining}</div>
      <p className="mt-2 text-sm">{timer.isRunning ? "Focus sprint active" : "Timer paused"}</p>
    </section>
  );
}
