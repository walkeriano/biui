"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faRightToBracket,
  faShieldHalved,
  faUser,
  faUserPlus,
} from "@/lib/fontawesome";
import { useAuth } from "@/context/AuthContext";
import useAuthActions from "@/hooks/useAuthActions";

const fieldClassName =
  "h-12 w-full appearance-none rounded-md border border-line bg-surface px-4 text-sm text-foreground placeholder:text-muted transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft";

export default function Register({ onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isConfigured } = useAuth();
  const { signUp } = useAuthActions();

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setIsSubmitting(true);

    const { data, error } = await signUp(form);
    setIsSubmitting(false);

    if (error) {
      setFeedback(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setFeedback(
      "Cuenta creada. Revisa tu correo para confirmar el registro antes de iniciar sesion.",
    );
  };

  return (
    <div aria-labelledby="register-title">
      <div>
        <h2 id="register-title" className="text-3xl font-bold text-foreground">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Empieza a recibir reservas en minutos.
        </p>
      </div>

      {!isConfigured ? (
        <p className="mt-5 rounded-card border border-line bg-surface-muted px-4 py-3 text-sm leading-6 text-muted">
          Supabase aun no esta configurado. Agrega tus variables en
          .env.local para habilitar el registro real.
        </p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-bold text-foreground">Nombre</span>
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              className={`${fieldClassName} pl-11`}
              type="text"
              name="name"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />
          </div>
        </label>

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
              placeholder="Minimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
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

        <button
          type="submit"
          disabled={isSubmitting || !isConfigured}
          className="flex h-13 w-full items-center justify-center gap-3 rounded-md bg-accent px-4 text-base font-bold text-white shadow-card transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent-soft"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          <FontAwesomeIcon icon={faUserPlus} className="size-4" />
        </button>
      </form>

      {feedback ? (
        <p className="mt-4 rounded-card bg-surface-muted px-4 py-3 text-sm leading-6 text-muted">
          {feedback}
        </p>
      ) : null}

      <p className="mt-4 text-center text-xs leading-5 text-muted">
        Al registrarte aceptas nuestros{" "}
        <a
          href="#terminos"
          className="font-bold text-accent underline underline-offset-4 transition hover:text-primary"
        >
          Terminos y Condiciones
        </a>{" "}
        y nuestra{" "}
        <a
          href="#privacidad"
          className="inline-flex items-center gap-1 font-bold text-accent underline underline-offset-4 transition hover:text-primary"
        >
          <FontAwesomeIcon icon={faShieldHalved} className="size-3" />
          Politica de Privacidad
        </a>
      </p>

      <p className="mt-4 text-center text-sm font-medium text-muted">
        Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="inline-flex items-center gap-2 font-bold text-accent underline underline-offset-4 transition hover:text-primary"
        >
          <FontAwesomeIcon icon={faRightToBracket} className="size-3.5" />
          Iniciar sesion
        </button>
      </p>
    </div>
  );
}
