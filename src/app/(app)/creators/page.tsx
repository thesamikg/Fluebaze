import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus, Search, Users } from "lucide-react";
import { getCreators } from "@/lib/data";
import { paymentLabel, paymentTone } from "@/lib/payment";
import { deleteCreator } from "@/app/(app)/creators/actions";
import { PageHeader } from "@/components/app/page-header";
import { ConfirmForm } from "@/components/app/confirm-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; platform?: string; tag?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const creators = await getCreators();
  const q = params.q?.trim().toLowerCase() ?? "";
  const platform = params.platform ?? "";
  const tag = params.tag ?? "";
  const allTags = [...new Set(creators.flatMap((creator) => creator.tags.map((item) => item.name)))].sort();
  const filtered = creators.filter((creator) => {
    const matchesQuery = !q || creator.full_name.toLowerCase().includes(q) || creator.handle.toLowerCase().includes(q);
    const matchesPlatform = !platform || creator.platform === platform;
    const matchesTag = !tag || creator.tags.some((item) => item.name === tag);
    return matchesQuery && matchesPlatform && matchesTag;
  });

  return (
    <>
      <PageHeader
        eyebrow="Relationship and performance memory"
        title="Creator CRM"
        description={`${creators.length} creator relationship${creators.length === 1 ? "" : "s"} with contacts, rates, fit, campaign history, and payout context.`}
        actions={<Button asChild variant="primary"><Link href="/creators/new"><Plus size={16} /> Add creator</Link></Button>}
      />
      {params.deleted ? <p role="status" className="mb-4 rounded-lg border border-[#cde3c9] bg-[#eef8eb] px-4 py-3 text-sm text-[#337047]">Creator deleted.</p> : null}
      {creators.length ? (
        <>
          <Card className="mb-4 p-3">
            <form className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_180px_180px_auto]" action="/creators">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9188]" size={15} />
                <Input name="q" defaultValue={params.q} className="pl-9" placeholder="Search name or handle" aria-label="Search creators" />
              </label>
              <Select name="platform" defaultValue={platform} aria-label="Filter by platform">
                <option value="">All platforms</option>
                {["Instagram", "TikTok", "YouTube", "X", "LinkedIn", "Other"].map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Select name="tag" defaultValue={tag} aria-label="Filter by tag">
                <option value="">All tags</option>
                {allTags.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Button type="submit" variant="outline">Apply</Button>
            </form>
          </Card>
          <Card className="overflow-hidden">
            {filtered.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] border-collapse text-left text-sm">
                  <thead className="border-b border-[#e5e7e0] bg-[#fafbf8] text-[10px] uppercase tracking-[.08em] text-[#8a9087]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Creator</th>
                      <th className="px-4 py-3 font-semibold">Platform</th>
                      <th className="px-4 py-3 font-semibold">Niche</th>
                      <th className="px-4 py-3 font-semibold">Followers</th>
                      <th className="px-4 py-3 font-semibold">Active campaigns</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Updated</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((creator) => (
                      <tr key={creator.id} className="border-b border-[#eef0eb] last:border-0 hover:bg-[#fbfcf9]">
                        <td className="px-4 py-3.5">
                          <Link href={`/creators/${creator.id}`} className="font-semibold text-[#242924] hover:underline">{creator.full_name}</Link>
                          <p className="mt-1 text-xs text-[#8b9188]">{creator.handle || "No handle"}</p>
                          {creator.tags.length ? <div className="mt-1.5 flex gap-1">{creator.tags.slice(0, 2).map((item) => <Badge key={item.id}>{item.name}</Badge>)}</div> : null}
                        </td>
                        <td className="px-4 py-3.5"><Badge tone="blue">{creator.platform}</Badge></td>
                        <td className="px-4 py-3.5 text-[#666c64]">{creator.niche || "—"}</td>
                        <td className="px-4 py-3.5 font-mono text-xs">{new Intl.NumberFormat("en", { notation: "compact" }).format(creator.follower_count)}</td>
                        <td className="px-4 py-3.5">{creator.activeCampaigns}</td>
                        <td className="px-4 py-3.5">
                          {creator.paymentStatus ? <Badge tone={paymentTone(creator.paymentStatus)}>{paymentLabel(creator.paymentStatus)}</Badge> : <span className="text-[#a0a59e]">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#7c8279]">{formatDistanceToNow(new Date(creator.updated_at), { addSuffix: true })}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1">
                            <Button asChild size="sm" variant="ghost"><Link href={`/creators/${creator.id}/edit`}>Edit</Link></Button>
                            <ConfirmForm
                              action={deleteCreator.bind(null, creator.id)}
                              label="Delete"
                              message={`Delete ${creator.full_name}? Their campaign history and payment records will also be removed.`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Search} title="No creators match those filters" description="Try a different name, platform or tag." />
            )}
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState icon={Users} title="No creators yet" description="Add a creator to start building a relationship record your whole e-commerce team can use." actionLabel="Add your first creator" href="/creators/new" />
        </Card>
      )}
    </>
  );
}
