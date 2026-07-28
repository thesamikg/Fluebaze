import Link from "next/link";
import { format } from "date-fns";
import { FolderKanban, Plus, Search } from "lucide-react";
import { getCampaigns } from "@/lib/data";
import { archiveCampaign } from "@/app/(app)/campaigns/actions";
import { PageHeader } from "@/components/app/page-header";
import { ConfirmForm } from "@/components/app/confirm-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const campaignTone = {
  draft: "neutral",
  active: "green",
  completed: "blue",
  archived: "amber",
} as const;

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; archived?: string }>;
}) {
  const params = await searchParams;
  const campaigns = await getCampaigns();
  const q = params.q?.toLowerCase().trim() ?? "";
  const status = params.status ?? "";
  const filtered = campaigns.filter((campaign) => {
    const matchesQuery = !q || campaign.name.toLowerCase().includes(q) || campaign.brand_name.toLowerCase().includes(q);
    return matchesQuery && (!status || campaign.status === status);
  });

  return (
    <>
      <PageHeader
        eyebrow="Influencer campaign CRM"
        title="Campaigns"
        description="Plan launches and always-on programs while keeping creators, products, deliverables, and spend together."
        actions={<Button asChild variant="primary"><Link href="/campaigns/new"><Plus size={16} /> New campaign</Link></Button>}
      />
      {params.archived ? <p role="status" className="mb-4 rounded-lg border border-[#cde3c9] bg-[#eef8eb] px-4 py-3 text-sm text-[#337047]">Campaign archived.</p> : null}
      {campaigns.length ? (
        <>
          <Card className="mb-4 p-3">
            <form className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_180px_auto]" action="/campaigns">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9188]" size={15} />
                <Input className="pl-9" name="q" defaultValue={params.q} placeholder="Search campaign or product" aria-label="Search campaigns" />
              </label>
              <Select name="status" defaultValue={status} aria-label="Filter by status">
                <option value="">All statuses</option>
                {["draft", "active", "completed", "archived"].map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
              </Select>
              <Button type="submit" variant="outline">Apply</Button>
            </form>
          </Card>
          <Card className="overflow-hidden">
            {filtered.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1020px] text-left text-sm">
                  <thead className="border-b border-[#e5e7e0] bg-[#fafbf8] text-[10px] uppercase tracking-[.08em] text-[#8a9087]">
                    <tr>
                      <th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Creators</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Agreed spend</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Outstanding</th><th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((campaign) => {
                      const progress = campaign.creatorCount ? Math.round((campaign.completedCount / campaign.creatorCount) * 100) : 0;
                      return (
                        <tr key={campaign.id} className="border-b border-[#eef0eb] last:border-0 hover:bg-[#fbfcf9]">
                          <td className="px-4 py-4">
                            <Link className="font-semibold hover:underline" href={`/campaigns/${campaign.id}`}>{campaign.name}</Link>
                            <p className="mt-1 text-xs text-[#888e85]">{campaign.brand_name}</p>
                          </td>
                          <td className="px-4 py-4"><Badge tone={campaignTone[campaign.status]}>{campaign.status}</Badge></td>
                          <td className="px-4 py-4 text-xs text-[#666c64]">{format(new Date(`${campaign.start_date}T00:00:00`), "d MMM")} – {format(new Date(`${campaign.end_date}T00:00:00`), "d MMM yyyy")}</td>
                          <td className="px-4 py-4">{campaign.creatorCount}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e5e7e1]"><span className="block h-full rounded-full bg-[#82ad31]" style={{ width: `${progress}%` }} /></span>
                              <span className="font-mono text-[11px] text-[#737970]">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs">{formatCurrency(campaign.agreedSpend)}</td>
                          <td className="px-4 py-4 font-mono text-xs">{formatCurrency(campaign.amountPaid)}</td>
                          <td className="px-4 py-4 font-mono text-xs font-semibold text-[#8b4d0a]">{formatCurrency(campaign.outstanding)}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <Button asChild size="sm" variant="ghost"><Link href={`/campaigns/${campaign.id}/edit`}>Edit</Link></Button>
                              {campaign.status !== "archived" ? <ConfirmForm action={archiveCampaign.bind(null, campaign.id)} label="Archive" message={`Archive ${campaign.name}? You can still view it using the Archived filter.`} /> : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState icon={Search} title="No campaigns match those filters" description="Try a different name or status." />}
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState icon={FolderKanban} title="No campaigns yet" description="Create a launch, gifting program, affiliate push, or UGC campaign and add the creators you’re working with." actionLabel="Create first campaign" href="/campaigns/new" />
        </Card>
      )}
    </>
  );
}
