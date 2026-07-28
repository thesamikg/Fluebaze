import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || null);

const optionalNumber = z.union([z.coerce.number().nonnegative(), z.literal(""), z.null()]).optional()
  .transform((value) => (value === "" || value == null ? null : value));

export const creatorSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the creator’s name.").max(120),
  handle: z.string().trim().max(120).default(""),
  platform: z.enum(["Instagram", "TikTok", "YouTube", "X", "LinkedIn", "Other"]),
  profile_url: z.union([z.string().trim().url("Enter a valid profile URL."), z.literal("")]).optional().transform((value) => value || null),
  email: z.union([z.string().trim().email("Enter a valid email."), z.literal("")]).optional().transform((value) => value || null),
  phone: optionalText(60),
  location: optionalText(120),
  niche: optionalText(100),
  follower_count: z.coerce.number().int().nonnegative("Follower count cannot be negative.").default(0),
  engagement_rate: optionalNumber.refine((value) => value == null || value <= 100, "Use a percentage between 0 and 100."),
  expected_rate: optionalNumber,
  notes: optionalText(4000),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});

export const campaignSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a campaign name.").max(140),
    brand_name: z.string().trim().min(2, "Enter a brand or product name.").max(120),
    description: optionalText(2000),
    objective: optionalText(500),
    start_date: z.string().date("Choose a start date."),
    end_date: z.string().date("Choose an end date."),
    status: z.enum(["draft", "active", "completed", "archived"]),
    budget: optionalNumber,
    notes: optionalText(4000),
  })
  .refine((value) => value.end_date >= value.start_date, {
    path: ["end_date"],
    message: "End date must be on or after the start date.",
  });

export const collaborationSchema = z.object({
  campaign_id: z.string().uuid(),
  creator_id: z.string().uuid(),
  agreed_fee: z.coerce.number().nonnegative(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  deliverable_type: z.enum([
    "Instagram post",
    "Instagram reel",
    "Instagram story",
    "TikTok video",
    "YouTube video",
    "UGC asset",
    "Other",
  ]),
  deliverable_count: z.coerce.number().int().min(1).max(100),
  deliverable_description: z.string().trim().min(2).max(1000),
  deliverable_due_date: z.string().date(),
  payment_due_date: z.union([z.string().date(), z.literal("")]).transform((value) => value || null),
  notes: optionalText(2000),
});

export const stageSchema = z.object({
  collaborationId: z.string().uuid(),
  stage: z.enum(["contacted", "confirmed", "content_due", "posted", "paid"]),
  paid: z.boolean().optional(),
  paidAt: z.string().datetime().optional(),
  referenceNumber: z.string().trim().max(120).optional(),
});

export const paymentSchema = z.object({
  payment_id: z.string().uuid(),
  agreed_amount: z.coerce.number().nonnegative(),
  amount_paid: z.coerce.number().nonnegative(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  status: z.enum(["not_due", "due", "paid"]),
  due_date: z.union([z.string().date(), z.literal("")]).transform((value) => value || null),
  paid_at: z.union([z.string().datetime(), z.literal("")]).optional().transform((value) => value || null),
  payment_method: optionalText(80),
  reference_number: optionalText(120),
  notes: optionalText(2000),
}).refine((value) => value.amount_paid <= value.agreed_amount, {
  path: ["amount_paid"],
  message: "Amount paid cannot exceed the agreed amount.",
});
