"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFallbackSlug } from "@/lib/slug";

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
    setIsLoading(false);
  }, [fallbackSlug, supabase, user]);

  useEffect(() => {
    queueMicrotask(fetchSlug);
  }, [fetchSlug]);

  return {
    href: `/${slug}`,
    isLoading,
    slug,
  };
}
