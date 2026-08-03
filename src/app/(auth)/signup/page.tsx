import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex justify-center">
      <AuthForm mode="signup" />
    </div>
  );
}