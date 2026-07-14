"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { cleanText } from "@/lib/utils";

export type WaitlistState = {
  status: "idle" | "success" | "error" | "duplicate";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

const businessTypes = [
  "D2C brand",
  "Marketing team",
  "Influencer agency",
  "Freelancer",
  "Other",
] as const;

const collaborationRanges = [
  "1–10",
  "11–25",
  "26–50",
  "51–100",
  "More than 100",
] as const;

const waitlistSchema = z.object({
  full_name: z.string().min(2, "Enter your full name.").max(100),
  email: z.string().email("Enter a valid work email.").max(254),
  company_name: z.string().min(2, "Enter your company or brand name.").max(120),
  business_type: z.enum(businessTypes, { message: "Choose a business type." }),
  monthly_collaborations: z.enum(collaborationRanges, {
    message: "Choose a collaboration range.",
  }),
  biggest_challenge: z.string().max(1000).optional(),
  referral_source: z.string().max(100).optional(),
});

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function joinWaitlist(
  _previousState: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const candidate = {
    full_name: cleanText(formData.get("full_name"), 100),
    email: cleanText(formData.get("email"), 254).toLowerCase(),
    company_name: cleanText(formData.get("company_name"), 120),
    business_type: cleanText(formData.get("business_type"), 40),
    monthly_collaborations: cleanText(formData.get("monthly_collaborations"), 40),
    biggest_challenge: cleanText(formData.get("biggest_challenge"), 1000) || undefined,
    referral_source: cleanText(formData.get("referral_source"), 100) || undefined,
  };

  const parsed = waitlistSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      status: "error",
      message: "Waitlist setup is not complete yet. Please try again shortly.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("waitlist_signups")
      .insert({
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        company_name: parsed.data.company_name,
        business_type: parsed.data.business_type,
        monthly_collaborations: parsed.data.monthly_collaborations,
        biggest_challenge: parsed.data.biggest_challenge,
        referral_source: parsed.data.referral_source,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);

      if (error.code === "23505") {
        return {
          status: "duplicate",
          message: "You’re already on the waitlist — we’ll be in touch when your spot is ready.",
        };
      }

      return {
        status: "error",
        message: `Supabase insert error${error.code ? ` (${error.code})` : ""}: ${error.message}`,
      };
    }

    if (!data?.id) {
      console.error("Supabase insert error: insert returned no row.");
      return {
        status: "error",
        message: "Supabase insert error: the database did not return the inserted row.",
      };
    }

    return {
      status: "success",
      message: "You’re on the list! We’ll reach out when your early-access spot is ready.",
    };
  } catch (error) {
    console.error("Supabase insert exception:", error);
    return {
      status: "error",
      message: `Supabase insert request failed: ${error instanceof Error ? error.message : "Unknown server error."}`,
    };
  }
}
