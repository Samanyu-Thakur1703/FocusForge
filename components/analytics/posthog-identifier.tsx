"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

type PostHogIdentifierProps = {
  userId: string;
  email: string;
};

export function PostHogIdentifier({ userId, email }: PostHogIdentifierProps) {
  useEffect(() => {
    posthog.identify(userId, { email });
  }, [userId, email]);

  return null;
}
