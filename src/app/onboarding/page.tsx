import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getCurrentWorkspace, requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  const { profile, workspace } = await getCurrentWorkspace();
  if (profile?.onboarding_completed && workspace) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#f5f6f1] px-5 py-8 sm:py-14">
      <OnboardingForm defaultName={profile?.full_name || String(user.user_metadata.full_name ?? "")} />
    </main>
  );
}
