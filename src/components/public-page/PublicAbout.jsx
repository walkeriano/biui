import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faLeaf } from "@/lib/fontawesome";

const qualities = ["Empatia y cercania", "Herramientas practicas", "Proceso personalizado"];

export default function PublicAbout({ page }) {
  return (
    <section id="sobre-mi" className="bg-[#fbf7ef] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[25rem_minmax(0,1fr)] lg:items-center">
        <div className="min-h-[26rem] overflow-hidden rounded-card bg-primary shadow-soft">
          {page.about.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.about.image}
              alt=""
              className="h-full min-h-[26rem] w-full object-cover"
            />
          ) : (
            <div className="grid h-full min-h-[26rem] place-items-center bg-[radial-gradient(circle_at_35%_22%,rgba(84,173,24,0.36),transparent_32%)] text-5xl font-bold text-white/90">
              {page.professional.avatarInitials}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Sobre mi
          </p>
          <h2
            className="mt-2 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: page.theme.titleFont }}
          >
            {page.about.title}
          </h2>
          <p
            className="mt-2 text-base font-bold"
            style={{ color: page.theme.primaryColor }}
          >
            {page.about.subtitle}
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            {page.about.description}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {qualities.map((quality, index) => (
              <div
                key={quality}
                className="rounded-card border border-line bg-white p-4 shadow-card"
              >
                <FontAwesomeIcon
                  icon={index === 1 ? faLeaf : faCheck}
                  className="size-4"
                  style={{ color: page.theme.primaryColor }}
                />
                <p className="mt-3 text-sm font-bold text-foreground">
                  {quality}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
