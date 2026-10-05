import {
  inputClassName,
  textareaClassName,
} from "@/components/dashboard/MyPageView/data";
import Field from "@/components/dashboard/MyPageView/components/Field";
import ImagePicker from "@/components/dashboard/MyPageView/components/ImagePicker";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";

export default function AboutSection({
  data,
  handleImage,
  profileImage,
  setProfileImage,
  updateData,
}) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <SectionHeader
        number="3"
        title="Sobre mi"
        description="Tu historia profesional y enfoque de trabajo."
      />

      <div className="grid gap-5">
        <ImagePicker
          label="Foto de perfil"
          image={profileImage}
          onChange={handleImage(setProfileImage, "page", "profileImage")}
          onClear={() => setProfileImage("")}
          hint="Recomendado: 400x400px."
        />

        <div className="grid gap-4">
          <Field label="Titulo" counter={`${data.profileTitle.length}/60`}>
            <input
              value={data.profileTitle}
              maxLength={60}
              onChange={(event) => updateData("profileTitle", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Subtitulo" counter={`${data.profileSubtitle.length}/80`}>
            <input
              value={data.profileSubtitle}
              maxLength={80}
              onChange={(event) =>
                updateData("profileSubtitle", event.target.value)
              }
              className={inputClassName}
            />
          </Field>
          <Field
            label="Descripcion"
            counter={`${data.profileDescription.length}/500`}
          >
            <textarea
              value={data.profileDescription}
              maxLength={500}
              rows={4}
              onChange={(event) =>
                updateData("profileDescription", event.target.value)
              }
              className={textareaClassName}
            />
          </Field>
        </div>
      </div>
    </article>
  );
}
