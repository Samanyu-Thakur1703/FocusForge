import type { SupabaseClient } from "@supabase/supabase-js";
import { assertNoDatabaseError } from "@/lib/database/db-errors";
import type { Database, FocusSessionType, Inserts, Json, Tables } from "@/lib/supabase/types";

export type Protocol = Tables<"protocols">;
export type ProtocolInsert = Inserts<"protocols">;
export type ProtocolSessionInsert = ProtocolInsert & {
  subject: string;
  session_type: FocusSessionType;
  started_at?: string;
};

export type ProtocolSessionCreation = {
  protocolId: string;
  sessionId: string;
};

export class ProtocolRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(protocol: ProtocolInsert): Promise<Protocol> {
    const { data, error } = await this.supabase
      .from("protocols")
      .insert(protocol)
      .select("*")
      .single();

    assertNoDatabaseError(error);
    return data;
  }

  async createWithSession(input: ProtocolSessionInsert): Promise<ProtocolSessionCreation> {
    const { data, error } = await this.supabase.rpc("create_protocol_with_session", {
      p_user_id: input.user_id,
      p_problem_statement: input.problem_statement ?? null,
      p_symptom_keys: input.symptom_keys,
      p_title: input.title,
      p_coach_message: input.coach_message,
      p_steps: input.steps,
      p_sprint_minutes: input.sprint_minutes ?? 25,
      p_break_minutes: input.break_minutes ?? 5,
      p_protocol_version: input.protocol_version ?? "v1",
      p_provider: input.provider ?? "rule_based",
      p_provider_metadata: input.provider_metadata ?? ({} as Json),
      p_subject: input.subject,
      p_session_type: input.session_type,
      p_started_at: input.started_at
    });

    assertNoDatabaseError(error);

    const created = data[0];

    if (!created) {
      throw new Error("Unable to create protocol and session.");
    }

    return {
      protocolId: created.protocol_id,
      sessionId: created.session_id
    };
  }

  async findByIdForUser(protocolId: string, userId: string): Promise<Protocol | null> {
    const { data, error } = await this.supabase
      .from("protocols")
      .select("*")
      .eq("id", protocolId)
      .eq("user_id", userId)
      .maybeSingle();

    assertNoDatabaseError(error);
    return data;
  }

  async listRecentForUser(userId: string, limit = 10): Promise<Protocol[]> {
    const { data, error } = await this.supabase
      .from("protocols")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    assertNoDatabaseError(error);
    return data;
  }
}
