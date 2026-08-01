import {
  ArrowDown, ArrowRight, BadgeDollarSign, BarChart3, Check, CheckCircle2,
  CircleAlert, CircleDollarSign, ClipboardCheck, Clock3, FileCheck2,
  Layers3, MessageSquareText, PackageCheck, ReceiptText, ShoppingBag, Sparkles,
  Tags, UserRound, UsersRound,
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
          <div className="eyebrow"><ShoppingBag size={13} /> The influencer CRM for e-commerce brands</div>
          <h1>Run creator campaigns like a <span>revenue channel.</span></h1>
          <p>Manage relationships, product seeding, briefs, content, promo codes, payouts, and attributed sales without stitching together spreadsheets, DMs, and store reports.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#waitlist">Join early access <ArrowRight size={17} /></a>
            <a className="button button-secondary" href="#how-it-works">See the workflow <ArrowDown size={16} /></a>
          </div>
          <div className="hero-audience"><span className="avatar-stack"><i>A</i><i>M</i><i>J</i></span>Built for lean DTC teams running 10–200 creator partnerships a month.</div>
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
        <Reveal className="section-heading split-heading"><div><span className="section-label">THE E-COMMERCE GAP</span><h2>Your creator program should know more than who posted.</h2></div><p>When gifting, content, codes, sales, and payouts live in separate tools, your team loses the relationship history—and the revenue story.</p></Reveal>
        <div className="problem-grid">
          {problems.map((problem, index) => { const Icon = icons[index]; return <Reveal key={problem} delay={index * 0.04} className="problem-card"><div className="icon-box"><Icon size={18} /></div><p>{problem}</p><span>0{index + 1}</span></Reveal>; })}
        </div>
        <Reveal className="problem-resolution"><span className="resolution-icon"><Check size={18} /></span><p><strong>{siteConfig.name}</strong> connects every creator relationship to the products, content, costs, and commerce outcomes behind it.</p></Reveal>
      </div>
    </section>
  );
}

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="section workflow-section">
      <div className="container">
        <Reveal className="section-heading centered"><span className="section-label">ONE OPERATING SYSTEM</span><h2>From first DM to repeat partner.</h2><p>A commerce-aware workflow for every creator, product, deliverable, code, and payout—without enterprise overhead.</p></Reveal>
        <div className="workflow-line">
          {workflow.map((step, index) => <Reveal className="workflow-step" key={step.title} delay={index * 0.07}><div className="step-number">{index + 1}</div><h3>{step.title}</h3><p>{step.description}</p></Reveal>)}
        </div>
      </div>
    </section>
  );
}

const features = [
  { title: "Creator Relationship CRM", description: "Contacts, rates, audience fit, shipping details, notes, past campaigns, and performance—one living record.", icon: UserRound, className: "feature-wide", visual: <div className="mini-profile"><span>AM</span><div><b>Aisha Mehta</b><small>Beauty · Instagram · 4.8% ER</small></div><em>Repeat partner</em></div> },
  { title: "Campaign & Seeding Pipeline", description: "See who was contacted, contracted, gifted, delivered, approved, live, and paid.", icon: PackageCheck, visual: <div className="mini-pipeline"><i /><i /><i /><i /></div> },
  { title: "Deliverables & Usage Rights", description: "Track reels, stories, drafts, deadlines, live links, usage windows, and whitelisting terms.", icon: ClipboardCheck },
  { title: "Content Approvals", description: "Review drafts, share feedback, request revisions, and approve launch-ready content in context.", icon: FileCheck2, className: "feature-tall", visual: <div className="approval-card"><div><span>Launch reel · v2</span><em>00:14 / 00:32</em></div><i /><p><CheckCircle2 size={14} /> Product claims approved</p></div> },
  { title: "Products, Codes & Links", description: "Connect each creator to seeded SKUs, unique promo codes, tracking links, and live content.", icon: Tags },
  { title: "Fees, Gifts & Payouts", description: "See cash fees, product value, invoices, due dates, and total collaboration cost.", icon: BadgeDollarSign, visual: <div className="mini-payment"><span><CircleDollarSign size={15} /> Total cost</span><b>$4,820</b></div> },
  { title: "Creator Revenue Reporting", description: "Compare orders, attributed revenue, ROAS, reach, engagement, and reusable content by creator.", icon: BarChart3, className: "feature-wide", visual: <div className="feature-chart">{[35, 52, 47, 70, 61, 82, 76, 95].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div> },
  { title: "Relationship Memory", description: "Keep every promise, preference, follow-up, product shipment, and result visible to the whole team.", icon: UsersRound },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="section features-section">
      <div className="container"><Reveal className="section-heading"><span className="section-label">BUILT AROUND COMMERCE</span><h2>One CRM from gifting to revenue.</h2><p>Give every creator relationship the context your team needs to execute quickly, measure honestly, and invest in the right partners again.</p></Reveal>
        <div className="features-grid">{features.map((feature, index) => { const Icon = feature.icon; return <Reveal key={feature.title} delay={(index % 4) * 0.04} className={`feature-card ${"className" in feature ? feature.className ?? "" : ""}`}><div className="feature-icon"><Icon size={19} /></div><h3>{feature.title}</h3><p>{feature.description}</p>{"visual" in feature && feature.visual}</Reveal>; })}</div>
      </div>
    </section>
  );
}

export function ProductPreviewSection() {
  return <section id="product" className="section product-section"><div className="container"><Reveal className="section-heading centered"><span className="section-label">THE CRM IN ACTION</span><h2>See the relationship—and the return.</h2><p>Move from campaign operations to creator history, product seeding, payouts, and attributed revenue without losing context.</p></Reveal><Reveal><ProductPreview /></Reveal></div></section>;
}

export function AudienceSection() {
  const icons = [Sparkles, ShoppingBag, PackageCheck];
  return <section className="section audience-section"><div className="container"><Reveal className="section-heading split-heading"><div><span className="section-label">FOR PRODUCT-LED BRANDS</span><h2>Built for the categories where creators shape the cart.</h2></div><p>Whether you run launches, always-on gifting, affiliate partnerships, or UGC production, Fluebaze keeps the relationship and its commercial context together.</p></Reveal><div className="audience-grid">{audiences.map((audience, i) => { const Icon = icons[i]; return <Reveal className="audience-card" key={audience.title} delay={i * 0.06}><div><Icon size={21} /><span>0{i + 1}</span></div><h3>{audience.title}</h3><p>{audience.description}</p><span className="audience-link">Built for repeatable growth <ArrowRight size={14} /></span></Reveal>; })}</div></div></section>;
}

export function ComparisonSection() {
  const before = ["Creators in Sheets and DMs", "Gifting in courier tabs", "Briefs and rights in Drive", "Codes buried in store exports", "Fees tracked by finance", "Repeat partners chosen by instinct"];
  const after = ["One creator relationship record", "Visible seeding status", "Content and terms connected", "Codes, links, orders, and revenue", "Total cost and payout status", "A clear next-campaign shortlist"];
  return <section className="section comparison-section"><div className="container comparison-grid"><Reveal className="comparison-copy"><span className="section-label">FROM ADMIN TO GROWTH</span><h2>Make influencer a channel you can actually operate.</h2><p>Fluebaze gives e-commerce teams less status-chasing, cleaner creator relationships, and a commercial view of every partnership.</p></Reveal><Reveal className="comparison-cards"><div className="comparison-card before"><h3><CircleAlert size={18} /> Before {siteConfig.name}</h3>{before.map((item) => <div key={item}><span>×</span>{item}</div>)}</div><div className="comparison-card after"><h3><CheckCircle2 size={18} /> With {siteConfig.name}</h3>{after.map((item) => <div key={item}><span><Check size={12} /></span>{item}</div>)}</div></Reveal></div></section>;
}

export function EarlyAccessSection() {
  const benefits = [{ icon: Sparkles, title: "Concierge onboarding", text: "Bring your current creator roster and campaigns with you." }, { icon: MessageSquareText, title: "Shape commerce workflows", text: "Prioritize the store, affiliate, gifting, and reporting connections you need." }, { icon: BadgeDollarSign, title: "Founding-brand pricing", text: "Lock in pilot pricing before the public launch." }];
  return <section className="section early-section"><div className="container early-card"><Reveal className="early-copy"><span className="section-label">EARLY ACCESS FOR E-COMMERCE</span><h2>Help build the influencer CRM your brand has been missing.</h2><p>We are partnering with a small group of product-led brands to turn messy creator operations into a repeatable, measurable growth channel.</p></Reveal><div className="benefits-list">{benefits.map(({ icon: Icon, title, text }, i) => <Reveal className="benefit" key={title} delay={i * .06}><span><Icon size={18} /></span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}</div></div></section>;
}

export function WaitlistSection() {
  return <section id="waitlist" className="section waitlist-section"><div className="container waitlist-grid"><Reveal className="waitlist-copy"><span className="section-label">JOIN THE PILOT</span><h2>Turn your creator roster into a real CRM.</h2><p>Tell us how your brand runs influencer today. We’ll use your answers to shape early access around the products, partnerships, and store workflows you already have.</p><div className="form-expectations"><span><Check size={14} /> Built specifically for e-commerce teams</span><span><Check size={14} /> No commitment required</span><span><Check size={14} /> Founding-brand onboarding and pricing</span></div></Reveal><Reveal className="form-card" delay={.08}><WaitlistForm /></Reveal></div></section>;
}

export function FAQSection() {
  return <section id="faq" className="section faq-section"><div className="container faq-grid"><Reveal className="faq-copy"><span className="section-label">COMMON QUESTIONS</span><h2>Good things to know before you join.</h2><p>Still curious? Email us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p></Reveal><Reveal><FAQ /></Reveal></div></section>;
}

export function FinalCTA() {
  return <section className="section final-section"><Reveal className="container final-card"><div className="final-orb" /><span className="section-label">CREATOR RELATIONSHIPS, BUILT TO COMPOUND</span><h2>Know who to brief, what to send, and who to hire again.</h2><p>Join the pilot for an influencer CRM built around how e-commerce brands actually grow.</p><a className="button button-light" href="#waitlist">Join early access <ArrowRight size={17} /></a></Reveal></section>;
}
