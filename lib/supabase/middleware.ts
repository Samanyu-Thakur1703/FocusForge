import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

const authRoutes = ["/login", "/signup", "/reset-password"];
const callbackRoute = "/callback";
const onboardingRoute = "/profile";

function isExactOrChildPath(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => isExactOrChildPath(pathname, route));
}

export function isPublicRoute(pathname: string) {
  return isAuthRoute(pathname) || isExactOrChildPath(pathname, callbackRoute);
}

export function isProtectedRoute(pathname: string) {
  return !isPublicRoute(pathname);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (isProtectedRoute(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!user) {
    return response;
  }

  if (isExactOrChildPath(pathname, callbackRoute)) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const hasCompletedOnboarding = profile?.onboarding_completed === true;
  const isOnboardingRoute = isExactOrChildPath(pathname, onboardingRoute);

  if (!hasCompletedOnboarding && !isOnboardingRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = onboardingRoute;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = hasCompletedOnboarding ? "/dashboard" : onboardingRoute;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
