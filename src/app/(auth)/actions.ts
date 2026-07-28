"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";

const authInputSchema = z.object({
  mode: z.enum(["login", "signup", "forgot", "update"]),
  fullName: z.string().trim().max(120).optional(),
  email: z.string().trim().max(254),
  password: z.string().max(200).optional(),
  next: z.string().max(300).optional(),
});

export async function performAuth(
  input: z.infer<typeof authInputSchema>,
): Promise<ActionResult<{ redirectTo?: string; confirmationRequired?: boolean }>> {
  const parsed = authInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check your details and try again." };
  }

  const { mode, fullName, email, password, next } = parsed.data;
  if (mode !== "update" && !z.string().email().safeParse(email).success) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (mode !== "forgot" && (!password || password.length < 8)) {
    return { ok: false, message: "Use a password with at least eight characters." };
  }
  if (mode === "signup" && (!fullName || fullName.length < 2)) {
    return { ok: false, message: "Enter your full name." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (mode === "login") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password!,
    });
    if (error) {
      console.error("Sign-in failed", error.message);
      return { ok: false, message: "That email and password don’t match." };
    }
    return {
      ok: true,
      data: { redirectTo: next?.startsWith("/") ? next : "/dashboard" },
    };
  }

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password!,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
      },
    });
    if (error) {
      console.error("Sign-up failed", error.message);
      return {
        ok: false,
        message: error.message.toLowerCase().includes("already")
          ? "An account already exists for that email."
          : "We couldn’t create your account. Please try again.",
      };
    }
    return data.session
      ? { ok: true, data: { redirectTo: "/onboarding" } }
      : {
          ok: true,
          data: { confirmationRequired: true },
          message: "Check your inbox to confirm your email, then continue to onboarding.",
        };
  }

  if (mode === "forgot") {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
    });
    if (error) console.error("Password reset request failed", error.message);
    return {
      ok: true,
      message: "If that email has an account, a reset link is on its way.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: password! });
  if (error) {
    console.error("Password update failed", error.message);
    return { ok: false, message: "We couldn’t update your password. Request a new reset link and try again." };
  }
  return {
    ok: true,
    data: { redirectTo: "/dashboard" },
    message: "Password updated.",
  };
}
