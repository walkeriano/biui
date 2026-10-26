"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRightToBracket, faUserPlus, faXmark } from "@/lib/fontawesome";

const navigation = [
  { label: "Inicio", href: "#inicio" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Suscripción", href: "#suscripcion" },
  { label: "Atención al cliente", href: "#atencion" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#inicio");
  const headerRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    function updateActiveSection() {
      let current = "#inicio";
      for (const item of navigation) {
        const section = document.getElementById(item.href.slice(1));
        if (section && section.getBoundingClientRect().top <= 160) {
          current = item.href;
        }
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = "#atencion";
      }
      setActiveHref(current);
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    function closeOnDesktop(event) {
      if (event.matches) setIsOpen(false);
    }
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function dismiss(event) {
      if (event.type === "keydown") {
        if (event.key !== "Escape") return;
        toggleRef.current?.focus();
      } else if (headerRef.current?.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
    };
  }, [isOpen]);

  return (
    <header ref={headerRef} className="relative mx-auto flex w-full max-w-[86rem] items-center justify-between rounded-[1.15rem] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_40px_rgba(8,31,24,0.08)] backdrop-blur sm:gap-6 sm:px-8">
      <a href="#inicio" onClick={() => setIsOpen(false)} aria-label="BIUI inicio" className="shrink-0">
        <Image
          src="/logo-biui.jpg"
          alt="BIUI"
          width={981}
          height={554}
          priority
          className="h-10 w-auto object-contain mix-blend-multiply sm:h-12"
        />
      </a>
      <nav id="landing-navigation" aria-label="Navegación principal" className={`${isOpen ? "flex" : "hidden"} absolute inset-x-0 top-[calc(100%+0.5rem)] max-h-[calc(100dvh-7rem)] flex-col gap-2 overflow-y-auto rounded-[1.15rem] border border-white/70 bg-white p-4 shadow-[0_12px_40px_rgba(8,31,24,0.12)] lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:gap-8 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none text-sm font-medium text-[#0f1315]`}>
        {navigation.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={activeHref === item.href ? "location" : undefined}
            onClick={() => {
              setIsOpen(false);
              if (toggleRef.current?.offsetParent) toggleRef.current.focus();
            }}
            className={
              activeHref === item.href
                ? "rounded px-3 py-3 font-bold text-[#34ad12] lg:px-0 lg:py-2 lg:underline lg:decoration-4 lg:underline-offset-[1rem] focus-visible:outline-2 focus-visible:outline-accent"
                : "rounded px-3 py-3 transition hover:text-accent lg:px-0 lg:py-2 focus-visible:outline-2 focus-visible:outline-accent"
            }
          >
            {item.label}
          </a>
        ))}
        <Link href="/acceso" className="rounded px-3 py-3 font-bold text-primary focus-visible:outline-2 focus-visible:outline-accent sm:hidden">
          Iniciar sesión
        </Link>
      </nav>
      <div className="flex items-center gap-3">
        <button
          ref={toggleRef}
          type="button"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
          aria-controls="landing-navigation"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-lg text-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-accent lg:hidden"
        >
          <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="size-5" />
        </button>
        <Link
          href="/acceso"
          className="hidden items-center gap-3 text-base font-bold text-[#0d1214] transition hover:text-accent text-sm sm:inline-flex"
        >
          <FontAwesomeIcon icon={faRightToBracket} className="size-3.5" />
          Iniciar sesión
        </Link>
        <Link
          href="/acceso"
          aria-label="Crear cuenta"
          className="inline-flex size-10 items-center justify-center gap-2 whitespace-nowrap rounded-[0.55rem] bg-[#00261e] text-sm font-bold text-white shadow-[0_14px_30px_rgba(0,31,24,0.16)] transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-soft sm:h-11 sm:w-auto sm:px-4"
        >
          <span className="hidden sm:inline">Crear cuenta</span>
          <FontAwesomeIcon icon={faUserPlus} className="size-3.7" />
        </Link>
      </div>
    </header>
  );
}
