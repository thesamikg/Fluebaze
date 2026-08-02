"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { saveCreator } from "@/app/(app)/creators/actions";
import type { Creator } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the creator’s name."),
  handle: z.string(),
  platform: z.enum(["Instagram", "TikTok", "YouTube", "X", "LinkedIn", "Other"]),
  profile_url: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  niche: z.string(),
  follower_count: z.number().int().nonnegative(),
  engagement_rate: z.string().refine((value) => value === "" || (Number(value) >= 0 && Number(value) <= 100), "Use a percentage between 0 and 100."),
  expected_rate: z.string().refine((value) => value === "" || Number(value) >= 0, "Expected fee cannot be negative."),
  notes: z.string(),
  tagsText: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatorForm({
  creator,
  tags = [],
}: {
  creator?: Creator;
  tags?: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: creator?.full_name ?? "",
      handle: creator?.handle ?? "",
      platform: creator?.platform ?? "Instagram",
      profile_url: creator?.profile_url ?? "",
      email: creator?.email ?? "",
      phone: creator?.phone ?? "",
      location: creator?.location ?? "",
      niche: creator?.niche ?? "",
      follower_count: creator?.follower_count ?? 0,
      engagement_rate: creator?.engagement_rate == null ? "" : String(creator.engagement_rate),
      expected_rate: creator?.expected_rate == null ? "" : String(creator.expected_rate),
      notes: creator?.notes ?? "",
      tagsText: tags.join(", "),
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await saveCreator({
        ...values,
        id: creator?.id,
        tags: values.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/creators/${result.data?.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <Card>
        <CardHeader><CardTitle>Creator profile</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" required error={errors.full_name?.message}>
            <Input autoFocus placeholder="Maya Kapoor" {...register("full_name")} />
          </Field>
          <Field label="Handle or username">
            <Input placeholder="@mayamakes" {...register("handle")} />
          </Field>
          <Field label="Primary platform" required>
            <Select {...register("platform")}>
              {["Instagram", "TikTok", "YouTube", "X", "LinkedIn", "Other"].map((platform) => <option key={platform}>{platform}</option>)}
            </Select>
          </Field>
          <Field label="Profile URL" error={errors.profile_url?.message}>
            <Input type="url" placeholder="https://instagram.com/…" {...register("profile_url")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" placeholder="maya@example.com" {...register("email")} />
          </Field>
          <Field label="Phone or WhatsApp">
            <Input type="tel" placeholder="+91 98765 43210" {...register("phone")} />
          </Field>
          <Field label="Location">
            <Input placeholder="Mumbai, India" {...register("location")} />
          </Field>
          <Field label="Content niche">
            <Input placeholder="Skincare routines & ingredient education" {...register("niche")} />
          </Field>
          <Field label="Follower count" error={errors.follower_count?.message}>
            <Input type="number" min={0} {...register("follower_count", { valueAsNumber: true })} />
          </Field>
          <Field label="Engagement rate (%)" error={errors.engagement_rate?.message}>
            <Input type="number" min={0} max={100} step="0.01" placeholder="4.8" {...register("engagement_rate")} />
          </Field>
          <Field label="Expected fee (INR)" error={errors.expected_rate?.message}>
            <Input type="number" min={0} step="0.01" placeholder="12000" {...register("expected_rate")} />
          </Field>
          <Field label="Tags" hint="Comma separated">
            <Input placeholder="repeat partner, high conversion, gifting" {...register("tagsText")} />
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Relationship notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Relationship history, product fit, content preferences, shipping details, codes, usage terms, and past performance…" {...register("notes")} />
        </CardContent>
      </Card>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}
          {pending ? "Saving…" : creator ? "Save changes" : "Add creator"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-2">
      <Label>{label}{required ? <span className="text-[#9d3e35]"> *</span> : null}{hint ? <span className="ml-1 font-normal text-[#92988f]">· {hint}</span> : null}</Label>
      {children}
      {error ? <p className="text-xs text-[#b4473d]">{error}</p> : null}
    </div>
  );
}
