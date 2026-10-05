"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faLotus } from "@/lib/fontawesome";
import {
  getButtonClassName,
  getButtonStyle,
} from "@/components/public-page/theme";

const navItems = [
  ["inicio", "Inicio"],
  ["sobre-mi", "Sobre mi"],
  ["servicios", "Servicios"],
  ["reservar", "Reservar"],
];

export default function PublicHeader({ page, previewMode = false }) {
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    if (previewMode) return undefined;

    const handleScroll = () => {
      const current = navItems
        .map(([id]) => {
          const element = document.getElementById(id);
          return element
            ? { id, top: Math.abs(element.getBoundingClientRect().top - 96) }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.top - b.top)[0];

      if (current) {
        setActiveSection(current.id);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [previewMode]);

  return (
    <header
      className={
        previewMode
          ? "absolute inset-x-0 top-0 z-40 border-b border-white/35 bg-white/72 backdrop-blur-xl"
          : "fixed inset-x-0 top-0 z-40 border-b border-white/35 bg-white/72 backdrop-blur-xl"
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          {page.professional.logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.professional.logoImage}
              alt={page.professional.name}
              className="h-11 w-auto max-w-[11rem] object-contain"
            />
          ) : (
            <BrandFallback page={page} />
          )}
        </a>

        <nav className="hidden items-center gap-9 text-sm font-bold text-[#061923] lg:flex">
          {navItems.map(([id, label]) => {
            const isActive =
              activeSection === id || (previewMode && id === "inicio");

            return (
              <a
                key={id}
                href={`#${id}`}
                className="border-b pb-1 transition"
                style={{
                  borderColor: isActive ? page.theme.primaryColor : "transparent",
                  color: isActive ? page.theme.primaryColor : undefined,
                }}
              >
                {label}
              </a>
            );
          })}
        </nav>

        <a
          href="#reservar"
          className={`inline-flex h-11 items-center justify-center gap-2 px-5 text-sm font-bold shadow-card ${getButtonClassName(page.theme.buttonStyle, { pill: true })}`}
          style={getButtonStyle(page)}
        >
          Reservar cita
          <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
        </a>
      </div>
    </header>
  );
}

function BrandFallback({ page }) {
  return (
    <>
      <FontAwesomeIcon
        icon={faLotus}
        className="size-10"
        style={{ color: page.theme.secondaryColor }}
      />
      <span>
        <span
          className="block text-lg font-bold leading-none text-[#061923]"
          style={{ fontFamily: page.theme.titleFont }}
        >
          {page.professional.name}
        </span>
        <span
          className="mt-1 block text-[0.65rem] font-bold uppercase tracking-[0.32em]"
          style={{ color: page.theme.secondaryColor }}
        >
          {page.professional.title}
        </span>
      </span>
    </>
  );
}
