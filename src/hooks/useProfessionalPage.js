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
import { getFallbackSlug, isReservedSlug, sanitizeSlug } from "@/lib/slug";
import { buildTimeSlots } from "@/lib/availability";

const pageCacheTtl = 5 * 60 * 1000;

export default function useProfessionalPage() {
  const { supabase, user } = useAuth();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase && user));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchPage = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setHasLoaded(false);
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
    setHasLoaded(true);
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

      if (!hasLoaded) {
        return { error: { message: "Espera a que tu pagina termine de cargarse antes de publicar." } };
      }

      const payload = editorStateToPagePayload({
        availableDays,
        data: {
          ...data,
          publicSlug: sanitizeSlug(data.publicSlug) || getFallbackSlug(user),
        },
        services,
        professional: {
          ...(page?.professional ?? {}),
          name: user.user_metadata?.full_name || user.user_metadata?.name || "Profesional",
          title: data.profileSubtitle || "",
        },
      });

      if (isReservedSlug(payload.slug)) {
        return { error: { message: "Este enlace esta reservado. Elige otro nombre para tu pagina." } };
      }
      if (!payload.services.length || payload.services.some((service) => !service.name?.trim())) {
        return { error: { message: "Agrega al menos un servicio con nombre antes de publicar." } };
      }
      if (!buildTimeSlots(data.scheduleStart, data.scheduleEnd).length) {
        return { error: { message: "El horario de fin debe ser posterior al inicio." } };
      }

      setIsSaving(true);
      setError("");

      let savedRow, saveError;
      try {
        const result = await supabase
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
        savedRow = result.data;
        saveError = result.error;
      } catch {
        saveError = { message: "No se pudo conectar para publicar. Intentalo de nuevo." };
      } finally {
        setIsSaving(false);
      }

      if (saveError) {
        if (saveError.code === "23505") {
          saveError = { ...saveError, message: "Este enlace ya pertenece a otro profesional. Elige otro." };
        }
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
    [hasLoaded, page, supabase, user],
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
