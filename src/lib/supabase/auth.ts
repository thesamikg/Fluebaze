import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  DEMO_USER_ID,
  isDemoRequest,
  readDemoStore,
} from "@/lib/demo-store";

export const getCurrentUser = cache(async () => {
  if (await isDemoRequest()) return getDemoUser();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

export const getCurrentWorkspace = cache(async () => {
  if (await isDemoRequest()) {
    const store = readDemoStore();
    return {
      user: getDemoUser(),
      profile: store.profile,
      workspace: store.workspace,
    };
  }
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: profile }, { data: workspace }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("workspaces").select("*").eq("owner_id", user.id).maybeSingle(),
  ]);
  return { user, profile, workspace };
});

export async function requireWorkspace() {
  const context = await getCurrentWorkspace();
  if (!context.profile?.onboarding_completed || !context.workspace) {
    redirect("/onboarding");
  }
  return {
    ...context,
    profile: context.profile,
    workspace: context.workspace,
  };
}

function getDemoUser(): User {
  return {
    id: DEMO_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "fluebaze-local-demo@local.test",
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "demo", providers: ["demo"] },
    user_metadata: { full_name: "Local Demo User" },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  };
}
