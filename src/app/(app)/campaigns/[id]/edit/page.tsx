import { notFound } from "next/navigation";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { PageHeader } from "@/components/app/page-header";
import { getCampaign } from "@/lib/data";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCampaign(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Influencer campaign CRM" title={`Edit ${data.campaign.name}`} description="Update the product, objective, offer, dates, budget, or campaign status." />
      <CampaignForm campaign={data.campaign} />
    </div>
  );
}
