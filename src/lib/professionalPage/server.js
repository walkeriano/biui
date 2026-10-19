import "server-only";
import { cache } from "react";
import { getPublicPageBySlug as getMockPublicPageBySlug } from "@/data/publicPages";
import { databaseRowToPublicPage } from "@/lib/professionalPage/mapper";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const getPublicPageBySlug = cache(async function getPublicPageBySlug(slug) {
  if (!isSupabaseConfigured) {
    return process.env.NODE_ENV === "development" ? getMockPublicPageBySlug(slug) : null;
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

  const page = databaseRowToPublicPage(data);
  return page;
});
