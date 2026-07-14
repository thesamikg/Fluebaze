"use client";

import { useState } from "react";
import { Activity, CalendarDays, Check, CircleDollarSign, FileVideo2, LayoutDashboard, Search, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Campaigns", "Creators", "Deliverables", "Payments", "Reports"] as const;
type Tab = (typeof tabs)[number];

export function ProductPreview() {
  const [active, setActive] = useState<Tab>("Campaigns");

  return (
    <div className="product-preview">
      <div className="preview-tabs" role="tablist" aria-label="Product areas">
        {tabs.map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={active === tab} onClick={() => setActive(tab)}>{tab}</button>
        ))}
      </div>
      <div className="preview-window" role="tabpanel">
        <div className="preview-sidebar">
          <div className="preview-logo">F</div>
          {[LayoutDashboard, Users, FileVideo2, CircleDollarSign, TrendingUp].map((Icon, i) => <Icon key={i} size={18} className={i === tabs.indexOf(active) ? "active" : ""} />)}
          <div className="preview-user">SK</div>
        </div>
        <div className="preview-main">
          <div className="preview-topbar">
            <div><span className="mock-kicker">WORKSPACE</span><h3>{active}</h3></div>
            <div className="search-box"><Search size={14} /> Search anything</div>
            <button type="button">+ New {active.slice(0, -1)}</button>
          </div>
          <PreviewContent active={active} />
        </div>
      </div>
    </div>
  );
}

function PreviewContent({ active }: { active: Tab }) {
  if (active === "Creators") return <CreatorsPreview />;
  if (active === "Deliverables") return <DeliverablesPreview />;
  if (active === "Payments") return <PaymentsPreview />;
  if (active === "Reports") return <ReportsPreview />;
  return <CampaignsPreview />;
}

function CampaignsPreview() {
  const campaigns = [
    ["Summer social launch", "24 creators", "In progress", "74%"],
    ["Hydration week", "12 creators", "Content review", "58%"],
    ["Everyday essentials", "18 creators", "Live", "91%"],
  ];
  return <div className="preview-body"><div className="preview-stat-strip"><Stat icon={Activity} label="Active campaigns" value="8" /><Stat icon={Users} label="Creators active" value="64" /><Stat icon={CalendarDays} label="Due this week" value="11" /></div><div className="preview-table"><div className="table-head"><span>Campaign</span><span>Creators</span><span>Status</span><span>Progress</span></div>{campaigns.map((row, i) => <div className="table-row" key={row[0]}><span><i className={`campaign-thumb c${i}`} /> <b>{row[0]}</b></span><span>{row[1]}</span><span><em>{row[2]}</em></span><span><i className="mini-progress"><i style={{ width: row[3] }} /></i>{row[3]}</span></div>)}</div></div>;
}

function CreatorsPreview() {
  const rows = [["AM", "Aisha Mehta", "Lifestyle · Instagram", "$650", "4 campaigns"], ["JR", "Jonah Reed", "Wellness · TikTok", "$480", "2 campaigns"], ["NS", "Nina Shah", "Beauty · Instagram", "$720", "6 campaigns"], ["LC", "Leo Chen", "Fitness · YouTube", "$890", "3 campaigns"]];
  return <div className="preview-body"><div className="preview-filter-row"><span>All creators <b>128</b></span><span>Active <b>64</b></span><span>Favorites <b>18</b></span></div><div className="creator-table">{rows.map((row, i) => <div key={row[1]}><span className={`creator-avatar tone-${i % 2}`}>{row[0]}</span><span><b>{row[1]}</b><small>{row[2]}</small></span><span>{row[3]}</span><span>{row[4]}</span><button aria-label={`Open ${row[1]}`} type="button">•••</button></div>)}</div></div>;
}

function DeliverablesPreview() {
  const items = [["Aisha Mehta", "Morning routine reel", "Draft review", "Today"], ["Jonah Reed", "Product story set", "Changes requested", "Tomorrow"], ["Nina Shah", "Unboxing reel", "Approved", "Aug 12"], ["Leo Chen", "YouTube integration", "Awaiting draft", "Aug 14"]];
  return <div className="preview-body"><div className="kanban-mini">{["Awaiting draft", "In review", "Approved"].map((stage, stageIndex) => <div key={stage}><h4>{stage}<b>{stageIndex + 2}</b></h4>{items.filter((_, i) => i % 3 === stageIndex || (stageIndex === 0 && i === 3)).map((item) => <article key={item[1]}><span className="asset-type"><FileVideo2 size={14} /> REEL</span><b>{item[1]}</b><small>{item[0]}</small><footer><span>{item[3]}</span>{stageIndex === 2 && <Check size={13} />}</footer></article>)}</div>)}</div></div>;
}

function PaymentsPreview() {
  const payments = [["Nina Shah", "Summer social launch", "$720", "Paid"], ["Aisha Mehta", "Summer social launch", "$650", "Due Aug 18"], ["Jonah Reed", "Hydration week", "$480", "Invoice needed"], ["Leo Chen", "Everyday essentials", "$890", "Scheduled"]];
  return <div className="preview-body"><div className="preview-stat-strip"><Stat icon={CircleDollarSign} label="Total committed" value="$18.2k" /><Stat icon={Check} label="Paid this month" value="$11.4k" /><Stat icon={CalendarDays} label="Upcoming" value="$4.8k" /></div><div className="preview-table payments"><div className="table-head"><span>Creator</span><span>Campaign</span><span>Amount</span><span>Status</span></div>{payments.map((row, i) => <div className="table-row" key={row[0]}><span><span className={`tiny-avatar tone-${i % 2}`}>{row[0][0]}</span><b>{row[0]}</b></span><span>{row[1]}</span><span><b>{row[2]}</b></span><span><em className={cn(i === 0 && "paid")}>{row[3]}</em></span></div>)}</div></div>;
}

function ReportsPreview() {
  return <div className="preview-body reports"><div className="preview-stat-strip"><Stat icon={Users} label="Total reach" value="1.8M" /><Stat icon={Activity} label="Engagement" value="5.8%" /><Stat icon={TrendingUp} label="Conversions" value="3,240" /></div><div className="report-grid"><div className="chart-card"><span>Views over time <b>+18.2%</b></span><div className="bar-chart">{[30, 46, 38, 62, 54, 72, 66, 88, 78, 96, 90, 100].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><div className="chart-labels"><span>Jul 1</span><span>Jul 15</span><span>Jul 30</span></div></div><div className="top-creators"><span>Top creators</span>{[["Aisha M.", "420k", "6.8%"], ["Nina S.", "310k", "6.2%"], ["Jonah R.", "248k", "5.9%"]].map((row, i) => <div key={row[0]}><b>{i + 1}</b><span>{row[0]}</span><span>{row[1]}</span><em>{row[2]}</em></div>)}</div></div></div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <div><span><Icon size={15} />{label}</span><b>{value}</b></div>;
}
