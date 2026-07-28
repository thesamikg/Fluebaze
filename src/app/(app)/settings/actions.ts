"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspace } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";
import { isDemoRequest, mutateDemoStore } from "@/lib/demo-store";

const settingsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  workspaceName: z.string().trim().min(2, "Enter your workspace name.").max(120),
});

export async function updateSettings(input: unknown): Promise<ActionResult> {
  const { user, workspace } = await requireWorkspace();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your settings." };
  }
  if (await isDemoRequest()) {
    mutateDemoStore((store) => {
      const now = new Date().toISOString();
      store.profile.full_name = parsed.data.fullName;
      store.profile.updated_at = now;
      store.workspace.name = parsed.data.workspaceName;
      store.workspace.updated_at = now;
    });
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings updated." };
  }
  const supabase = await createClient();
  const [{ error: profileError }, { error: workspaceError }] = await Promise.all([
    supabase.from("profiles").update({ full_name: parsed.data.fullName }).eq("id", user.id),
    supabase.from("workspaces").update({ name: parsed.data.workspaceName }).eq("id", workspace.id),
  ]);
  if (profileError || workspaceError) {
    console.error("Settings update failed", profileError || workspaceError);
    return { ok: false, message: "We couldn’t update your settings." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings updated." };
}

export async function sendPasswordReset(): Promise<ActionResult> {
  const { user } = await requireWorkspace();
  if (await isDemoRequest()) {
    return {
      ok: true,
      message: "Password reset is disabled in the local test session.",
    };
  }
  if (!user.email) return { ok: false, message: "Your account does not have an email address." };
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });
  if (error) {
    console.error("Password reset failed", error);
    return { ok: false, message: "We couldn’t send the password reset email." };
  }
  return { ok: true, message: "Password reset email sent." };
}

export async function removeSampleData(): Promise<ActionResult> {
  await requireWorkspace();
  if (await isDemoRequest()) {
    mutateDemoStore((store) => {
      const sampleCollaborationIds = store.collaborations
        .filter((item) => item.is_sample)
        .map((item) => item.id);
      const sampleCreatorIds = store.creators
        .filter((item) => item.is_sample)
        .map((item) => item.id);
      const sampleTagIds = store.creatorTags
        .filter((item) => sampleCreatorIds.includes(item.creator_id))
        .map((item) => item.tag_id);
      store.payments = store.payments.filter(
        (item) =>
          !item.is_sample &&
          !sampleCollaborationIds.includes(item.campaign_creator_id),
      );
      store.collaborations = store.collaborations.filter(
        (item) => !item.is_sample,
      );
      store.creatorTags = store.creatorTags.filter(
        (item) => !sampleCreatorIds.includes(item.creator_id),
      );
      store.tags = store.tags.filter(
        (item) => !sampleTagIds.includes(item.id),
      );
      store.creators = store.creators.filter((item) => !item.is_sample);
      store.campaigns = store.campaigns.filter((item) => !item.is_sample);
    });
    revalidatePath("/", "layout");
    return { ok: true, message: "Sample campaign and creators removed." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_sample_data");
  if (error) {
    console.error("Sample removal failed", error);
    return { ok: false, message: "We couldn’t remove the sample data." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Sample campaign and creators removed." };
}
