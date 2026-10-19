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
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <SectionHeader
        icon={faImage}
        isOpen={isOpen}
        onToggle={onToggle}
        title="Portada (Hero)"
        description="Imagen principal y texto de presentacion."
      />

      {isOpen ? (
        <div className="mt-4 grid gap-5">
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
