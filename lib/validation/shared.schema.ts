import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const nonEmptyTrimmedString = (max: number) => z.string().trim().min(1).max(max);

export const subjectSchema = nonEmptyTrimmedString(100);

export const optionalBoundedTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null))
    .optional()
    .nullable();
