import { describe, expect, it } from "vitest";
import { isAuthRoute, isProtectedRoute, isPublicRoute } from "@/lib/supabase/middleware";

describe("middleware route classification", () => {
  it("treats auth and callback routes as public", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/signup")).toBe(true);
    expect(isPublicRoute("/reset-password")).toBe(true);
    expect(isPublicRoute("/callback")).toBe(true);
  });

  it("treats current and future app routes as protected by default", () => {
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/check-in")).toBe(true);
    expect(isProtectedRoute("/future-protected-route")).toBe(true);
  });

  it("matches auth routes by path segment", () => {
    expect(isAuthRoute("/login")).toBe(true);
    expect(isAuthRoute("/login-extra")).toBe(false);
  });
});
