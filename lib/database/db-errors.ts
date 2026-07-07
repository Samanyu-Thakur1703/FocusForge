import type { PostgrestError } from "@supabase/supabase-js";

export class DatabaseError extends Error {
  readonly code?: string;
  readonly details?: string;

  constructor(message: string, options?: { code?: string; details?: string }) {
    super(message);
    this.name = "DatabaseError";
    this.code = options?.code;
    this.details = options?.details;
  }
}

export function assertNoDatabaseError(error: PostgrestError | null): asserts error is null {
  if (error) {
    throw new DatabaseError(error.message, {
      code: error.code,
      details: error.details
    });
  }
}
