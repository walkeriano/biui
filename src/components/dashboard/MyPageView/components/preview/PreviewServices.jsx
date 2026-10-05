import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUser } from "@/lib/fontawesome";

export default function PreviewServices({ data, services }) {
  return (
    <section className="p-7">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
        Mis servicios
      </p>
      <h3
        className="mt-2 text-3xl font-bold text-foreground"
        style={{ fontFamily: data.titleFont }}
      >
        ¿Como puedo ayudarte?
      </h3>
      <p className="mt-1 text-sm text-muted">
        Acompanamiento psicologico adaptado a tus necesidades.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {services.slice(0, 3).map((service) => (
          <article
            key={service.id}
            className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
          >
            <div className="h-32 bg-primary">
              {service.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={service.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full place-items-center bg-orange-50 text-orange-500">
                  <FontAwesomeIcon icon={faUser} className="size-5" />
                </span>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-bold text-foreground">{service.name}</h4>
              <p className="mt-2 min-h-12 text-xs leading-5 text-muted">
                {service.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm font-bold">
                <span className="text-muted">
                  <FontAwesomeIcon icon={faClock} className="mr-2 size-3" />
                  {service.duration}
                </span>
                <span>{service.price} €</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
