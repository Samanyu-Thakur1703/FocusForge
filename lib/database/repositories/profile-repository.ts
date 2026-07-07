import type { SupabaseClient } from "@supabase/supabase-js";
import { assertNoDatabaseError } from "@/lib/database/db-errors";
import type { Database, Inserts, Tables, Updates } from "@/lib/supabase/types";

export type Profile = Tables<"profiles">;
export type ProfileInsert = Inserts<"profiles">;
export type ProfileUpdate = Updates<"profiles">;

export class ProfileRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    assertNoDatabaseError(error);
    return data;
  }

  async upsert(profile: ProfileInsert): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" })
      .select("*")
      .single();

    assertNoDatabaseError(error);
    return data;
  }

  async update(userId: string, profile: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(profile)
      .eq("id", userId)
      .select("*")
      .single();

    assertNoDatabaseError(error);
    return data;
  }
}
