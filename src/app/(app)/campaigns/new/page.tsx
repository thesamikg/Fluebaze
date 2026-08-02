import { CampaignForm } from "@/components/campaigns/campaign-form";
import { PageHeader } from "@/components/app/page-header";
import { requireWorkspace } from "@/lib/supabase/auth";

export default async function NewCampaignPage() {
  const { workspace } = await requireWorkspace();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Influencer campaign CRM" title="New campaign" description="Start with the product, objective, offer, dates, and budget. Add creators on the next screen." />
      <CampaignForm defaultBrand={workspace.name} />
    </div>
  );
}
