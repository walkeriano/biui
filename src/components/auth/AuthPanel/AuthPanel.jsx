"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Login from "@/components/auth/Login/Login";
import Register from "@/components/auth/Register/Register";
import { faRightToBracket, faUserPlus } from "@/lib/fontawesome";

const modes = [
  { id: "register", label: "Crear cuenta", icon: faUserPlus },
  { id: "login", label: "Iniciar sesion", icon: faRightToBracket },
];

export default function AuthPanel() {
  const [activeMode, setActiveMode] = useState("register");
  const isRegister = activeMode === "register";

  return (
    <section className="mx-auto w-full max-w-md rounded-[1.25rem] border border-line bg-surface-elevated p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="grid grid-cols-2 rounded-card bg-surface-muted p-1">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveMode(mode.id)}
              className={
                isActive
                  ? "flex h-11 items-center justify-center gap-2 rounded-md bg-primary text-sm font-bold text-white shadow-card transition"
                  : "flex h-11 items-center justify-center gap-2 rounded-md text-sm font-bold text-muted transition hover:bg-surface hover:text-foreground"
              }
              aria-pressed={isActive}
            >
              <FontAwesomeIcon icon={mode.icon} className="size-3.5" />
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className="mt-7">
        {isRegister ? (
          <Register onSwitchToLogin={() => setActiveMode("login")} />
        ) : (
          <Login onSwitchToRegister={() => setActiveMode("register")} />
        )}
      </div>
    </section>
  );
}
