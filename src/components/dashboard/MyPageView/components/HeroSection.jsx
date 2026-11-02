import {
  inputClassName,
  textareaClassName,
} from "@/components/dashboard/MyPageView/data";
import Field from "@/components/dashboard/MyPageView/components/Field";
import ImagePicker from "@/components/dashboard/MyPageView/components/ImagePicker";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";
import { faImage } from "@/lib/fontawesome";

export default function HeroSection({
  data,
  handleImage,
  heroImage,
  isOpen,
  onToggle,
  setHeroImage,
  updateData,
}) {
  return (
    <article className="overflow-hidden rounded-card border border-black bg-black shadow-card">
      <SectionHeader
        icon={faImage}
        isOpen={isOpen}
        onToggle={onToggle}
        title="Home bienvenida"
        description="Nombre comercial, imagen principal y texto de presentación."
      />

      {isOpen ? (
        <div className="page-editor-content bg-black p-4 grid gap-5">
          <Field label="Nombre comercial" counter={`${(data.businessName ?? "").length}/80`}>
            <input
              value={data.businessName ?? ""}
              maxLength={80}
              placeholder="Tu marca o tu nombre"
              onChange={(event) => updateData("businessName", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <p className="text-xs leading-5 text-white/72">
            Se mostrará en la pestaña del navegador al publicar. Si lo dejas vacío, se usará el nombre del profesional.
          </p>
          <ImagePicker
            label="Imagen de portada"
            image={heroImage}
            onChange={handleImage(setHeroImage, "page", "heroImage")}
            onClear={() => setHeroImage("")}
            hint="Recomendado: 1920x1080px."
          />

          <div className="grid gap-4">
            <Field label="Etiqueta (opcional)" counter={`${data.heroLabel.length}/40`}>
              <input
                value={data.heroLabel}
                maxLength={40}
                onChange={(event) => updateData("heroLabel", event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Titulo principal" counter={`${data.heroTitle.length}/80`}>
              <input
                value={data.heroTitle}
                maxLength={80}
                onChange={(event) => updateData("heroTitle", event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field
              label="Texto de presentacion"
              counter={`${data.heroText.length}/300`}
            >
              <textarea
                value={data.heroText}
                maxLength={300}
                rows={4}
                onChange={(event) => updateData("heroText", event.target.value)}
                className={textareaClassName}
              />
            </Field>
          </div>
        </div>
      ) : null}
    </article>
  );
}
