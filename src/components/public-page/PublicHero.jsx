import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faShieldHalved } from "@/lib/fontawesome";

export default function PublicHero({ page }) {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-white"
      style={{
        background:
          "linear-gradient(110deg,#fff8ed 0%,#ffffff 48%,#e7f8d9 100%)",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
            <FontAwesomeIcon icon={faShieldHalved} className="size-3.5" />
            {page.hero.label}
          </span>
          <h1
            className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ fontFamily: page.theme.titleFont }}
          >
            {page.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {page.hero.text}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#reservar"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-sm font-bold text-white shadow-card transition hover:opacity-90"
              style={{ backgroundColor: page.theme.secondaryColor }}
            >
              Reservar mi primera cita
              <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
            </a>
            <a
              href="#servicios"
              className="inline-flex h-12 items-center justify-center rounded-md border border-line bg-white px-6 text-sm font-bold text-foreground transition hover:border-accent hover:text-accent"
            >
              Ver servicios
            </a>
          </div>
        </div>

        <div className="relative min-h-[28rem] overflow-hidden rounded-card bg-primary shadow-soft">
          {page.hero.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.hero.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(84,173,24,0.38),transparent_34%),linear-gradient(140deg,rgba(255,255,255,0.12),transparent_45%)]" />
              <div className="absolute bottom-0 left-1/2 h-[88%] w-[68%] -translate-x-1/2 rounded-t-full bg-white/12" />
            </>
          )}
          <div className="absolute inset-0 bg-primary/15" />
          <div className="absolute left-6 top-6 rounded-card bg-white/92 px-4 py-3 shadow-card">
            <p className="text-xs font-bold text-muted">Disponible hoy</p>
            <p className="mt-1 text-2xl font-bold text-foreground">6 horarios</p>
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-card bg-white p-4 shadow-card">
            <p className="text-sm font-bold text-foreground">
              {page.professional.name}
            </p>
            <p className="mt-1 text-xs text-muted">{page.professional.title}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {page.availability.times.slice(0, 3).map((time) => (
                <span
                  key={time}
                  className="rounded-md bg-success-soft px-3 py-2 text-center text-xs font-bold text-success"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
