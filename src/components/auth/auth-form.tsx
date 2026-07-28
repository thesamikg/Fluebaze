"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { performAuth } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup" | "forgot" | "update";

const schema = z
  .object({
    fullName: z.string().trim().max(120).optional(),
    email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]),
    password: z.union([z.string().min(8, "Use at least 8 characters."), z.literal("")]).optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.password && value.confirmPassword !== undefined && value.password !== value.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
    }
  });

type FormValues = z.infer<typeof schema>;

const copy: Record<Mode, { title: string; description: string; submit: string }> = {
  login: {
    title: "Welcome back",
    description: "Sign in to manage your creator relationships, campaigns, and payouts.",
    submit: "Sign in",
  },
  signup: {
    title: "Start your creator CRM",
    description: "Create an e-commerce workspace for your creator roster and campaigns in under five minutes.",
    submit: "Create account",
  },
  forgot: {
    title: "Reset your password",
    description: "Enter your email and we’ll send you a secure reset link.",
    submit: "Send reset link",
  },
  update: {
    title: "Choose a new password",
    description: "Use at least eight characters for your new password.",
    submit: "Update password",
  },
};

export function AuthForm({ mode, next = "/dashboard" }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    setMessage(null);
    if (needsEmail && !values.email) {
      setMessage({ tone: "error", text: "Enter your email address." });
      return;
    }
    if (needsPassword && !values.password) {
      setMessage({ tone: "error", text: "Enter a password with at least eight characters." });
      return;
    }
    if (mode === "signup" && (!values.fullName || values.fullName.trim().length < 2)) {
      setMessage({ tone: "error", text: "Enter your full name." });
      return;
    }
    try {
      const result = await performAuth({
        mode,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        next,
      });
      if (!result.ok) {
        setMessage({ tone: "error", text: result.message });
        return;
      }
      if (result.data?.confirmationRequired || !result.data?.redirectTo) {
        setMessage({ tone: "success", text: result.message ?? "Request completed." });
        return;
      }
      if (result.message) {
        setMessage({ tone: "success", text: result.message });
      }
      router.replace(result.data.redirectTo);
      router.refresh();
    } catch (error) {
      const authMessage = error instanceof Error ? error.message : "";
      setMessage({
        tone: "error",
        text: authMessage.toLowerCase().includes("invalid login")
          ? "That email and password don’t match."
          : "We couldn’t complete that request. Check your details and try again.",
      });
    }
  }

  const details = copy[mode];
  const needsEmail = mode !== "update";
  const needsPassword = mode !== "forgot";

  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-[#648b1d]">Fluebaze pilot</p>
      <h1 className="text-3xl font-semibold tracking-[-.045em]">{details.title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#6f756d]">{details.description}</p>
      <form className="mt-8 grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {mode === "signup" ? (
          <AuthField label="Full name" error={errors.fullName?.message}>
            <Input autoComplete="name" placeholder="Your name" {...register("fullName")} />
          </AuthField>
        ) : null}
        {needsEmail ? (
          <AuthField label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" placeholder="you@brand.com" {...register("email")} />
          </AuthField>
        ) : null}
        {needsPassword ? (
          <AuthField label={mode === "update" ? "New password" : "Password"} error={errors.password?.message}>
            <Input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" {...register("password")} />
          </AuthField>
        ) : null}
        {mode === "update" ? (
          <AuthField label="Confirm password" error={errors.confirmPassword?.message}>
            <Input type="password" autoComplete="new-password" placeholder="Repeat your password" {...register("confirmPassword")} />
          </AuthField>
        ) : null}
        {mode === "login" ? (
          <div className="-mt-2 text-right">
            <Link className="text-xs font-medium text-[#4d7307] hover:underline" href="/forgot-password">Forgot password?</Link>
          </div>
        ) : null}
        {message ? (
          <p role="status" className={`rounded-lg px-3 py-2.5 text-sm ${message.tone === "error" ? "bg-[#fde8e6] text-[#9b3f36]" : "bg-[#e8f5e4] text-[#2f7044]"}`}>
            {message.text}
          </p>
        ) : null}
        <Button variant="primary" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : null}
          {isSubmitting ? "Working…" : details.submit}
          {!isSubmitting ? <ArrowRight size={16} /> : null}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#737970]">
        {mode === "login" ? (
          <>New to Fluebaze? <Link className="font-semibold text-[#2e332d] hover:underline" href="/signup">Create an account</Link></>
        ) : mode === "signup" ? (
          <>Already have an account? <Link className="font-semibold text-[#2e332d] hover:underline" href="/login">Sign in</Link></>
        ) : mode === "forgot" ? (
          <Link className="font-semibold text-[#2e332d] hover:underline" href="/login">Back to sign in</Link>
        ) : null}
      </p>
    </>
  );
}

function AuthField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-[#b4473d]">{error}</p> : null}
    </div>
  );
}
