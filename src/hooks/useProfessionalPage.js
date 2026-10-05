"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  databaseRowToPublicPage,
  editorStateToPagePayload,
  pagePayloadToEditorState,
} from "@/lib/professionalPage/mapper";
import { getFallbackSlug, sanitizeSlug } from "@/lib/slug";

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
    return nextPage;
  }, [supabase, user]);

  useEffect(() => {
    queueMicrotask(fetchPage);
  }, [fetchPage]);

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
