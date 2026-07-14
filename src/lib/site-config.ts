export const siteConfig = {
  name: "Fluebaze",
  description:
    "Manage influencer outreach, campaign deliverables, content approvals, payments, and performance from one simple workspace.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fluebaze.example",
  email: "hello@fluebaze.com",
  links: {
    privacy: "#",
    terms: "#",
    linkedin: "#",
    x: "#",
  },
} as const;

export const navigation = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
] as const;

export const problems = [
  "Creator details are scattered across spreadsheets.",
  "Campaign conversations get lost in email and WhatsApp.",
  "Deadlines and deliverables are difficult to track.",
  "Draft approvals create long message threads.",
  "Payment status is unclear.",
  "Campaign performance is reported manually.",
] as const;

export const workflow = [
  {
    title: "Add your creators",
    description: "Import creator contacts or add them manually to your CRM.",
  },
  {
    title: "Launch a campaign",
    description:
      "Set the brief, deliverables, deadlines, payment amount, and creator requirements.",
  },
  {
    title: "Track every collaboration",
    description:
      "Move creators from Contacted through Content Submitted, Approved, Posted, and Paid.",
  },
  {
    title: "Measure the results",
    description:
      "Track content links, views, engagement, conversions, spend, and performance.",
  },
] as const;

export const audiences = [
  {
    title: "D2C Brands",
    description: "For growing brands running recurring influencer and UGC campaigns.",
  },
  {
    title: "Marketing Teams",
    description:
      "For small teams that need a structured workflow without enterprise complexity.",
  },
  {
    title: "Influencer Agencies",
    description:
      "For agencies managing multiple brands, creators, deliverables, and payment records.",
  },
] as const;

export const faqs = [
  {
    question: "Who is this product for?",
    answer:
      "It is designed for small brands, D2C companies, marketing teams, and agencies that work with micro-influencers and UGC creators.",
  },
  {
    question: "Is this an influencer discovery platform?",
    answer:
      "The initial product focuses on managing existing creator relationships and campaigns. Creator discovery may be added later.",
  },
  {
    question: "Can creators use the platform?",
    answer:
      "Creators will receive a simple secure portal where they can review briefs, upload drafts, submit content links, and provide invoices.",
  },
  {
    question: "Will the product support payments?",
    answer:
      "The first version will help teams record and track payments. Automated payment processing may be introduced later.",
  },
  {
    question: "When will early access begin?",
    answer:
      "Early-access users will be invited in small groups as the product becomes ready.",
  },
  {
    question: "How much will it cost?",
    answer:
      "Early users will receive special founding-customer pricing before the public launch.",
  },
] as const;
