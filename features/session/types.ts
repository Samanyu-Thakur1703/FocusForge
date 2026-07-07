export type SessionActionState = {
  ok: boolean;
  message?: string;
};

export type SessionStatus = "active" | "paused" | "completed" | "abandoned";

export type SessionLifecycleResult = {
  ok: boolean;
  sessionId?: string;
  message?: string;
};
