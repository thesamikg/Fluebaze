import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil, Plus, WalletCards } from "lucide-react";
import { format } from "date-fns";
import { archiveCampaign } from "@/app/(app)/campaigns/actions";
import { getCampaign } from "@/lib/data";
import { Pipeline } from "@/components/campaigns/pipeline";
import { AddCreatorToCampaign } from "@/components/campaigns/add-creator-to-campaign";
import { ConfirmForm } from "@/components/app/confirm-form";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCampaign(id);
  if (!data) notFound();
  const { campaign, collaborations, creators } = data;
  const availableCreators = creators.filter((creator) => !collaborations.some((row) => row.creator_id === creator.id));
  const agreed = collaborations.reduce((sum, row) => sum + Number(row.agreed_fee), 0);
  const paid = collaborations.reduce((sum, row) => sum + Number(row.payment?.amount_paid ?? 0), 0);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3"><Link href="/campaigns"><ArrowLeft size={15} /> All campaigns</Link></Button>
      <PageHeader
        eyebrow={campaign.brand_name}
        title={campaign.name}
        description={campaign.objective || campaign.description || "Creator, product, content, and payout pipeline"}
        actions={
          <>
            <Button asChild variant="outline"><Link href={`/campaigns/${campaign.id}/edit`}><Pencil size={15} /> Edit</Link></Button>
            {campaign.status !== "archived" ? <ConfirmForm action={archiveCampaign.bind(null, campaign.id)} label="Archive" variant="outline" message={`Archive ${campaign.name}? Its history will remain available.`} /> : null}
          </>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Campaign status" value={<Badge tone={campaign.status === "active" ? "green" : campaign.status === "completed" ? "blue" : "neutral"}>{campaign.status}</Badge>} />
        <Metric label="Campaign dates" value={`${format(new Date(`${campaign.start_date}T00:00:00`), "d MMM")} – ${format(new Date(`${campaign.end_date}T00:00:00`), "d MMM yyyy")}`} icon={<CalendarDays size={15} />} />
        <Metric label="Agreed spend" value={formatCurrency(agreed)} icon={<WalletCards size={15} />} />
        <Metric label="Outstanding" value={formatCurrency(Math.max(0, agreed - paid))} icon={<WalletCards size={15} />} emphasis />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="overflow-x-auto p-4 sm:p-5">
            {collaborations.length ? <Pipeline initialCollaborations={collaborations} /> : (
              <div className="grid min-h-72 place-items-center text-center">
                <div><span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#f0f1eb] text-[#6f756d]"><Plus size={19} /></span><h2 className="mt-4 font-semibold">No creators in this campaign yet</h2><p className="mt-2 text-sm text-[#777d75]">Add your first creator, then capture the product, deliverables, fee, and deadline.</p></div>
              </div>
            )}
          </CardContent>
        </Card>
        <aside className="grid content-start gap-5">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus size={16} /> Add creator</CardTitle></CardHeader>
            <CardContent><AddCreatorToCampaign campaignId={campaign.id} creators={availableCreators} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Campaign brief</CardTitle></CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#92988f]">Description</p><p className="mt-1.5 whitespace-pre-wrap leading-6 text-[#5f655d]">{campaign.description || "No description added."}</p></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#92988f]">Internal notes</p><p className="mt-1.5 whitespace-pre-wrap leading-6 text-[#5f655d]">{campaign.notes || "No notes added."}</p></div>
              {campaign.budget != null ? <div><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#92988f]">Budget</p><p className="mt-1.5 font-mono">{formatCurrency(campaign.budget)}</p></div> : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Metric({ label, value, icon, emphasis }: { label: string; value: React.ReactNode; icon?: React.ReactNode; emphasis?: boolean }) {
  return (
    <Card className={emphasis ? "border-[#e8d6bd] bg-[#fffaf2]" : ""}>
      <CardContent>
        <p className="flex items-center gap-1.5 text-xs text-[#7c8279]">{icon}{label}</p>
        <div className={`mt-2 text-lg font-semibold tracking-[-.03em] ${emphasis ? "text-[#8b4d0a]" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
