"use client";

import { useEffect, useMemo } from "react";
import { useFocusSessionStore } from "@/stores/focus-session-store";

type UseFocusTimerInput = {
  sessionId: string;
  durationSeconds: number;
  initialElapsedSeconds: number;
  status: "active" | "paused" | "completed" | "abandoned";
};

export function useFocusTimer({
  sessionId,
  durationSeconds,
  initialElapsedSeconds,
  status
}: UseFocusTimerInput) {
  const elapsedSeconds = useFocusSessionStore((state) => state.elapsedSeconds);
  const isRunning = useFocusSessionStore((state) => state.isRunning);
  const setActiveSessionId = useFocusSessionStore((state) => state.setActiveSessionId);
  const setElapsedSeconds = useFocusSessionStore((state) => state.setElapsedSeconds);
  const setIsRunning = useFocusSessionStore((state) => state.setIsRunning);

  useEffect(() => {
    setActiveSessionId(sessionId);
    setElapsedSeconds(initialElapsedSeconds);
    setIsRunning(status === "active");
  }, [initialElapsedSeconds, sessionId, setActiveSessionId, setElapsedSeconds, setIsRunning, status]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(useFocusSessionStore.getState().elapsedSeconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, setElapsedSeconds]);

  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

  return useMemo(
    () => ({
      elapsedSeconds,
      remainingSeconds,
      isRunning,
      isComplete: remainingSeconds === 0,
      formattedRemaining: formatSeconds(remainingSeconds)
    }),
    [elapsedSeconds, isRunning, remainingSeconds]
  );
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
