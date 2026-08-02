export const siteConfig = {
  name: "Fluebaze",
  description:
    "The influencer CRM for e-commerce brands to manage creator relationships, product seeding, content, payouts, and attributed revenue.",
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
  "Creator history and rates are buried in spreadsheets and DMs.",
  "Nobody knows which products were sent, delivered, or still need a follow-up.",
  "Briefs, deadlines, drafts, and content rights live in different places.",
  "Promo codes and live links are disconnected from each collaboration.",
  "Fees, gifting costs, and payout status are hard to reconcile.",
  "The next creator partnership is chosen without a clear view of sales performance.",
] as const;

export const workflow = [
  {
    title: "Build your creator CRM",
    description: "Import your roster with contacts, rates, audience fit, notes, and complete relationship history.",
  },
  {
    title: "Plan and seed",
    description:
      "Set the brief, select products, assign codes, record gifting, agree fees, and confirm deliverables.",
  },
  {
    title: "Launch every post",
    description:
      "Move each creator from outreach to product sent, draft review, approved, live, and paid.",
  },
  {
    title: "Retain the winners",
    description:
      "Compare content, orders, attributed revenue, ROAS, and total cost to decide who to work with again.",
  },
] as const;

export const audiences = [
  {
    title: "Beauty & wellness",
    description: "Keep gifting, launch content, usage rights, promo codes, and repeat creator relationships connected.",
  },
  {
    title: "Fashion & lifestyle",
    description:
      "Coordinate seasonal drops, product variants, creator deliverables, and performance without another spreadsheet.",
  },
  {
    title: "Food & consumer",
    description:
      "Run always-on seeding and paid partnerships while seeing which creators actually move product.",
  },
] as const;

export const faqs = [
  {
    question: "Who is this product for?",
    answer:
      "Fluebaze is built for lean e-commerce and DTC teams that manage recurring influencer, affiliate, ambassador, and UGC campaigns.",
  },
  {
    question: "Is this an influencer discovery platform?",
    answer:
      "No. Fluebaze starts once you have a creator in mind. It helps your team manage the relationship, product seeding, campaign work, and results in one CRM.",
  },
  {
    question: "Can I track gifted and paid collaborations?",
    answer:
      "Yes. Keep product value, creator fees, deliverables, deadlines, payment status, and notes together for both gifted and paid partnerships.",
  },
  {
    question: "Does Fluebaze connect content to sales?",
    answer:
      "Campaign reporting is designed around promo codes, tracking links, orders, attributed revenue, and creator-level return alongside reach and engagement.",
  },
  {
    question: "Can creators use the platform?",
    answer:
      "Creators receive a focused portal for briefs, shipping details, draft uploads, live links, usage terms, and invoices—without needing to learn your internal workflow.",
  },
  {
    question: "Will Fluebaze send products or payments?",
    answer:
      "The first release tracks product seeding and payout status; it does not move inventory or money. Commerce and payment integrations are planned as the pilot develops.",
  },
  {
    question: "When will early access begin?",
    answer:
      "E-commerce teams will be invited in small pilot groups. Early users receive hands-on onboarding, roadmap input, and founding-customer pricing.",
  },
] as const;
