import type { SupabaseClient, User } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";
import type { AuthCredentials, PasswordResetRequest } from "@/features/auth/types";

export class AuthService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async signUp({ email, password }: AuthCredentials) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/callback`
      }
    });
  }

  async login({ email, password }: AuthCredentials) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async logout() {
    return this.supabase.auth.signOut();
  }

  async requestPasswordReset({ email }: PasswordResetRequest) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/callback`
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error
    } = await this.supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  }
}
