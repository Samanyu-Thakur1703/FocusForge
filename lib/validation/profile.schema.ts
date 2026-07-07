import { z } from "zod";
import { nonEmptyTrimmedString } from "@/lib/validation/shared.schema";

export const academicLevelSchema = z.enum([
  "high_school",
  "undergraduate",
  "postgraduate",
  "competitive_exam",
  "other"
]);

export const profileSchema = z.object({
  name: nonEmptyTrimmedString(80),
  studyGoal: nonEmptyTrimmedString(160),
  academicLevel: academicLevelSchema.default("undergraduate"),
  dailyTargetMinutes: z.coerce.number().int().min(15).max(720)
});

export type ProfileInput = z.infer<typeof profileSchema>;
