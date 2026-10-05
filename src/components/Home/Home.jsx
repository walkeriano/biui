import Link from "next/link";
import Header from "@/components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCalendarDays,
  faCheck,
  faClock,
  faHeart,
  faUsers,
} from "@/lib/fontawesome";

const benefits = [
  "Pagina personalizada con tu enlace",
  "Calendario de reservas en tiempo real",
  "Funciona en movil y ordenador",
  "Ideal para cualquier profesional",
];

const services = [
  { label: "Terapia individual", icon: faUsers },
  { label: "Terapia de pareja", icon: faHeart },
  { label: "Acompanamiento emocional", icon: faClock },
];

const days = [
  { day: "Lun", date: "7" },
  { day: "Mar", date: "8" },
  { day: "Mie", date: "9", active: true },
  { day: "Jue", date: "10" },
  { day: "Vie", date: "11" },
];

const times = ["09:00", "10:00", "11:00", "12:00", "16:00", "17:30"];

export default function Home() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_15%_18%,var(--accent-soft),transparent_24rem),linear-gradient(135deg,#ffffff_0%,var(--background)_48%,#f1f7fb_100%)] px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <Header />

      <section className="mx-auto grid w-full max-w-[var(--container-page)] items-center gap-10 py-12 lg:grid-cols-[1fr_0.82fr] lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Tu plataforma de reservas en minutos
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.03] text-foreground sm:text-6xl lg:text-7xl">
            Tus clientes reservan.
            <span className="block text-accent">Tu solo trabajas.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Crea tu pagina de reservas, compartela con tus clientes y recibe
            citas automaticamente. Sin complicaciones.
          </p>

          <ul className="mt-8 grid gap-4 text-base text-muted-foreground">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success text-sm font-bold text-success-foreground">
                  <FontAwesomeIcon icon={faCheck} className="size-3" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <Link
              href="/acceso"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-card bg-accent px-8 text-base font-bold text-white shadow-soft transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent-soft"
            >
              Crear mi pagina gratis
              <FontAwesomeIcon icon={faArrowRight} className="size-4" />
            </Link>
            <p className="mt-4 text-sm text-muted">
              Sin tarjeta de credito. Configurala en minutos.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -left-8 top-2 hidden h-24 w-24 rounded-full bg-accent-soft blur-2xl lg:block" />
          <div className="absolute -bottom-8 -right-10 h-32 w-32 rounded-full bg-primary-soft blur-2xl" />

          <article className="relative rounded-[1.4rem] border border-line bg-surface p-5 shadow-soft">
            <div className="h-36 rounded-card bg-[linear-gradient(135deg,#e8f4ef_0%,#ffffff_55%,#dff5ce_100%)] p-5">
              <div className="flex h-full items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted">Perfil</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    Laura Martin
                  </p>
                </div>
                <div className="grid size-20 place-items-center rounded-full bg-primary text-3xl font-bold text-white">
                  LM
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-2xl font-bold text-foreground">
                Laura Martin
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Psicologa
              </p>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-muted">
              {services.map((service) => (
                <li key={service.label} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-accent-soft text-accent">
                    <FontAwesomeIcon icon={service.icon} className="size-3" />
                  </span>
                  {service.label}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-2 rounded-card bg-surface-muted px-3 py-2 text-sm font-semibold text-muted-foreground">
              <FontAwesomeIcon icon={faCalendarDays} className="size-4 text-accent" />
              Selecciona fecha y horario
            </div>

            <div className="mt-6 grid grid-cols-5 gap-2">
              {days.map((item) => (
                <div
                  key={item.day}
                  className={
                    item.active
                      ? "rounded-md bg-primary px-2 py-3 text-center text-white"
                      : "rounded-md bg-surface-muted px-2 py-3 text-center text-muted-foreground"
                  }
                >
                  <p className="text-xs font-semibold">{item.day}</p>
                  <p className="mt-1 text-base font-bold">{item.date}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {times.map((time) => (
                <button
                  key={time}
                  type="button"
                  className="h-11 rounded-md bg-accent-soft text-sm font-bold text-accent transition hover:bg-primary hover:text-white"
                >
                  {time}
                </button>
              ))}
            </div>

            <Link
              href="/acceso"
              className="mt-5 flex h-13 items-center justify-center gap-3 rounded-card bg-primary px-5 text-base font-bold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-soft"
            >
              Reservar cita
              <FontAwesomeIcon icon={faArrowRight} className="size-4" />
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
