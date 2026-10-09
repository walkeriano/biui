import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";
import { supabaseServiceRoleKey } from "@/lib/supabase/serverConfig";

export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
