"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserCacheKey,
  readLocalCache,
  writeLocalCache,
} from "@/lib/localCache";
import { getFallbackSlug } from "@/lib/slug";

const slugCacheTtl = 10 * 60 * 1000;

export default function useCurrentPublicPageLink() {
  const { supabase, user } = useAuth();
  const fallbackSlug = useMemo(() => getFallbackSlug(user), [user]);
  const [slug, setSlug] = useState(fallbackSlug);
  const [isLoading, setIsLoading] = useState(Boolean(supabase && user));

  const fetchSlug = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      setSlug(fallbackSlug);
      return;
    }

    setIsLoading(true);

    const { data } = await supabase
      .from("professional_pages")
      .select("slug")
      .eq("user_id", user.id)
      .maybeSingle();

    setSlug(data?.slug || fallbackSlug);
    writeLocalCache(
      getUserCacheKey(user, "public-page-slug"),
      data?.slug || fallbackSlug,
      slugCacheTtl,
    );
    setIsLoading(false);
  }, [fallbackSlug, supabase, user]);

  useEffect(() => {
    queueMicrotask(() => {
      if (user) {
        const cachedSlug = readLocalCache(
          getUserCacheKey(user, "public-page-slug"),
        );

        if (cachedSlug) {
          setSlug(cachedSlug);
          setIsLoading(false);
        }
      }

      fetchSlug();
    });
  }, [fetchSlug, user]);

  return {
    href: `/${slug}`,
    isLoading,
    slug,
  };
}
