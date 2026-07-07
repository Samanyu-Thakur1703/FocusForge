import type { SymptomKey } from "@/lib/protocol-engine/symptoms";

export type ProtocolProviderId = "rule_based" | "ai";

export type ProtocolMode = "assessment" | "quick";

export type ProtocolStep = {
  title: string;
  instruction: string;
  durationMinutes?: number;
};

export type ProtocolProviderInput = {
  mode: ProtocolMode;
  subject: string;
  symptomKeys?: SymptomKey[];
  problemStatement?: string | null;
};

export type GeneratedProtocol = {
  title: string;
  coachMessage: string;
  symptomKeys: SymptomKey[];
  steps: ProtocolStep[];
  sprintMinutes: number;
  breakMinutes: number;
  providerMetadata: Record<string, unknown>;
};

export interface ProtocolProvider {
  readonly id: ProtocolProviderId;
  readonly version: string;
  generateAssessmentProtocol(input: ProtocolProviderInput): GeneratedProtocol;
  generateQuickProtocol(input: ProtocolProviderInput): GeneratedProtocol;
}
