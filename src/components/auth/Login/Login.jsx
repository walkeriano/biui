"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faRightToBracket,
  faShieldHalved,
  faUserPlus,
} from "@/lib/fontawesome";
import { useAuth } from "@/context/AuthContext";
import useAuthActions from "@/hooks/useAuthActions";

const fieldClassName =
  "h-12 w-full appearance-none rounded-md border border-line bg-surface px-4 text-sm text-foreground placeholder:text-muted transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft";

export default function Login({ onSwitchToRegister }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConfigured } = useAuth();
  const { resetPassword, signIn } = useAuthActions();
  const nextPath = searchParams.get("next") || "/dashboard";

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setIsSubmitting(true);

    const { error } = await signIn(form);
    setIsSubmitting(false);

    if (error) {
      setFeedback(error.message);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  const handleResetPassword = async () => {
    if (!form.email) {
      setFeedback("Escribe tu email para enviarte el enlace de recuperacion.");
      return;
    }

    setFeedback("");
    const { error } = await resetPassword(form.email);
    setFeedback(
      error
        ? error.message
        : "Te enviamos un enlace de recuperacion si el email existe.",
    );
  };

  return (
    <div aria-labelledby="login-title">
      <div>
        <h2 id="login-title" className="text-3xl font-bold text-foreground">
          Inicia sesion
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Vuelve a tu panel para gestionar reservas y clientes.
        </p>
      </div>

      {!isConfigured ? (
        <p className="mt-5 rounded-card border border-line bg-surface-muted px-4 py-3 text-sm leading-6 text-muted">
          Supabase aun no esta configurado. Agrega tus variables en
          .env.local para habilitar el acceso real.
        </p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-bold text-foreground">Email</span>
          <div className="relative">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              className={`${fieldClassName} pl-11`}
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              placeholder="nombre@tucorreo.com"
              autoComplete="email"
              required
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-foreground">Contrasena</span>
          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              className={`${fieldClassName} pl-11 pr-12`}
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={(event) => updateForm("password", event.target.value)}
              placeholder="Tu contrasena"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 grid w-8 place-items-center text-muted transition hover:text-primary"
              aria-label={showPassword ? "Ocultar contrasena" : "Ver contrasena"}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="size-4"
              />
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="inline-flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              className="size-4 rounded border-line text-primary"
            />
            Recordarme
          </label>
          <button
            type="button"
            onClick={handleResetPassword}
            className="inline-flex items-center gap-2 font-bold text-accent underline-offset-4 transition hover:text-primary hover:underline"
          >
            <FontAwesomeIcon icon={faShieldHalved} className="size-3.5" />
            Recuperar
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isConfigured}
          className="flex h-13 w-full items-center justify-center gap-3 rounded-md bg-accent px-4 text-base font-bold text-white shadow-card transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent-soft"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
          <FontAwesomeIcon icon={faRightToBracket} className="size-4" />
        </button>
      </form>

      {feedback ? (
        <p className="mt-4 rounded-card bg-surface-muted px-4 py-3 text-sm leading-6 text-muted">
          {feedback}
        </p>
      ) : null}

      <p className="mt-5 text-center text-sm font-medium text-muted">
        Aun no tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="inline-flex items-center gap-2 font-bold text-accent underline underline-offset-4 transition hover:text-primary"
        >
          <FontAwesomeIcon icon={faUserPlus} className="size-3.5" />
          Crear cuenta
        </button>
      </p>
    </div>
  );
}
