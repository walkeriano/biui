import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faClock, faHeart, faLotus, faUser } from "@/lib/fontawesome";

export default function PublicServices({ page }) {
  return (
    <section id="servicios" className="bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.24em]"
              style={{ color: page.theme.secondaryColor }}
            >
              Mis servicios
            </p>
            <h2
              className="mt-3 text-4xl font-bold leading-tight text-[#061923] sm:text-5xl"
              style={{ fontFamily: page.theme.titleFont }}
            >
              ¿Como puedo ayudarte?
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
              Servicios adaptados a tus necesidades, con una experiencia clara y
              sencilla para reservar.
            </p>
          </div>
          <a
            href="#reservar"
            className="inline-flex w-fit items-center gap-3 border-b pb-1 text-sm font-bold"
            style={{
              borderColor: page.theme.primaryColor,
              color: page.theme.primaryColor,
            }}
          >
            Ver todos los servicios
            <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {page.services.map((service, index) => (
            <article
              key={service.id}
              className="grid min-h-[14.5rem] overflow-hidden rounded-card border border-line/70 bg-white shadow-card sm:grid-cols-[minmax(0,1fr)_8rem]"
            >
              <div className="flex flex-col p-6">
                <span
                  className="grid size-12 place-items-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 14%, white)`,
                    color: page.theme.secondaryColor,
                  }}
                >
                  <FontAwesomeIcon
                    icon={index === 1 ? faHeart : index === 2 ? faLotus : faUser}
                    className="size-5"
                  />
                </span>
                <h3
                  className="mt-5 text-xl font-bold text-[#061923]"
                  style={{ fontFamily: page.theme.titleFont }}
                >
                  {service.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {service.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-5 text-sm font-bold text-[#061923]">
                  <span className="inline-flex items-center gap-2 text-muted">
                    <FontAwesomeIcon icon={faClock} className="size-3.5" />
                    {service.duration}
                  </span>
                  <span>{service.price} €</span>
                </div>
              </div>

              <div
                className="hidden sm:block"
                style={{
                  backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 10%, white)`,
                }}
              >
                {service.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="grid h-full place-items-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 14%, white)`,
                      color: page.theme.secondaryColor,
                    }}
                  >
                    <FontAwesomeIcon icon={faLotus} className="size-8 opacity-70" />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
