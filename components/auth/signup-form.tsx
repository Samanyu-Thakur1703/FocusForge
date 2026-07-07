"use client";

import { useActionState } from "react";
import { signupAction } from "@/features/auth/actions";
import type { AuthActionState } from "@/features/auth/types";

const initialState: AuthActionState = { ok: false };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-2">
        <span>Email</span>
        <input name="email" type="email" required className="w-full rounded-md border px-3 py-2" />
      </label>
      <label className="block space-y-2">
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border px-3 py-2"
        />
      </label>
      {state.message ? <p>{state.message}</p> : null}
      <button type="submit" disabled={isPending} className="rounded-md border px-4 py-2">
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
