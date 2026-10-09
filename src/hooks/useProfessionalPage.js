"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserCacheKey,
  readLocalCache,
  writeLocalCache,
} from "@/lib/localCache";
import {
  databaseRowToPublicPage,
  editorStateToPagePayload,
  pagePayloadToEditorState,
} from "@/lib/professionalPage/mapper";
import { getFallbackSlug, sanitizeSlug } from "@/lib/slug";

const pageCacheTtl = 5 * 60 * 1000;

export default function useProfessionalPage() {
  const { supabase, user } = useAuth();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase && user));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("professional_pages")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setIsLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return null;
    }

    const nextPage = databaseRowToPublicPage(data);
    setPage(nextPage);
    writeLocalCache(
      getUserCacheKey(user, "professional-page"),
      nextPage,
      pageCacheTtl,
    );
    return nextPage;
  }, [supabase, user]);

  useEffect(() => {
    queueMicrotask(() => {
      if (user) {
        const cachedPage = readLocalCache(
          getUserCacheKey(user, "professional-page"),
        );

        if (cachedPage) {
          setPage(cachedPage);
          setIsLoading(false);
        }
      }

      fetchPage();
    });
  }, [fetchPage, user]);

  const savePage = useCallback(
    async ({ availableDays, data, services }) => {
      if (!supabase || !user) {
        return {
          error: {
            message:
              "Necesitas iniciar sesion y configurar Supabase para guardar.",
          },
        };
      }

      const payload = editorStateToPagePayload({
        availableDays,
        data: {
          ...data,
          publicSlug: sanitizeSlug(data.publicSlug) || getFallbackSlug(user),
        },
        services,
      });

      setIsSaving(true);
      setError("");

      const { data: savedRow, error: saveError } = await supabase
        .from("professional_pages")
        .upsert(
          {
            user_id: user.id,
            ...payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        .select("*")
        .single();

      setIsSaving(false);

      if (saveError) {
        setError(saveError.message);
        return { error: saveError };
      }

      const nextPage = databaseRowToPublicPage(savedRow);
      setPage(nextPage);
      writeLocalCache(
        getUserCacheKey(user, "professional-page"),
        nextPage,
        pageCacheTtl,
      );
      writeLocalCache(
        getUserCacheKey(user, "public-page-slug"),
        nextPage.slug,
        10 * 60 * 1000,
      );
      return { data: nextPage, error: null };
    },
    [supabase, user],
  );

  return {
    editorState: pagePayloadToEditorState(page),
    error,
    fetchPage,
    isLoading,
    isSaving,
    page,
    savePage,
  };
}
