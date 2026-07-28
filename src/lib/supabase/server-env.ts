import "server-only";
import { getSupabaseConfig } from "@/lib/supabase/env";

/**
 * Product sessions normally use the browser-safe anon key. The original
 * landing project was configured with server-only Supabase credentials, so
 * local development may securely use that key as the API gateway key while
 * the signed-in user's access token remains the Authorization header. The
 * service-role value never reaches a Client Component or browser response.
 */
export function requireServerSupabaseConfig() {
  const publicConfig = getSupabaseConfig();
  if (publicConfig) return publicConfig;

  const url = process.env.SUPABASE_URL;
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serverKey) return { url, anonKey: serverKey };

  throw new Error(
    "Fluebaze is not connected to Supabase. Add the Supabase project URL and a server or anon key.",
  );
}
