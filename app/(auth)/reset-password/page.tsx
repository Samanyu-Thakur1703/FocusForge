import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <h1 className="mb-6 text-2xl font-semibold">Reset password</h1>
      <ResetPasswordForm />
      <Link href="/login" className="mt-4 block">
        Back to login
      </Link>
    </AuthCard>
  );
}
