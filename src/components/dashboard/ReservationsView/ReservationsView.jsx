import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCheck,
  faChevronRight,
  faClock,
  faUserGroup,
} from "@/lib/fontawesome";

const reservations = [
  {
    time: "10:00",
    client: "Maria Garcia",
    service: "Terapia individual",
    status: "Confirmada",
  },
  {
    time: "11:30",
    client: "Carlos Ruiz",
    service: "Terapia de pareja",
    status: "Confirmada",
  },
  {
    time: "13:00",
    client: "Ana Torres",
    service: "Terapia individual",
    status: "Pendiente",
  },
  {
    time: "16:00",
    client: "Lucia Fernandez",
    service: "Primera consulta",
    status: "Confirmada",
  },
];

const summary = [
  {
    label: "Reservas de hoy",
    value: "4",
    icon: faCalendarDays,
    tone: "bg-success-soft text-success",
  },
  {
    label: "Pendientes",
    value: "2",
    icon: faClock,
    tone: "bg-orange-50 text-orange-500",
  },
  {
    label: "Clientes activos",
    value: "18",
    icon: faUserGroup,
    tone: "bg-blue-50 text-blue-600",
  },
];

export default function ReservationsView() {
  return (
    <div className="grid gap-5">
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-success">
              <FontAwesomeIcon icon={faCalendarDays} className="size-3" />
              Reservas
            </p>
            <h2 className="mt-4 text-2xl font-bold text-foreground">
              Gestiona tu agenda profesional
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Esta vista queda preparada para construir el flujo completo de
              citas, estados, disponibilidad y detalle de cada reserva.
            </p>
          </div>

          <button
            type="button"
            className="flex h-11 items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            Nueva reserva
            <FontAwesomeIcon icon={faChevronRight} className="size-3" />
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <article
            key={item.label}
            className="rounded-card border border-line bg-surface p-4 shadow-card"
          >
            <span className={`grid size-10 place-items-center rounded-md ${item.tone}`}>
              <FontAwesomeIcon icon={item.icon} className="size-4" />
            </span>
            <p className="mt-4 text-3xl font-bold text-foreground">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.label}</p>
          </article>
        ))}
      </div>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-foreground">Agenda de hoy</h3>
          <button className="text-sm font-bold text-accent underline">
            Ver agenda completa
          </button>
        </div>

        <div className="overflow-hidden rounded-card border border-line">
          {reservations.map((reservation) => {
            const isPending = reservation.status === "Pendiente";

            return (
              <button
                key={`${reservation.time}-${reservation.client}`}
                type="button"
                className="grid w-full gap-2 border-b border-line px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-surface-muted sm:grid-cols-[5rem_minmax(10rem,1fr)_minmax(9rem,1fr)_auto_1.5rem] sm:items-center sm:gap-3"
              >
                <span className="text-xs font-bold text-muted sm:text-sm sm:text-foreground">
                  {reservation.time}
                </span>
                <span className="font-bold text-foreground">
                  {reservation.client}
                </span>
                <span className="text-sm leading-5 text-muted">
                  {reservation.service}
                </span>
                <span
                  className={
                    isPending
                      ? "w-fit rounded-md bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-500"
                      : "inline-flex w-fit items-center gap-2 rounded-md bg-success-soft px-3 py-1.5 text-xs font-bold text-success"
                  }
                >
                  {!isPending ? (
                    <FontAwesomeIcon icon={faCheck} className="size-3" />
                  ) : null}
                  {reservation.status}
                </span>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="hidden size-3 text-muted sm:block"
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
