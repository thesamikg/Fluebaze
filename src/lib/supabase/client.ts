"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseConfig } from "@/lib/supabase/env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!client) {
    const { url, anonKey } = requireSupabaseConfig();
    client = createBrowserClient<Database>(url, anonKey);
  }
  return client;
}
