"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import type { ActionResult } from "@/lib/action-result";

const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  workspaceName: z.string().trim().min(2, "Enter your brand or company name.").max(120),
  collaborationVolume: z.enum(["1–5", "6–10", "11–25", "26–40", "40+"]),
  currentWorkflow: z.enum(["Spreadsheet", "WhatsApp", "Instagram DMs", "Email", "Other"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(input: OnboardingInput): Promise<ActionResult> {
  await requireUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_onboarding", {
    p_full_name: parsed.data.fullName,
    p_workspace_name: parsed.data.workspaceName,
    p_collaboration_volume: parsed.data.collaborationVolume,
    p_current_workflow: parsed.data.currentWorkflow,
  });

  if (error) {
    console.error("Onboarding failed", error);
    return { ok: false, message: "We couldn’t create your workspace. Please try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
