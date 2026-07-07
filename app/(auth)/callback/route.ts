import { NextResponse, type NextRequest } from "next/server";
import { AuthService } from "@/features/auth/service";
import { ProfileService } from "@/features/profile/service";
import { ProfileRepository } from "@/lib/database/repositories/profile-repository";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "auth_callback_failed");
      return NextResponse.redirect(loginUrl);
    }
  }

  const user = await new AuthService(supabase).getCurrentUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", code ? "session_not_found" : "missing_auth_code");
    return NextResponse.redirect(loginUrl);
  }

  const profile = await new ProfileService(new ProfileRepository(supabase)).getProfile(user.id);
  const nextPath = profile?.onboarding_completed ? "/dashboard" : "/profile";

  return NextResponse.redirect(new URL(nextPath, request.url));
}
