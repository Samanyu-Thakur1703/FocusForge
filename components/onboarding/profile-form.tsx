"use client";

import { useActionState } from "react";
import { completeOnboardingAction, updateProfileAction } from "@/features/profile/actions";
import type { AcademicLevel, ProfileActionState } from "@/features/profile/types";

const initialState: ProfileActionState = { ok: false };

type ProfileFormProps = {
  defaultValues?: {
    name: string;
    studyGoal: string;
    academicLevel: AcademicLevel;
    dailyTargetMinutes: number;
    onboardingCompleted: boolean;
  };
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const action = defaultValues?.onboardingCompleted ? updateProfileAction : completeOnboardingAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-2">
        <span>Name</span>
        <input
          name="name"
          required
          maxLength={80}
          defaultValue={defaultValues?.name}
          className="w-full rounded-md border px-3 py-2"
        />
      </label>
      <label className="block space-y-2">
        <span>Academic level</span>
        <select
          name="academicLevel"
          defaultValue={defaultValues?.academicLevel ?? "undergraduate"}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="high_school">High school</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="postgraduate">Postgraduate</option>
          <option value="competitive_exam">Competitive exam</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block space-y-2">
        <span>Study goal</span>
        <input
          name="studyGoal"
          required
          maxLength={160}
          defaultValue={defaultValues?.studyGoal}
          className="w-full rounded-md border px-3 py-2"
        />
      </label>
      <label className="block space-y-2">
        <span>Daily target minutes</span>
        <input
          name="dailyTargetMinutes"
          type="number"
          required
          min={15}
          max={720}
          defaultValue={defaultValues?.dailyTargetMinutes ?? 120}
          className="w-full rounded-md border px-3 py-2"
        />
      </label>
      {state.message ? <p>{state.message}</p> : null}
      <button type="submit" disabled={isPending} className="rounded-md border px-4 py-2">
        {isPending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
