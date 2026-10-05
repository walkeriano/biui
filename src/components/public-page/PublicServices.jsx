import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faHeart, faUser } from "@/lib/fontawesome";

export default function PublicServices({ page }) {
  return (
    <section id="servicios" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Mis servicios
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2
              className="text-3xl font-bold text-foreground sm:text-4xl"
              style={{ fontFamily: page.theme.titleFont }}
            >
              ¿Como puedo ayudarte?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Acompanamiento psicologico adaptado a tus necesidades.
            </p>
          </div>
          <a
            href="#reservar"
            className="inline-flex h-11 w-fit items-center rounded-md px-5 text-sm font-bold text-white"
            style={{ backgroundColor: page.theme.secondaryColor }}
          >
            Reservar cita
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {page.services.map((service, index) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
            >
              <div className="h-44 bg-primary">
                {service.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center bg-success-soft text-success">
                    <FontAwesomeIcon
                      icon={index === 1 ? faHeart : faUser}
                      className="size-5"
                    />
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground">
                  {service.name}
                </h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-muted">
                  {service.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-bold">
                  <span className="text-muted">
                    <FontAwesomeIcon icon={faClock} className="mr-2 size-3.5" />
                    {service.duration}
                  </span>
                  <span>{service.price} €</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
