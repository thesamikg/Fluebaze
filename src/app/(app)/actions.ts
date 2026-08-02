"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, isDemoRequest } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  if (await isDemoRequest()) {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_COOKIE);
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
