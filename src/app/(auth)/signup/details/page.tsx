import { redirect } from "next/navigation";
import { SignupDetailsForm } from "@/components/auth/signup-details-form";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export default async function SignupDetailsPage() {
  if (env.isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/signup");
    }
  }

  return (
    <div className="mx-auto flex justify-center">
      <SignupDetailsForm />
    </div>
  );
}
