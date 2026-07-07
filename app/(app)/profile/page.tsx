import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/onboarding/profile-form";
import { AuthService } from "@/features/auth/service";
import { ProfileService } from "@/features/profile/service";
import { ProfileRepository } from "@/lib/database/repositories/profile-repository";
import { createClient } from "@/lib/supabase/server";

export default function ProfilePage() {
  return <ProfileContent />;
}

async function ProfileContent() {
  const supabase = await createClient();
  const user = await new AuthService(supabase).getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await new ProfileService(new ProfileRepository(supabase)).getProfile(user.id);

  return (
    <main className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
      <ProfileForm
        defaultValues={
          profile
            ? {
                name: profile.name,
                studyGoal: profile.study_goal,
                academicLevel: profile.academic_level,
                dailyTargetMinutes: profile.daily_target_minutes,
                onboardingCompleted: profile.onboarding_completed
              }
            : undefined
        }
      />
    </main>
  );
}
