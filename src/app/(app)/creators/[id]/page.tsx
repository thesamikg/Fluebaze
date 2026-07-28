import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, MapPin, Pencil, Phone, Plus } from "lucide-react";
import { format } from "date-fns";
import { getCreator, getCampaigns } from "@/lib/data";
import { deleteCreator } from "@/app/(app)/creators/actions";
import { PageHeader } from "@/components/app/page-header";
import { ConfirmForm } from "@/components/app/confirm-form";
import { AddCreatorToCampaign } from "@/components/campaigns/add-creator-to-campaign";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getPaymentStatus, paymentLabel, paymentTone } from "@/lib/payment";

export default async function CreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, campaigns] = await Promise.all([getCreator(id), getCampaigns()]);
  if (!data) notFound();
  const { creator, collaborations, tags } = data;
  const totalValue = collaborations.reduce((sum, row) => sum + Number(row.agreed_fee), 0);
  const availableCampaigns = campaigns.filter(
    (campaign) => campaign.status !== "archived" && !collaborations.some((row) => row.campaign_id === campaign.id),
  );

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3"><Link href="/creators"><ArrowLeft size={15} /> All creators</Link></Button>
      <PageHeader
        eyebrow={`${creator.platform} creator`}
        title={creator.full_name}
        description={creator.handle || "No handle added"}
        actions={
          <>
            <Button asChild variant="outline"><Link href={`/creators/${creator.id}/edit`}><Pencil size={15} /> Edit</Link></Button>
            <ConfirmForm action={deleteCreator.bind(null, creator.id)} label="Delete" variant="outline" message={`Delete ${creator.full_name}? Their campaign and payment history will also be removed.`} />
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-5">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Platform" value={<Badge tone="blue">{creator.platform}</Badge>} />
              <Info label="Followers" value={new Intl.NumberFormat("en-IN").format(creator.follower_count)} />
              <Info label="Engagement" value={creator.engagement_rate == null ? "—" : `${creator.engagement_rate}%`} />
              <Info label="Niche" value={creator.niche || "—"} />
              <Info label="Location" value={creator.location ? <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {creator.location}</span> : "—"} />
              <Info label="Expected fee" value={creator.expected_rate == null ? "—" : formatCurrency(creator.expected_rate)} />
              <Info label="Email" value={creator.email ? <a className="inline-flex items-center gap-1.5 hover:underline" href={`mailto:${creator.email}`}><Mail size={13} /> {creator.email}</a> : "—"} />
              <Info label="Phone / WhatsApp" value={creator.phone ? <a className="inline-flex items-center gap-1.5 hover:underline" href={`tel:${creator.phone}`}><Phone size={13} /> {creator.phone}</a> : "—"} />
              <Info label="Profile" value={creator.profile_url ? <a className="inline-flex items-center gap-1.5 text-[#4d7307] hover:underline" href={creator.profile_url} target="_blank" rel="noreferrer">Open profile <ExternalLink size={13} /></a> : "—"} />
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[#90968d]">Tags</p>
                <div className="flex flex-wrap gap-1.5">{tags.length ? tags.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>) : <span className="text-sm text-[#858b82]">No tags</span>}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Campaign history</CardTitle></CardHeader>
            <CardContent className="p-0 pt-4">
              {collaborations.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="border-y border-[#e7e9e3] bg-[#fafbf8] text-[10px] uppercase tracking-[.08em] text-[#8a9087]">
                      <tr><th className="px-5 py-2.5">Campaign</th><th className="px-4 py-2.5">Stage</th><th className="px-4 py-2.5">Deliverable</th><th className="px-4 py-2.5">Agreed</th><th className="px-4 py-2.5">Payment</th></tr>
                    </thead>
                    <tbody>
                      {collaborations.map((row) => {
                        const status = row.payment ? getPaymentStatus(row.payment) : null;
                        return (
                          <tr key={row.id} className="border-b border-[#eef0eb] last:border-0">
                            <td className="px-5 py-3.5"><Link className="font-semibold hover:underline" href={`/campaigns/${row.campaign_id}`}>{row.campaign.name}</Link></td>
                            <td className="px-4 py-3.5"><Badge tone="lime">{row.stage.replace("_", " ")}</Badge></td>
                            <td className="px-4 py-3.5 text-[#666c64]">{row.deliverable_type}</td>
                            <td className="px-4 py-3.5 font-mono text-xs">{formatCurrency(row.agreed_fee, row.currency)}</td>
                            <td className="px-4 py-3.5">{status ? <Badge tone={paymentTone(status)}>{paymentLabel(status)}</Badge> : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p className="px-5 pb-5 text-sm text-[#777d75]">This creator has not been added to a campaign yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Relationship notes</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap text-sm leading-6 text-[#60665e]">{creator.notes || "No notes added yet."}</p></CardContent>
          </Card>
        </div>
        <aside className="grid content-start gap-5">
          <Card className="bg-[#171a17] text-white">
            <CardContent>
              <p className="text-xs text-[#aeb4ab]">Total agreed value</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-.045em]">{formatCurrency(totalValue)}</p>
              <p className="mt-3 text-xs leading-5 text-[#8f968d]">Across {collaborations.length} campaign collaboration{collaborations.length === 1 ? "" : "s"}.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus size={16} /> Add to campaign</CardTitle></CardHeader>
            <CardContent>
              <AddCreatorToCampaign creatorId={creator.id} campaigns={availableCampaigns} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Added" value={format(new Date(creator.created_at), "d MMM yyyy")} />
              <Info label="Updated" value={format(new Date(creator.updated_at), "d MMM yyyy")} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.08em] text-[#90968d]">{label}</p>
      <div className="text-sm text-[#3c423b]">{value}</div>
    </div>
  );
}
