import { describe, expect, it } from "vitest";
import {
  InvalidSessionTransitionError,
  SessionService
} from "@/features/session/service";
import { StaleSessionTransitionError } from "@/lib/database/repositories/session-repository";
import type { FocusSession } from "@/lib/database/repositories/session-repository";

function makeSession(overrides: Partial<FocusSession> = {}): FocusSession {
  return {
    id: "session-id",
    user_id: "user-id",
    protocol_id: "protocol-id",
    session_type: "assessment",
    subject: "Operating Systems",
    status: "active",
    started_at: new Date(0).toISOString(),
    paused_at: null,
    ended_at: null,
    accumulated_seconds: 0,
    focus_rating: null,
    goal_completed: null,
    reflection_note: null,
    created_at: new Date(0).toISOString(),
    ...overrides
  };
}

function makeRepository(session: FocusSession | null = makeSession()) {
  const updates: unknown[] = [];
  const creates: unknown[] = [];

  return {
    updates,
    creates,
    repository: {
      async create(input: unknown) {
        creates.push(input);
        return makeSession(input as Partial<FocusSession>);
      },
      async findByIdForUser() {
        return session;
      },
      async updateForUser(_sessionId: string, _userId: string, patch: Partial<FocusSession>) {
        updates.push(patch);
        return makeSession({ ...session, ...patch });
      },
      async updateForUserWithExpectedStatuses(
        _sessionId: string,
        _userId: string,
        expectedStatuses: Array<FocusSession["status"]>,
        patch: Partial<FocusSession>
      ) {
        if (session && !expectedStatuses.includes(session.status)) {
          return makeSession(session);
        }

        updates.push(patch);
        return makeSession({ ...session, ...patch });
      }
    }
  };
}

describe("session service", () => {
  it("creates active sessions from protocol metadata", async () => {
    const fake = makeRepository();
    const service = new SessionService({
      repository: fake.repository,
      protocols: {
        async findByIdForUser() {
          return {
            id: "protocol-id",
            user_id: "user-id",
            problem_statement: null,
            symptom_keys: [],
            title: "Protocol",
            coach_message: "Message",
            steps: [],
            sprint_minutes: 25,
            break_minutes: 5,
            protocol_version: "v1",
            provider: "rule_based",
            provider_metadata: {},
            created_at: new Date(0).toISOString()
          };
        }
      },
      now: () => new Date(1000)
    });

    await service.createSession("user-id", {
      protocolId: "protocol-id",
      subject: "Discrete Mathematics",
      sessionType: "quick"
    });

    expect(fake.creates[0]).toMatchObject({
      user_id: "user-id",
      protocol_id: "protocol-id",
      subject: "Discrete Mathematics",
      session_type: "quick",
      status: "active"
    });
  });

  it("pauses active sessions and persists accumulated seconds", async () => {
    const fake = makeRepository(makeSession({ started_at: new Date(0).toISOString() }));
    const service = new SessionService({
      repository: fake.repository,
      now: () => new Date(3000)
    });

    await service.pause("user-id", "session-id");

    expect(fake.updates[0]).toMatchObject({
      status: "paused",
      accumulated_seconds: 3
    });
  });

  it("prevents invalid transitions from completed sessions", async () => {
    const fake = makeRepository(makeSession({ status: "completed" }));
    const service = new SessionService({ repository: fake.repository });

    await expect(service.pause("user-id", "session-id")).rejects.toBeInstanceOf(
      InvalidSessionTransitionError
    );
  });

  it("surfaces stale transition failures from guarded repository updates", async () => {
    const session = makeSession({ status: "active" });
    const service = new SessionService({
      repository: {
        async create() {
          return session;
        },
        async findByIdForUser() {
          return session;
        },
        async updateForUser() {
          return session;
        },
        async updateForUserWithExpectedStatuses() {
          throw new StaleSessionTransitionError();
        }
      }
    });

    await expect(service.pause("user-id", "session-id")).rejects.toBeInstanceOf(
      StaleSessionTransitionError
    );
  });

  it("completes sessions with required reflection fields", async () => {
    const fake = makeRepository(makeSession({ started_at: new Date(0).toISOString() }));
    const service = new SessionService({
      repository: fake.repository,
      now: () => new Date(5000)
    });

    await service.complete("user-id", {
      sessionId: "session-id",
      focusRating: 5,
      goalCompleted: true,
      reflectionNote: "Done"
    });

    expect(fake.updates[0]).toMatchObject({
      status: "completed",
      accumulated_seconds: 5,
      focus_rating: 5,
      goal_completed: true,
      reflection_note: "Done"
    });
  });

  it("rejects session creation when protocol ownership validation fails", async () => {
    const fake = makeRepository();
    const service = new SessionService({
      repository: fake.repository,
      protocols: {
        async findByIdForUser() {
          return null;
        }
      }
    });

    await expect(
      service.createSession("user-id", {
        protocolId: "other-protocol-id",
        subject: "Operating Systems",
        sessionType: "assessment"
      })
    ).rejects.toThrow("Protocol does not belong");
  });
});
