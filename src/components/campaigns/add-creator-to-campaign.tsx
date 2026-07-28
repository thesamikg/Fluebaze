"use client";

import { useState, useTransition } from "react";
import { format, addDays } from "date-fns";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { addCreatorToCampaign } from "@/app/(app)/campaigns/actions";
import type { Campaign, Creator } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function AddCreatorToCampaign({
  creatorId,
  campaigns,
  campaignId,
  creators,
  onAdded,
}: {
  creatorId?: string;
  campaigns?: Campaign[];
  campaignId?: string;
  creators?: Creator[];
  onAdded?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const defaultDue = format(addDays(new Date(), 7), "yyyy-MM-dd");

  if (creatorId && !campaigns?.length) {
    return <p className="text-sm leading-6 text-[#777d75]">This creator is already in every active campaign. Create another campaign to add them again.</p>;
  }
  if (campaignId && !creators?.length) {
    return <p className="text-sm leading-6 text-[#777d75]">Add a creator to your CRM first, then return here to add them to this campaign.</p>;
  }

  return (
    <form
      className="grid gap-3"
      action={(formData) => {
        setError("");
        startTransition(async () => {
          const result = await addCreatorToCampaign({
            campaign_id: campaignId ?? String(formData.get("campaign_id")),
            creator_id: creatorId ?? String(formData.get("creator_id")),
            agreed_fee: formData.get("agreed_fee"),
            currency: "INR",
            deliverable_type: formData.get("deliverable_type"),
            deliverable_count: formData.get("deliverable_count"),
            deliverable_description: formData.get("deliverable_description"),
            deliverable_due_date: formData.get("deliverable_due_date"),
            payment_due_date: formData.get("payment_due_date"),
            notes: "",
          });
          if (!result.ok) {
            setError(result.message);
            toast.error(result.message);
            return;
          }
          toast.success(result.message);
          onAdded?.();
          window.location.reload();
        });
      }}
    >
      {creatorId ? (
        <CompactField label="Campaign">
          <Select name="campaign_id" required>{campaigns?.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</Select>
        </CompactField>
      ) : (
        <CompactField label="Creator">
          <Select name="creator_id" required>{creators?.map((creator) => <option key={creator.id} value={creator.id}>{creator.full_name} · {creator.handle}</option>)}</Select>
        </CompactField>
      )}
      <div className="grid grid-cols-2 gap-3">
        <CompactField label="Creator fee"><Input name="agreed_fee" type="number" min={0} defaultValue={0} required /></CompactField>
        <CompactField label="Deliverables"><Input name="deliverable_count" type="number" min={1} max={100} defaultValue={1} required /></CompactField>
      </div>
      <CompactField label="Deliverable type">
        <Select name="deliverable_type" defaultValue="Instagram reel">
          {["Instagram post", "Instagram reel", "Instagram story", "TikTok video", "YouTube video", "UGC asset", "Other"].map((item) => <option key={item}>{item}</option>)}
        </Select>
      </CompactField>
      <CompactField label="Products, offer & deliverables"><Input name="deliverable_description" placeholder="Glow Set · 1 reel · code MAYAGLOW20" required /></CompactField>
      <div className="grid grid-cols-2 gap-3">
        <CompactField label="Content due"><Input name="deliverable_due_date" type="date" defaultValue={defaultDue} required /></CompactField>
        <CompactField label="Payment due"><Input name="payment_due_date" type="date" defaultValue={format(addDays(new Date(), 14), "yyyy-MM-dd")} /></CompactField>
      </div>
      {error ? <p className="text-xs text-[#b4473d]">{error}</p> : null}
      <Button type="submit" variant="primary" disabled={pending} className="mt-1 w-full">
        {pending ? <LoaderCircle className="animate-spin" size={15} /> : <Plus size={15} />}
        {pending ? "Adding…" : "Add to campaign"}
      </Button>
    </form>
  );
}

function CompactField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
