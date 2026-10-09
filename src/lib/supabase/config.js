export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export function assertSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
}
