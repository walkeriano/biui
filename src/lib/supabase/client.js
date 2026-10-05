import { createBrowserClient } from "@supabase/ssr";
import {
  assertSupabaseConfig,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";

let browserClient;

export function createClient() {
  assertSupabaseConfig();

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
}
