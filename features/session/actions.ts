"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthService } from "@/features/auth/service";
import {
  InvalidSessionTransitionError,
  ProtocolOwnershipError,
  SessionNotFoundError,
  SessionService
} from "@/features/session/service";
import type { SessionActionState } from "@/features/session/types";
import { ProtocolRepository } from "@/lib/database/repositories/protocol-repository";
import { SessionRepository } from "@/lib/database/repositories/session-repository";
import { StaleSessionTransitionError } from "@/lib/database/repositories/session-repository";
import { createClient } from "@/lib/supabase/server";
import {
  createSessionSchema,
  reflectionSchema,
  sessionIdSchema
} from "@/lib/validation/session.schema";
import { getPostHogClient } from "@/lib/posthog-server";

function formDataValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getSessionFeatureService() {
  const supabase = await createClient();
  return {
    auth: new AuthService(supabase),
    sessions: new SessionService({
      repository: new SessionRepository(supabase),
      protocols: new ProtocolRepository(supabase)
    })
  };
}

async function requireUser() {
  const { auth, sessions } = await getSessionFeatureService();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return { user, sessions };
}

function sessionActionError(error: unknown): SessionActionState {
  if (
    error instanceof InvalidSessionTransitionError ||
    error instanceof SessionNotFoundError ||
    error instanceof StaleSessionTransitionError ||
    error instanceof ProtocolOwnershipError
  ) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Unable to update focus session." };
}

export async function startSessionAction(formData: FormData) {
  const parsed = createSessionSchema.safeParse({
    protocolId: formDataValue(formData, "protocolId"),
    sessionType: formDataValue(formData, "sessionType"),
    subject: formDataValue(formData, "subject")
  });

  if (!parsed.success) {
    redirect("/check-in");
  }

  const { user, sessions } = await requireUser();

  try {
    const session = await sessions.createSession(user.id, parsed.data);

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "focus_session_started",
      properties: {
        session_id: session.id,
        session_type: parsed.data.sessionType
      }
    });
    await posthog.flush();

    redirect(`/focus/${session.id}`);
  } catch (error) {
    if (error instanceof ProtocolOwnershipError) {
      redirect("/check-in");
    }

    throw error;
  }
}

export async function pauseSessionAction(
  _previousState: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const parsed = sessionIdSchema.safeParse({ sessionId: formDataValue(formData, "sessionId") });

  if (!parsed.success) {
    return { ok: false, message: "Invalid session." };
  }

  const { user, sessions } = await requireUser();

  try {
    await sessions.pause(user.id, parsed.data.sessionId);
    revalidatePath(`/focus/${parsed.data.sessionId}`);
    return { ok: true, message: "Session paused." };
  } catch (error) {
    return sessionActionError(error);
  }
}

export async function resumeSessionAction(
  _previousState: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const parsed = sessionIdSchema.safeParse({ sessionId: formDataValue(formData, "sessionId") });

  if (!parsed.success) {
    return { ok: false, message: "Invalid session." };
  }

  const { user, sessions } = await requireUser();

  try {
    await sessions.resume(user.id, parsed.data.sessionId);
    revalidatePath(`/focus/${parsed.data.sessionId}`);
    return { ok: true, message: "Session resumed." };
  } catch (error) {
    return sessionActionError(error);
  }
}

export async function abandonSessionAction(
  _previousState: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const parsed = sessionIdSchema.safeParse({ sessionId: formDataValue(formData, "sessionId") });

  if (!parsed.success) {
    return { ok: false, message: "Invalid session." };
  }

  const { user, sessions } = await requireUser();

  try {
    await sessions.abandon(user.id, parsed.data.sessionId);
    revalidatePath(`/focus/${parsed.data.sessionId}`);
    return { ok: true, message: "Session abandoned." };
  } catch (error) {
    return sessionActionError(error);
  }
}

export async function completeSessionAction(
  _previousState: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const parsed = reflectionSchema.safeParse({
    sessionId: formDataValue(formData, "sessionId"),
    focusRating: formDataValue(formData, "focusRating"),
    goalCompleted: formDataValue(formData, "goalCompleted"),
    reflectionNote: formDataValue(formData, "reflectionNote")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid reflection." };
  }

  const { user, sessions } = await requireUser();

  try {
    await sessions.complete(user.id, parsed.data);

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "focus_session_completed",
      properties: {
        session_id: parsed.data.sessionId,
        focus_rating: parsed.data.focusRating,
        goal_completed: parsed.data.goalCompleted
      }
    });
    await posthog.flush();

    revalidatePath(`/focus/${parsed.data.sessionId}`);
    return { ok: true, message: "Session completed." };
  } catch (error) {
    return sessionActionError(error);
  }
}
