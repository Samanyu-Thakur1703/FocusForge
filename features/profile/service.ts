import { ProfileRepository, type Profile } from "@/lib/database/repositories/profile-repository";
import type { ProfileInput } from "@/lib/validation/profile.schema";

export class ProfileService {
  constructor(private readonly profiles: ProfileRepository) {}

  async getProfile(userId: string): Promise<Profile | null> {
    return this.profiles.findByUserId(userId);
  }

  async completeOnboarding(userId: string, input: ProfileInput): Promise<Profile> {
    return this.profiles.upsert({
      id: userId,
      name: input.name,
      study_goal: input.studyGoal,
      academic_level: input.academicLevel,
      daily_target_minutes: input.dailyTargetMinutes,
      onboarding_completed: true
    });
  }

  async updateProfile(userId: string, input: ProfileInput): Promise<Profile> {
    return this.profiles.update(userId, {
      name: input.name,
      study_goal: input.studyGoal,
      academic_level: input.academicLevel,
      daily_target_minutes: input.dailyTargetMinutes,
      onboarding_completed: true
    });
  }
}
