import "server-only";

export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseAdminConfigured = Boolean(supabaseServiceRoleKey);

export function assertSupabaseAdminConfig() {
  if (!isSupabaseAdminConfigured) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY.");
  }
}
