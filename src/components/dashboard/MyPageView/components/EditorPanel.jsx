"use client";

import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faImage, faUser, faBriefcase, faLocationDot, faCalendarDays, faLink } from "@/lib/fontawesome";
import AboutSection from "@/components/dashboard/MyPageView/components/AboutSection";
import AppearanceSection from "@/components/dashboard/MyPageView/components/AppearanceSection";
import AvailabilitySection from "@/components/dashboard/MyPageView/components/AvailabilitySection";
import HeroSection from "@/components/dashboard/MyPageView/components/HeroSection";
import LocationSection from "@/components/dashboard/MyPageView/components/LocationSection";
import ServicesSection from "@/components/dashboard/MyPageView/components/ServicesSection";
import PublicLinkSection from "@/components/dashboard/MyPageView/components/PublicLinkSection";

const sections = [
  { id: "link", label: "Enlace público", icon: faLink, Component: PublicLinkSection },
  { id: "appearance", label: "Apariencia", icon: faPalette, Component: AppearanceSection },
  { id: "hero", label: "Home bienvenida", icon: faImage, Component: HeroSection },
  { id: "about", label: "Sobre mí", icon: faUser, Component: AboutSection },
  { id: "services", label: "Servicios", icon: faBriefcase, Component: ServicesSection },
  { id: "location", label: "Ubicación", icon: faLocationDot, Component: LocationSection },
  { id: "availability", label: "Disponibilidad", icon: faCalendarDays, Component: AvailabilitySection },
];

export default function EditorPanel({
  addService,
  availableDays,
  data,
  handleServiceImage,
  handleImage,
  handleSavePage,
  hasChanges,
  heroImage,
  isSaving,
  isLoading,
  hasExistingPage,
  publishStatus,
  isUploading,
  profileImage,
  removeService,
  services,
  setHeroImage,
  setProfileImage,
  toggleAvailableDay,
  updateData,
  updateService,
}) {
  const [openSections, setOpenSections] = useState({});
  const [mobileSection, setMobileSection] = useState(null);
  const editorId = useId();

  const toggleSection = (sectionId) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const isSectionOpen = (sectionId) => Boolean(openSections[sectionId]);

  const selectMobileSection = (sectionId, event) => {
    setMobileSection(sectionId);
    setOpenSections((current) => ({ ...current, [sectionId]: true }));
    event.currentTarget.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const sectionProps = {
    link: { data, updateData },
    appearance: { data, handleImage, updateData },
    hero: { data, handleImage, heroImage, setHeroImage, updateData },
    about: { data, handleImage, profileImage, setProfileImage, updateData },
    services: { addService, handleServiceImage, removeService, services, updateService },
    location: { data, updateData },
    availability: { availableDays, data, toggleAvailableDay, updateData },
  };

  return (
    <fieldset
      disabled={isLoading || isSaving || isUploading || publishStatus?.state === "publishing"}
      aria-busy={isLoading}
      className="grid min-w-0 gap-4 max-md:order-2"
    >
      <nav
        aria-label="Secciones del editor de página"
        className="flex min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2 md:hidden"
      >
        {sections.map(({ id, label, icon }) => {
          const isActive = mobileSection === id && isSectionOpen(id);
          return (
            <button
              key={id}
              type="button"
              aria-controls={`${editorId}-${id}`}
              aria-expanded={isActive}
              onClick={(event) => selectMobileSection(id, event)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                isActive
                  ? "border-accent bg-accent text-white"
                  : "border-black bg-black text-white hover:border-accent"
              }`}
            >
              <FontAwesomeIcon icon={icon} className={`size-4 ${isActive ? "text-white" : "text-accent"}`} />
              {label}
            </button>
          );
        })}
      </nav>
      {sections.map(({ id, label, Component }) => (
        <section
          key={id}
          id={`${editorId}-${id}`}
          aria-label={label}
          className={mobileSection === id ? "min-w-0 md:contents" : "hidden min-w-0 md:contents"}
        >
          <Component
            {...sectionProps[id]}
            isOpen={isSectionOpen(id)}
            onToggle={() => toggleSection(id)}
          />
        </section>
      ))}
      <article className="rounded-card border border-black bg-black p-4 text-white shadow-card">
        <p className="text-sm font-bold">Publicar cambios</p>
        <p className="mt-1 text-[0.8125rem] leading-5 text-white/72">
          Guarda la configuracion actual y actualiza tu pagina publica para tus
          clientes.
        </p>
        <button
          type="button"
          onClick={handleSavePage}
          disabled={(!hasChanges && hasExistingPage) || isLoading || isSaving || isUploading || publishStatus?.state === "publishing"}
          className="mt-4 h-11 w-full rounded-md bg-accent px-4 text-sm font-bold text-white shadow-card transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Publicando..." : hasChanges ? "Publicar cambios" : "Sin cambios pendientes"}
        </button>
      </article>
    </fieldset>
  );
}
