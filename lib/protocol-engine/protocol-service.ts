import type {
  ProtocolRepository,
  Protocol,
  ProtocolSessionCreation
} from "@/lib/database/repositories/protocol-repository";
import { RuleBasedProtocolProvider } from "@/lib/protocol-engine/rule-based-provider";
import type {
  GeneratedProtocol,
  ProtocolProvider,
  ProtocolProviderInput
} from "@/lib/protocol-engine/provider";
import { protocolSnapshotSchema } from "@/lib/validation/protocol.schema";
import type { Json } from "@/lib/supabase/types";

type ProtocolServiceOptions = {
  repository: Pick<ProtocolRepository, "create" | "createWithSession">;
  provider?: ProtocolProvider;
};

export class ProtocolService {
  private readonly provider: ProtocolProvider;

  constructor(private readonly options: ProtocolServiceOptions) {
    this.provider = options.provider ?? new RuleBasedProtocolProvider();
  }

  async createAssessmentProtocol(userId: string, input: ProtocolProviderInput): Promise<Protocol> {
    const generated = this.provider.generateAssessmentProtocol({
      ...input,
      mode: "assessment"
    });

    return this.persistGeneratedProtocol(userId, input, generated);
  }

  async createQuickProtocol(userId: string, input: ProtocolProviderInput): Promise<Protocol> {
    const generated = this.provider.generateQuickProtocol({
      ...input,
      mode: "quick",
      symptomKeys: []
    });

    return this.persistGeneratedProtocol(userId, input, generated);
  }

  async createAssessmentProtocolWithSession(
    userId: string,
    input: ProtocolProviderInput
  ): Promise<ProtocolSessionCreation> {
    const generated = this.provider.generateAssessmentProtocol({
      ...input,
      mode: "assessment"
    });

    return this.persistGeneratedProtocolWithSession(userId, input, generated);
  }

  async createQuickProtocolWithSession(
    userId: string,
    input: ProtocolProviderInput
  ): Promise<ProtocolSessionCreation> {
    const generated = this.provider.generateQuickProtocol({
      ...input,
      mode: "quick",
      symptomKeys: []
    });

    return this.persistGeneratedProtocolWithSession(userId, input, generated);
  }

  private async persistGeneratedProtocol(
    userId: string,
    input: ProtocolProviderInput,
    generated: GeneratedProtocol
  ): Promise<Protocol> {
    const validated = protocolSnapshotSchema.parse({
      title: generated.title,
      coachMessage: generated.coachMessage,
      steps: generated.steps,
      sprintMinutes: generated.sprintMinutes,
      breakMinutes: generated.breakMinutes,
      provider: this.provider.id,
      protocolVersion: this.provider.version,
      providerMetadata: generated.providerMetadata
    });

    return this.options.repository.create({
      user_id: userId,
      problem_statement: input.problemStatement ?? null,
      symptom_keys: generated.symptomKeys,
      title: validated.title,
      coach_message: validated.coachMessage,
      steps: validated.steps.map((step) => ({
        title: step.title,
        instruction: step.instruction,
        ...(step.durationMinutes ? { durationMinutes: step.durationMinutes } : {})
      })) as Json,
      sprint_minutes: validated.sprintMinutes,
      break_minutes: validated.breakMinutes,
      protocol_version: validated.protocolVersion,
      provider: validated.provider,
      provider_metadata: validated.providerMetadata as Json
    });
  }

  private async persistGeneratedProtocolWithSession(
    userId: string,
    input: ProtocolProviderInput,
    generated: GeneratedProtocol
  ): Promise<ProtocolSessionCreation> {
    const validated = protocolSnapshotSchema.parse({
      title: generated.title,
      coachMessage: generated.coachMessage,
      steps: generated.steps,
      sprintMinutes: generated.sprintMinutes,
      breakMinutes: generated.breakMinutes,
      provider: this.provider.id,
      protocolVersion: this.provider.version,
      providerMetadata: generated.providerMetadata
    });

    return this.options.repository.createWithSession({
      user_id: userId,
      problem_statement: input.problemStatement ?? null,
      symptom_keys: generated.symptomKeys,
      title: validated.title,
      coach_message: validated.coachMessage,
      steps: validated.steps.map((step) => ({
        title: step.title,
        instruction: step.instruction,
        ...(step.durationMinutes ? { durationMinutes: step.durationMinutes } : {})
      })) as Json,
      sprint_minutes: validated.sprintMinutes,
      break_minutes: validated.breakMinutes,
      protocol_version: validated.protocolVersion,
      provider: validated.provider,
      provider_metadata: validated.providerMetadata as Json,
      subject: input.subject,
      session_type: input.mode === "quick" ? "quick" : "assessment"
    });
  }
}
