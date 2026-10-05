import AboutSection from "@/components/dashboard/MyPageView/components/AboutSection";
import AppearanceSection from "@/components/dashboard/MyPageView/components/AppearanceSection";
import AvailabilitySection from "@/components/dashboard/MyPageView/components/AvailabilitySection";
import HeroSection from "@/components/dashboard/MyPageView/components/HeroSection";
import LocationSection from "@/components/dashboard/MyPageView/components/LocationSection";
import ServicesSection from "@/components/dashboard/MyPageView/components/ServicesSection";

export default function EditorPanel({
  addService,
  availableDays,
  data,
  handleServiceImage,
  handleImage,
  handleSavePage,
  heroImage,
  isSaving,
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
  return (
    <section className="grid gap-4">
      <AppearanceSection data={data} updateData={updateData} />
      <HeroSection
        data={data}
        handleImage={handleImage}
        heroImage={heroImage}
        setHeroImage={setHeroImage}
        updateData={updateData}
      />
      <AboutSection
        data={data}
        handleImage={handleImage}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        updateData={updateData}
      />
      <ServicesSection
        addService={addService}
        handleServiceImage={handleServiceImage}
        removeService={removeService}
        services={services}
        updateService={updateService}
      />
      <LocationSection data={data} updateData={updateData} />
      <AvailabilitySection
        availableDays={availableDays}
        data={data}
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
          disabled={isSaving || isUploading}
          className="mt-4 h-11 w-full rounded-md bg-accent px-4 text-sm font-bold text-white shadow-card transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Publicando..." : "Publicar cambios"}
        </button>
      </article>
    </section>
  );
}
