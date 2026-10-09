import { getPublicPageBySlug as getMockPublicPageBySlug } from "@/data/publicPages";
import { databaseRowToPublicPage } from "@/lib/professionalPage/mapper";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const publicPageCache = new Map();
const publicPageCacheTtl = 60 * 1000;

export async function getPublicPageBySlug(slug) {
  if (!isSupabaseConfigured) {
    return getMockPublicPageBySlug(slug);
  }

  const cachedPage = getCachedPublicPage(slug);
  if (cachedPage) return cachedPage;

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
  setCachedPublicPage(slug, page);
  return page;
}

function getCachedPublicPage(slug) {
  const cached = publicPageCache.get(slug);

  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    publicPageCache.delete(slug);
    return null;
  }

  return cached.page;
}

function setCachedPublicPage(slug, page) {
  publicPageCache.set(slug, {
    expiresAt: Date.now() + publicPageCacheTtl,
    page,
  });
}
