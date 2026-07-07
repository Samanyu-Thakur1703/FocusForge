import { ProtocolService } from "@/lib/protocol-engine/protocol-service";
import type { ProtocolRequestInput } from "@/lib/validation/protocol.schema";

export class ProtocolFeatureService {
  constructor(private readonly protocols: ProtocolService) {}

  async createProtocol(userId: string, input: ProtocolRequestInput) {
    if (input.sessionType === "quick") {
      return this.protocols.createQuickProtocol(userId, {
        mode: "quick",
        subject: input.subject,
        symptomKeys: []
      });
    }

    return this.protocols.createAssessmentProtocol(userId, {
      mode: "assessment",
      subject: input.subject,
      symptomKeys: input.symptomKeys,
      problemStatement: input.problemStatement
    });
  }

  async createProtocolWithSession(userId: string, input: ProtocolRequestInput) {
    if (input.sessionType === "quick") {
      return this.protocols.createQuickProtocolWithSession(userId, {
        mode: "quick",
        subject: input.subject,
        symptomKeys: []
      });
    }

    return this.protocols.createAssessmentProtocolWithSession(userId, {
      mode: "assessment",
      subject: input.subject,
      symptomKeys: input.symptomKeys,
      problemStatement: input.problemStatement
    });
  }
}
