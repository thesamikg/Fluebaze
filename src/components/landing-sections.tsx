import {
  ArrowDown, ArrowRight, BadgeDollarSign, BarChart3, Check, CheckCircle2,
  CircleAlert, CircleDollarSign, ClipboardCheck, Clock3, FileCheck2, FolderKanban,
  Handshake, Layers3, MessageSquareText, ReceiptText, Sparkles, UserRound, UsersRound,
} from "lucide-react";
import { ProductMockup } from "@/components/product-mockup";
import { ProductPreview } from "@/components/product-preview";
import { WaitlistForm } from "@/components/waitlist-form";
import { FAQ } from "@/components/faq";
import { Reveal } from "@/components/reveal";
import { audiences, problems, siteConfig, workflow } from "@/lib/site-config";

export function HeroSection() {
  return (
    <section id="top" className="hero section-grid-bg">
      <div className="hero-glow" />
      <div className="container hero-inner">
        <Reveal className="hero-copy">
          <div className="eyebrow"><Sparkles size={13} /> Influencer campaign management for growing brands</div>
          <h1>Manage every influencer collaboration from one <span>simple workspace.</span></h1>
          <p>Organize outreach, briefs, deliverables, approvals, payments, and campaign results without juggling spreadsheets, email threads, and WhatsApp messages.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#waitlist">Join the waitlist <ArrowRight size={17} /></a>
            <a className="button button-secondary" href="#how-it-works">See how it works <ArrowDown size={16} /></a>
          </div>
          <div className="hero-audience"><span className="avatar-stack"><i>A</i><i>M</i><i>J</i></span>Built for small brands, D2C teams, and influencer agencies.</div>
        </Reveal>
        <Reveal className="hero-preview" delay={0.12}><ProductMockup /></Reveal>
      </div>
    </section>
  );
}

export function ProblemSection() {
  const icons = [Layers3, MessageSquareText, Clock3, FileCheck2, ReceiptText, BarChart3];
  return (
    <section className="section problem-section">
      <div className="container">
        <Reveal className="section-heading split-heading"><div><span className="section-label">THE PROBLEM</span><h2>Influencer campaigns should not be managed across five different tools.</h2></div><p>When campaign information lives everywhere, small tasks become slow, handoffs get missed, and nobody has the full picture.</p></Reveal>
        <div className="problem-grid">
          {problems.map((problem, index) => { const Icon = icons[index]; return <Reveal key={problem} delay={index * 0.04} className="problem-card"><div className="icon-box"><Icon size={18} /></div><p>{problem}</p><span>0{index + 1}</span></Reveal>; })}
        </div>
        <Reveal className="problem-resolution"><span className="resolution-icon"><Check size={18} /></span><p><strong>{siteConfig.name}</strong> gives your team one place to manage the complete collaboration lifecycle.</p></Reveal>
      </div>
    </section>
  );
}

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="section workflow-section">
      <div className="container">
        <Reveal className="section-heading centered"><span className="section-label">HOW IT WORKS</span><h2>From first outreach to final results.</h2><p>A clear workflow for every creator, deliverable, and detail—without adding enterprise complexity.</p></Reveal>
        <div className="workflow-line">
          {workflow.map((step, index) => <Reveal className="workflow-step" key={step.title} delay={index * 0.07}><div className="step-number">{index + 1}</div><h3>{step.title}</h3><p>{step.description}</p></Reveal>)}
        </div>
      </div>
    </section>
  );
}

const features = [
  { title: "Creator CRM", description: "Profiles, contacts, social accounts, notes, rates, past campaigns, and relationship history—all together.", icon: UserRound, className: "feature-wide", visual: <div className="mini-profile"><span>AM</span><div><b>Aisha Mehta</b><small>Lifestyle · Instagram</small></div><em>Active</em></div> },
  { title: "Campaign Pipeline", description: "See the stage of every creator collaboration in one visual pipeline.", icon: FolderKanban, visual: <div className="mini-pipeline"><i /><i /><i /><i /></div> },
  { title: "Deliverable Tracking", description: "Track reels, posts, stories, deadlines, live links, and requirements.", icon: ClipboardCheck },
  { title: "Content Approvals", description: "Collect drafts, share feedback, request revisions, and approve content in context.", icon: FileCheck2, className: "feature-tall", visual: <div className="approval-card"><div><span>Draft v2</span><em>00:14 / 00:32</em></div><i /><p><CheckCircle2 size={14} /> Ready to approve</p></div> },
  { title: "Creator Portal", description: "A secure page for briefs, uploads, live links, and invoices.", icon: Handshake },
  { title: "Payment Tracking", description: "Record fees, invoices, due dates, and payment status.", icon: BadgeDollarSign, visual: <div className="mini-payment"><span><CircleDollarSign size={15} /> Pending</span><b>$4,820</b></div> },
  { title: "Campaign Reporting", description: "Track reach, views, engagement, conversions, cost, and creator performance.", icon: BarChart3, className: "feature-wide", visual: <div className="feature-chart">{[35, 52, 47, 70, 61, 82, 76, 95].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div> },
  { title: "Team Collaboration", description: "Add notes, assign tasks, update stages, and follow recent activity.", icon: UsersRound },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="section features-section">
      <div className="container"><Reveal className="section-heading"><span className="section-label">EVERYTHING IN SYNC</span><h2>One calm workspace for busy campaigns.</h2><p>Enough structure to keep every collaboration moving, without turning your process into a full-time job.</p></Reveal>
        <div className="features-grid">{features.map((feature, index) => { const Icon = feature.icon; return <Reveal key={feature.title} delay={(index % 4) * 0.04} className={`feature-card ${"className" in feature ? feature.className ?? "" : ""}`}><div className="feature-icon"><Icon size={19} /></div><h3>{feature.title}</h3><p>{feature.description}</p>{"visual" in feature && feature.visual}</Reveal>; })}</div>
      </div>
    </section>
  );
}

export function ProductPreviewSection() {
  return <section id="product" className="section product-section"><div className="container"><Reveal className="section-heading centered"><span className="section-label">PRODUCT PREVIEW</span><h2>See the whole campaign. Know what comes next.</h2><p>Switch between the core parts of your workspace to see how Fluebaze keeps the work connected.</p></Reveal><Reveal><ProductPreview /></Reveal></div></section>;
}

export function AudienceSection() {
  const icons = [Sparkles, UsersRound, Handshake];
  return <section className="section audience-section"><div className="container"><Reveal className="section-heading split-heading"><div><span className="section-label">BUILT FOR YOUR TEAM</span><h2>Simple enough to start today. Structured enough to grow.</h2></div><p>Whether campaigns live with a founder, a lean marketing team, or an agency, everyone gets the same clear source of truth.</p></Reveal><div className="audience-grid">{audiences.map((audience, i) => { const Icon = icons[i]; return <Reveal className="audience-card" key={audience.title} delay={i * 0.06}><div><Icon size={21} /><span>0{i + 1}</span></div><h3>{audience.title}</h3><p>{audience.description}</p><span className="audience-link">A workspace that fits <ArrowRight size={14} /></span></Reveal>; })}</div></div></section>;
}

export function ComparisonSection() {
  const before = ["Google Sheets", "WhatsApp follow-ups", "Email approvals", "Drive folders", "Manual payment tracking", "Manually created campaign reports"];
  const after = ["One creator database", "One campaign pipeline", "Clear deadlines", "Centralized approvals", "Visible payment status", "Simple campaign reporting"];
  return <section className="section comparison-section"><div className="container comparison-grid"><Reveal className="comparison-copy"><span className="section-label">BEFORE & AFTER</span><h2>Replace campaign chaos with one clear operating rhythm.</h2><p>Give your team less admin, fewer status meetings, and more time for the relationships and creative work that move a campaign forward.</p></Reveal><Reveal className="comparison-cards"><div className="comparison-card before"><h3><CircleAlert size={18} /> Before {siteConfig.name}</h3>{before.map((item) => <div key={item}><span>×</span>{item}</div>)}</div><div className="comparison-card after"><h3><CheckCircle2 size={18} /> With {siteConfig.name}</h3>{after.map((item) => <div key={item}><span><Check size={12} /></span>{item}</div>)}</div></Reveal></div></section>;
}

export function EarlyAccessSection() {
  const benefits = [{ icon: Sparkles, title: "Early product access", text: "Be among the first teams inside Fluebaze." }, { icon: MessageSquareText, title: "Influence the roadmap", text: "Tell us which workflows matter most." }, { icon: BadgeDollarSign, title: "Founding-customer pricing", text: "Receive special pricing before launch." }];
  return <section className="section early-section"><div className="container early-card"><Reveal className="early-copy"><span className="section-label">EARLY ACCESS</span><h2>Help us build the influencer CRM your team actually needs.</h2><p>We are inviting a small group of brands and agencies to test the first version, influence the roadmap, and receive early-launch benefits.</p></Reveal><div className="benefits-list">{benefits.map(({ icon: Icon, title, text }, i) => <Reveal className="benefit" key={title} delay={i * .06}><span><Icon size={18} /></span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}</div></div></section>;
}

export function WaitlistSection() {
  return <section id="waitlist" className="section waitlist-section"><div className="container waitlist-grid"><Reveal className="waitlist-copy"><span className="section-label">JOIN THE WAITLIST</span><h2>Get a calmer campaign workflow from day one.</h2><p>Tell us a little about your team. We’ll use your answers to shape early access and make sure Fluebaze fits the way you actually work.</p><div className="form-expectations"><span><Check size={14} /> Takes less than two minutes</span><span><Check size={14} /> No commitment required</span><span><Check size={14} /> Founding-customer benefits</span></div></Reveal><Reveal className="form-card" delay={.08}><WaitlistForm /></Reveal></div></section>;
}

export function FAQSection() {
  return <section id="faq" className="section faq-section"><div className="container faq-grid"><Reveal className="faq-copy"><span className="section-label">COMMON QUESTIONS</span><h2>Good things to know before you join.</h2><p>Still curious? Email us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p></Reveal><Reveal><FAQ /></Reveal></div></section>;
}

export function FinalCTA() {
  return <section className="section final-section"><Reveal className="container final-card"><div className="final-orb" /><span className="section-label">A BETTER WAY TO RUN CAMPAIGNS</span><h2>Run your next influencer campaign without the spreadsheet chaos.</h2><p>Join the waitlist and help shape a simpler way to manage creator collaborations.</p><a className="button button-light" href="#waitlist">Join the waitlist <ArrowRight size={17} /></a></Reveal></section>;
}
