"use client";

import { useState } from "react";
import AboutSection from "@/components/dashboard/MyPageView/components/AboutSection";
import AppearanceSection from "@/components/dashboard/MyPageView/components/AppearanceSection";
import AvailabilitySection from "@/components/dashboard/MyPageView/components/AvailabilitySection";
import HeroSection from "@/components/dashboard/MyPageView/components/HeroSection";
import LocationSection from "@/components/dashboard/MyPageView/components/LocationSection";
import ServicesSection from "@/components/dashboard/MyPageView/components/ServicesSection";

const sectionIds = [
  "appearance",
  "hero",
  "about",
  "services",
  "location",
  "availability",
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

  const toggleSection = (sectionId) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const isSectionOpen = (sectionId) => Boolean(openSections[sectionId]);

  return (
    <fieldset
      disabled={isLoading || isSaving || isUploading || publishStatus?.state === "publishing"}
      aria-busy={isLoading}
      className="grid min-w-0 gap-4"
    >
      <AppearanceSection
        data={data}
        handleImage={handleImage}
        isOpen={isSectionOpen(sectionIds[0])}
        onToggle={() => toggleSection(sectionIds[0])}
        updateData={updateData}
      />
      <HeroSection
        data={data}
        handleImage={handleImage}
        heroImage={heroImage}
        isOpen={isSectionOpen(sectionIds[1])}
        onToggle={() => toggleSection(sectionIds[1])}
        setHeroImage={setHeroImage}
        updateData={updateData}
      />
      <AboutSection
        data={data}
        handleImage={handleImage}
        isOpen={isSectionOpen(sectionIds[2])}
        onToggle={() => toggleSection(sectionIds[2])}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        updateData={updateData}
      />
      <ServicesSection
        addService={addService}
        handleServiceImage={handleServiceImage}
        isOpen={isSectionOpen(sectionIds[3])}
        onToggle={() => toggleSection(sectionIds[3])}
        removeService={removeService}
        services={services}
        updateService={updateService}
      />
      <LocationSection
        data={data}
        isOpen={isSectionOpen(sectionIds[4])}
        onToggle={() => toggleSection(sectionIds[4])}
        updateData={updateData}
      />
      <AvailabilitySection
        availableDays={availableDays}
        data={data}
        isOpen={isSectionOpen(sectionIds[5])}
        onToggle={() => toggleSection(sectionIds[5])}
        toggleAvailableDay={toggleAvailableDay}
        updateData={updateData}
      />
      <article className="rounded-card border border-line bg-primary p-4 text-white shadow-card">
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
