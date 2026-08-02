import { ArrowUpRight, Check, CircleDollarSign, Clock3, MoreHorizontal, Sparkles } from "lucide-react";

const creators = [
  { initials: "AM", name: "Aisha Mehta", handle: "AMGLOW20 · 38 orders", status: "Top performer", color: "violet" },
  { initials: "JR", name: "Jonah Reed", handle: "Product delivered · 16 Jul", status: "Draft due", color: "blue" },
  { initials: "NS", name: "Nina Shah", handle: "Usage rights · 90 days", status: "In review", color: "orange" },
];

export function ProductMockup() {
  return (
    <div className="dashboard-shell" aria-label="Preview of a Fluebaze campaign dashboard">
      <div className="mock-browser-bar">
        <div className="browser-dots"><i /><i /><i /></div>
        <span>Fluebaze / Glow Reset launch</span>
        <div className="browser-avatar">SK</div>
      </div>
      <div className="dashboard-grid">
        <aside className="mock-sidebar">
          <div className="mini-brand"><span>F</span></div>
          {['⌂','◫','◎','✓','◒'].map((item, index) => <span className={index === 1 ? "active" : ""} key={item}>{item}</span>)}
        </aside>
        <div className="dashboard-main">
          <div className="dashboard-heading">
            <div><span className="mock-kicker">ECOMMERCE CAMPAIGN</span><h3>Glow Reset launch</h3></div>
            <button type="button">View campaign <ArrowUpRight size={14} /></button>
          </div>
          <div className="metric-row">
            <Metric label="Attributed revenue" value="$48.6k" change="↑ 18.4%" accent />
            <Metric label="Creator orders" value="386" change="+64 this week" />
            <Metric label="Campaign ROAS" value="3.9×" change="Target 3.0×" accent />
            <Metric label="Total cost" value="$12.4k" change="Fees + gifting" />
          </div>
          <div className="mock-content-grid">
            <div className="pipeline-card mock-card">
              <div className="mock-card-title"><div><Sparkles size={15} /> Creator campaign pipeline</div><MoreHorizontal size={16} /></div>
              <div className="pipeline-columns">
                <PipelineColumn title="Contacted" count={8} names={["Ravi K.", "Maya J."]} />
                <PipelineColumn title="Product sent" count={6} names={["Aisha M.", "Jonah R."]} highlight />
                <PipelineColumn title="Content review" count={5} names={["Nina S.", "Leo P."]} />
                <PipelineColumn title="Live" count={12} names={["Dara C.", "Mila T."]} success />
              </div>
            </div>
            <div className="creators-card mock-card">
              <div className="mock-card-title"><div>Creator performance</div><span>View CRM</span></div>
              <div className="creator-list">
                {creators.map((creator) => (
                  <div className="creator-row" key={creator.name}>
                    <span className={`creator-avatar ${creator.color}`}>{creator.initials}</span>
                    <span className="creator-name"><b>{creator.name}</b><small>{creator.handle}</small></span>
                    <span className={`status-pill ${creator.status === "Top performer" ? "success" : ""}`}>{creator.status}</span>
                  </div>
                ))}
              </div>
              <div className="payment-summary">
                <div><CircleDollarSign size={16} /><span><b>Creator economics</b><small>$48,600 revenue on $12,400 cost</small></span></div>
                <span className="progress-ring">3.9×</span>
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
