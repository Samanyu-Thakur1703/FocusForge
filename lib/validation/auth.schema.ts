import { z } from "zod";

export const emailSchema = z.string().email();

export const passwordSchema = z.string().min(8).max(128);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const signupSchema = loginSchema;

export const resetPasswordSchema = z.object({
  email: emailSchema
});
