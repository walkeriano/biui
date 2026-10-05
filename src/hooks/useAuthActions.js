"use client";

import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export default function useAuthActions() {
  const { supabase } = useAuth();

  const ensureClient = useCallback(() => {
    if (!supabase) {
      return {
        error: {
          message:
            "Supabase aun no esta configurado. Agrega las variables de entorno.",
        },
      };
    }

    return { supabase };
  }, [supabase]);

  const signIn = useCallback(
    async ({ email, password }) => {
      const client = ensureClient();
      if (client.error) return client;
      return client.supabase.auth.signInWithPassword({ email, password });
    },
    [ensureClient],
  );

  const signUp = useCallback(
    async ({ email, name, password }) => {
      const client = ensureClient();
      if (client.error) return client;

      return client.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
    },
    [ensureClient],
  );

  const signOut = useCallback(async () => {
    const client = ensureClient();
    if (client.error) return client;
    return client.supabase.auth.signOut();
  }, [ensureClient]);

  const resetPassword = useCallback(
    async (email) => {
      const client = ensureClient();
      if (client.error) return client;

      return client.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/acceso`,
      });
    },
    [ensureClient],
  );

  return {
    resetPassword,
    signIn,
    signOut,
    signUp,
  };
}
