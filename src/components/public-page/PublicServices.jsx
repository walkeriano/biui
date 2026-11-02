export default function PublicServices({ page }) {
  return (
    <section id="servicios" className="bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: page.theme.secondaryColor }}
          >
            Mis servicios
          </p>
          <h2
            className="mt-3 text-4xl font-bold leading-tight sm:text-5xl"
            style={{
              color: page.theme.primaryColor,
              fontFamily: page.theme.titleFont,
            }}
          >
            ¿Como puedo ayudarte?
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
            Servicios adaptados a tus necesidades, con una experiencia clara y
            sencilla para reservar.
          </p>
        </div>

        <div
          role="region"
          aria-label="Servicios disponibles"
          tabIndex={0}
          className="mt-10 flex snap-x snap-proximity gap-5 overflow-x-auto overscroll-x-contain rounded-card pb-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          style={{ color: page.theme.primaryColor }}
        >
          {page.services.map((service) => (
            <article
              key={service.id}
              className="flex min-h-64 w-[85%] max-w-sm shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line/70 bg-white text-left shadow-card sm:w-80 lg:w-96"
            >
              {service.image ? (
                <div className="relative h-44 max-h-44 w-full shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <h3
                  className="break-words text-xl font-bold"
                  style={{
                    color: page.theme.primaryColor,
                    fontFamily: page.theme.titleFont,
                  }}
                >
                  {service.name}
                </h3>
                <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-muted">
                  {service.description}
                </p>
                <div className="mt-auto pt-5 text-lg font-bold text-[#061923]">
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
