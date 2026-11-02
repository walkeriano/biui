"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ResetPassword() {
  const { supabase, user, isLoading } = useAuth();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const invalidLink = Boolean(params.get("error")) || (!isLoading && !user);

  async function submit(event) {
    event.preventDefault();
    if (isSubmitting || invalidLink || !supabase) return;
    if (password.length < 8) return setFeedback("Usa al menos 8 caracteres.");
    if (password !== confirmation) return setFeedback("Las contraseñas no coinciden.");
    setIsSubmitting(true);
    setFeedback("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmation("");
      setSaved(true);
    } catch (error) {
      setFeedback(error.message || "No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-card border border-line bg-surface p-7 shadow-card">
      <h1 className="text-2xl font-bold">Restablecer contraseña</h1>
      {isLoading ? <p className="mt-4" role="status">Validando enlace...</p> : saved ? (
        <div className="mt-4" role="status"><p>Tu contraseña se ha actualizado.</p><Link className="mt-4 inline-block font-bold text-accent" href="/dashboard">Ir al dashboard</Link></div>
      ) : invalidLink ? (
        <div className="mt-4"><p role="alert">El enlace no es válido o ha caducado. Solicita uno nuevo desde el acceso.</p><Link className="mt-4 inline-block font-bold text-accent" href="/acceso?mode=login">Volver al acceso</Link></div>
      ) : (
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold">Nueva contraseña<input className="h-12 rounded-md border border-line px-3" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} /></label>
          <label className="grid gap-2 text-sm font-bold">Repite la contraseña<input className="h-12 rounded-md border border-line px-3" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={isSubmitting} /></label>
          {feedback ? <p role="alert" className="text-sm text-danger">{feedback}</p> : null}
          <button className="h-12 rounded-md bg-accent px-4 font-bold text-white disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar contraseña"}</button>
        </form>
      )}
    </section>
  );
}
