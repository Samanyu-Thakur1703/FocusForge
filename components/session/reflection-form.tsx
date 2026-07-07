"use client";

import { useActionState } from "react";
import { completeSessionAction } from "@/features/session/actions";
import type { SessionActionState } from "@/features/session/types";

const initialState: SessionActionState = { ok: false };

type ReflectionFormProps = {
  sessionId: string;
  status: "active" | "paused" | "completed" | "abandoned";
};

export function ReflectionForm({ sessionId, status }: ReflectionFormProps) {
  const [state, formAction, isPending] = useActionState(completeSessionAction, initialState);

  if (status === "completed") {
    return <p>Reflection submitted.</p>;
  }

  if (status === "abandoned") {
    return <p>This session was abandoned.</p>;
  }

  return (
    <form action={formAction} className="space-y-4 rounded-md border p-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <label className="block space-y-2">
        <span>Focus rating</span>
        <select name="focusRating" required className="w-full rounded-md border px-3 py-2">
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Difficult</option>
          <option value="1">1 - Very difficult</option>
        </select>
      </label>
      <fieldset className="space-y-2">
        <legend>Did you complete your goal?</legend>
        <label className="mr-4">
          <input name="goalCompleted" type="radio" value="true" required /> Yes
        </label>
        <label>
          <input name="goalCompleted" type="radio" value="false" required /> No
        </label>
      </fieldset>
      <label className="block space-y-2">
        <span>Reflection note</span>
        <textarea name="reflectionNote" maxLength={1000} rows={3} className="w-full rounded-md border px-3 py-2" />
      </label>
      {state.message ? <p>{state.message}</p> : null}
      <button type="submit" disabled={isPending} className="rounded-md border px-4 py-2">
        {isPending ? "Completing..." : "Complete Session"}
      </button>
    </form>
  );
}
