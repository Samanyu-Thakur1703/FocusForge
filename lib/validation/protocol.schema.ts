import { z } from "zod";
import { symptomKeys } from "@/lib/protocol-engine/symptoms";
import { optionalBoundedTextSchema, subjectSchema } from "@/lib/validation/shared.schema";

export const symptomKeySchema = z.enum(symptomKeys);

export const protocolStepSchema = z.object({
  title: z.string().trim().min(1).max(120),
  instruction: z.string().trim().min(1).max(500),
  durationMinutes: z.number().int().min(1).max(120).optional()
});

export const sessionTypeSchema = z.enum(["assessment", "quick"]);

export const assessmentProtocolRequestSchema = z.object({
  subject: subjectSchema,
  sessionType: z.literal("assessment"),
  symptomKeys: z.array(symptomKeySchema).min(1).max(9),
  problemStatement: optionalBoundedTextSchema(500)
});

export const quickProtocolRequestSchema = z.object({
  subject: subjectSchema,
  sessionType: z.literal("quick")
});

export const protocolRequestSchema = z.discriminatedUnion("sessionType", [
  assessmentProtocolRequestSchema,
  quickProtocolRequestSchema
]);

export const protocolSnapshotSchema = z.object({
  title: z.string().trim().min(1).max(160),
  coachMessage: z.string().trim().min(1).max(1000),
  steps: z.array(protocolStepSchema).min(1).max(6),
  sprintMinutes: z.number().int().min(5).max(60),
  breakMinutes: z.number().int().min(1).max(30),
  protocolVersion: z.string().trim().min(1).max(20),
  provider: z.string().trim().min(1).max(40),
  providerMetadata: z.record(z.string(), z.unknown()).default({})
});

export type ProtocolRequestInput = z.infer<typeof protocolRequestSchema>;
export type ProtocolSnapshotInput = z.infer<typeof protocolSnapshotSchema>;
