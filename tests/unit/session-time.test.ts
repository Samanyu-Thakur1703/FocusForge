import { describe, expect, it } from "vitest";
import { calculateAccumulatedSeconds, calculateElapsedSeconds } from "@/lib/session/session-time";
import { formatSeconds } from "@/hooks/use-focus-timer";

describe("session time foundation", () => {
  it("calculates positive elapsed seconds", () => {
    expect(calculateElapsedSeconds(new Date(0), new Date(1000))).toBe(1);
  });

  it("adds active segment time to accumulated seconds", () => {
    expect(
      calculateAccumulatedSeconds({
        status: "active",
        startedAt: new Date(0),
        now: new Date(5000),
        accumulatedSeconds: 10
      })
    ).toBe(15);
  });

  it("does not add elapsed time while paused", () => {
    expect(
      calculateAccumulatedSeconds({
        status: "paused",
        startedAt: new Date(0),
        now: new Date(5000),
        accumulatedSeconds: 10
      })
    ).toBe(10);
  });

  it("formats countdown values", () => {
    expect(formatSeconds(65)).toBe("01:05");
  });
});
