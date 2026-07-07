import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthCard>
      <h1 className="mb-6 text-2xl font-semibold">Sign up</h1>
      <SignupForm />
      <Link href="/login" className="mt-4 block">
        Already have an account?
      </Link>
    </AuthCard>
  );
}
