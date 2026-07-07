"use client";

import { useActionState } from "react";
import { SubjectInput } from "@/components/check-in/subject-input";
import { generateQuickProtocolAction } from "@/features/protocol/actions";
import type { ProtocolActionState } from "@/features/protocol/types";

const initialState: ProtocolActionState = { ok: false };

export function QuickFocusForm() {
  const [state, formAction, isPending] = useActionState(generateQuickProtocolAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <SubjectInput />
      {state.message ? <p>{state.message}</p> : null}
      {state.protocolId ? (
        <p>
          Created protocol: {state.title} ({state.protocolId})
        </p>
      ) : null}
      <button type="submit" disabled={isPending} className="rounded-md border px-4 py-2">
        {isPending ? "Starting..." : "Start Focus Now"}
      </button>
    </form>
  );
}
