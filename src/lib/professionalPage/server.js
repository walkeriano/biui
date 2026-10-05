import { getPublicPageBySlug as getMockPublicPageBySlug } from "@/data/publicPages";
import { databaseRowToPublicPage } from "@/lib/professionalPage/mapper";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function getPublicPageBySlug(slug) {
  if (!isSupabaseConfigured) {
    return getMockPublicPageBySlug(slug);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Error loading public page", error.message);
    return null;
  }

  return databaseRowToPublicPage(data);
}
