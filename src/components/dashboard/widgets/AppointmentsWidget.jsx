import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faClock } from "@/lib/fontawesome";

export default function AppointmentsWidget({ appointments = [] }) {
  return (
    <section className="flex h-full min-h-[28rem] flex-col rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-success-soft text-success">
          <FontAwesomeIcon icon={faCalendarDays} className="size-[1.125rem]" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Agenda
          </p>
          <h2 className="text-xl font-bold text-foreground">
            Proximas citas de hoy
          </h2>
        </div>
      </div>

      {appointments.length ? (
        <div className="overflow-hidden rounded-card border border-line">
          {appointments.map((appointment) => {
            const isPending = appointment.status === "Pendiente";

            return (
              <div
                key={appointment.id}
                className="grid gap-2 border-b border-line px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[5rem_minmax(10rem,1fr)_minmax(9rem,1fr)_auto] sm:items-center sm:gap-3"
              >
                <p className="inline-flex items-center gap-2 text-xs font-bold text-muted sm:text-sm sm:text-foreground">
                  <FontAwesomeIcon icon={faClock} className="size-3 text-success" />
                  {appointment.time}
                </p>
                <p className="font-bold text-foreground">{appointment.client}</p>
                <p className="text-sm leading-5 text-muted">
                  {appointment.service}
                </p>
                <span
                  className={
                    isPending
                      ? "w-fit rounded-md bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-500"
                      : "w-fit rounded-md bg-success-soft px-3 py-1.5 text-xs font-bold text-success"
                  }
                >
                  {appointment.status}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-card">
          <div className="relative z-10 mx-auto mt-32 max-w-sm px-4 text-center">
            <p className="text-sm font-bold text-foreground">Sin citas para hoy</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Cuando recibas reservas, apareceran aqui automaticamente.
            </p>
          </div>

          <div className="absolute inset-x-0 top-0 grid gap-3 px-4 pt-4">
            <GhostAppointmentRow opacity="opacity-80" />
            <GhostAppointmentRow opacity="opacity-60" />
            <GhostAppointmentRow opacity="opacity-40" />
            <GhostAppointmentRow opacity="opacity-25" />
            <GhostAppointmentRow opacity="opacity-10" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-surface" />
        </div>
      )}
    </section>
  );
}

function GhostAppointmentRow({ opacity }) {
  return (
    <div
      className={`grid gap-3 rounded-md border border-line bg-white/80 px-3 py-3 shadow-card sm:grid-cols-[4.5rem_minmax(0,1fr)_7rem] sm:items-center ${opacity}`}
    >
      <span className="h-4 w-12 rounded-full bg-success-soft" />
      <div className="grid gap-2">
        <span className="h-3 w-3/4 rounded-full bg-line" />
        <span className="h-3 w-1/2 rounded-full bg-line" />
      </div>
      <span className="h-7 rounded-md bg-orange-50" />
    </div>
  );
}
