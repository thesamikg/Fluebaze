"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { campaignSchema, collaborationSchema, stageSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/supabase/auth";
import type { ActionResult } from "@/lib/action-result";
import {
  createDemoId,
  isDemoRequest,
  mutateDemoStore,
  readDemoStore,
} from "@/lib/demo-store";

const campaignMutationSchema = campaignSchema.extend({ id: z.string().uuid().optional() });

export async function saveCampaign(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { workspace } = await requireWorkspace();
  const parsed = campaignMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the campaign details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { id, ...values } = parsed.data;
  if (await isDemoRequest()) {
    const now = new Date().toISOString();
    const campaignId = id || createDemoId();
    mutateDemoStore((store) => {
      const existing = store.campaigns.find(
        (campaign) => campaign.id === campaignId,
      );
      const archivedAt =
        values.status === "archived" ? now : null;
      if (existing) {
        Object.assign(existing, values, {
          archived_at: archivedAt,
          updated_at: now,
        });
      } else {
        store.campaigns.unshift({
          id: campaignId,
          workspace_id: workspace.id,
          ...values,
          archived_at: archivedAt,
          is_sample: false,
          created_at: now,
          updated_at: now,
        });
      }
    });
    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath("/campaigns");
    revalidatePath("/dashboard");
    return {
      ok: true,
      data: { id: campaignId },
      message: id ? "Campaign updated." : "Campaign created.",
    };
  }
  const supabase = await createClient();

  if (id) {
    const { data, error } = await supabase
      .from("campaigns")
      .update({
        ...values,
        archived_at: values.status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("workspace_id", workspace.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      console.error("Campaign update failed", error);
      return { ok: false, message: "We couldn’t update this campaign." };
    }
    revalidatePath(`/campaigns/${id}`);
    revalidatePath("/campaigns");
    revalidatePath("/dashboard");
    return { ok: true, data: { id }, message: "Campaign updated." };
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...values, workspace_id: workspace.id })
    .select("id")
    .single();
  if (error || !data) {
    console.error("Campaign creation failed", error);
    return { ok: false, message: "We couldn’t create this campaign." };
  }
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: data.id }, message: "Campaign created." };
}

export async function archiveCampaign(id: string) {
  const { workspace } = await requireWorkspace();
  if (!z.string().uuid().safeParse(id).success) return;
  if (await isDemoRequest()) {
    mutateDemoStore((store) => {
      const campaign = store.campaigns.find((item) => item.id === id);
      if (campaign) {
        const now = new Date().toISOString();
        campaign.status = "archived";
        campaign.archived_at = now;
        campaign.updated_at = now;
      }
    });
    revalidatePath("/campaigns");
    revalidatePath("/dashboard");
    redirect("/campaigns?archived=1");
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("campaigns")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspace.id);
  if (error) {
    console.error("Campaign archive failed", error);
    redirect(`/campaigns/${id}?error=archive`);
  }
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  redirect("/campaigns?archived=1");
}

export async function addCreatorToCampaign(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { workspace } = await requireWorkspace();
  const parsed = collaborationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the collaboration details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { payment_due_date, ...values } = parsed.data;
  if (await isDemoRequest()) {
    const current = readDemoStore();
    const campaign = current.campaigns.find(
      (item) => item.id === values.campaign_id,
    );
    const creator = current.creators.find(
      (item) => item.id === values.creator_id,
    );
    if (!campaign || !creator) {
      return { ok: false, message: "Campaign or creator not found." };
    }
    if (
      current.collaborations.some(
        (item) =>
          item.campaign_id === values.campaign_id &&
          item.creator_id === values.creator_id,
      )
    ) {
      return {
        ok: false,
        message: "This creator is already part of that campaign.",
      };
    }
    const collaborationId = createDemoId();
    mutateDemoStore((store) => {
      const now = new Date().toISOString();
      store.collaborations.unshift({
        id: collaborationId,
        workspace_id: workspace.id,
        ...values,
        stage: "contacted",
        post_url: null,
        posted_at: null,
        last_activity_at: now,
        is_sample: false,
        created_at: now,
        updated_at: now,
      });
      store.payments.unshift({
        id: createDemoId(),
        workspace_id: workspace.id,
        campaign_creator_id: collaborationId,
        agreed_amount: values.agreed_fee,
        amount_paid: 0,
        currency: values.currency,
        status: payment_due_date ? "due" : "not_due",
        due_date: payment_due_date,
        paid_at: null,
        payment_method: null,
        reference_number: null,
        notes: null,
        is_sample: false,
        created_at: now,
        updated_at: now,
      });
    });
    revalidatePath(`/campaigns/${values.campaign_id}`);
    revalidatePath(`/creators/${values.creator_id}`);
    revalidatePath("/campaigns");
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    return {
      ok: true,
      data: { id: collaborationId },
      message: "Creator added to campaign.",
    };
  }
  const supabase = await createClient();

  const [{ data: campaign }, { data: creator }] = await Promise.all([
    supabase.from("campaigns").select("id").eq("id", values.campaign_id).eq("workspace_id", workspace.id).maybeSingle(),
    supabase.from("creators").select("id").eq("id", values.creator_id).eq("workspace_id", workspace.id).maybeSingle(),
  ]);
  if (!campaign || !creator) return { ok: false, message: "Campaign or creator not found." };

  const { data: collaboration, error } = await supabase
    .from("campaign_creators")
    .insert({
      ...values,
      workspace_id: workspace.id,
      stage: "contacted",
      last_activity_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "This creator is already part of that campaign." };
    }
    console.error("Collaboration creation failed", error);
    return { ok: false, message: "We couldn’t add this creator to the campaign." };
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    workspace_id: workspace.id,
    campaign_creator_id: collaboration.id,
    agreed_amount: values.agreed_fee,
    amount_paid: 0,
    currency: values.currency,
    status: payment_due_date ? "due" : "not_due",
    due_date: payment_due_date,
  });
  if (paymentError) {
    console.error("Payment creation failed", paymentError);
    await supabase.from("campaign_creators").delete().eq("id", collaboration.id);
    return { ok: false, message: "We couldn’t create the payment record for this collaboration." };
  }

  revalidatePath(`/campaigns/${values.campaign_id}`);
  revalidatePath(`/creators/${values.creator_id}`);
  revalidatePath("/campaigns");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: collaboration.id }, message: "Creator added to campaign." };
}

export async function updateCollaborationStage(input: unknown): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const parsed = stageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "That stage change is not valid." };

  if (await isDemoRequest()) {
    const current = readDemoStore();
    const existing = current.collaborations.find(
      (item) => item.id === parsed.data.collaborationId,
    );
    if (!existing) {
      return { ok: false, message: "Collaboration not found." };
    }
    if (parsed.data.stage === "paid" && !parsed.data.paid) {
      return {
        ok: false,
        message: "Confirm the payment before moving this collaboration to Paid.",
      };
    }
    if (
      parsed.data.stage === "paid" &&
      !current.payments.some(
        (item) => item.campaign_creator_id === existing.id,
      )
    ) {
      return {
        ok: false,
        message: "Add a payment record before marking this collaboration paid.",
      };
    }
    mutateDemoStore((store) => {
      const collaboration = store.collaborations.find(
        (item) => item.id === parsed.data.collaborationId,
      );
      if (!collaboration) return;
      if (parsed.data.stage === "paid" && parsed.data.paid) {
        const payment = store.payments.find(
          (item) => item.campaign_creator_id === collaboration.id,
        );
        if (!payment) return;
        const now = new Date().toISOString();
        payment.status = "paid";
        payment.amount_paid = payment.agreed_amount;
        payment.paid_at = parsed.data.paidAt ?? now;
        payment.reference_number =
          parsed.data.referenceNumber || payment.reference_number;
        payment.updated_at = now;
      }
      const now = new Date().toISOString();
      collaboration.stage = parsed.data.stage;
      collaboration.last_activity_at = now;
      collaboration.updated_at = now;
      if (parsed.data.stage === "posted" && !collaboration.posted_at) {
        collaboration.posted_at = now;
      }
    });
    revalidatePath(`/campaigns/${existing.campaign_id}`);
    revalidatePath(`/creators/${existing.creator_id}`);
    revalidatePath("/dashboard");
    revalidatePath("/payments");
    return { ok: true, message: "Stage updated." };
  }

  const supabase = await createClient();
  const { data: collaboration } = await supabase
    .from("campaign_creators")
    .select("*")
    .eq("id", parsed.data.collaborationId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!collaboration) return { ok: false, message: "Collaboration not found." };

  if (parsed.data.stage === "paid" && !parsed.data.paid) {
    return { ok: false, message: "Confirm the payment before moving this collaboration to Paid." };
  }

  if (parsed.data.stage === "paid") {
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("campaign_creator_id", collaboration.id)
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    if (!payment) return { ok: false, message: "Add a payment record before marking this collaboration paid." };
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        amount_paid: payment.agreed_amount,
        paid_at: parsed.data.paidAt ?? new Date().toISOString(),
        reference_number: parsed.data.referenceNumber || null,
      })
      .eq("id", payment.id)
      .eq("workspace_id", workspace.id);
    if (paymentError) {
      console.error("Payment completion failed", paymentError);
      return { ok: false, message: "Payment could not be marked as paid." };
    }
  }

  const { error } = await supabase
    .from("campaign_creators")
    .update({
      stage: parsed.data.stage,
      last_activity_at: new Date().toISOString(),
      posted_at: parsed.data.stage === "posted" && !collaboration.posted_at ? new Date().toISOString() : collaboration.posted_at,
    })
    .eq("id", collaboration.id)
    .eq("workspace_id", workspace.id);
  if (error) {
    console.error("Stage update failed", error);
    return { ok: false, message: "The stage could not be updated. Your board has been restored." };
  }

  revalidatePath(`/campaigns/${collaboration.campaign_id}`);
  revalidatePath(`/creators/${collaboration.creator_id}`);
  revalidatePath("/dashboard");
  revalidatePath("/payments");
  return { ok: true, message: "Stage updated." };
}

export async function removeCollaboration(id: string): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, message: "Invalid collaboration." };
  if (await isDemoRequest()) {
    const existing = readDemoStore().collaborations.find(
      (item) => item.id === id,
    );
    if (!existing) {
      return { ok: false, message: "Collaboration not found." };
    }
    mutateDemoStore((store) => {
      const collaboration = store.collaborations.find(
        (item) => item.id === id,
      );
      if (!collaboration) return;
      store.payments = store.payments.filter(
        (payment) => payment.campaign_creator_id !== collaboration.id,
      );
      store.collaborations = store.collaborations.filter(
        (item) => item.id !== id,
      );
    });
    revalidatePath(`/campaigns/${existing.campaign_id}`);
    revalidatePath(`/creators/${existing.creator_id}`);
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    return { ok: true, message: "Creator removed from campaign." };
  }
  const supabase = await createClient();
  const { data: collaboration } = await supabase
    .from("campaign_creators")
    .select("campaign_id,creator_id")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!collaboration) return { ok: false, message: "Collaboration not found." };
  const { error } = await supabase.from("campaign_creators").delete().eq("id", id).eq("workspace_id", workspace.id);
  if (error) return { ok: false, message: "We couldn’t remove this creator from the campaign." };
  revalidatePath(`/campaigns/${collaboration.campaign_id}`);
  revalidatePath(`/creators/${collaboration.creator_id}`);
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { ok: true, message: "Creator removed from campaign." };
}
