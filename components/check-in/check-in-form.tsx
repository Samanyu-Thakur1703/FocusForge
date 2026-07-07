"use client";

import { useActionState } from "react";
import { generateAssessmentProtocolAction } from "@/features/protocol/actions";
import type { ProtocolActionState } from "@/features/protocol/types";
import { ProblemStatementField } from "@/components/check-in/problem-statement-field";
import { SubjectInput } from "@/components/check-in/subject-input";
import { SymptomPicker } from "@/components/check-in/symptom-picker";

const initialState: ProtocolActionState = { ok: false };

export function CheckInForm() {
  const [state, formAction, isPending] = useActionState(
    generateAssessmentProtocolAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <SubjectInput />
      <SymptomPicker />
      <ProblemStatementField />
      {state.message ? <p>{state.message}</p> : null}
      {state.protocolId ? (
        <p>
          Created protocol: {state.title} ({state.protocolId})
        </p>
      ) : null}
      <button type="submit" disabled={isPending} className="rounded-md border px-4 py-2">
        {isPending ? "Creating protocol..." : "Generate Focus Protocol"}
      </button>
    </form>
  );
}
