import type {
  GeneratedProtocol,
  ProtocolProvider,
  ProtocolProviderInput
} from "@/lib/protocol-engine/provider";

export class AIProtocolProviderPlaceholder implements ProtocolProvider {
  readonly id = "ai" as const;
  readonly version = "v1";

  generateAssessmentProtocol(_input: ProtocolProviderInput): GeneratedProtocol {
    throw new Error("AIProtocolProvider is reserved for future implementation.");
  }

  generateQuickProtocol(_input: ProtocolProviderInput): GeneratedProtocol {
    throw new Error("AIProtocolProvider is reserved for future implementation.");
  }
}
