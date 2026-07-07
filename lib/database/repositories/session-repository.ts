import type { SupabaseClient } from "@supabase/supabase-js";
import { assertNoDatabaseError } from "@/lib/database/db-errors";
import type { Database, FocusSessionStatus, Inserts, Tables, Updates } from "@/lib/supabase/types";

export type FocusSession = Tables<"focus_sessions">;
export type FocusSessionInsert = Inserts<"focus_sessions">;
export type FocusSessionUpdate = Updates<"focus_sessions">;

export class StaleSessionTransitionError extends Error {
  constructor() {
    super("Focus session changed before this action completed. Refresh and try again.");
    this.name = "StaleSessionTransitionError";
  }
}

export class SessionRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(session: FocusSessionInsert): Promise<FocusSession> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .insert(session)
      .select("*")
      .single();

    assertNoDatabaseError(error);
    return data;
  }

  async findByIdForUser(sessionId: string, userId: string): Promise<FocusSession | null> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    assertNoDatabaseError(error);
    return data;
  }

  async listRecentForUser(userId: string, limit = 10): Promise<FocusSession[]> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit);

    assertNoDatabaseError(error);
    return data;
  }

  async listAllForUser(userId: string): Promise<FocusSession[]> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    assertNoDatabaseError(error);
    return data;
  }

  async listForUserBetween(userId: string, startIso: string, endIso: string): Promise<FocusSession[]> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("started_at", startIso)
      .lt("started_at", endIso)
      .order("started_at", { ascending: false });

    assertNoDatabaseError(error);
    return data;
  }

  async updateForUser(
    sessionId: string,
    userId: string,
    patch: FocusSessionUpdate
  ): Promise<FocusSession> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .update(patch)
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select("*")
      .single();

    assertNoDatabaseError(error);
    return data;
  }

  async updateForUserWithExpectedStatuses(
    sessionId: string,
    userId: string,
    expectedStatuses: FocusSessionStatus[],
    patch: FocusSessionUpdate
  ): Promise<FocusSession> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .update(patch)
      .eq("id", sessionId)
      .eq("user_id", userId)
      .in("status", expectedStatuses)
      .select("*")
      .maybeSingle();

    assertNoDatabaseError(error);

    if (!data) {
      throw new StaleSessionTransitionError();
    }

    return data;
  }
}
