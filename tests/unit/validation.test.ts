import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/validation/auth.schema";
import { profileSchema } from "@/lib/validation/profile.schema";
import {
  assessmentProtocolRequestSchema,
  quickProtocolRequestSchema
} from "@/lib/validation/protocol.schema";
import { reflectionSchema } from "@/lib/validation/session.schema";
import { subjectSchema } from "@/lib/validation/shared.schema";

describe("validation foundation", () => {
  it("trims and accepts a valid subject", () => {
    expect(subjectSchema.parse("  Operating Systems  ")).toBe("Operating Systems");
  });

  it("rejects short passwords", () => {
    expect(loginSchema.safeParse({ email: "student@example.com", password: "short" }).success).toBe(
      false
    );
  });

  it("coerces and validates onboarding input", () => {
    expect(
      profileSchema.parse({
        name: " Ada ",
        studyGoal: "Pass operating systems",
        academicLevel: "undergraduate",
        dailyTargetMinutes: "120"
      })
    ).toEqual({
      name: "Ada",
      studyGoal: "Pass operating systems",
      academicLevel: "undergraduate",
      dailyTargetMinutes: 120
    });
  });

  it("requires symptoms for assessment protocol requests", () => {
    expect(
      assessmentProtocolRequestSchema.safeParse({
        sessionType: "assessment",
        subject: "AI Algorithms",
        symptomKeys: []
      }).success
    ).toBe(false);
  });

  it("allows quick protocol requests without symptoms", () => {
    expect(
      quickProtocolRequestSchema.safeParse({
        sessionType: "quick",
        subject: "C Programming"
      }).success
    ).toBe(true);
  });

  it("parses session reflection values from form data strings", () => {
    const parsed = reflectionSchema.parse({
      sessionId: "00000000-0000-4000-8000-000000000000",
      focusRating: "4",
      goalCompleted: "false",
      reflectionNote: "  I got halfway through.  "
    });

    expect(parsed.goalCompleted).toBe(false);
    expect(parsed.focusRating).toBe(4);
    expect(parsed.reflectionNote).toBe("I got halfway through.");
  });
});
