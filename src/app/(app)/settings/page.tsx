import { PageHeader } from "@/components/app/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { requireWorkspace } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoRequest, readDemoStore } from "@/lib/demo-store";

export default async function SettingsPage() {
  const { user, profile, workspace } = await requireWorkspace();
  let hasSampleData = false;
  if (await isDemoRequest()) {
    const store = readDemoStore();
    hasSampleData =
      store.creators.some((item) => item.is_sample) ||
      store.campaigns.some((item) => item.is_sample);
  } else {
    const supabase = await createClient();
    const [{ count: sampleCreators }, { count: sampleCampaigns }] =
      await Promise.all([
        supabase
          .from("creators")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .eq("is_sample", true),
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .eq("is_sample", true),
      ]);
    hasSampleData = Boolean(sampleCreators || sampleCampaigns);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="E-commerce workspace" title="Settings" description="Manage your account, brand workspace, and pilot data." />
      <SettingsForm
        fullName={profile.full_name}
        workspaceName={workspace.name}
        email={user.email ?? ""}
        hasSampleData={hasSampleData}
      />
    </div>
  );
}
