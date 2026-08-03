import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex justify-center">
      <AuthForm mode="login" />
    </div>
  );
}
