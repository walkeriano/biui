import { inputClassName } from "@/components/dashboard/MyPageView/data";
import Field from "@/components/dashboard/MyPageView/components/Field";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";
import { sanitizeSlug } from "@/lib/slug";

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

export default function LocationSection({ data, updateData }) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <SectionHeader
        number="5"
        title="Ubicacion"
        description="Define los datos publicos de contacto y ubicacion."
      />

      <div className="grid gap-3">
        <Field label="Link publico">
          <div className="flex overflow-hidden rounded-md border border-line bg-surface focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft">
            <span className="grid shrink-0 place-items-center border-r border-line bg-surface-muted px-3 text-[0.8125rem] font-bold text-muted">
              /
            </span>
            <input
              value={data.publicSlug}
              onChange={(event) =>
                updateData("publicSlug", sanitizeSlug(event.target.value))
              }
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-[0.8125rem] font-medium text-foreground outline-none placeholder:text-muted"
              placeholder="mi-pagina"
            />
          </div>
        </Field>
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
    </article>
  );
}
