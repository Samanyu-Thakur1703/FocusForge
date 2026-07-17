"use client";

import posthog from "posthog-js";
import { logoutAction } from "@/features/auth/actions";

export function LogoutButton() {
  const handleLogout = () => {
    posthog.reset();
  };

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        onClick={handleLogout}
        className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Logout
      </button>
    </form>
  );
}
