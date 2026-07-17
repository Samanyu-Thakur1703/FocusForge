"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/features/auth/service";
import type { AuthActionState } from "@/features/auth/types";
import { ProfileService } from "@/features/profile/service";
import { ProfileRepository } from "@/lib/database/repositories/profile-repository";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, resetPasswordSchema, signupSchema } from "@/lib/validation/auth.schema";
import { getPostHogClient } from "@/lib/posthog-server";

function formDataValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function authErrorMessage(message?: string) {
  return message ?? "Unable to complete the authentication request.";
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formDataValue(formData, "email"),
    password: formDataValue(formData, "password")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid signup details." };
  }

  const supabase = await createClient();
  const service = new AuthService(supabase);
  const { error } = await service.signUp(parsed.data);

  if (error) {
    return { ok: false, message: authErrorMessage(error.message) };
  }

  const newUser = await service.getCurrentUser();
  if (newUser) {
    const posthog = getPostHogClient();
    posthog.identify({ distinctId: newUser.id, properties: { email: newUser.email } });
    posthog.capture({ distinctId: newUser.id, event: "user_signed_up" });
    await posthog.flush();
  }

  redirect("/profile");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formDataValue(formData, "email"),
    password: formDataValue(formData, "password")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid login details." };
  }

  const supabase = await createClient();
  const service = new AuthService(supabase);
  const { error } = await service.login(parsed.data);

  if (error) {
    return { ok: false, message: authErrorMessage(error.message) };
  }

  const user = await service.getCurrentUser();
  const profile = user
    ? await new ProfileService(new ProfileRepository(supabase)).getProfile(user.id)
    : null;

  if (user) {
    const posthog = getPostHogClient();
    posthog.identify({ distinctId: user.id, properties: { email: user.email } });
    posthog.capture({ distinctId: user.id, event: "user_logged_in" });
    await posthog.flush();
  }

  redirect(profile?.onboarding_completed ? "/dashboard" : "/profile");
}

export async function logoutAction() {
  const service = new AuthService(await createClient());
  await service.logout();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formDataValue(formData, "email")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid email address." };
  }

  const service = new AuthService(await createClient());
  const { error } = await service.requestPasswordReset(parsed.data);

  if (error) {
    return { ok: false, message: authErrorMessage(error.message) };
  }

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: parsed.data.email, event: "password_reset_requested" });
  await posthog.flush();

  return { ok: true, message: "Password reset email sent." };
}
