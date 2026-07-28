import Link from "next/link";
import { format, isBefore, startOfToday } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  FolderKanban,
  Plus,
  Users,
  WalletCards,
} from "lucide-react";
import { getDashboard } from "@/lib/data";
import { requireWorkspace } from "@/lib/supabase/auth";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const campaignTone = { draft: "neutral", active: "green", completed: "blue", archived: "amber" } as const;

export default async function DashboardPage() {
  const [{ profile }, data] = await Promise.all([requireWorkspace(), getDashboard()]);
  const firstName = profile.full_name.split(/\s+/)[0] || "there";

  return (
    <>
      <PageHeader
        eyebrow="E-commerce creator operations"
        title={`Good to see you, ${firstName}`}
        description="Here’s what needs attention across your creator relationships, launches, and payouts."
        actions={
          <>
            <Button asChild variant="outline"><Link href="/creators/new"><Users size={16} /> Add creator</Link></Button>
            <Button asChild variant="primary"><Link href="/campaigns/new"><Plus size={16} /> New campaign</Link></Button>
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<FolderKanban size={17} />} label="Active campaigns" value={String(data.summary.activeCampaigns)} href="/campaigns?status=active" />
        <SummaryCard icon={<Users size={17} />} label="Active collaborations" value={String(data.summary.activeCollaborations)} href="/campaigns" />
        <SummaryCard icon={<CalendarClock size={17} />} label="Deliverables due this week" value={String(data.summary.dueThisWeek)} href="/campaigns" />
        <SummaryCard icon={<WalletCards size={17} />} label="Outstanding payments" value={formatCurrency(data.summary.outstanding)} href="/payments" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Needs attention</CardTitle><p className="mt-1 text-xs text-[#777d75]">Prioritized by urgency.</p></div>
            {data.attention.length ? <Badge tone="red">{data.attention.length}</Badge> : null}
          </CardHeader>
          <CardContent className="pt-4">
            {data.attention.length ? (
              <div className="grid gap-2">
                {data.attention.slice(0, 7).map((item) => {
                  const overdue = item.reason.includes("Overdue");
                  return (
                    <Link key={item.collaboration.id} href={`/campaigns/${item.campaign.id}`} className="group flex items-start gap-3 rounded-lg border border-[#e7e9e3] p-3 transition hover:border-[#ced2c8] hover:bg-[#fbfcf9]">
                      <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${overdue ? "bg-[#fde8e6] text-[#a34239]" : "bg-[#fff3d8] text-[#8a5d08]"}`}><AlertTriangle size={15} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2"><strong className="truncate text-sm">{item.creator.full_name}</strong><Badge tone={overdue ? "red" : "amber"}>{item.reason}</Badge></span>
                        <span className="mt-1 block truncate text-xs text-[#777d75]">{item.campaign.name} · {item.collaboration.deliverable_description}</span>
                      </span>
                      <ArrowRight className="mt-2 shrink-0 text-[#a0a59e] transition group-hover:translate-x-0.5" size={14} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-56 place-items-center text-center">
                <div><span className="mx-auto grid size-10 place-items-center rounded-xl bg-[#e8f5e4] text-[#337047]">✓</span><h3 className="mt-3 text-sm font-semibold">Nothing urgent right now</h3><p className="mt-1 text-xs text-[#7c8279]">Overdue content, due payouts, and creator follow-ups will appear here.</p></div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Recent campaigns</CardTitle><p className="mt-1 text-xs text-[#777d75]">Your active operating view.</p></div>
            <Button asChild variant="ghost" size="sm"><Link href="/campaigns">View all <ArrowRight size={14} /></Link></Button>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            {data.campaigns.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-y border-[#e7e9e3] bg-[#fafbf8] text-[10px] uppercase tracking-[.08em] text-[#8a9087]">
                    <tr><th className="px-5 py-2.5">Campaign</th><th className="px-4 py-2.5">Progress</th><th className="px-4 py-2.5">Deadline</th><th className="px-4 py-2.5">Outstanding</th><th className="px-4 py-2.5">Status</th></tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((campaign) => {
                      const progress = campaign.creatorCount ? Math.round((campaign.completedCount / campaign.creatorCount) * 100) : 0;
                      const overdue = isBefore(new Date(`${campaign.end_date}T00:00:00`), startOfToday()) && campaign.status === "active";
                      return (
                        <tr key={campaign.id} className="border-b border-[#eef0eb] last:border-0">
                          <td className="px-5 py-3.5"><Link className="font-semibold hover:underline" href={`/campaigns/${campaign.id}`}>{campaign.name}</Link><p className="mt-1 text-xs text-[#858b82]">{campaign.creatorCount} creators</p></td>
                          <td className="px-4 py-3.5"><div className="flex items-center gap-2"><span className="h-1.5 w-14 overflow-hidden rounded-full bg-[#e5e7e1]"><span className="block h-full rounded-full bg-[#82ad31]" style={{ width: `${progress}%` }} /></span><span className="font-mono text-[10px]">{progress}%</span></div></td>
                          <td className={`px-4 py-3.5 text-xs ${overdue ? "font-semibold text-[#a34239]" : "text-[#666c64]"}`}>{format(new Date(`${campaign.end_date}T00:00:00`), "d MMM yyyy")}</td>
                          <td className="px-4 py-3.5 font-mono text-xs">{formatCurrency(campaign.outstanding)}</td>
                          <td className="px-4 py-3.5"><Badge tone={campaignTone[campaign.status]}>{campaign.status}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center px-6 text-center">
                <div><FolderKanban className="mx-auto text-[#8b9188]" size={22} /><h3 className="mt-3 text-sm font-semibold">No campaigns yet</h3><p className="mt-1 text-xs text-[#777d75]">Create your first campaign to connect creators, products, content, and spend.</p><Button asChild variant="primary" size="sm" className="mt-4"><Link href="/campaigns/new"><Plus size={14} /> New campaign</Link></Button></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SummaryCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-[#c9ccc3] group-hover:shadow-sm">
        <CardContent>
          <div className="flex items-center justify-between text-[#7b8178]"><span className="grid size-8 place-items-center rounded-lg bg-[#f0f1eb]">{icon}</span><ArrowRight className="opacity-0 transition group-hover:opacity-100" size={14} /></div>
          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">{value}</p>
          <p className="mt-1 text-xs text-[#777d75]">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
