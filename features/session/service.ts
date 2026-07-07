import type {
  FocusSession,
  FocusSessionInsert,
  SessionRepository
} from "@/lib/database/repositories/session-repository";
import type { ProtocolRepository } from "@/lib/database/repositories/protocol-repository";
import { calculateAccumulatedSeconds } from "@/lib/session/session-time";
import type { CreateSessionInput, ReflectionInput } from "@/lib/validation/session.schema";

type SessionServiceOptions = {
  repository: Pick<
    SessionRepository,
    "create" | "findByIdForUser" | "updateForUser" | "updateForUserWithExpectedStatuses"
  >;
  protocols?: Pick<ProtocolRepository, "findByIdForUser">;
  now?: () => Date;
};

type Transition = "pause" | "resume" | "complete" | "abandon";

const allowedTransitions: Record<FocusSession["status"], Transition[]> = {
  active: ["pause", "complete", "abandon"],
  paused: ["resume", "complete", "abandon"],
  completed: [],
  abandoned: []
};

export class InvalidSessionTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSessionTransitionError";
  }
}

export class SessionNotFoundError extends Error {
  constructor() {
    super("Focus session not found.");
    this.name = "SessionNotFoundError";
  }
}

export class ProtocolOwnershipError extends Error {
  constructor() {
    super("Protocol does not belong to the authenticated user.");
    this.name = "ProtocolOwnershipError";
  }
}

export class SessionService {
  private readonly now: () => Date;

  constructor(private readonly options: SessionServiceOptions) {
    this.now = options.now ?? (() => new Date());
  }

  async createSession(userId: string, input: CreateSessionInput): Promise<FocusSession> {
    if (input.protocolId) {
      const protocol = await this.options.protocols?.findByIdForUser(input.protocolId, userId);

      if (!protocol) {
        throw new ProtocolOwnershipError();
      }
    }

    const session: FocusSessionInsert = {
      user_id: userId,
      protocol_id: input.protocolId ?? null,
      session_type: input.sessionType,
      subject: input.subject,
      status: "active",
      started_at: this.now().toISOString()
    };

    return this.options.repository.create(session);
  }

  async getSession(userId: string, sessionId: string): Promise<FocusSession | null> {
    return this.options.repository.findByIdForUser(sessionId, userId);
  }

  async pause(userId: string, sessionId: string): Promise<FocusSession> {
    const session = await this.requireSession(userId, sessionId);
    this.assertTransition(session, "pause");

    const now = this.now();
    const accumulatedSeconds = this.accumulatedSeconds(session, now);

    return this.options.repository.updateForUserWithExpectedStatuses(sessionId, userId, ["active"], {
      status: "paused",
      paused_at: now.toISOString(),
      accumulated_seconds: accumulatedSeconds
    });
  }

  async resume(userId: string, sessionId: string): Promise<FocusSession> {
    const session = await this.requireSession(userId, sessionId);
    this.assertTransition(session, "resume");

    return this.options.repository.updateForUserWithExpectedStatuses(sessionId, userId, ["paused"], {
      status: "active",
      started_at: this.now().toISOString(),
      paused_at: null
    });
  }

  async complete(userId: string, input: ReflectionInput): Promise<FocusSession> {
    const session = await this.requireSession(userId, input.sessionId);
    this.assertTransition(session, "complete");

    const now = this.now();
    const accumulatedSeconds = this.accumulatedSeconds(session, now);

    return this.options.repository.updateForUserWithExpectedStatuses(
      input.sessionId,
      userId,
      ["active", "paused"],
      {
        status: "completed",
        ended_at: now.toISOString(),
        paused_at: null,
        accumulated_seconds: accumulatedSeconds,
        focus_rating: input.focusRating,
        goal_completed: input.goalCompleted,
        reflection_note: input.reflectionNote ?? null
      }
    );
  }

  async abandon(userId: string, sessionId: string): Promise<FocusSession> {
    const session = await this.requireSession(userId, sessionId);
    this.assertTransition(session, "abandon");

    const now = this.now();
    const accumulatedSeconds = this.accumulatedSeconds(session, now);

    return this.options.repository.updateForUserWithExpectedStatuses(
      sessionId,
      userId,
      ["active", "paused"],
      {
        status: "abandoned",
        ended_at: now.toISOString(),
        paused_at: null,
        accumulated_seconds: accumulatedSeconds
      }
    );
  }

  private async requireSession(userId: string, sessionId: string) {
    const session = await this.options.repository.findByIdForUser(sessionId, userId);

    if (!session) {
      throw new SessionNotFoundError();
    }

    return session;
  }

  private assertTransition(session: FocusSession, transition: Transition) {
    if (!allowedTransitions[session.status].includes(transition)) {
      throw new InvalidSessionTransitionError(
        `Cannot ${transition} a session with status ${session.status}.`
      );
    }
  }

  private accumulatedSeconds(session: FocusSession, now: Date) {
    return calculateAccumulatedSeconds({
      status: session.status,
      startedAt: new Date(session.started_at),
      accumulatedSeconds: session.accumulated_seconds,
      now
    });
  }
}
