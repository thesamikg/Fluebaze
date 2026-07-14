import { ArrowUpRight, Check, CircleDollarSign, Clock3, MoreHorizontal, Sparkles } from "lucide-react";

const creators = [
  { initials: "AM", name: "Aisha Mehta", handle: "@aishamakes", status: "Approved", color: "violet" },
  { initials: "JR", name: "Jonah Reed", handle: "@jonahdaily", status: "In review", color: "blue" },
  { initials: "NS", name: "Nina Shah", handle: "@ninastudio", status: "Draft due", color: "orange" },
];

export function ProductMockup() {
  return (
    <div className="dashboard-shell" aria-label="Preview of a Fluebaze campaign dashboard">
      <div className="mock-browser-bar">
        <div className="browser-dots"><i /><i /><i /></div>
        <span>Fluebaze / Summer social launch</span>
        <div className="browser-avatar">SK</div>
      </div>
      <div className="dashboard-grid">
        <aside className="mock-sidebar">
          <div className="mini-brand"><span>F</span></div>
          {['⌂','◫','◎','✓','◒'].map((item, index) => <span className={index === 1 ? "active" : ""} key={item}>{item}</span>)}
        </aside>
        <div className="dashboard-main">
          <div className="dashboard-heading">
            <div><span className="mock-kicker">CAMPAIGN OVERVIEW</span><h3>Summer social launch</h3></div>
            <button type="button">View campaign <ArrowUpRight size={14} /></button>
          </div>
          <div className="metric-row">
            <Metric label="Active creators" value="24" change="+4 this week" />
            <Metric label="Total reach" value="1.8M" change="↑ 12.4%" accent />
            <Metric label="Content live" value="38" change="6 awaiting" />
            <Metric label="Campaign spend" value="$12.4k" change="68% paid" />
          </div>
          <div className="mock-content-grid">
            <div className="pipeline-card mock-card">
              <div className="mock-card-title"><div><Sparkles size={15} /> Collaboration pipeline</div><MoreHorizontal size={16} /></div>
              <div className="pipeline-columns">
                <PipelineColumn title="Contacted" count={8} names={["Ravi K.", "Maya J."]} />
                <PipelineColumn title="Confirmed" count={6} names={["Aisha M.", "Jonah R."]} highlight />
                <PipelineColumn title="Content due" count={5} names={["Nina S.", "Leo P."]} />
                <PipelineColumn title="Posted" count={12} names={["Dara C.", "Mila T."]} success />
              </div>
            </div>
            <div className="creators-card mock-card">
              <div className="mock-card-title"><div>Creators</div><span>View all</span></div>
              <div className="creator-list">
                {creators.map((creator) => (
                  <div className="creator-row" key={creator.name}>
                    <span className={`creator-avatar ${creator.color}`}>{creator.initials}</span>
                    <span className="creator-name"><b>{creator.name}</b><small>{creator.handle}</small></span>
                    <span className={`status-pill ${creator.status === "Approved" ? "success" : ""}`}>{creator.status}</span>
                  </div>
                ))}
              </div>
              <div className="payment-summary">
                <div><CircleDollarSign size={16} /><span><b>18 payments</b><small>$8,420 of $12,400 paid</small></span></div>
                <span className="progress-ring">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, change, accent }: { label: string; value: string; change: string; accent?: boolean }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small className={accent ? "accent" : ""}>{change}</small></div>;
}

function PipelineColumn({ title, count, names, highlight, success }: { title: string; count: number; names: string[]; highlight?: boolean; success?: boolean }) {
  return (
    <div className="pipeline-column">
      <div className="pipeline-title"><span>{title}</span><b>{count}</b></div>
      {names.map((name, index) => (
        <div className="pipeline-item" key={name}>
          <div><span className={`tiny-avatar tone-${index}`}>{name[0]}</span><b>{name}</b></div>
          <small>{success ? <><Check size={10} /> Live</> : highlight ? <><Clock3 size={10} /> In progress</> : index ? "1 Reel" : "2 assets"}</small>
        </div>
      ))}
    </div>
  );
}
