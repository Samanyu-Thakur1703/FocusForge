import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard>
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>
      <LoginForm />
      <Link href="/reset-password" className="mt-4 block">
        Forgot password?
      </Link>
      <Link href="/signup" className="mt-2 block">
        Create an account
      </Link>
    </AuthCard>
  );
}
