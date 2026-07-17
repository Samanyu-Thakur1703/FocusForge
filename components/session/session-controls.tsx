"use client";

import { useActionState } from "react";
import posthog from "posthog-js";
import {
  abandonSessionAction,
  pauseSessionAction,
  resumeSessionAction
} from "@/features/session/actions";
import type { SessionActionState } from "@/features/session/types";

const initialState: SessionActionState = { ok: false };

type SessionControlsProps = {
  sessionId: string;
  status: "active" | "paused" | "completed" | "abandoned";
};

export function SessionControls({ sessionId, status }: SessionControlsProps) {
  const [pauseState, pauseAction, isPausing] = useActionState(pauseSessionAction, initialState);
  const [resumeState, resumeAction, isResuming] = useActionState(resumeSessionAction, initialState);
  const [abandonState, abandonAction, isAbandoning] = useActionState(
    abandonSessionAction,
    initialState
  );
  const message = pauseState.message ?? resumeState.message ?? abandonState.message;

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {status === "active" ? (
          <form action={pauseAction}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <button
              type="submit"
              disabled={isPausing}
              onClick={() => posthog.capture("focus_session_paused", { session_id: sessionId })}
              className="rounded-md border px-4 py-2"
            >
              Pause
            </button>
          </form>
        ) : null}
        {status === "paused" ? (
          <form action={resumeAction}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <button
              type="submit"
              disabled={isResuming}
              onClick={() => posthog.capture("focus_session_resumed", { session_id: sessionId })}
              className="rounded-md border px-4 py-2"
            >
              Resume
            </button>
          </form>
        ) : null}
        {status === "active" || status === "paused" ? (
          <form action={abandonAction}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <button
              type="submit"
              disabled={isAbandoning}
              onClick={() => posthog.capture("focus_session_abandoned", { session_id: sessionId })}
              className="rounded-md border px-4 py-2"
            >
              Abandon
            </button>
          </form>
        ) : null}
      </div>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
