"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { creatorSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/supabase/auth";
import type { ActionResult } from "@/lib/action-result";
import {
  createDemoId,
  isDemoRequest,
  mutateDemoStore,
} from "@/lib/demo-store";

const creatorMutationSchema = creatorSchema.extend({
  id: z.string().uuid().optional(),
});

export async function saveCreator(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { workspace } = await requireWorkspace();
  const parsed = creatorMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, tags, ...values } = parsed.data;
  if (await isDemoRequest()) {
    const now = new Date().toISOString();
    const creatorId = id || createDemoId();
    mutateDemoStore((store) => {
      const existing = store.creators.find((creator) => creator.id === creatorId);
      if (existing) {
        Object.assign(existing, values, { updated_at: now });
      } else {
        store.creators.unshift({
          id: creatorId,
          workspace_id: workspace.id,
          ...values,
          is_sample: false,
          created_at: now,
          updated_at: now,
        });
      }
      store.creatorTags = store.creatorTags.filter(
        (link) => link.creator_id !== creatorId,
      );
      for (const tagName of [...new Set(tags)]) {
        let tag = store.tags.find(
          (item) => item.name.toLowerCase() === tagName.toLowerCase(),
        );
        if (!tag) {
          tag = {
            id: createDemoId(),
            workspace_id: workspace.id,
            name: tagName,
            created_at: now,
          };
          store.tags.push(tag);
        }
        store.creatorTags.push({ creator_id: creatorId, tag_id: tag.id });
      }
    });
    revalidatePath("/creators");
    revalidatePath(`/creators/${creatorId}`);
    revalidatePath("/dashboard");
    return {
      ok: true,
      data: { id: creatorId },
      message: id ? "Creator updated." : "Creator added.",
    };
  }
  const supabase = await createClient();
  let creatorId = id;

  if (id) {
    const { data, error } = await supabase
      .from("creators")
      .update(values)
      .eq("id", id)
      .eq("workspace_id", workspace.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      console.error("Creator update failed", error);
      return { ok: false, message: "We couldn’t update this creator." };
    }
  } else {
    const { data, error } = await supabase
      .from("creators")
      .insert({ ...values, workspace_id: workspace.id })
      .select("id")
      .single();
    if (error || !data) {
      console.error("Creator creation failed", error);
      return { ok: false, message: "We couldn’t add this creator." };
    }
    creatorId = data.id;
  }

  if (!creatorId) return { ok: false, message: "We couldn’t save this creator." };

  const { error: clearError } = await supabase.from("creator_tags").delete().eq("creator_id", creatorId);
  if (clearError) console.error("Creator tag cleanup failed", clearError);

  if (tags.length) {
    const normalizedTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
    const { data: savedTags, error: tagError } = await supabase
      .from("tags")
      .upsert(
        normalizedTags.map((name) => ({ workspace_id: workspace.id, name })),
        { onConflict: "workspace_id,name" },
      )
      .select("id,name");
    if (tagError) {
      console.error("Tag save failed", tagError);
      return { ok: false, message: "The creator was saved, but their tags could not be updated." };
    }
    if (savedTags?.length) {
      const { error: linkError } = await supabase
        .from("creator_tags")
        .insert(savedTags.map((tag) => ({ creator_id: creatorId!, tag_id: tag.id })));
      if (linkError) console.error("Tag link failed", linkError);
    }
  }

  revalidatePath("/creators");
  revalidatePath(`/creators/${creatorId}`);
  revalidatePath("/dashboard");
  return { ok: true, data: { id: creatorId }, message: id ? "Creator updated." : "Creator added." };
}

export async function deleteCreator(id: string) {
  const { workspace } = await requireWorkspace();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return;

  if (await isDemoRequest()) {
    mutateDemoStore((store) => {
      const collaborationIds = store.collaborations
        .filter((row) => row.creator_id === parsed.data)
        .map((row) => row.id);
      store.payments = store.payments.filter(
        (payment) =>
          !collaborationIds.includes(payment.campaign_creator_id),
      );
      store.collaborations = store.collaborations.filter(
        (row) => row.creator_id !== parsed.data,
      );
      store.creatorTags = store.creatorTags.filter(
        (link) => link.creator_id !== parsed.data,
      );
      store.creators = store.creators.filter(
        (creator) => creator.id !== parsed.data,
      );
    });
    revalidatePath("/creators");
    revalidatePath("/dashboard");
    redirect("/creators?deleted=1");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("creators")
    .delete()
    .eq("id", parsed.data)
    .eq("workspace_id", workspace.id);
  if (error) {
    console.error("Creator deletion failed", error);
    redirect(`/creators/${id}?error=delete`);
  }
  revalidatePath("/creators");
  revalidatePath("/dashboard");
  redirect("/creators?deleted=1");
}
