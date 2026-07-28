"use client";

import { useState } from "react";
import { Activity, Check, CircleDollarSign, Gift, LayoutDashboard, Search, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Campaigns", "Creator CRM", "Seeding", "Payouts", "Revenue"] as const;
type Tab = (typeof tabs)[number];

const newItemLabels: Record<Tab, string> = {
  Campaigns: "campaign",
  "Creator CRM": "creator",
  Seeding: "shipment",
  Payouts: "payout",
  Revenue: "report",
};

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
          {[LayoutDashboard, Users, Gift, CircleDollarSign, TrendingUp].map((Icon, i) => <Icon key={i} size={18} className={i === tabs.indexOf(active) ? "active" : ""} />)}
          <div className="preview-user">SK</div>
        </div>
        <div className="preview-main">
          <div className="preview-topbar">
            <div><span className="mock-kicker">ASTER & BLOOM</span><h3>{active}</h3></div>
            <div className="search-box"><Search size={14} /> Search creators, codes, campaigns</div>
            <button type="button">+ New {newItemLabels[active]}</button>
          </div>
          <PreviewContent active={active} />
        </div>
      </div>
    </div>
  );
}

function PreviewContent({ active }: { active: Tab }) {
  if (active === "Creator CRM") return <CreatorsPreview />;
  if (active === "Seeding") return <DeliverablesPreview />;
  if (active === "Payouts") return <PaymentsPreview />;
  if (active === "Revenue") return <ReportsPreview />;
  return <CampaignsPreview />;
}

function CampaignsPreview() {
  const campaigns = [
    ["Glow Reset launch", "24 creators", "Live", "3.9× ROAS"],
    ["Hydration Week", "12 creators", "Content review", "2.8× ROAS"],
    ["Everyday SPF", "18 creators", "Seeding", "1.6× ROAS"],
  ];
  return <div className="preview-body"><div className="preview-stat-strip"><Stat icon={TrendingUp} label="Attributed revenue" value="$124.8k" /><Stat icon={ShoppingBag} label="Creator orders" value="986" /><Stat icon={Users} label="Active creators" value="64" /></div><div className="preview-table"><div className="table-head"><span>Campaign</span><span>Creators</span><span>Status</span><span>Return</span></div>{campaigns.map((row, i) => <div className="table-row" key={row[0]}><span><i className={`campaign-thumb c${i}`} /> <b>{row[0]}</b></span><span>{row[1]}</span><span><em>{row[2]}</em></span><span><b>{row[3]}</b></span></div>)}</div></div>;
}

function CreatorsPreview() {
  const rows = [["AM", "Aisha Mehta", "Beauty · Instagram · 4.8% ER", "$18.4k revenue", "Repeat partner"], ["JR", "Jonah Reed", "Wellness · TikTok · 5.2% ER", "$9.8k revenue", "Product sent"], ["NS", "Nina Shah", "Skincare · Instagram · 6.1% ER", "$24.2k revenue", "Top performer"], ["LC", "Leo Chen", "Fitness · YouTube · 3.9% ER", "$12.6k revenue", "Contracted"]];
  return <div className="preview-body"><div className="preview-filter-row"><span>All creators <b>128</b></span><span>Repeat partners <b>36</b></span><span>Top performers <b>18</b></span></div><div className="creator-table">{rows.map((row, i) => <div key={row[1]}><span className={`creator-avatar tone-${i % 2}`}>{row[0]}</span><span><b>{row[1]}</b><small>{row[2]}</small></span><span>{row[3]}</span><span>{row[4]}</span><button aria-label={`Open ${row[1]}`} type="button">•••</button></div>)}</div></div>;
}

function DeliverablesPreview() {
  const items = [["Aisha Mehta", "Glow Set · 2 SKUs", "Packed", "Today"], ["Jonah Reed", "Daily Duo · 2 SKUs", "In transit", "Tomorrow"], ["Nina Shah", "SPF Kit · 3 SKUs", "Delivered", "12 Aug"], ["Leo Chen", "Reset Bundle · 3 SKUs", "Packed", "14 Aug"]];
  return <div className="preview-body"><div className="kanban-mini">{["Ready to send", "In transit", "Delivered"].map((stage, stageIndex) => <div key={stage}><h4>{stage}<b>{stageIndex + 2}</b></h4>{items.filter((_, i) => i % 3 === stageIndex || (stageIndex === 0 && i === 3)).map((item) => <article key={item[1]}><span className="asset-type"><Gift size={14} /> PRODUCT SEEDING</span><b>{item[1]}</b><small>{item[0]}</small><footer><span>{item[3]}</span>{stageIndex === 2 && <Check size={13} />}</footer></article>)}</div>)}</div></div>;
}

function PaymentsPreview() {
  const payments = [["Nina Shah", "Glow Reset launch", "$720", "Paid"], ["Aisha Mehta", "Glow Reset launch", "$650", "Due Aug 18"], ["Jonah Reed", "Hydration Week", "$480", "Invoice needed"], ["Leo Chen", "Everyday SPF", "$890", "Scheduled"]];
  return <div className="preview-body"><div className="preview-stat-strip"><Stat icon={CircleDollarSign} label="Creator fees" value="$18.2k" /><Stat icon={Gift} label="Gifted product value" value="$4.6k" /><Stat icon={Check} label="Paid this month" value="$11.4k" /></div><div className="preview-table payments"><div className="table-head"><span>Creator</span><span>Campaign</span><span>Fee</span><span>Status</span></div>{payments.map((row, i) => <div className="table-row" key={row[0]}><span><span className={`tiny-avatar tone-${i % 2}`}>{row[0][0]}</span><b>{row[0]}</b></span><span>{row[1]}</span><span><b>{row[2]}</b></span><span><em className={cn(i === 0 && "paid")}>{row[3]}</em></span></div>)}</div></div>;
}

function ReportsPreview() {
  return <div className="preview-body reports"><div className="preview-stat-strip"><Stat icon={TrendingUp} label="Attributed revenue" value="$124.8k" /><Stat icon={ShoppingBag} label="Creator orders" value="986" /><Stat icon={Activity} label="Blended ROAS" value="3.6×" /></div><div className="report-grid"><div className="chart-card"><span>Attributed revenue over time <b>+18.2%</b></span><div className="bar-chart">{[30, 46, 38, 62, 54, 72, 66, 88, 78, 96, 90, 100].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><div className="chart-labels"><span>Jul 1</span><span>Jul 15</span><span>Jul 30</span></div></div><div className="top-creators"><span>Top creators by revenue</span>{[["Aisha M.", "$18.4k", "4.8×"], ["Nina S.", "$15.1k", "4.2×"], ["Jonah R.", "$12.8k", "3.9×"]].map((row, i) => <div key={row[0]}><b>{i + 1}</b><span>{row[0]}</span><span>{row[1]}</span><em>{row[2]}</em></div>)}</div></div></div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <div><span><Icon size={15} />{label}</span><b>{value}</b></div>;
}
