"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/features/auth/service";
import { ProfileService } from "@/features/profile/service";
import type { ProfileActionState } from "@/features/profile/types";
import { ProfileRepository } from "@/lib/database/repositories/profile-repository";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile.schema";

function formDataValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getProfileService() {
  const supabase = await createClient();
  return {
    auth: new AuthService(supabase),
    profiles: new ProfileService(new ProfileRepository(supabase))
  };
}

export async function completeOnboardingAction(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    name: formDataValue(formData, "name"),
    studyGoal: formDataValue(formData, "studyGoal"),
    academicLevel: formDataValue(formData, "academicLevel"),
    dailyTargetMinutes: formDataValue(formData, "dailyTargetMinutes")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const { auth, profiles } = await getProfileService();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await profiles.completeOnboarding(user.id, parsed.data);
  redirect("/dashboard");
}

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    name: formDataValue(formData, "name"),
    studyGoal: formDataValue(formData, "studyGoal"),
    academicLevel: formDataValue(formData, "academicLevel"),
    dailyTargetMinutes: formDataValue(formData, "dailyTargetMinutes")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const { auth, profiles } = await getProfileService();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await profiles.updateProfile(user.id, parsed.data);
  return { ok: true, message: "Profile updated." };
}
