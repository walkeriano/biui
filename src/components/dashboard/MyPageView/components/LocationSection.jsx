import { inputClassName } from "@/components/dashboard/MyPageView/data";
import Field from "@/components/dashboard/MyPageView/components/Field";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";
import { faLocationDot } from "@/lib/fontawesome";

const locationFields = [
  ["city", "Ciudad"],
  ["address", "Direccion"],
  ["phone", "Telefono"],
  ["email", "Email"],
];

const socialFields = [
  ["socialFacebook", "Facebook"],
  ["socialInstagram", "Instagram"],
  ["socialYoutube", "YouTube"],
];

export default function LocationSection({ data, isOpen, onToggle, updateData }) {
  return (
    <article className="overflow-hidden rounded-card border border-black bg-black shadow-card">
      <SectionHeader
        icon={faLocationDot}
        isOpen={isOpen}
        onToggle={onToggle}
        title="Ubicacion"
        description="Define los datos publicos de contacto y ubicacion."
      />

      {isOpen ? (
        <div className="page-editor-content bg-black p-4 grid gap-3">
          {locationFields.map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                value={data[key]}
                onChange={(event) => updateData(key, event.target.value)}
                className={inputClassName}
              />
            </Field>
          ))}
          <div className="mt-2 border-t border-line pt-4">
            <p className="mb-3 text-[0.75rem] font-bold text-foreground">
              Redes sociales
            </p>
            <div className="grid gap-3">
              {socialFields.map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    value={data[key]}
                    onChange={(event) => updateData(key, event.target.value)}
                    className={inputClassName}
                    placeholder={`https://${label.toLowerCase()}.com/tu-empresa`}
                  />
                </Field>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
