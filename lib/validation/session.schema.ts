import { z } from "zod";
import { optionalBoundedTextSchema, subjectSchema, uuidSchema } from "@/lib/validation/shared.schema";
import { sessionTypeSchema } from "@/lib/validation/protocol.schema";

export const sessionIdSchema = z.object({
  sessionId: uuidSchema
});

export const sessionStatusSchema = z.enum(["active", "paused", "completed", "abandoned"]);

export const createSessionSchema = z.object({
  protocolId: uuidSchema.nullable().optional(),
  sessionType: sessionTypeSchema,
  subject: subjectSchema
});

export const updateSessionStatusSchema = sessionIdSchema.extend({
  status: sessionStatusSchema,
  accumulatedSeconds: z.number().int().min(0).optional()
});

export const reflectionSchema = sessionIdSchema.extend({
  focusRating: z.coerce.number().int().min(1).max(5),
  goalCompleted: z.preprocess((value) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  }, z.boolean()),
  reflectionNote: optionalBoundedTextSchema(1000)
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type ReflectionInput = z.infer<typeof reflectionSchema>;
