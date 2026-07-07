export type ProfileActionState = {
  ok: boolean;
  message?: string;
};

export type AcademicLevel =
  | "high_school"
  | "undergraduate"
  | "postgraduate"
  | "competitive_exam"
  | "other";

export type ProfileFormInput = {
  name: string;
  studyGoal: string;
  academicLevel: AcademicLevel;
  dailyTargetMinutes: number;
};
