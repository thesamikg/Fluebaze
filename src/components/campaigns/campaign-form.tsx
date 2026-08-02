"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { saveCampaign } from "@/app/(app)/campaigns/actions";
import type { Campaign } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a campaign name."),
  brand_name: z.string().trim().min(2, "Enter a brand or product name."),
  description: z.string(),
  objective: z.string(),
  start_date: z.string().min(1, "Choose a start date."),
  end_date: z.string().min(1, "Choose an end date."),
  status: z.enum(["draft", "active", "completed", "archived"]),
  budget: z.string().refine((value) => value === "" || Number(value) >= 0, "Budget cannot be negative."),
  notes: z.string(),
}).refine((value) => value.end_date >= value.start_date, { path: ["end_date"], message: "End date must be after the start date." });

type Values = z.infer<typeof schema>;

export function CampaignForm({ campaign, defaultBrand }: { campaign?: Campaign; defaultBrand?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const today = format(new Date(), "yyyy-MM-dd");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: campaign?.name ?? "",
      brand_name: campaign?.brand_name ?? defaultBrand ?? "",
      description: campaign?.description ?? "",
      objective: campaign?.objective ?? "",
      start_date: campaign?.start_date ?? today,
      end_date: campaign?.end_date ?? today,
      status: campaign?.status ?? "draft",
      budget: campaign?.budget == null ? "" : String(campaign.budget),
      notes: campaign?.notes ?? "",
    },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await saveCampaign({ ...values, id: campaign?.id });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/campaigns/${result.data?.id}`);
      router.refresh();
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader><CardTitle>Campaign details</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Campaign name" error={errors.name?.message} required><Input autoFocus placeholder="Glow Reset launch" {...register("name")} /></Field>
          <Field label="Brand or product" error={errors.brand_name?.message} required><Input placeholder="Aster & Bloom · Glow Reset Set" {...register("brand_name")} /></Field>
          <Field label="Objective" className="sm:col-span-2"><Input placeholder="Generate product trial, creator content, and tracked first-time orders" {...register("objective")} /></Field>
          <Field label="Description" className="sm:col-span-2"><Textarea placeholder="Products, audience, offer, content angle, promo code rules, and success criteria…" {...register("description")} /></Field>
          <Field label="Start date" error={errors.start_date?.message} required><Input type="date" {...register("start_date")} /></Field>
          <Field label="End date" error={errors.end_date?.message} required><Input type="date" {...register("end_date")} /></Field>
          <Field label="Status"><Select {...register("status")}>{["draft", "active", "completed", "archived"].map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</Select></Field>
          <Field label="Budget (INR)" error={errors.budget?.message}><Input type="number" min={0} placeholder="50000" {...register("budget")} /></Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Commerce and team notes</CardTitle></CardHeader>
        <CardContent><Textarea placeholder="Brief links, seeded SKUs, shipping details, usage rights, promo code rules, and product claims…" {...register("notes")} /></CardContent>
      </Card>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}
          {pending ? "Saving…" : campaign ? "Save changes" : "Create campaign"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, required, className, children }: { label: string; error?: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={`grid content-start gap-2 ${className ?? ""}`}>
      <Label>{label}{required ? <span className="text-[#9d3e35]"> *</span> : null}</Label>
      {children}
      {error ? <p className="text-xs text-[#b4473d]">{error}</p> : null}
    </div>
  );
}
