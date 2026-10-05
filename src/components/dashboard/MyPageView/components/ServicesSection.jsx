import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGripVertical,
  faImage,
  faPlus,
  faTrash,
  faUpload,
} from "@/lib/fontawesome";
import {
  ghostButtonClassName,
  inputClassName,
  textareaClassName,
} from "@/components/dashboard/MyPageView/data";
import Field from "@/components/dashboard/MyPageView/components/Field";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";

export default function ServicesSection({
  addService,
  handleServiceImage,
  removeService,
  services,
  updateService,
}) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <SectionHeader
        number="4"
        title="Servicios"
        description="Define los servicios que ofreces."
      />

      <div className="grid gap-3">
        {services.map((service) => (
          <div key={service.id} className="rounded-card border border-line p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faGripVertical} className="size-4 text-muted" />
                <div className="grid size-12 place-items-center overflow-hidden rounded-md bg-primary text-[0.75rem] font-bold text-white">
                  {service.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faImage} className="size-4" />
                  )}
                </div>
                <p className="text-[0.8125rem] font-bold text-foreground">
                  {service.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeService(service.id)}
                className="grid size-9 place-items-center rounded-md text-danger transition hover:bg-danger-soft"
                aria-label="Eliminar servicio"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>

            <div className="grid gap-3">
              <div>
                <p className="mb-2 text-[0.75rem] font-bold text-foreground">
                  Imagen del servicio
                </p>
                <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                  <div className="grid h-28 place-items-center overflow-hidden rounded-card border border-line bg-primary text-white">
                    {service.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faImage} className="size-5" />
                    )}
                  </div>
                  <div className="grid content-start gap-2">
                    <label className={ghostButtonClassName}>
                      <FontAwesomeIcon icon={faUpload} className="size-3.5" />
                      Adjuntar imagen
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleServiceImage(service.id)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateService(service.id, "image", "")}
                      className="flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-[0.8125rem] font-bold text-danger transition hover:border-danger"
                    >
                      <FontAwesomeIcon icon={faTrash} className="size-3.5" />
                      Eliminar imagen
                    </button>
                    <p className="text-[0.75rem] leading-5 text-muted">
                      Recomendado: 800x600px. Luego conectaremos esta imagen con
                      Supabase Storage.
                    </p>
                  </div>
                </div>
              </div>

              <Field label="Nombre del servicio">
                <input
                  value={service.name}
                  onChange={(event) =>
                    updateService(service.id, "name", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Duracion">
                  <select
                    value={service.duration}
                    onChange={(event) =>
                      updateService(service.id, "duration", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option>50 minutos</option>
                    <option>60 minutos</option>
                    <option>90 minutos</option>
                  </select>
                </Field>
                <Field label="Precio">
                  <input
                    value={service.price}
                    onChange={(event) =>
                      updateService(service.id, "price", event.target.value)
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field label="Descripcion">
                <textarea
                  value={service.description}
                  rows={3}
                  onChange={(event) =>
                    updateService(service.id, "description", event.target.value)
                  }
                  className={textareaClassName}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addService}
        className="mt-4 flex h-10 items-center gap-2 rounded-md border border-line px-4 text-[0.8125rem] font-bold text-foreground transition hover:border-accent hover:text-accent"
      >
        <FontAwesomeIcon icon={faPlus} className="size-3.5" />
        Anadir servicio
      </button>
    </article>
  );
}
