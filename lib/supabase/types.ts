export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AcademicLevel =
  | "high_school"
  | "undergraduate"
  | "postgraduate"
  | "competitive_exam"
  | "other";

export type FocusSessionStatus = "active" | "paused" | "completed" | "abandoned";
export type FocusSessionType = "assessment" | "quick";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          study_goal: string;
          academic_level: AcademicLevel;
          daily_target_minutes: number;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          study_goal: string;
          academic_level?: AcademicLevel;
          daily_target_minutes?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          study_goal?: string;
          academic_level?: AcademicLevel;
          daily_target_minutes?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      protocols: {
        Row: {
          id: string;
          user_id: string;
          problem_statement: string | null;
          symptom_keys: string[];
          title: string;
          coach_message: string;
          steps: Json;
          sprint_minutes: number;
          break_minutes: number;
          protocol_version: string;
          provider: string;
          provider_metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_statement?: string | null;
          symptom_keys: string[];
          title: string;
          coach_message: string;
          steps: Json;
          sprint_minutes?: number;
          break_minutes?: number;
          protocol_version?: string;
          provider?: string;
          provider_metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: never;
          user_id?: never;
          problem_statement?: never;
          symptom_keys?: never;
          title?: never;
          coach_message?: never;
          steps?: never;
          sprint_minutes?: never;
          break_minutes?: never;
          protocol_version?: never;
          provider?: never;
          provider_metadata?: never;
          created_at?: never;
        };
        Relationships: [];
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          protocol_id: string | null;
          session_type: FocusSessionType;
          subject: string;
          status: FocusSessionStatus;
          started_at: string;
          paused_at: string | null;
          ended_at: string | null;
          accumulated_seconds: number;
          focus_rating: number | null;
          goal_completed: boolean | null;
          reflection_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          protocol_id?: string | null;
          session_type: FocusSessionType;
          subject: string;
          status?: FocusSessionStatus;
          started_at?: string;
          paused_at?: string | null;
          ended_at?: string | null;
          accumulated_seconds?: number;
          focus_rating?: number | null;
          goal_completed?: boolean | null;
          reflection_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          user_id?: never;
          protocol_id?: string | null;
          session_type?: never;
          subject?: never;
          status?: FocusSessionStatus;
          started_at?: string;
          paused_at?: string | null;
          ended_at?: string | null;
          accumulated_seconds?: number;
          focus_rating?: number | null;
          goal_completed?: boolean | null;
          reflection_note?: string | null;
          created_at?: never;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_protocol_with_session: {
        Args: {
          p_user_id: string;
          p_problem_statement: string | null;
          p_symptom_keys: string[];
          p_title: string;
          p_coach_message: string;
          p_steps: Json;
          p_sprint_minutes: number;
          p_break_minutes: number;
          p_protocol_version: string;
          p_provider: string;
          p_provider_metadata: Json;
          p_subject: string;
          p_session_type: FocusSessionType;
          p_started_at?: string;
        };
        Returns: Array<{
          protocol_id: string;
          session_id: string;
        }>;
      };
    };
    Enums: {
      academic_level: AcademicLevel;
      focus_session_status: FocusSessionStatus;
      focus_session_type: FocusSessionType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
