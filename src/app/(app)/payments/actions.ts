"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { paymentSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/supabase/auth";
import type { ActionResult } from "@/lib/action-result";
import { isDemoRequest, mutateDemoStore } from "@/lib/demo-store";

export async function savePayment(input: unknown): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the payment details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  if (parsed.data.status === "paid" && parsed.data.amount_paid !== parsed.data.agreed_amount) {
    return { ok: false, message: "A paid payment must have the full agreed amount recorded." };
  }

  if (await isDemoRequest()) {
    let found = false;
    const { payment_id, ...values } = parsed.data;
    mutateDemoStore((store) => {
      const payment = store.payments.find(
        (item) => item.id === payment_id,
      );
      if (!payment) return;
      found = true;
      const normalizedStatus =
        values.amount_paid >= values.agreed_amount
          ? "paid"
          : values.status === "paid"
            ? "due"
            : values.status;
      const now = new Date().toISOString();
      Object.assign(payment, values, {
        status: normalizedStatus,
        paid_at:
          normalizedStatus === "paid"
            ? values.paid_at ?? now
            : null,
        updated_at: now,
      });
      const collaboration = store.collaborations.find(
        (item) => item.id === payment.campaign_creator_id,
      );
      if (collaboration) {
        if (normalizedStatus === "paid") {
          collaboration.stage = "paid";
        } else if (collaboration.stage === "paid") {
          collaboration.stage = "posted";
        }
        collaboration.last_activity_at = now;
        collaboration.updated_at = now;
      }
    });
    if (!found) return { ok: false, message: "Payment not found." };
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/campaigns");
    return { ok: true, message: "Payment updated." };
  }

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", parsed.data.payment_id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!payment) return { ok: false, message: "Payment not found." };

  const { payment_id, ...values } = parsed.data;
  const normalizedStatus = values.amount_paid >= values.agreed_amount ? "paid" : values.status === "paid" ? "due" : values.status;
  const { error } = await supabase
    .from("payments")
    .update({
      ...values,
      status: normalizedStatus,
      paid_at: normalizedStatus === "paid" ? values.paid_at ?? new Date().toISOString() : null,
    })
    .eq("id", payment_id)
    .eq("workspace_id", workspace.id);
  if (error) {
    console.error("Payment update failed", error);
    return { ok: false, message: "We couldn’t update this payment." };
  }

  if (normalizedStatus === "paid") {
    await supabase
      .from("campaign_creators")
      .update({ stage: "paid", last_activity_at: new Date().toISOString() })
      .eq("id", payment.campaign_creator_id)
      .eq("workspace_id", workspace.id);
  } else {
    const { data: collaboration } = await supabase
      .from("campaign_creators")
      .select("stage")
      .eq("id", payment.campaign_creator_id)
      .maybeSingle();
    if (collaboration?.stage === "paid") {
      await supabase
        .from("campaign_creators")
        .update({ stage: "posted", last_activity_at: new Date().toISOString() })
        .eq("id", payment.campaign_creator_id)
        .eq("workspace_id", workspace.id);
    }
  }

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
  return { ok: true, message: "Payment updated." };
}

export async function markPaymentPaid(
  id: string,
  paidAt = new Date().toISOString(),
  referenceNumber?: string,
): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, message: "Invalid payment." };
  if (await isDemoRequest()) {
    let found = false;
    mutateDemoStore((store) => {
      const payment = store.payments.find((item) => item.id === id);
      if (!payment) return;
      found = true;
      const now = new Date().toISOString();
      payment.status = "paid";
      payment.amount_paid = payment.agreed_amount;
      payment.paid_at = paidAt;
      payment.reference_number =
        referenceNumber || payment.reference_number;
      payment.updated_at = now;
      const collaboration = store.collaborations.find(
        (item) => item.id === payment.campaign_creator_id,
      );
      if (collaboration) {
        collaboration.stage = "paid";
        collaboration.last_activity_at = now;
        collaboration.updated_at = now;
      }
    });
    if (!found) return { ok: false, message: "Payment not found." };
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/campaigns");
    return { ok: true, message: "Payment marked as paid." };
  }
  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!payment) return { ok: false, message: "Payment not found." };

  const { error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      amount_paid: payment.agreed_amount,
      paid_at: paidAt,
      reference_number: referenceNumber || payment.reference_number,
    })
    .eq("id", id)
    .eq("workspace_id", workspace.id);
  if (error) return { ok: false, message: "We couldn’t mark this payment as paid." };

  await supabase
    .from("campaign_creators")
    .update({ stage: "paid", last_activity_at: new Date().toISOString() })
    .eq("id", payment.campaign_creator_id)
    .eq("workspace_id", workspace.id);

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
  return { ok: true, message: "Payment marked as paid." };
}
