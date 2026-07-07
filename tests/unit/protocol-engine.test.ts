import { describe, expect, it } from "vitest";
import { ProtocolService } from "@/lib/protocol-engine/protocol-service";
import { RuleBasedProtocolProvider } from "@/lib/protocol-engine/rule-based-provider";
import type { Protocol } from "@/lib/database/repositories/protocol-repository";

const provider = new RuleBasedProtocolProvider();

describe("rule-based protocol provider", () => {
  it("generates deterministic rules for every MVP symptom", () => {
    const symptoms = [
      "cant_start",
      "phone_distraction",
      "social_media",
      "sleepiness",
      "anxiety",
      "mind_wandering",
      "low_motivation",
      "burnout",
      "overwhelm"
    ] as const;

    for (const symptom of symptoms) {
      const protocol = provider.generateAssessmentProtocol({
        mode: "assessment",
        subject: "Operating Systems",
        symptomKeys: [symptom]
      });

      expect(protocol.steps.length).toBeGreaterThan(0);
      expect(protocol.steps.length).toBeLessThanOrEqual(6);
      expect(protocol.symptomKeys).toEqual([symptom]);
    }
  });

  it("prioritizes sleepiness with a shorter sprint", () => {
    const protocol = provider.generateAssessmentProtocol({
      mode: "assessment",
      subject: "Discrete Mathematics",
      symptomKeys: ["sleepiness", "phone_distraction", "anxiety"]
    });

    expect(protocol.sprintMinutes).toBe(10);
    expect(protocol.steps.length).toBeLessThanOrEqual(6);
    expect(protocol.steps[0]?.title).toBe("Block the distraction loop");
  });

  it("generates the default Quick Focus protocol without symptoms", () => {
    const protocol = provider.generateQuickProtocol({
      mode: "quick",
      subject: "AI Algorithms"
    });

    expect(protocol.title).toBe("25-Minute Focus Sprint");
    expect(protocol.symptomKeys).toEqual([]);
    expect(protocol.sprintMinutes).toBe(25);
    expect(protocol.steps.length).toBeLessThanOrEqual(6);
  });
});

describe("protocol service", () => {
  it("validates and persists immutable protocol snapshots", async () => {
    const created: unknown[] = [];
    const repository = {
      async create(input: unknown) {
        created.push(input);
        return {
          id: "protocol-id",
          user_id: "user-id",
          problem_statement: null,
          symptom_keys: [],
          title: "25-Minute Focus Sprint",
          coach_message: "message",
          steps: [],
          sprint_minutes: 25,
          break_minutes: 5,
          protocol_version: "v1",
          provider: "rule_based",
          provider_metadata: {},
          created_at: new Date(0).toISOString()
        } satisfies Protocol;
      },
      async createWithSession(input: unknown) {
        created.push(input);
        return {
          protocolId: "protocol-id",
          sessionId: "session-id"
        };
      }
    };

    const service = new ProtocolService({ repository });
    const protocol = await service.createQuickProtocol("user-id", {
      mode: "quick",
      subject: "C Programming"
    });

    expect(protocol.id).toBe("protocol-id");
    expect(created[0]).toMatchObject({
      user_id: "user-id",
      provider: "rule_based",
      protocol_version: "v1",
      symptom_keys: [],
      sprint_minutes: 25,
      break_minutes: 5
    });
  });

  it("persists protocol and session through the atomic creation path", async () => {
    const created: unknown[] = [];
    const repository = {
      async create() {
        throw new Error("create should not be called by atomic path");
      },
      async createWithSession(input: unknown) {
        created.push(input);
        return {
          protocolId: "protocol-id",
          sessionId: "session-id"
        };
      }
    };

    const service = new ProtocolService({ repository });
    const result = await service.createAssessmentProtocolWithSession("user-id", {
      mode: "assessment",
      subject: "Operating Systems",
      symptomKeys: ["mind_wandering"]
    });

    expect(result).toEqual({ protocolId: "protocol-id", sessionId: "session-id" });
    expect(created[0]).toMatchObject({
      user_id: "user-id",
      subject: "Operating Systems",
      session_type: "assessment",
      provider: "rule_based",
      protocol_version: "v1"
    });
  });
});
