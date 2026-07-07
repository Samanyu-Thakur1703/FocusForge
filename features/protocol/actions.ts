"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/features/auth/service";
import { ProtocolFeatureService } from "@/features/protocol/service";
import type { ProtocolActionState } from "@/features/protocol/types";
import { ProtocolRepository } from "@/lib/database/repositories/protocol-repository";
import { ProtocolService } from "@/lib/protocol-engine/protocol-service";
import { createClient } from "@/lib/supabase/server";
import {
  assessmentProtocolRequestSchema,
  quickProtocolRequestSchema
} from "@/lib/validation/protocol.schema";

function formDataValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formDataValues(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is string => typeof value === "string");
}

async function getProtocolFeatureService() {
  const supabase = await createClient();
  return {
    auth: new AuthService(supabase),
    protocols: new ProtocolFeatureService(
      new ProtocolService({
        repository: new ProtocolRepository(supabase)
      })
    )
  };
}

export async function generateAssessmentProtocolAction(
  _previousState: ProtocolActionState,
  formData: FormData
): Promise<ProtocolActionState> {
  const parsed = assessmentProtocolRequestSchema.safeParse({
    sessionType: "assessment",
    subject: formDataValue(formData, "subject"),
    symptomKeys: formDataValues(formData, "symptomKeys"),
    problemStatement: formDataValue(formData, "problemStatement")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid check-in details." };
  }

  const { auth, protocols } = await getProtocolFeatureService();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const created = await protocols.createProtocolWithSession(user.id, parsed.data);

  redirect(`/focus/${created.sessionId}`);
}

export async function generateQuickProtocolAction(
  _previousState: ProtocolActionState,
  formData: FormData
): Promise<ProtocolActionState> {
  const parsed = quickProtocolRequestSchema.safeParse({
    sessionType: "quick",
    subject: formDataValue(formData, "subject")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid subject." };
  }

  const { auth, protocols } = await getProtocolFeatureService();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const created = await protocols.createProtocolWithSession(user.id, parsed.data);

  redirect(`/focus/${created.sessionId}`);
}
